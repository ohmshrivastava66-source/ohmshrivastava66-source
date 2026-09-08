import { SubjectId } from '../types/game';
import { SurpriseAttackDefinition, EliteSynthesisQuestion } from '../types/surpriseAttack';

// Mathematics: The Singularity Ambush
export const MATH_SURPRISE_AMBUSH: SurpriseAttackDefinition = {
  id: 'math_surprise_ambush',
  title: 'The Singularity Ambush: Synthesis of Quadratic Invariants & Linear Constraints',
  flavorText:
    'The creatures of the Spire emerge from the dimensional rift. They have witnessed your mathematical velocity and forged a paradoxical lock requiring simultaneous algebraic decomposition and constraint satisfaction.',
  subject: 'mathematics',
  difficultyTier: 'elite',
  cooldownBattles: 2,
  minThreatLevel: 40,
  prestigeReward: {
    xp: 180,
    title: 'Apex Invariant',
    relic: 'Aegis of the Hunted',
    masteryBonus: 10,
  },
  eliteQuestions: [
    {
      id: 'math_ambush_q1',
      scenario:
        'A kinetic ward is bound by the system: { y - 2x = 3,  x² - y + 1 = 0 }. The ward can only be deactivated by substituting the linear relation into the quadratic constraint, factoring the resulting polynomial, and isolating the non-negative coordinate root x.',
      objective:
        'Determine the correct quadratic substitution equation and identify the valid non-negative coordinate value for x.',
      combinedConcepts: ['math_linear_systems', 'math_factorization', 'math_roots_radicals'],
      options: [
        {
          id: 'opt_math_1_a',
          label: 'A. Substitute y = 2x + 3 → x² - 2x - 2 = 0; roots cannot be factored over integers.',
          isCorrect: false,
          rationale:
            'Incorrect sign distribution during substitution: x² - (2x + 3) + 1 yields x² - 2x - 2, which fails to track that +1 - 3 = -2, but the actual equation has +1, giving x² - 2x - 2 instead of verifying the zero terms.',
          distractorMisconception: 'Sign error during binomial distribution',
        },
        {
          id: 'opt_math_1_b',
          label: 'B. Substitute y = 2x + 3 → x² - 2x - 2 = 0 → x = 2; premature estimation without factoring.',
          isCorrect: false,
          rationale:
            'Premature root extraction without factoring or verifying the discriminant leads to invalid root acceptance.',
          distractorMisconception: 'Premature root extraction without factoring',
        },
        {
          id: 'opt_math_1_c',
          label:
            'C. Substitute y = 2x + 3 → x² - (2x + 3) + 1 = 0 → x² - 2x - 2 = 0 with discriminant Δ = 4 - 4(1)(-2) = 12 → x = (2 ± √12)/2 = 1 ± √3; valid non-negative root is x = 1 + √3 ≈ 2.732.',
          isCorrect: true,
          rationale:
            'Exact substitution yields x² - 2x - 2 = 0. Applying the quadratic formula gives x = 1 ± √3. Because 1 - √3 < 0, the strictly non-negative root is x = 1 + √3.',
        },
        {
          id: 'opt_math_1_d',
          label: 'D. Substitute y = 2x - 3 → x² - 2x + 4 = 0 → roots are complex conjugates.',
          isCorrect: false,
          rationale:
            'Inverted transposition of y - 2x = 3 resulted in y = 2x - 3 instead of y = 2x + 3.',
          distractorMisconception: 'Transposition inversion in linear system',
        },
      ],
      correctExplanation:
        'Solving y = 2x + 3 and substituting into x² - y + 1 = 0 yields x² - 2x - 2 = 0. The quadratic formula gives roots x = 1 ± √3. The non-negative root is 1 + √3.',
      recoveryEchoVaultId: 'vault_factorization',
    },
    {
      id: 'math_ambush_q2',
      scenario:
        'A secondary seal demands simultaneous verification: Given the factored polynomial P(x) = (x - 3)(2x + 1)(x + 4) = 0, an enemy ward negates any root that violates the linear boundary condition 2x + 5 > 3. Which root legitimately survives both the polynomial equation and the strict inequality boundary?',
      objective:
        'Extract all candidate roots using the Zero Product Property, test each against the boundary inequality, and identify the surviving invariant root.',
      combinedConcepts: ['math_factorization', 'math_roots_radicals', 'math_verification'],
      options: [
        {
          id: 'opt_math_2_a',
          label: 'A. All candidate roots {-4, -1/2, 3} survive because they solve P(x) = 0.',
          isCorrect: false,
          rationale:
            'Ignoring boundary constraints: x = -4 yields 2(-4) + 5 = -3, which violates 2x + 5 > 3.',
          distractorMisconception: 'Omission of domain/boundary constraints',
        },
        {
          id: 'opt_math_2_b',
          label: 'B. Only x = 3 survives, because both negative roots are immediately invalid in any geometric ward.',
          isCorrect: false,
          rationale:
            'Premature dismissal of negative roots without checking the inequality. Note that x = -1/2 yields 2(-1/2) + 5 = 4 > 3, which is completely valid!',
          distractorMisconception: 'Premature sign bias discarding valid negative roots',
        },
        {
          id: 'opt_math_2_c',
          label:
            'C. Candidate roots are x = 3, x = -1/2, x = -4. The boundary 2x + 5 > 3 requires x > -1. Thus, x = 3 and x = -1/2 survive, while x = -4 is excluded.',
          isCorrect: true,
          rationale:
            'Zero Product Property gives x = 3, x = -1/2, and x = -4. The boundary condition 2x + 5 > 3 simplifies to 2x > -2 => x > -1. Since 3 > -1 and -1/2 > -1, both survive. -4 < -1, so it is eliminated.',
        },
        {
          id: 'opt_math_2_d',
          label: 'D. Roots are x = -3, x = 1/2, x = 4; none satisfy the condition.',
          isCorrect: false,
          rationale:
            'Sign reversal error when applying Zero Product Property (setting x - a = 0 gives x = +a, not -a).',
          distractorMisconception: 'Root sign reversal misconception',
        },
      ],
      correctExplanation:
        'P(x) = 0 yields x ∈ {3, -0.5, -4}. The inequality 2x + 5 > 3 simplifies to x > -1. Thus, roots 3 and -0.5 survive, and -4 is filtered out.',
      recoveryEchoVaultId: 'vault_verification',
    },
  ],
};

