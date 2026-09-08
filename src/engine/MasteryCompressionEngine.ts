import { SubjectId } from '../types/game';
import { EncounterDefinition, MisconceptionRule } from '../types/curriculum';
import { PlayerProfile, ConceptPerformanceRecord } from '../types/telemetry';

export interface MasteryCoverageResult {
  isComplete: boolean;
  demonstratedConcepts: string[];
  missingConcepts: string[];
  routeUsed: 'main' | 'compressed' | 'mixed';
}

export interface BossAccessResult {
  allowed: boolean;
  reason: string;
  route: 'main' | 'compressed' | 'locked';
}

export interface HiddenTrialFailureDiagnosis {
  failedConcept: string;
  recommendedMainPathLevel: number;
  conceptExplanation: string;
}

export class MasteryCompressionEngine {
  // Required core curriculum concepts per subject for boss eligibility
  public static readonly REQUIRED_CONCEPTS: Record<SubjectId, string[]> = {
    mathematics: [
      'math_factorization',
      'math_linear_systems',
      'math_roots_radicals',
      'math_verification',
    ],
    computerScience: [
      'cs_arrays_invariants',
      'cs_binary_search',
      'cs_sorting',
      'cs_dynamic_programming',
    ],
    physics: ['phys_force_acceleration', 'phys_potential_kinetic'],
    chemistry: ['chem_stoichiometry', 'chem_titration_ph'],
    biology: ['bio_transcription', 'bio_mitosis'],
    history: ['hist_sequencing', 'hist_cause_effect'],
    geography: ['geo_tectonics', 'geo_atmospheric'],
    language: ['lang_syntax', 'lang_semantics'],
  };

  // Concept mapping for Main Path stages (Stage 1 to 4)
  public static readonly MAIN_STAGE_CONCEPTS: Record<SubjectId, Record<number, string>> = {
    mathematics: {
      1: 'math_factorization',
      2: 'math_linear_systems',
      3: 'math_roots_radicals',
      4: 'math_verification',
    },
    computerScience: {
      1: 'cs_arrays_invariants',
      2: 'cs_binary_search',
      3: 'cs_sorting',
      4: 'cs_dynamic_programming',
    },
    physics: { 1: 'phys_force_acceleration', 2: 'phys_potential_kinetic' },
    chemistry: { 1: 'chem_stoichiometry', 2: 'chem_titration_ph' },
    biology: { 1: 'bio_transcription', 2: 'bio_mitosis' },
    history: { 1: 'hist_sequencing', 2: 'hist_cause_effect' },
    geography: { 1: 'geo_tectonics', 2: 'geo_atmospheric' },
    language: { 1: 'lang_syntax', 2: 'lang_semantics' },
  };

  // Concept mapping for Hidden Path trials
  public static readonly HIDDEN_TRIAL_CONCEPTS: Record<string, string[]> = {
    math_hidden_trial_1: ['math_factorization', 'math_linear_systems'],
    math_hidden_trial_2: ['math_roots_radicals', 'math_verification'],
    cs_hidden_trial_1: ['cs_arrays_invariants', 'cs_binary_search'],
    cs_hidden_trial_2: ['cs_sorting', 'cs_dynamic_programming'],
  };

  // Required hidden trials per subject to achieve full compression
  public static readonly REQUIRED_HIDDEN_TRIALS: Record<SubjectId, string[]> = {
    mathematics: ['math_hidden_trial_1', 'math_hidden_trial_2'],
    computerScience: ['cs_hidden_trial_1', 'cs_hidden_trial_2'],
    physics: [],
    chemistry: [],
    biology: [],
    history: [],
    geography: [],
    language: [],
  };

  public static getRequiredSubjectConcepts(subject: SubjectId): string[] {
    return this.REQUIRED_CONCEPTS[subject] || [];
  }

