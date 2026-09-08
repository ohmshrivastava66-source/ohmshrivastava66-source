import { SubjectId } from '../types/game';
import { PlayerProfile } from '../types/telemetry';
import { CounterStrategyChallenge, StrategySignature } from '../types/learningDna';
import { learningDNAEngine } from './LearningDNAEngine';
import { Mulberry32PRNG } from './DangerEngine';

export class CounterStrategyEngine {
  private prng: Mulberry32PRNG;

  constructor(seed: number = 888888) {
    this.prng = new Mulberry32PRNG(seed);
  }

  public setSeed(seed: number) {
    this.prng = new Mulberry32PRNG(seed);
  }

  /**
   * Evaluates if a counter-strategy challenge should trigger based on behavioral evidence
   * Normal: 2–5% | Strong evidence: 5–10% | Max: 12%
   */
  public evaluateOpportunity(
    profile: PlayerProfile,
    isJudgeDemo: boolean = false
  ): { shouldTrigger: boolean; probability: number; signature?: StrategySignature } {
    if (isJudgeDemo) {
      return { shouldTrigger: false, probability: 0 };
    }

    const dna = learningDNAEngine.getLearningDNA(profile);
    const signatures = learningDNAEngine.getDominantStrategies(profile);

    if (signatures.length === 0) {
      const prob = 0.03; // baseline 3%
      const roll = this.prng.next();
      return { shouldTrigger: roll < prob, probability: prob };
    }

    // Determine evidence strength
    let probability = 0.04; // default 4% with mild signature
    const primary = signatures[0];

    if (
      (primary === 'shortcut_seeker' && dna.riskTaking >= 75) ||
      (primary === 'rapid_pattern_matcher' && dna.speedProfile >= 80) ||
      (primary === 'surface_pattern_dependent' && dna.patternRecognition >= 75)
    ) {
      probability = 0.09; // strong behavioral evidence (5–10%)
    }

    if (signatures.length >= 2 && dna.accuracy >= 75) {
      probability = 0.12; // exceptional evidence (hard cap 12%)
    }

    const roll = this.prng.next();
    return {
      shouldTrigger: roll < probability,
      probability,
      signature: primary,
    };
  }