// Computer Science: The Complexity Ambush
export const CS_SURPRISE_AMBUSH: SurpriseAttackDefinition = {
  id: 'cs_surprise_ambush',
  title: 'The Complexity Ambush: Synthesis of Invariants, Search Boundaries & Dynamic Memoization',
  flavorText:
    'The algorithmic sentinels converge to halt your computational ascendancy. They present a multi-paradigm anomaly requiring precise loop invariant maintenance, binary boundary partitioning, and overlapping subproblem analysis.',
  subject: 'computerScience',
  difficultyTier: 'elite',
  cooldownBattles: 2,
  minThreatLevel: 40,
  prestigeReward: {
    xp: 180,
    title: 'Turing Vanguard',
    relic: 'Aegis of the Hunted',
    masteryBonus: 10,
  },
  eliteQuestions: [
    {
      id: 'cs_ambush_q1',
      scenario:
        'You are optimizing a search over a monotonically non-decreasing rotated sorted array. To maintain O(log N) complexity without falling into O(N) degradation, you must combine the binary search boundary invariant with dynamic partition logic.',
      objective:
        'Identify the correct invariant check that determines which half of the array is guaranteed to be strictly sorted at each iteration.',
      combinedConcepts: ['cs_arrays_invariants', 'cs_binary_search', 'cs_sorting'],
      options: [
        {
          id: 'opt_cs_1_a',
          label:
            'A. Compare target with array[mid]. If target > array[mid], the right subarray is always sorted.',
          isCorrect: false,
          rationale:
            'Comparing target to array[mid] tells you where target might lie relative to mid, but not whether the subarray itself is contiguous or contains the rotation pivot.',
          distractorMisconception: 'Conflating target position with array monotonicity',
        },
        {
          id: 'opt_cs_1_b',
          label:
            'B. Check if array[low] <= array[mid]. If true, the left half [low..mid] is strictly ordered; otherwise the right half [mid..high] is strictly ordered.',
          isCorrect: true,
          rationale:
            'In a rotated sorted array, at least one half [low..mid] or [mid..high] must remain contiguous and un-rotated. If array[low] <= array[mid], the left half is guaranteed monotonic, allowing logarithmic boundary narrowing.',
        },
        {
          id: 'opt_cs_1_c',
          label:
            'C. If array[mid] > array[high], immediately reset low = 0 and perform linear scan to find the pivot.',
          isCorrect: false,
          rationale:
            'Linear scan destroys the O(log N) guarantee, degrading worst-case performance to O(N).',
          distractorMisconception: 'Algorithmic degradation fallback to linear scanning',
        },
        {
          id: 'opt_cs_1_d',
          label:
            'D. Use mid = (low + high + 1) / 2 without bounds checking to avoid off-by-one errors.',
          isCorrect: false,
          rationale:
            'Altering mid bias without corresponding boundary assignment (low = mid vs high = mid - 1) causes infinite loops when high - low = 1.',
          distractorMisconception: 'Off-by-one infinite loop trap in binary midpoint',
        },
      ],
      correctExplanation:
        'Comparing array[low] <= array[mid] establishes which half is sorted. Once identified, checking if target lies within that sorted range deterministically narrows the search in O(log N).',
      recoveryEchoVaultId: 'vault_binary_search',
    },
    {
      id: 'cs_ambush_q2',
      scenario:
        'An energy cost matrix has overlapping subproblems: E(i) = min(E(i-1) + C1, E(i-2) + C2). An ambush daemon attempts to force naive recursion, asserting that memoization requires O(2^N) state storage because both paths must be kept in memory simultaneously.',
      objective:
        'Synthesize dynamic programming optimal substructure with space complexity optimization to refute the daemon and identify the optimal memory footprint.',
      combinedConcepts: ['cs_dynamic_programming', 'cs_arrays_invariants'],
      options: [
        {
          id: 'opt_cs_2_a',
          label:
            'A. The daemon is correct; caching all recursive branch decisions requires an exponential tree cache of O(2^N) space.',
          isCorrect: false,
          rationale:
            'Subproblems are overlapping, not unique. There are only N distinct states (i = 1..N), so naive memoization requires at most O(N) space, never O(2^N).',
          distractorMisconception: 'Conflating recursion tree nodes with distinct subproblem state count',
        },
        {
          id: 'opt_cs_2_b',
          label:
            'B. Because E(i) depends strictly on the two immediate predecessor states E(i-1) and E(i-2), space can be compressed to O(1) auxiliary variables while maintaining O(N) linear time.',
          isCorrect: true,
          rationale:
            'Markovian property / sliding window state reduction: keeping prev1 and prev2 allows computing current in O(1) space and O(N) time.',
        },
        {
          id: 'opt_cs_2_c',
          label:
            'C. Space can only be reduced to O(log N) by applying divide-and-conquer master theorem.',
          isCorrect: false,
          rationale:
            'The recurrence is linear order-2, not fractional divide-and-conquer (T(N) = 2T(N/2)). Master theorem does not apply.',
          distractorMisconception: 'Misapplying Master Theorem to linear recurrences',
        },
        {
          id: 'opt_cs_2_d',
          label:
            'D. Memoization cannot be used if costs C1 and C2 vary between steps.',
          isCorrect: false,
          rationale:
            'Step-dependent transition weights (C1[i], C2[i]) are standard in dynamic programming and do not invalidate optimal substructure.',
          distractorMisconception: 'Believing dynamic programming requires invariant step costs',
        },
      ],
      correctExplanation:
        'The recurrence E(i) only references E(i-1) and E(i-2). Retaining only the last two computed states compresses memory from O(N) to O(1) space while retaining O(N) time.',
      recoveryEchoVaultId: 'vault_sorting',
    },
  ],
};