  /**
   * Evaluates which required curriculum concepts have been demonstrated by the player,
   * checking both Main Path completions and Hidden Path compressed trials.
   */
  public static verifyMasteryCoverage(
    subject: SubjectId,
    profile: PlayerProfile
  ): MasteryCoverageResult {
    const required = this.getRequiredSubjectConcepts(subject);
    const demonstrated = new Set<string>();

    let mainSourceCount = 0;
    let compressedSourceCount = 0;

    // 1. Check Main Path stages
    const clearedMain = profile.clearedLevels[subject] || [];
    const mainConcepts = this.MAIN_STAGE_CONCEPTS[subject] || {};
    for (const lvl of clearedMain) {
      if (mainConcepts[lvl]) {
        demonstrated.add(mainConcepts[lvl]);
        mainSourceCount++;
      }
    }

    // 2. Check Hidden Trials
    const clearedTrials = profile.clearedHiddenTrials?.[subject] || [];
    for (const trialId of clearedTrials) {
      const concepts = this.HIDDEN_TRIAL_CONCEPTS[trialId] || [];
      for (const c of concepts) {
        demonstrated.add(c);
        compressedSourceCount++;
      }
    }

    // 3. Check custom mastery compression records if any
    if (profile.masteryCompressionRecords) {
      for (const record of Object.values(profile.masteryCompressionRecords)) {
        for (const c of record.conceptSet) {
          if (required.includes(c)) {
            demonstrated.add(c);
            compressedSourceCount++;
          }
        }
      }
    }

    const demonstratedList = Array.from(demonstrated);
    const missing = required.filter(c => !demonstrated.has(c));
    const isComplete = missing.length === 0;

    let routeUsed: 'main' | 'compressed' | 'mixed' = 'mixed';
    if (compressedSourceCount > 0 && mainSourceCount <= 1) {
      routeUsed = 'compressed';
    } else if (compressedSourceCount === 0 && mainSourceCount >= 4) {
      routeUsed = 'main';
    }

    return {
      isComplete,
      demonstratedConcepts: demonstratedList,
      missingConcepts: missing,
      routeUsed,
    };
  }

  /**
   * Determines whether the student can access the Final Boss.
   * Access is granted IF:
   * 1. Main Path Stage 4 is completed (Main Route)
   * OR
   * 2. ALL required Hidden Trials are completed (Compression Route)
   * Trial 1 alone must NEVER unlock the Boss.
   */
  public static canAccessFinalBoss(
    subject: SubjectId,
    profile: PlayerProfile
  ): BossAccessResult {
    const clearedMain = profile.clearedLevels[subject] || [];
    const clearedTrials = profile.clearedHiddenTrials?.[subject] || [];
    const requiredTrials = this.REQUIRED_HIDDEN_TRIALS[subject] || [];

    // Main Route: Main Stage 4 completed
    if (clearedMain.includes(4)) {
      return {
        allowed: true,
        reason: 'The Grand Meridian Stage 4 completed. All curriculum axioms demonstrated.',
        route: 'main',
      };
    }

    // Compression Route: All required Hidden Trials completed
    if (requiredTrials.length > 0) {
      const allTrialsCleared = requiredTrials.every(trialId => clearedTrials.includes(trialId));

      if (allTrialsCleared) {
        // Validate that all required concepts are truly demonstrated
        const coverage = this.verifyMasteryCoverage(subject, profile);
        if (coverage.isComplete) {
          return {
            allowed: true,
            reason: 'Crucible of Compression completed. Denser multi-concept mastery proven across all required trials.',
            route: 'compressed',
          };
        }
      } else if (clearedTrials.length > 0) {
        return {
          allowed: false,
          reason: `Trial 1 demonstrates preliminary combined concepts, but remaining compressed trials must be conquered to prove complete mastery before the Archon.`,
          route: 'locked',
        };
      }
    }

    return {
      allowed: false,
      reason: 'Complete Main Path Stage 4 OR conquer all Crucible of Compression trials to awaken the Archon Boss.',
      route: 'locked',
    };
  }

