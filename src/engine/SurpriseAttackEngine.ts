import { SubjectId } from '../types/game';
import { PlayerProfile } from '../types/telemetry';
import { SurpriseAttackDefinition, ThreatBreakdown } from '../types/surpriseAttack';
import { Mulberry32PRNG } from './DangerEngine';
import { SURPRISE_ATTACKS_MAP } from '../curriculum/surpriseAttacks';

export class SurpriseAttackEngine {
  private prng: Mulberry32PRNG;

  constructor(seed?: number) {
    this.prng = new Mulberry32PRNG(seed !== undefined ? seed : Date.now());
  }

  public setSeed(seed: number) {
    this.prng = new Mulberry32PRNG(seed);
  }

  public getPRNG(): Mulberry32PRNG {
    return this.prng;
  }

  /**
   * Calculates the hidden Threat Level (0-100) based on student velocity, consistency, mastery,
   * boss proximity, and recent failures.
   */
  public calculateThreatLevel(subject: SubjectId, profile: PlayerProfile): ThreatBreakdown {
    const history = profile.runHistory || [];
    const subjectHistory = history.filter(r => r.subject === subject);
    const recentRuns = subjectHistory.slice(0, 5); // Focus on most recent runs

    // 1. Fast Progression Score (0 to 30)
    let fastProgressionScore = 0;
    if (recentRuns.length > 0) {
      const victoryRuns = recentRuns.filter(r => r.result === 'VICTORY');
      if (victoryRuns.length > 0) {
        const avgTime =
          victoryRuns.reduce((acc, r) => acc + (r.timeTakenSeconds || 45), 0) / victoryRuns.length;
        const avgTurns =
          victoryRuns.reduce((acc, r) => acc + (r.turnsUsed || 4), 0) / victoryRuns.length;

        if (avgTime < 25 && avgTurns <= 3) {
          fastProgressionScore = 30;
        } else if (avgTime < 35 && avgTurns <= 3.5) {
          fastProgressionScore = 20;
        } else if (avgTime < 45) {
          fastProgressionScore = 10;
        } else {
          fastProgressionScore = 5;
        }
      }
    }

    // 2. Consecutive Success Score (0 to 25)
    let consecutiveSuccessScore = 0;
    let consecutiveWins = 0;
    for (const run of subjectHistory) {
      if (run.result === 'VICTORY') {
        consecutiveWins += 1;
      } else {
        break; // streak interrupted
      }
    }

    if (consecutiveWins >= 5) {
      consecutiveSuccessScore = 25;
    } else if (consecutiveWins >= 3) {
      consecutiveSuccessScore = 18;
    } else if (consecutiveWins >= 2) {
      consecutiveSuccessScore = 10;
    } else if (consecutiveWins === 1) {
      consecutiveSuccessScore = 4;
    }

    // 3. Mastery Score (0 to 20)
    let masteryScore = 0;
    const mastery = profile.subjectMastery?.[subject] || 0;
    let decayedMistakes = 0;
    let recoveries = 0;

    if (profile.conceptPerformance) {
      for (const key in profile.conceptPerformance) {
        const c = profile.conceptPerformance[key];
        if (c.subject === subject) {
          decayedMistakes += c.recentMistakes + c.repeatedMistakes;
          recoveries += c.successfulRecoveries;
        }
      }
    }

    if (mastery >= 70 && decayedMistakes <= 1) {
      masteryScore = 20;
    } else if (mastery >= 50 && decayedMistakes <= 2) {
      masteryScore = 14;
    } else if (mastery >= 30) {
      masteryScore = 8;
    } else {
      masteryScore = 2;
    }
    if (recoveries > 0) {
      masteryScore = Math.min(20, masteryScore + recoveries * 2);
    }

    // 4. Boss Proximity Score (0 to 25)
    // CRITICAL: Boss proximity alone must NOT create a meaningful ambush threat.
    // It only activates when the student is also demonstrating fast progression!
    let bossProximityScore = 0;
    const cleared = profile.clearedLevels?.[subject] || [];
    const maxCleared = cleared.length > 0 ? Math.max(...cleared) : 0;
    const clearedTrials = profile.clearedHiddenTrials?.[subject] || [];

    // Condition: Player has cleared level 3, level 4, or hidden trial 1
    const nearBoss = maxCleared >= 3 || clearedTrials.length >= 1;
    if (nearBoss && fastProgressionScore >= 10) {
      if (maxCleared >= 4 || clearedTrials.length >= 2) {
        bossProximityScore = 25;
      } else if (maxCleared >= 3 || clearedTrials.length >= 1) {
        bossProximityScore = 18;
      }
    } else if (nearBoss && fastProgressionScore < 10) {
      // Normal pacing student near boss: minimal proximity bump
      bossProximityScore = 3;
    }

    // 5. Recent Failure Score (subtract up to 40)
    let recentFailureScore = 0;
    // Check recent runs for defeats
    const recentDefeats = recentRuns.filter(r => r.result === 'DEFEAT').length;
    recentFailureScore += recentDefeats * 20;

    // Check active concept mistakes
    if (decayedMistakes > 0) {
      recentFailureScore += Math.min(20, Math.round(decayedMistakes * 8));
    }
    recentFailureScore = Math.min(40, recentFailureScore);

    // Final Threat Level Calculation (0 to 100)
    const rawThreat =
      fastProgressionScore +
      consecutiveSuccessScore +
      masteryScore +
      bossProximityScore -
      recentFailureScore;

    const threatLevel = Math.max(0, Math.min(100, Math.round(rawThreat)));
    const opportunityProbability = this.getOpportunityProbability(threatLevel);

    return {
      fastProgressionScore,
      consecutiveSuccessScore,
      masteryScore,
      bossProximityScore,
      recentFailureScore,
      threatLevel,
      opportunityProbability,
    };
  }