  /**
   * Generates a curated, curriculum-fair challenge adapting to the player's strategy
   * NEVER CHEATS: Correct answer is mathematically/algorithmically sound.
   */
  public generateChallenge(
    subject: SubjectId,
    signature: StrategySignature = 'shortcut_seeker'
  ): CounterStrategyChallenge {
    if (subject === 'mathematics') {
      if (signature === 'shortcut_seeker' || signature === 'rapid_pattern_matcher') {
        return {
          id: 'cs_math_shortcut_trap',
          targetSignature: signature,
          subject: 'mathematics',
          adaptationType: 'plausible_distractor',
          originalConceptId: 'math_factorization',
          scenario:
            'A polynomial has roots that appear symmetrically obvious at first glance: P(x) = x² - 5x - 6 = 0. Notice the negative constant term.',
          objective:
            'Identify the authentic roots without falling into sign inversion or premature factorization assumptions.',
          options: [
            {
              id: 'opt_c_1',
              label: 'A. x = 6 and x = -1, because (x - 6)(x + 1) = x² - 5x - 6 = 0.',
              isCorrect: true,
              rationale:
                'Factors of -6 summing to -5 are -6 and +1, yielding roots x = 6 and x = -1.',
            },
            {
              id: 'opt_c_2',
              label: 'B. x = 2 and x = 3, because 2 + 3 = 5 and 2 × 3 = 6.',
              isCorrect: false,
              rationale:
                'Classic shortcut trap: assumed c = +6 instead of c = -6. (x - 2)(x - 3) = x² - 5x + 6, not -6.',
              distractorMisconception: 'Plausible sign shortcut error on constant term',
              isPlausibleShortcut: true,
            },
            {
              id: 'opt_c_3',
              label: 'C. x = -2 and x = -3.',
              isCorrect: false,
              rationale: 'Double sign inversion error.',
            },
            {
              id: 'opt_c_4',
              label: 'D. x = -6 and x = 1.',
              isCorrect: false,
              rationale: 'Inverted root signs from factors.',
            },
          ],
          correctExplanation:
            'Because the constant term is -6, factors must have opposite signs. -6 and +1 sum to -5, proving the factors are (x - 6)(x + 1) = 0 and the roots are x = 6, x = -1.',
        };
      }

      // Default math multi-step depth challenge
      return {
        id: 'cs_math_multistep_depth',
        targetSignature: signature,
        subject: 'mathematics',
        adaptationType: 'multi_step_depth',
        originalConceptId: 'math_roots_radicals',
        scenario:
          'Solve for x in the equation: √(2x + 7) = x + 2. Squaring introduces candidate roots that require axiomatic verification.',
        objective:
          'Square both sides, solve the resulting quadratic equation, and eliminate any extraneous roots.',
        options: [
          {
            id: 'opt_c_m1',
            label: 'A. Only x = 1 is a valid real root; x = -3 is extraneous.',
            isCorrect: true,
            rationale:
              '2x + 7 = (x + 2)² => x² + 2x - 3 = 0 => (x + 3)(x - 1) = 0. For x = -3, √(1) = 1 != -1, so -3 is extraneous.',
          },
          {
            id: 'opt_c_m2',
            label: 'B. Both x = 1 and x = -3 are valid roots.',
            isCorrect: false,
            rationale:
              'Failed to verify candidate roots in original radical equation where square root yields principal non-negative value.',
            distractorMisconception: 'Extraneous root retention error',
            isPlausibleShortcut: true,
          },
          {
            id: 'opt_c_m3',
            label: 'C. Only x = -3 is a valid root.',
            isCorrect: false,
            rationale: 'Extraneous root incorrectly chosen.',
          },
          {
            id: 'opt_c_m4',
            label: 'D. No real roots exist.',
            isCorrect: false,
            rationale: 'x = 1 satisfies √(9) = 3 and 1 + 2 = 3.',
          },
        ],
        correctExplanation:
          'Squaring produces candidate roots x = 1 and x = -3. Verification into √(2x + 7) = x + 2 reveals √(1) = 1 while x = -3 yields √(1) = -1 (false), strictly isolating x = 1.',
      };
    }

    // Computer Science adaptation
    return {
      id: 'cs_cs_context_variation',
      targetSignature: signature,
      subject: 'computerScience',
      adaptationType: 'variable_context',
      originalConceptId: 'cs_binary_search',
      scenario:
        'Instead of searching a standard 1D sorted array, binary search is applied to a monotonously increasing mathematical function f(x) over interval [0, 1000] to locate the root where f(x) = 0.',
      objective:
        'Transfer binary search invariants to continuous bisection and determine the maximum iterations needed for precision ε = 1.',
      options: [
        {
          id: 'opt_c_cs1',
          label: 'A. At most ⌈log₂(1000)⌉ = 10 bisection iterations.',
          isCorrect: true,
          rationale:
            'Each step cuts the search interval in half. 2¹⁰ = 1024 > 1000, so 10 iterations guarantee interval length ≤ 1.',
        },
        {
          id: 'opt_c_cs2',
          label: 'B. 1000 iterations because bisection must inspect each integer point.',
          isCorrect: false,
          rationale: 'Conflating binary bisection with linear sequential search.',
          distractorMisconception: 'Linear search complexity confusion',
          isPlausibleShortcut: true,
        },
        {
          id: 'opt_c_cs3',
          label: 'C. 100 iterations (10% of search space).',
          isCorrect: false,
          rationale: 'Arbitrary decimal halving misconception.',
        },
        {
          id: 'opt_c_cs4',
          label: 'D. Undefined because binary search only applies to array indexes.',
          isCorrect: false,
          rationale: 'Fails to recognize mathematical transfer of binary search invariant.',
        },
      ],
      correctExplanation:
        'The halving invariant applies equally to continuous monotonic intervals. log₂(1000) ≈ 9.965, requiring exactly 10 iterations.',
    };
  }
}

export const counterStrategyEngine = new CounterStrategyEngine();