  /**
   * Diagnoses which concept failed during a compressed Hidden Trial,
   * and recommends returning to the specific Main Path level that teaches it.
   */
  public static analyzeHiddenPathFailure(
    encounter: EncounterDefinition,
    stepIndex: number,
    attemptedOp: string,
    misconceptionRule?: MisconceptionRule | null
  ): HiddenTrialFailureDiagnosis {
    // 1. Mathematics Trial 1: Factorization + Linear Systems
    if (encounter.id === 'math_hidden_trial_1') {
      if (stepIndex === 0) {
        return {
          failedConcept: 'math_linear_systems',
          recommendedMainPathLevel: 2,
          conceptExplanation:
            'You struggled with substituting the linear expression into the quadratic constraint before factoring. In a coupled system, variables must be eliminated first.',
        };
      }
      return {
        failedConcept: 'math_factorization',
        recommendedMainPathLevel: 1,
        conceptExplanation:
          'You successfully substituted the linear variable, but struggled with factoring the resulting single-variable quadratic polynomial into binomial factors.',
      };
    }

    // 2. Mathematics Trial 2: Radical Roots + Verification
    if (encounter.id === 'math_hidden_trial_2') {
      if (stepIndex <= 1 || attemptedOp === 'EXPAND' || attemptedOp === 'SUBSTITUTE') {
        return {
          failedConcept: 'math_roots_radicals',
          recommendedMainPathLevel: 3,
          conceptExplanation:
            'You struggled with isolating the radical expression and extracting the roots via the quadratic formula.',
        };
      }
      return {
        failedConcept: 'math_verification',
        recommendedMainPathLevel: 4,
        conceptExplanation:
          'You solved the quadratic roots, but failed to rigorously substitute them back to identify and reject the extraneous solution.',
      };
    }

    // 3. Computer Science Trial 1: Array Invariants + Binary Search
    if (encounter.id === 'cs_hidden_trial_1') {
      if (stepIndex === 0 || attemptedOp === 'SWAP' || attemptedOp === 'RECURSE') {
        return {
          failedConcept: 'cs_arrays_invariants',
          recommendedMainPathLevel: 1,
          conceptExplanation:
            'You attempted operations before initializing pointer bounds and verifying loop invariants.',
        };
      }
      return {
        failedConcept: 'cs_binary_search',
        recommendedMainPathLevel: 2,
        conceptExplanation:
          'You initialized bounds, but failed to partition the monotonic search space with correct logarithmic comparison logic.',
      };
    }

    // 4. Computer Science Trial 2: Sorting + Dynamic Programming
    if (encounter.id === 'cs_hidden_trial_2') {
      if (stepIndex === 0 || attemptedOp === 'SWAP') {
        return {
          failedConcept: 'cs_sorting',
          recommendedMainPathLevel: 3,
          conceptExplanation:
            'You struggled with sorting invariants and establishing the monotonic subsequence ordering.',
        };
      }
      return {
        failedConcept: 'cs_dynamic_programming',
        recommendedMainPathLevel: 4,
        conceptExplanation:
          'You established the ordering, but failed to memoize overlapping subproblem states in the lookup table.',
      };
    }

    // General fallback based on encounter.fallbackMainPathLevelMap
    if (encounter.fallbackMainPathLevelMap) {
      const concepts = Object.keys(encounter.fallbackMainPathLevelMap);
      const chosenConcept = concepts[stepIndex % concepts.length] || concepts[0];
      const recLevel = encounter.fallbackMainPathLevelMap[chosenConcept] || 1;
      return {
        failedConcept: chosenConcept,
        recommendedMainPathLevel: recLevel,
        conceptExplanation: `Encountered difficulty with ${chosenConcept}. Return to Stage ${recLevel} on the Main Path to strengthen foundational mechanics.`,
      };
    }

    return {
      failedConcept: encounter.conceptName,
      recommendedMainPathLevel: 1,
      conceptExplanation: 'Review the underlying axioms on the Main Path to reinforce your foundation.',
    };
  }

