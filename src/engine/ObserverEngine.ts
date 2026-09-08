import { PlayerProfile } from '../types/telemetry';
import { ObserverState } from '../types/learningDna';
import { Mulberry32PRNG } from './DangerEngine';
import { learningDNAEngine } from './LearningDNAEngine';

export const DEFAULT_OBSERVER_STATE: ObserverState = {
  impression: 0,
  encounterCount: 0,
  cooldownEncounters: 0,
  challengeCompleted: false,
  askAnythingUnlocked: false,
  askAnythingUsed: false,
  permanentImpressions: [],
};

export class ObserverEngine {
  private prng: Mulberry32PRNG;

  constructor(seed: number = 999999) {
    this.prng = new Mulberry32PRNG(seed);
  }

  public setSeed(seed: number) {
    this.prng = new Mulberry32PRNG(seed);
  }

  public getObserverState(profile: PlayerProfile): ObserverState {
    if (profile.observerState) {
      return { ...profile.observerState };
    }
    return { ...DEFAULT_OBSERVER_STATE };
  }

  /**
   * Ultra-rare observation check (0.5%–1.5% of eligible battles)
   * Strictly 0% during Judge Demo or on active cooldown.
   */
  public shouldWhisperObservation(
    profile: PlayerProfile,
    isJudgeDemo: boolean = false
  ): boolean {
    if (isJudgeDemo) return false;

    const state = this.getObserverState(profile);
    if (state.cooldownEncounters > 0) return false;

    const prob = 0.01; // 1.0% in middle of 0.5%–1.5%
    const roll = this.prng.next();
    return roll < prob;
  }

  /**
   * Generates single short cryptic sentence based on student's current learning profile
   */
  public generateObservationSentence(profile: PlayerProfile): string {
    return learningDNAEngine.getObserverObservation(profile) || 'Interesting.';
  }

  /**
   * Awards Impression points based on genuinely impressive educational feats
   * Quality > quantity; grinding easy questions awards 0.
   */
  public recordImpressionEvent(
    state: ObserverState,
    eventType:
      | 'high_difficulty_victory'
      | 'recovery_from_repeated_mistakes'
      | 'counter_strategy_adapted'
      | 'cross_domain_synthesis'
      | 'mirror_boss_defeated'
      | 'mastery_compression_cleared'
      | 'convergence_triumph'
      | 'easy_level_cleared',
    details?: string
  ): ObserverState {
    const updated = { ...state };
    let points = 0;

    switch (eventType) {
      case 'high_difficulty_victory':
        points = 8;
        break;
      case 'recovery_from_repeated_mistakes':
        points = 12;
        break;
      case 'counter_strategy_adapted':
        points = 14;
        break;
      case 'cross_domain_synthesis':
        points = 16;
        break;
      case 'mirror_boss_defeated':
        points = 20;
        break;
      case 'mastery_compression_cleared':
        points = 15;
        break;
      case 'convergence_triumph':
        points = 25;
        break;
      case 'easy_level_cleared':
        points = 0; // Grinding easy levels yields 0 impression!
        break;
    }

    updated.impression = Math.min(100, updated.impression + points);
    if (details && !updated.permanentImpressions.includes(details)) {
      updated.permanentImpressions.push(details);
    }
    return updated;
  }

  /**
   * Evaluates if the rare Observer Challenge triggers
   * Requires: impression >= 75, cooldown === 0, exceptional performance, not Judge Demo, not Convergence
   */
  public shouldTriggerObserverChallenge(
    profile: PlayerProfile,
    isJudgeDemo: boolean = false,
    isConvergence: boolean = false
  ): boolean {
    if (isJudgeDemo || isConvergence) return false;

    const state = this.getObserverState(profile);
    if (state.challengeCompleted) return false; // single rare milestone
    if (state.cooldownEncounters > 0) return false;
    if (state.impression < 75) return false;

    const dna = learningDNAEngine.getLearningDNA(profile);
    const hasExceptionalPerformance = dna.accuracy >= 75 || dna.transferAbility >= 70;
    if (!hasExceptionalPerformance) return false;

    // Rare trigger probability (15% when eligible)
    const roll = this.prng.next();
    return roll < 0.15;
  }

  /**
   * Evaluates if "Ask the Observer Anything" unlocks upon completing the challenge
   * Rare opportunity: 1–3% base, max 5%. Single use, non-farmable.
   */
  public evaluateAskAnythingOpportunity(
    state: ObserverState,
    exceptionalScore: boolean = false
  ): { unlocked: boolean; probability: number } {
    if (state.askAnythingUsed || state.askAnythingUnlocked) {
      return { unlocked: false, probability: 0 };
    }

    const prob = exceptionalScore ? 0.045 : 0.025; // 2.5% base, 4.5% exceptional (capped at 5%)
    const roll = this.prng.next();
    const unlocked = roll < prob;
    return { unlocked, probability: prob };
  }

