import { SubjectId } from '../types/game';
import {
  ConceptPerformanceRecord,
  DangerEventDefinition,
  PlayerProfile,
} from '../types/telemetry';

export class Mulberry32PRNG {
  private s: number;

  constructor(seed: number = Date.now()) {
    this.s = seed | 0;
  }

  public next(): number {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

export class DangerEngine {
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
   * Initializes or fetches the internal concept performance record.
   */
  public getOrCreateConceptRecord(
    profile: PlayerProfile,
    conceptId: string,
    subject: SubjectId,
    conceptName: string
  ): ConceptPerformanceRecord {
    if (!profile.conceptPerformance) {
      profile.conceptPerformance = {};
    }

    if (!profile.conceptPerformance[conceptId]) {
      const currentMastery = profile.subjectMastery[subject] || 0;
      profile.conceptPerformance[conceptId] = {
        conceptId,
        subject,
        conceptName,
        recentMistakes: 0,
        repeatedMistakes: 0,
        misconceptionFrequency: 0,
        prerequisiteGaps: 0,
        recentSuccessCount: 0,
        totalAttempts: 0,
        masteryLevel: currentMastery,
        lastEncounterTimestamp: Date.now(),
        successfulRecoveries: 0,
        dangerEncounterCount: 0,
        cooldownEncounters: 0,
        lastSelectedAsDanger: false,
      };
    }

    return profile.conceptPerformance[conceptId];
  }

  /**
   * Applies recency decay to performance records (gamma = 0.85 per encounter).
   * Older mistakes gradually lose weight unless actively reinforced by repeated struggle.
   */
  public applyRecencyDecay(profile: PlayerProfile) {
    if (!profile.conceptPerformance) return;

    for (const key in profile.conceptPerformance) {
      const record = profile.conceptPerformance[key];
      // Attenuate past mistake influence
      record.recentMistakes = Number((record.recentMistakes * 0.85).toFixed(3));
      record.repeatedMistakes = Number((record.repeatedMistakes * 0.85).toFixed(3));
      record.prerequisiteGaps = Number((record.prerequisiteGaps * 0.85).toFixed(3));

      // Decrement encounter cooldown
      if (record.cooldownEncounters > 0) {
        record.cooldownEncounters -= 1;
      }
    }

    // Decrement global battle-level Danger cooldown
    if (profile.dangerCooldownBattles && profile.dangerCooldownBattles > 0) {
      profile.dangerCooldownBattles -= 1;
    }

    // Decrement Surprise Attack cooldown
    if (profile.surpriseAttackCooldownBattles && profile.surpriseAttackCooldownBattles > 0) {
      profile.surpriseAttackCooldownBattles -= 1;
    }
  }

  /**
   * Calculates the hidden Need Score for a concept.
   * Formula: More struggle -> higher weight; More mastery -> lower weight.
   * Clamped between 5 (baseline surprise weight) and 100.
   */
  public calculateNeedScore(record: ConceptPerformanceRecord): number {
    const rawScore =
      record.recentMistakes * 15 +
      record.repeatedMistakes * 20 +
      record.misconceptionFrequency * 15 +
      record.prerequisiteGaps * 25 -
      record.recentSuccessCount * 14 -
      record.masteryLevel * 0.4 -
      record.successfulRecoveries * 25;

    // Minimum baseline of 5 ensures low-need concepts retain an occasional surprise appearance chance
    return Math.max(5, Math.min(100, Math.round(rawScore)));
  }

  /**
   * Determines whether an atmospheric Danger event triggers for an upcoming encounter.
   * Strictly respects low-frequency thresholds (3% to 20% max).
   * Strictly returns false (0%) when isJudgeDemo is true.
   */
  public shouldTriggerDanger(
    subject: SubjectId,
    isJudgeDemo: boolean,
    profile: PlayerProfile,
    customRNG?: Mulberry32PRNG
  ): boolean {
    // REQUIREMENT: Judge Demo is 100% deterministic (0% danger)
    if (isJudgeDemo) {
      return false;
    }

    // Global battle cooldown check
    if (profile.dangerCooldownBattles && profile.dangerCooldownBattles > 0) {
      return false;
    }

    const eligible = this.getEligibleWeaknesses(subject, profile);
    if (eligible.length === 0) {
      return false;
    }

    // Compute effective need blending peak weakness with general performance
    const needScores = eligible.map(c => this.calculateNeedScore(c));
    const maxNeed = Math.max(...needScores);
    const avgNeed = needScores.reduce((acc, score) => acc + score, 0) / eligible.length;
    const effectiveNeed = 0.7 * maxNeed + 0.3 * avgNeed;

    // Calibrated Low-Frequency Probabilities
    let triggerChance: number;
    if (effectiveNeed <= 15) {
      // Strong student: 3% - 5%
      triggerChance = 0.04;
    } else if (effectiveNeed <= 35) {
      // Mild weakness: 5% - 8%
      triggerChance = 0.065;
    } else if (effectiveNeed <= 60) {
      // Moderate weakness: 8% - 12%
      triggerChance = 0.10;
    } else {
      // Significant/repeated weakness: 12% - 18% (capped at 20% max)
      triggerChance = Math.min(0.20, 0.12 + Math.min(0.06, ((effectiveNeed - 60) / 40) * 0.06));
    }

    const rng = customRNG || this.prng;
    const roll = rng.next();
    return roll < triggerChance;
  }

  /**
   * Returns eligible concepts for a subject, respecting cooldowns and anti-repetition guards.
   */
  public getEligibleWeaknesses(
    subject: SubjectId,
    profile: PlayerProfile
  ): ConceptPerformanceRecord[] {
    if (!profile.conceptPerformance) {
      profile.conceptPerformance = {};
    }

    // Ensure baseline seed concepts exist for the subject
    this.ensureBaselineConcepts(subject, profile);

    const candidates = Object.values(profile.conceptPerformance).filter(
      c => c.subject === subject
    );

    // Filter out concepts on cooldown
    let available = candidates.filter(c => c.cooldownEncounters === 0);

    // Anti-repetition: Avoid selecting the concept that triggered in the immediately preceding Danger
    if (available.length > 1) {
      const nonConsecutive = available.filter(c => !c.lastSelectedAsDanger);
      if (nonConsecutive.length > 0) {
        available = nonConsecutive;
      }
    }

    return available.length > 0 ? available : candidates;
  }

  /**
   * Converts candidate Need Scores into weighted selection roulette.
   * High-need concepts are more likely, but NEVER guaranteed.
   * Low-need concepts can still appear as occasional surprises.
   */
  public selectWeightedDanger(
    subject: SubjectId,
    profile: PlayerProfile,
    customRNG?: Mulberry32PRNG
  ): DangerEventDefinition | null {
    const candidates = this.getEligibleWeaknesses(subject, profile);
    if (candidates.length === 0) return null;

    // Calculate weights based on Need Score
    const weightedItems = candidates.map(c => ({
      concept: c,
      weight: Math.max(1, this.calculateNeedScore(c)),
    }));

    const totalWeight = weightedItems.reduce((acc, item) => acc + item.weight, 0);

    // Roulette wheel selection
    const rng = customRNG || this.prng;
    let threshold = rng.next() * totalWeight;

    let chosen = weightedItems[0].concept;
    for (const item of weightedItems) {
      threshold -= item.weight;
      if (threshold <= 0) {
        chosen = item.concept;
        break;
      }
    }

    // Apply cooldown and anti-repetition flags
    for (const c of Object.values(profile.conceptPerformance || {})) {
      if (c.conceptId === chosen.conceptId) {
        c.lastSelectedAsDanger = true;
        c.cooldownEncounters = 2; // on cooldown for next 2 encounters
        c.dangerEncounterCount += 1;
      } else {
        c.lastSelectedAsDanger = false;
      }
    }

    // Set battle-level global cooldown (1 battle grace period)
    profile.dangerCooldownBattles = 1;

    // Generate natural dark-fantasy hazard definition
    return this.createDangerEvent(chosen);
  }

  /**
   * Generates a natural in-game dark-fantasy Danger event definition.
   * Labels NEVER expose clinical terms ("Weakness", "AI detected", etc.).
   */
  private createDangerEvent(record: ConceptPerformanceRecord): DangerEventDefinition {
    const need = this.calculateNeedScore(record);
    const tier: 'reinforcement' | 'standard' | 'advanced' =
      need >= 50 ? 'reinforcement' : need >= 25 ? 'standard' : 'advanced';

    // Thematic titles by subject
    const hazards: Record<SubjectId, { name: string; warning: string }> = {
      mathematics: {
        name: 'Realm Hazard: Aetheric Flux',
        warning: 'The fractured realm resonates with unstable polynomial energy!',
      },
      computerScience: {
        name: 'Anomaly: Recursive Memory Breach',
        warning: 'An uncontained thread leaks into memory! The enemy harnesses dynamic pressure.',
      },
      physics: {
        name: 'Cosmic Anomaly: Gravitational Shear',
        warning: 'A spatial rift warps kinetic momentum on the battlefield.',
      },
      chemistry: {
        name: 'Volatile Surge: Exothermic Leak',
        warning: 'Unbalanced reagents ignite an volatile catalytic field.',
      },
      biology: {
        name: 'Bio-Hazard: Mutational Bloom',
        warning: 'Cellular tendrils rapidly divide, reinforcing the adversary.',
      },
      history: {
        name: 'Temporal Rift: Chrono Distortion',
        warning: 'Broken epochs bleed across the chronological barrier.',
      },
      geography: {
        name: 'Tectonic Anomaly: Subduction Quake',
        warning: 'Seismic tremors destabilize the arena foundation.',
      },
      language: {
        name: 'Linguistic Flare: Semantic Corruption',
        warning: 'Arcane syntax echoes distort cognitive clarity.',
      },
    };

    const hazardInfo = hazards[record.subject] || hazards.mathematics;

    let modifier: {
      type: 'shield' | 'cost_penalty' | 'bonus_mastery';
      value: number;
      description: string;
    };

    if (tier === 'reinforcement') {
      // High need: provide targeted challenge without overwhelming
      modifier = {
        type: 'shield',
        value: 15,
        description: 'The anomaly wreathes the adversary in a +15 resonance shield.',
      };
    } else if (tier === 'standard') {
      modifier = {
        type: 'cost_penalty',
        value: 1,
        description: 'Aetheric turbulence strains energy recovery.',
      };
    } else {
      // Advanced / Mastered reinforcement: higher reward
      modifier = {
        type: 'bonus_mastery',
        value: 20,
        description: 'Harmonic alignment: Grants +20% bonus mastery upon victory.',
      };
    }

    return {
      id: `danger_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      hazardName: hazardInfo.name,
      flavorWarning: hazardInfo.warning,
      conceptId: record.conceptId,
      conceptName: record.conceptName,
      difficultyTier: tier,
      modifierEffect: modifier,
    };
  }

  /**
   * Records student performance during combat or revision.
   */
  public recordPerformance(
    profile: PlayerProfile,
    conceptId: string,
    subject: SubjectId,
    conceptName: string,
    outcome: 'success' | 'mistake' | 'prerequisite_gap' | 'repeated_mistake' | 'recovery'
  ) {
    const record = this.getOrCreateConceptRecord(profile, conceptId, subject, conceptName);
    record.lastEncounterTimestamp = Date.now();
    record.totalAttempts += 1;

    if (outcome === 'success') {
      record.recentSuccessCount += 1;
      record.masteryLevel = Math.min(100, record.masteryLevel + 8);
    } else if (outcome === 'mistake') {
      record.recentMistakes += 1;
      record.misconceptionFrequency += 1;
    } else if (outcome === 'repeated_mistake') {
      record.recentMistakes += 1;
      record.repeatedMistakes += 1;
      record.misconceptionFrequency += 1;
    } else if (outcome === 'prerequisite_gap') {
      record.prerequisiteGaps += 1;
      record.recentMistakes += 1;
    } else if (outcome === 'recovery') {
      record.successfulRecoveries += 1;
      // Recovery strongly suppresses Need Score to progressively retire the weakness
      record.recentMistakes = Math.max(0, record.recentMistakes - 2);
      record.repeatedMistakes = Math.max(0, record.repeatedMistakes - 1);
      record.masteryLevel = Math.min(100, record.masteryLevel + 15);
    }
  }

  /**
   * Seeds default concept records for subjects if none exist.
   */
  private ensureBaselineConcepts(subject: SubjectId, profile: PlayerProfile) {
    if (!profile.conceptPerformance) {
      profile.conceptPerformance = {};
    }

    const baselineMap: Record<SubjectId, Array<{ id: string; name: string }>> = {
      mathematics: [
        { id: 'math_quadratic_factoring', name: 'Quadratic Factorization & Roots' },
        { id: 'math_linear_systems', name: 'Linear Systems & Elimination' },
        { id: 'math_complex_synthesis', name: 'Complex Factoring Synthesis' },
      ],
      computerScience: [
        { id: 'cs_sorting_invariants', name: 'Sorting & State Invariants' },
        { id: 'cs_memoization', name: 'Dynamic Programming & Caching' },
      ],
      physics: [
        { id: 'phys_force_acceleration', name: 'Kinematics & Force Vectors' },
      ],
      chemistry: [
        { id: 'chem_stoichiometry', name: 'Stoichiometry & Reaction Balance' },
      ],
      biology: [
        { id: 'bio_dna_transcription', name: 'DNA Transcription & Translation' },
      ],
      history: [
        { id: 'hist_chronology', name: 'Chronological Sequencing & Causation' },
      ],
      geography: [
        { id: 'geo_tectonics', name: 'Plate Tectonics & Pressure Gradients' },
      ],
      language: [
        { id: 'lang_syntax_parsing', name: 'Syntax Dependencies & Morphology' },
      ],
    };

    const seeds = baselineMap[subject] || baselineMap.mathematics;
    for (const seed of seeds) {
      if (!profile.conceptPerformance[seed.id]) {
        this.getOrCreateConceptRecord(profile, seed.id, subject, seed.name);
      }
    }
  }
}

export const dangerEngine = new DangerEngine();