  /**
   * Records successful completion of a Hidden Path compressed trial.
   * Preserves all existing Main Path progress, marks concepts as demonstrated,
   * updates performance records with recovery & mastery, and awards prestige rewards.
   */
  public static recordHiddenTrialCompletion(
    subject: SubjectId,
    encounter: EncounterDefinition,
    profile: PlayerProfile
  ): PlayerProfile {
    const updated = { ...profile };

    // 1. Initialize collections if not present
    if (!updated.clearedHiddenTrials) {
      updated.clearedHiddenTrials = {
        mathematics: [],
        computerScience: [],
        physics: [],
        chemistry: [],
        biology: [],
        history: [],
        geography: [],
        language: [],
      };
    }
    const currentTrials = updated.clearedHiddenTrials[subject] || [];
    if (!currentTrials.includes(encounter.id)) {
      updated.clearedHiddenTrials[subject] = [...currentTrials, encounter.id];
    }

    if (!updated.masteryCompressionRecords) {
      updated.masteryCompressionRecords = {};
    }
    updated.masteryCompressionRecords[encounter.id] = {
      conceptSet: encounter.compressedConcepts || [],
      clearedAt: Date.now(),
    };

    // 2. Boost mastery & reset mistakes for all compressed concepts
    if (!updated.conceptPerformance) {
      updated.conceptPerformance = {};
    }
    const concepts = encounter.compressedConcepts || [];
    for (const cId of concepts) {
      const existing: ConceptPerformanceRecord = updated.conceptPerformance[cId] || {
        conceptId: cId,
        subject,
        conceptName: cId,
        recentMistakes: 0,
        repeatedMistakes: 0,
        misconceptionFrequency: 0,
        prerequisiteGaps: 0,
        recentSuccessCount: 0,
        totalAttempts: 0,
        masteryLevel: 0,
        lastEncounterTimestamp: Date.now(),
        successfulRecoveries: 0,
        dangerEncounterCount: 0,
        cooldownEncounters: 0,
        lastSelectedAsDanger: false,
      };

      existing.successfulRecoveries += 1;
      existing.recentSuccessCount += 2;
      existing.totalAttempts += 1;
      existing.recentMistakes = 0;
      existing.repeatedMistakes = 0;
      existing.masteryLevel = Math.max(existing.masteryLevel, 85);
      existing.lastEncounterTimestamp = Date.now();
      updated.conceptPerformance[cId] = existing;
    }

    // 3. Subject Mastery boost
    const masteryGain = encounter.rewardMastery || 30;
    updated.subjectMastery[subject] = Math.min(
      100,
      (updated.subjectMastery[subject] || 0) + masteryGain
    );

    // 4. XP and Level Up
    const xpGain = (encounter.rewardXp || 200) + (encounter.prestigeRewards?.bonusXp || 0);
    updated.xp += xpGain;
    while (updated.xp >= updated.xpToNextLevel) {
      updated.xp -= updated.xpToNextLevel;
      updated.level += 1;
      updated.xpToNextLevel = Math.round(updated.xpToNextLevel * 1.4);
    }

    // 5. Prestige Rewards
    if (encounter.prestigeRewards?.title) {
      updated.title = encounter.prestigeRewards.title;
    }
    if (encounter.prestigeRewards?.relic) {
      if (!updated.relics.includes(encounter.prestigeRewards.relic)) {
        updated.relics = [...updated.relics, encounter.prestigeRewards.relic];
      }
    }
    if (encounter.prestigeRewards?.cardId) {
      if (!updated.unlockedCardIds.includes(encounter.prestigeRewards.cardId)) {
        updated.unlockedCardIds = [...updated.unlockedCardIds, encounter.prestigeRewards.cardId];
      }
    }

    return updated;
  }
}