  /**
   * Maps threat level to calibrated low-frequency opportunity probability (never exceeding 15%).
   * Threat < 40  => 0 - 2%
   * Threat 40-59 => 3 - 5%
   * Threat 60-79 => 5 - 8%
   * Threat 80-100 => 8 - 12% (hard ceiling 15%)
   */
  public getOpportunityProbability(threatLevel: number): number {
    if (threatLevel < 40) {
      return (threatLevel / 40) * 0.02; // 0.00 to 0.02
    } else if (threatLevel < 60) {
      return 0.03 + ((threatLevel - 40) / 20) * 0.02; // 0.03 to 0.05
    } else if (threatLevel < 80) {
      return 0.05 + ((threatLevel - 60) / 20) * 0.03; // 0.05 to 0.08
    } else {
      const prob = 0.08 + ((threatLevel - 80) / 20) * 0.04; // 0.08 to 0.12
      return Math.min(0.15, Number(prob.toFixed(4))); // strictly capped at 15%
    }
  }

  /**
   * Determines whether an Ambush Surprise Attack should trigger for the upcoming battle.
   */
  public shouldTriggerAttack(
    subject: SubjectId,
    isJudgeDemo: boolean,
    profile: PlayerProfile,
    customRNG?: Mulberry32PRNG
  ): boolean {
    // REQUIREMENT: Judge Demo is strictly 100% immune (0% ambush)
    if (isJudgeDemo) {
      return false;
    }

    // REQUIREMENT: Active cooldown suppresses ambush
    if (profile.surpriseAttackCooldownBattles && profile.surpriseAttackCooldownBattles > 0) {
      return false;
    }

    // REQUIREMENT: Run cap (maximum 2 ambushes per subject run to prevent farming)
    if (profile.surpriseAttacksCompleted && profile.surpriseAttacksCompleted >= 2) {
      return false;
    }

    const { threatLevel, opportunityProbability } = this.calculateThreatLevel(subject, profile);

    // Minimum threat threshold for an ambush
    if (threatLevel < 35) {
      return false;
    }

    const rng = customRNG || this.prng;
    const roll = rng.next();
    return roll < opportunityProbability;
  }

  /**
   * Retrieves the Surprise Attack definition for the subject, adapted to education tier.
   */
  public getSurpriseAttack(subject: SubjectId, _profile: PlayerProfile): SurpriseAttackDefinition {
    const attack = SURPRISE_ATTACKS_MAP[subject] || SURPRISE_ATTACKS_MAP.mathematics;
    return attack;
  }
}

export const surpriseAttackEngine = new SurpriseAttackEngine();