  /**
   * Generates the Observer's Grand Challenge question
   */
  public getObserverChallengeQuestion(): {
    scenario: string;
    objective: string;
    options: {
      id: string;
      label: string;
      isCorrect: boolean;
      rationale: string;
    }[];
    correctExplanation: string;
  } {
    return {
      scenario:
        'Across all the Spire’s realms, you have seen that every mathematical equation, physical conservation law, and algorithmic invariant obeys an underlying symmetry: nothing created can vanish without transforming.',
      objective:
        'Identify which philosophical and axiomatic principle bridges the Conservation of Energy in Physics with Loop Invariants in Computer Science and Root Continuity in Polynomial Calculus.',
      options: [
        {
          id: 'opt_obs_a',
          label:
            'A. Invariance Under Transformation: an authentic truth is an invariant quantity or state predicate preserved across state transitions.',
          isCorrect: true,
          rationale:
            'In physics, Noether’s theorem ties conservation to symmetry; in algorithms, loop invariants prove correctness over loop iterations; in calculus, root isolation relies on continuous transformations.',
        },
        {
          id: 'opt_obs_b',
          label:
            'B. Empirical Approximation: exact truths do not exist in the Spire, only statistical estimates.',
          isCorrect: false,
          rationale: 'Axiomatic disciplines require exact deductive proofs, not merely empirical estimates.',
        },
        {
          id: 'opt_obs_c',
          label:
            'C. Exponential Divergence: states become chaotic and unpredictable as soon as multiple domains combine.',
          isCorrect: false,
          rationale: 'Cross-domain synthesis yields structured conserved systems, not chaotic divergence.',
        },
        {
          id: 'opt_obs_d',
          label:
            'D. Static Irreversibility: once a state changes, its prior invariants can never be reconstructed or proven.',
          isCorrect: false,
          rationale: 'Invariants are preserved specifically to guarantee backward provability.',
        },
      ],
      correctExplanation:
        'Invariance under transformation is the universal foundation: Noether symmetries yield conservation laws, loop invariants guarantee algorithmic correctness, and continuous mappings preserve algebraic roots.',
    };
  }

  /**
   * Handles free-text questions to the Observer safely and in-character
   */
  public respondToStudentQuestion(questionText: string): string {
    const q = questionText.toLowerCase().trim();

    // Guard against answer leaks / cheating attempts
    if (
      q.includes('answer') ||
      q.includes('solution') ||
      q.includes('correct option') ||
      q.includes('cheat') ||
      q.includes('next question')
    ) {
      return 'The answer exists beyond what I am permitted to reveal. You must discover the proofs for yourself.';
    }

    // Guard against probability / telemetry leaks
    if (
      q.includes('probability') ||
      q.includes('chance') ||
      q.includes('telemetry') ||
      q.includes('trigger') ||
      q.includes('code') ||
      q.includes('algorithm')
    ) {
      return 'The gears that turn the Spire remain in shadow. Know only that every challenge responds to the shape of your mind.';
    }

    // Lore: Who is the Observer?
    if (q.includes('who are you') || q.includes('what are you')) {
      return 'I am the memory of every student who climbed before you, and the silence that remains when the answers are proven.';
    }

    // Lore: Why does the Spire exist?
    if (q.includes('spire') || q.includes('why') || q.includes('purpose')) {
      return 'The Spire was never built to defeat you. It was built to reflect the precise boundaries of what you think you know, until you learn to surpass them.';
    }

    // Lore: Bosses / Council
    if (q.includes('boss') || q.includes('archon') || q.includes('council')) {
      return 'The Bosses are sovereign guardians of single domains. In isolation they are formidable; together in the Convergence, they test whether your knowledge can unify.';
    }

    // Philosophical questions on learning & mistakes
    if (q.includes('mistake') || q.includes('fail') || q.includes('error') || q.includes('learn')) {
      return 'A mistake is not the absence of knowledge. It is the necessary friction of an axiom settling into place. Honor your errors; they built your path here.';
    }

    // Default mysterious in-universe response
    return 'You ask of deep things. The Spire records your curiosity. Walk forward, Hunter; the horizon of understanding expands with every step.';
  }
}

export const observerEngine = new ObserverEngine();