export const SURPRISE_ATTACKS_MAP: Record<SubjectId, SurpriseAttackDefinition> = {
  mathematics: MATH_SURPRISE_AMBUSH,
  computerScience: CS_SURPRISE_AMBUSH,
  physics: {
    ...MATH_SURPRISE_AMBUSH,
    id: 'physics_surprise_ambush',
    subject: 'physics',
    title: 'The Relativistic Ambush: Synthesis of Kinetic Work & Field Invariants',
  },
  chemistry: {
    ...MATH_SURPRISE_AMBUSH,
    id: 'chemistry_surprise_ambush',
    subject: 'chemistry',
    title: 'The Equilibrium Ambush: Synthesis of Stoichiometry & Le Chatelier Shifts',
  },
  biology: {
    ...CS_SURPRISE_AMBUSH,
    id: 'biology_surprise_ambush',
    subject: 'biology',
    title: 'The Genetic Ambush: Synthesis of Mendelian Ratios & Transcription Regulation',
  },
  history: {
    ...CS_SURPRISE_AMBUSH,
    id: 'history_surprise_ambush',
    subject: 'history',
    title: 'The Chronological Ambush: Synthesis of Geopolitical Causation & Evidence Synthesis',
  },
  geography: {
    ...MATH_SURPRISE_AMBUSH,
    id: 'geography_surprise_ambush',
    subject: 'geography',
    title: 'The Tectonic Ambush: Synthesis of Topographical Gradients & Climate Drivers',
  },
  language: {
    ...CS_SURPRISE_AMBUSH,
    id: 'language_surprise_ambush',
    subject: 'language',
    title: 'The Semantic Ambush: Synthesis of Syntactic Parsing & Rhetorical Logic',
  },
};
