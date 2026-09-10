const fs = require('fs');

const encounters = [
  // -------------------------------------------------------------------------
  // LEVEL 1 (dsa_m1_01): Operation Counting & Primitive Steps
  // -------------------------------------------------------------------------
  {
    id: 'dsa_m1_01',
    levelNumber: 1,
    levelTitle: 'The Count of Operations',
    subject: 'data_structures_algorithms',
    topic: 'Algorithm Analysis & Operation Counting',
    conceptName: 'Primitive Operation Counting & Dominant Steps',
    pathType: 'main',
    objective: 'Identify the dominant primitive operations in an iterative block to construct the exact step function T(n).',
    problemStatement: 'Iterative array block: for i = 0 to n-1: for j = 0 to 2: sum += A[i] * B[j]. Calculate the exact dominant primitive operations and express the total step function T(n).',
    initialEquationOrState: 'Outer(n) * Inner(3) | Dominant Op: ? | Step Function: T(n) = ?',
    targetState: 'T(n) = 3n multiplications + 3n additions [COUNT VERIFIED]',
    correctAnswer: 'T(n) = 6n + c',
    optimalSequence: ['IDENTIFY_DOMINANT', 'COUNT_OPERATIONS', 'VERIFY_INVARIANT'],
    stepTransformations: [
      {
        stepIndex: 0,
        operationKey: 'IDENTIFY_DOMINANT',
        resultingState: 'Inner loop executes exactly 3 times per outer step i. Total inner loop bodies = 3n.',
        explanation: 'Isolated nested loop boundaries: Inner loop is fixed size 3, executing 3 times per each of n outer iterations.',
        damageValue: 35,
      },
      {
        stepIndex: 1,
        operationKey: 'COUNT_OPERATIONS',
        resultingState: 'Primitive step tally: 3n multiplications and 3n additions = 6n arithmetic steps.',
        explanation: 'Counted primitive operations: multiplication and addition each execute exactly 3n times across the entire nested block.',
        damageValue: 40,
      },
      {
        stepIndex: 2,
        operationKey: 'VERIFY_INVARIANT',
        resultingState: 'T(n) = 3n multiplications + 3n additions [COUNT VERIFIED]',
        explanation: 'Verified step function with constant loop overhead c: T(n) = 6n + c, proving linear Theta(n) time complexity.',
        damageValue: 35,
      },
    ],
    alternativePaths: [
      {
        id: 'dsa_m1_01_alt_count_first',
        name: 'Method B: Direct Arithmetic Tally',
        operations: ['COUNT_OPERATIONS', 'IDENTIFY_DOMINANT', 'VERIFY_INVARIANT'],
        educationalMethod: 'Direct Operation Accumulation',
        difficulty: 1,
        completionCondition: 'T(n) = 3n multiplications + 3n additions [COUNT VERIFIED]',
        transformations: [
          {
            stepIndex: 0,
            operationKey: 'COUNT_OPERATIONS',
            resultingState: 'Each inner step executes 1 multiply and 1 add. Total steps per outer loop = 2 * 3 = 6.',
            explanation: 'Tallied cost of single inner loop pass: 2 operations executed 3 times = 6 operations.',
            damageValue: 35,
          },
          {
            stepIndex: 1,
            operationKey: 'IDENTIFY_DOMINANT',
            resultingState: 'Outer loop iterates n times. Total arithmetic operations = 6 * n = 6n.',
            explanation: 'Accumulated across n outer iterations: 6n dominant arithmetic steps.',
            damageValue: 40,
          },
          {
            stepIndex: 2,
            operationKey: 'VERIFY_INVARIANT',
            resultingState: 'T(n) = 3n multiplications + 3n additions [COUNT VERIFIED]',
            explanation: 'Confirmed step tally T(n) = 6n + c = Theta(n).',
            damageValue: 35,
          },
        ],
      },
    ],
    misconceptions: [
      {
        triggerOperation: 'EXPAND_RECURRENCE',
        atStepIndex: 0,
        diagnosisType: 'procedural_error',
        title: 'Iterative vs Recursive Mismatch',
        diagnosisExplanation: 'Non-recursive iterative code blocks are evaluated by operation counting and loop summations, not recurrence unrolling.',
        enemyAdaptationName: 'Non-Recursive Resistance',
        enemyAdaptationEffect: 'Adversary gains defensive ward against recurrence operations.',
        repairConcept: 'Identify inner vs outer loop ranges to count primitive steps.',
        echoVaultId: 'vault_dsa_asymptotics',
      },
    ],
    enemy: {
      name: 'Primitive Counter',
      title: 'Sentinel of Instruction Cycles',
      hp: 110,
      attack: 18,
      visualType: 'algorithmic_horror',
      flavorQuote: 'Count every cycle, Hunter, or lose yourself in the instruction stream.',
    },
    rewardXp: 120,
    rewardMastery: 20,
  },

  // -------------------------------------------------------------------------
  // LEVEL 2 (dsa_m1_02): Asymptotic Bounds & Formal Limits
  // -------------------------------------------------------------------------
  {
    id: 'dsa_m1_02',
    levelNumber: 2,
    levelTitle: 'The Asymptotic Threshold',
    subject: 'data_structures_algorithms',
    topic: 'Asymptotic Notations (O, Ω, Θ)',
    conceptName: 'Formal Asymptotic Definitions & Constant Witnesses',
    pathType: 'main',
    objective: 'Prove tight asymptotic bounds by deriving positive bounding constants c1, c2 and threshold n0 satisfying the definition of Big-Theta.',
    problemStatement: 'Prove that execution time function T(n) = 4n² - 6n + 15 is Θ(n²) by deriving positive bounding constants c₁, c₂ > 0 and threshold n₀ such that c₁n² ≤ T(n) ≤ c₂n² for all n ≥ n₀.',
    initialEquationOrState: 'T(n) = 4n² - 6n + 15 | Formal Constants: c₁, c₂ = ?',
    targetState: 'c₁ = 1, c₂ = 5, n₀ = 3 => T(n) = Θ(n²) [BOUND PROVEN]',
    correctAnswer: 'c₁ = 1, c₂ = 5, n₀ = 3',
    optimalSequence: ['BOUND_ASYMPTOTIC', 'ANALYZE_CASES', 'VERIFY_INVARIANT'],
    stepTransformations: [
      {
        stepIndex: 0,
        operationKey: 'BOUND_ASYMPTOTIC',
        resultingState: 'Dominant quadratic term isolated: lim_{n -> inf} (4n² - 6n + 15)/n² = 4.',
        explanation: 'Isolated leading order term: The limit of the ratio equals 4, establishing quadratic asymptotic behavior.',
        damageValue: 40,
      },
      {
        stepIndex: 1,
        operationKey: 'ANALYZE_CASES',
        resultingState: 'Upper bound: For n >= 3, -6n + 15 <= 0 => T(n) <= 4n² <= 5n². Lower bound: T(n) >= 1n².',
        explanation: 'Formulated bounding constants: c1 = 1 and c2 = 5 valid for all n >= n0 = 3.',
        damageValue: 45,
      },
      {
        stepIndex: 2,
        operationKey: 'VERIFY_INVARIANT',
        resultingState: 'c₁ = 1, c₂ = 5, n₀ = 3 => T(n) = Θ(n²) [BOUND PROVEN]',
        explanation: 'Enforced formal Big-Theta definition: 1n² <= 4n² - 6n + 15 <= 5n² for all n >= 3.',
        damageValue: 35,
      },
    ],
    alternativePaths: [
      {
        id: 'dsa_m1_02_alt_cases_first',
        name: 'Method B: Inequality First Bounding',
        operations: ['ANALYZE_CASES', 'BOUND_ASYMPTOTIC', 'VERIFY_INVARIANT'],
        educationalMethod: 'Algebraic Inequality Bounding',
        difficulty: 2,
        completionCondition: 'c₁ = 1, c₂ = 5, n₀ = 3 => T(n) = Θ(n²) [BOUND PROVEN]',
        transformations: [
          {
            stepIndex: 0,
            operationKey: 'ANALYZE_CASES',
            resultingState: 'Bounded lower and upper terms: 4n² - 6n >= 1n² for n >= 2, and 4n² + 15 <= 5n² for n >= 4.',
            explanation: 'Derived algebraic inequalities for lower and upper envelopes.',
            damageValue: 40,
          },
          {
            stepIndex: 1,
            operationKey: 'BOUND_ASYMPTOTIC',
            resultingState: 'Unified constants: 1n² <= T(n) <= 5n² holds for all n >= max(2, 3) = 3.',
            explanation: 'Unified boundary threshold n0 = 3 and positive constants c1 = 1, c2 = 5.',
            damageValue: 45,
          },
          {
            stepIndex: 2,
            operationKey: 'VERIFY_INVARIANT',
            resultingState: 'c₁ = 1, c₂ = 5, n₀ = 3 => T(n) = Θ(n²) [BOUND PROVEN]',
            explanation: 'Validated tight asymptotic envelope Theta(n²).',
            damageValue: 35,
          },
        ],
      },
    ],
    misconceptions: [
      {
        triggerOperation: 'COUNT_OPERATIONS',
        atStepIndex: 0,
        diagnosisType: 'conceptual_misconception',
        title: 'Concrete Counting vs Asymptotic Definition',
        diagnosisExplanation: 'Asymptotic proof requires establishing constants c1, c2, n0, not merely recounting terms.',
        enemyAdaptationName: 'Order Distortion Wave',
        enemyAdaptationEffect: 'Adversary hardens against concrete tallying.',
        repairConcept: 'Apply Big-Theta definition: c1*g(n) <= f(n) <= c2*g(n).',
        echoVaultId: 'vault_dsa_asymptotics',
      },
    ],
    enemy: {
      name: 'Asymptotic Spectre',
      title: 'Manifestation of Lower-Order Shadows',
      hp: 120,
      attack: 20,
      visualType: 'algorithmic_horror',
      flavorQuote: 'Can your constants withstand the march toward infinity?',
    },
    rewardXp: 135,
    rewardMastery: 20,
  },

  // -------------------------------------------------------------------------
  // LEVEL 3 (dsa_m1_03): Best, Worst, and Average Case Analysis
  // -------------------------------------------------------------------------
  {
    id: 'dsa_m1_03',
    levelNumber: 3,
    levelTitle: 'The Spectrum of Inputs',
    subject: 'data_structures_algorithms',
    topic: 'Best, Worst, and Average Case Complexity',
    conceptName: 'Linear Search & Input Distribution Divergence',
    pathType: 'main',
    objective: 'Characterize input permutations that cause algorithmic performance divergence between best-case Ω(1), worst-case O(n), and average-case Θ(n).',
    problemStatement: 'Analyze Linear Search over an array of size n with uniformly distributed target queries. Determine step count expectations across Best, Worst, and Average case input permutations.',
    initialEquationOrState: 'Input Cases: Best = ? | Worst = ? | Average = ?',
    targetState: 'Best: Ω(1) [Index 0], Worst: O(n) [Index n-1 or Absent], Avg: E[T] = (n+1)/2 = Θ(n)',
    correctAnswer: 'Best: Ω(1), Worst: O(n), Average: Θ(n)',
    optimalSequence: ['ANALYZE_CASES', 'COUNT_OPERATIONS', 'VERIFY_INVARIANT'],
    stepTransformations: [
      {
        stepIndex: 0,
        operationKey: 'ANALYZE_CASES',
        resultingState: 'Best Case: Target at index 0 => 1 comparison. Worst Case: Target at index n-1 or absent => n comparisons.',
        explanation: 'Identified structural boundary cases: Immediate match at front vs exhaustive scan to array terminus.',
        damageValue: 40,
      },
      {
        stepIndex: 1,
        operationKey: 'COUNT_OPERATIONS',
        resultingState: 'Average Case Expectation: E[T] = sum_{k=1}^n k * (1/n) = (n+1)/2 comparisons.',
        explanation: 'Computed discrete expectation under uniform distribution: P(k) = 1/n across all valid positions.',
        damageValue: 45,
      },
      {
        stepIndex: 2,
        operationKey: 'VERIFY_INVARIANT',
        resultingState: 'Best: Ω(1) [Index 0], Worst: O(n) [Index n-1 or Absent], Avg: E[T] = (n+1)/2 = Θ(n)',
        explanation: 'Confirmed asymptotic classes: Best is Omega(1), Worst is O(n), and Average is Theta(n).',
        damageValue: 35,
      },
    ],
    alternativePaths: [
      {
        id: 'dsa_m1_03_alt_tally_first',
        name: 'Method B: Expectation First Derivation',
        operations: ['COUNT_OPERATIONS', 'ANALYZE_CASES', 'VERIFY_INVARIANT'],
        educationalMethod: 'Probabilistic Expectation Modeling',
        difficulty: 2,
        completionCondition: 'Best: Ω(1) [Index 0], Worst: O(n) [Index n-1 or Absent], Avg: E[T] = (n+1)/2 = Θ(n)',
        transformations: [
          {
            stepIndex: 0,
            operationKey: 'COUNT_OPERATIONS',
            resultingState: 'Computed expected steps: sum_{k=1}^n k*(1/n) = (n+1)/2 = 0.5n + 0.5.',
            explanation: 'Formulated probabilistic expectation across search indices.',
            damageValue: 40,
          },
          {
            stepIndex: 1,
            operationKey: 'ANALYZE_CASES',
            resultingState: 'Bound extremes: Min comparisons = 1 (Best), Max comparisons = n (Worst).',
            explanation: 'Extracted minimum and maximum case boundaries.',
            damageValue: 45,
          },
          {
            stepIndex: 2,
            operationKey: 'VERIFY_INVARIANT',
            resultingState: 'Best: Ω(1) [Index 0], Worst: O(n) [Index n-1 or Absent], Avg: E[T] = (n+1)/2 = Θ(n)',
            explanation: 'Verified case complexity designations.',
            damageValue: 35,
          },
        ],
      },
    ],
    misconceptions: [
      {
        triggerOperation: 'SUM_SERIES',
        atStepIndex: 0,
        diagnosisType: 'conceptual_misconception',
        title: 'Premature Series Calculation',
        diagnosisExplanation: 'Characterize input permutations and case boundaries before summing expectations.',
        enemyAdaptationName: 'Distribution Chaos Field',
        enemyAdaptationEffect: 'Adversary redirects uncharacterized probability mass.',
        repairConcept: 'Identify best, worst, and average scenarios.',
        echoVaultId: 'vault_dsa_asymptotics',
      },
    ],
    enemy: {
      name: 'Variance Phantom',
      title: 'Disrupter of Average Cases',
      hp: 125,
      attack: 20,
      visualType: 'algorithmic_horror',
      flavorQuote: 'A single outlier can shatter your naive assumptions!',
    },
    rewardXp: 140,
    rewardMastery: 20,
  },

  // -------------------------------------------------------------------------
  // LEVEL 4 (dsa_m1_04): Space Complexity & Call Stack Analysis
  // -------------------------------------------------------------------------
  {
    id: 'dsa_m1_04',
    levelNumber: 4,
    levelTitle: 'The Depth of Memory',
    subject: 'data_structures_algorithms',
    topic: 'Space Complexity & Call Stack Analysis',
    conceptName: 'Auxiliary Memory vs Input Space & Call Frame Stacks',
    pathType: 'main',
    objective: 'Calculate total auxiliary memory for recursive divide-and-conquer vs iterative traversal, proving stack depth bounds.',
    problemStatement: 'A recursive divide-and-conquer function traverses a balanced binary search tree of n nodes. Each activation record uses 32 bytes of stack memory. Determine the maximum auxiliary call-stack memory required.',
    initialEquationOrState: 'Tree: n nodes, balanced | Activation Record: 32B | Peak Stack Space: ?',
    targetState: 'h = ⌊log₂ n⌋ => Peak Stack: 32(⌊log₂ n⌋ + 1) bytes = O(log n) Auxiliary Space',
    correctAnswer: 'O(log n) Auxiliary Space',
    optimalSequence: ['EVALUATE_SPACE', 'BOUND_ASYMPTOTIC', 'VERIFY_INVARIANT'],
    stepTransformations: [
      {
        stepIndex: 0,
        operationKey: 'EVALUATE_SPACE',
        resultingState: 'Balanced tree height h = floor(log₂ n). Maximum call stack depth = h + 1 frames.',
        explanation: 'Evaluated recursion call depth: At any instant, the stack holds frames along a single path from root to leaf.',
        damageValue: 40,
      },
      {
        stepIndex: 1,
        operationKey: 'BOUND_ASYMPTOTIC',
        resultingState: 'Peak auxiliary stack memory: 32 * (floor(log₂ n) + 1) bytes = Theta(log n) bytes.',
        explanation: 'Calculated byte allocation: Frame size 32 is constant, giving logarithmic auxiliary memory consumption.',
        damageValue: 45,
      },
      {
        stepIndex: 2,
        operationKey: 'VERIFY_INVARIANT',
        resultingState: 'h = ⌊log₂ n⌋ => Peak Stack: 32(⌊log₂ n⌋ + 1) bytes = O(log n) Auxiliary Space',
        explanation: 'Proved auxiliary space bound: Auxiliary memory is strictly O(log n) while input data space is O(n).',
        damageValue: 35,
      },
    ],
    alternativePaths: [
      {
        id: 'dsa_m1_04_alt_asymptotic_first',
        name: 'Method B: Order Analysis First',
        operations: ['BOUND_ASYMPTOTIC', 'EVALUATE_SPACE', 'VERIFY_INVARIANT'],
        educationalMethod: 'Asymptotic Depth Bounding',
        difficulty: 2,
        completionCondition: 'h = ⌊log₂ n⌋ => Peak Stack: 32(⌊log₂ n⌋ + 1) bytes = O(log n) Auxiliary Space',
        transformations: [
          {
            stepIndex: 0,
            operationKey: 'BOUND_ASYMPTOTIC',
            resultingState: 'Tree traversal recursion depth is bounded by tree height O(log n).',
            explanation: 'Established logarithmic bound on maximum call chain.',
            damageValue: 40,
          },
          {
            stepIndex: 1,
            operationKey: 'EVALUATE_SPACE',
            resultingState: 'Peak stack memory = 32 bytes/frame * (log₂ n + 1) frames.',
            explanation: 'Computed exact byte scaling from stack frame dimensions.',
            damageValue: 45,
          },
          {
            stepIndex: 2,
            operationKey: 'VERIFY_INVARIANT',
            resultingState: 'h = ⌊log₂ n⌋ => Peak Stack: 32(⌊log₂ n⌋ + 1) bytes = O(log n) Auxiliary Space',
            explanation: 'Verified auxiliary memory bound O(log n).',
            damageValue: 35,
          },
        ],
      },
    ],
    misconceptions: [
      {
        triggerOperation: 'COUNT_OPERATIONS',
        atStepIndex: 0,
        diagnosisType: 'conceptual_misconception',
        title: 'Time vs Space Conflation',
        diagnosisExplanation: 'Memory analysis evaluates simultaneous resident call frames and allocations, not total executed operations.',
        enemyAdaptationName: 'Stack Overflow Ward',
        enemyAdaptationEffect: 'Adversary hardens against time-based metrics.',
        repairConcept: 'Calculate maximum simultaneous activation frames.',
        echoVaultId: 'vault_dsa_asymptotics',
      },
    ],
    enemy: {
      name: 'Stack Leech',
      title: 'Devourer of Call Frames',
      hp: 130,
      attack: 22,
      visualType: 'algorithmic_horror',
      flavorQuote: 'Every unclosed frame feeds the void in memory!',
    },
    rewardXp: 150,
    rewardMastery: 20,
  },

  // -------------------------------------------------------------------------
  // LEVEL 5 (dsa_m1_05): Non-Recursive Algorithm Analysis (Nested Summations)
  // -------------------------------------------------------------------------
  {
    id: 'dsa_m1_05',
    levelNumber: 5,
    levelTitle: 'The Triangular Crucible',
    subject: 'data_structures_algorithms',
    topic: 'Non-Recursive Algorithm Analysis',
    conceptName: 'Dependent Nested Loop Summations',
    pathType: 'main',
    objective: 'Evaluate exact closed-form double summations for nested loops with dependent index bounds and logarithmic steps.',
    problemStatement: 'Evaluate the total step complexity of: for i = 1 to n: for j = 1 to i: k = 1; while k < n: k *= 2; sum++. Formulate the exact double summation and derive the tight asymptotic order.',
    initialEquationOrState: 'Summation: ∑_{i=1}^n ∑_{j=1}^i ∑_{k} 1 | Step Tally: ?',
    targetState: 'T(n) = (n(n+1)/2) * ⌈log₂ n⌉ = Θ(n² log n) [SUMMATION RESOLVED]',
    correctAnswer: 'Θ(n² log n)',
    optimalSequence: ['SUM_SERIES', 'COUNT_OPERATIONS', 'BOUND_ASYMPTOTIC'],
    stepTransformations: [
      {
        stepIndex: 0,
        operationKey: 'SUM_SERIES',
        resultingState: 'Innermost while loop: k doubles each pass (1, 2, 4, ..., 2^p < n), executing exactly ceil(log₂ n) times.',
        explanation: 'Resolved innermost loop: Repeated doubling produces exactly logarithmic step count ceil(log2 n).',
        damageValue: 45,
      },
      {
        stepIndex: 1,
        operationKey: 'COUNT_OPERATIONS',
        resultingState: 'Middle loop sum_{j=1}^i 1 = i. Outer loop sum_{i=1}^n i = n(n+1)/2 triangular pairs.',
        explanation: 'Calculated dependent summation: Outer dependent nested loops evaluate to n(n+1)/2.',
        damageValue: 45,
      },
      {
        stepIndex: 2,
        operationKey: 'BOUND_ASYMPTOTIC',
        resultingState: 'T(n) = (n(n+1)/2) * ⌈log₂ n⌉ = Θ(n² log n) [SUMMATION RESOLVED]',
        explanation: 'Combined terms: T(n) = (n²/2 + n/2) * log₂ n = Theta(n² log n).',
        damageValue: 40,
      },
    ],
    alternativePaths: [
      {
        id: 'dsa_m1_05_alt_count_first',
        name: 'Method B: Outer Dependent First',
        operations: ['COUNT_OPERATIONS', 'SUM_SERIES', 'BOUND_ASYMPTOTIC'],
        educationalMethod: 'Iterated Summation Unrolling',
        difficulty: 3,
        completionCondition: 'T(n) = (n(n+1)/2) * ⌈log₂ n⌉ = Θ(n² log n) [SUMMATION RESOLVED]',
        transformations: [
          {
            stepIndex: 0,
            operationKey: 'COUNT_OPERATIONS',
            resultingState: 'Pairwise loop executions = sum_{i=1}^n i = n(n+1)/2 iterations.',
            explanation: 'Tallied outer double loop total execution count.',
            damageValue: 45,
          },
          {
            stepIndex: 1,
            operationKey: 'SUM_SERIES',
            resultingState: 'Inner while loop contributes independent factor ceil(log₂ n) per execution.',
            explanation: 'Multiplied by independent innermost logarithmic loop cost.',
            damageValue: 45,
          },
          {
            stepIndex: 2,
            operationKey: 'BOUND_ASYMPTOTIC',
            resultingState: 'T(n) = (n(n+1)/2) * ⌈log₂ n⌉ = Θ(n² log n) [SUMMATION RESOLVED]',
            explanation: 'Established tight bound Theta(n² log n).',
            damageValue: 40,
          },
        ],
      },
    ],
    misconceptions: [
      {
        triggerOperation: 'BOUND_ASYMPTOTIC',
        atStepIndex: 0,
        diagnosisType: 'procedural_error',
        title: 'Premature Asymptotic Guess',
        diagnosisExplanation: 'Solve the algebraic loop summation before applying asymptotic bounds.',
        enemyAdaptationName: 'Logarithmic Distortion',
        enemyAdaptationEffect: 'Adversary shields against ungrounded asymptotic guesses.',
        repairConcept: 'Solve the innermost and outer summations algebraically.',
        echoVaultId: 'vault_dsa_asymptotics',
      },
    ],
    enemy: {
      name: 'Summation Golem',
      title: 'Monolith of Nested Indices',
      hp: 140,
      attack: 24,
      visualType: 'algorithmic_horror',
      flavorQuote: 'A triangular grid expands faster than naive eyes perceive!',
    },
    rewardXp: 165,
    rewardMastery: 20,
  },

  // -------------------------------------------------------------------------
  // LEVEL 6 (dsa_m1_06): Algorithm Correctness & Loop Invariants
  // -------------------------------------------------------------------------
  {
    id: 'dsa_m1_06',
    levelNumber: 6,
    levelTitle: 'The Invariant Forge',
    subject: 'data_structures_algorithms',
    topic: 'Correctness Proofs & Invariants',
    conceptName: 'Loop Invariant: Initialization, Maintenance, Termination',
    pathType: 'main',
    objective: 'Establish the correctness of Insertion Sort on array A[0..n-1]. State the loop invariant for index i and prove Initialization, Maintenance, and Termination conditions.',
    problemStatement: 'Establish the correctness of Insertion Sort on array A[0..n-1]. State the loop invariant for index i and prove Initialization, Maintenance, and Termination conditions.',
    initialEquationOrState: 'Invariant Candidate: A[0..i-1] | Verification: Init, Maint, Term',
    targetState: 'Invariant: A[0..i-1] is sorted permutation of original elements. At i=n, A[0..n-1] is sorted [PROOF COMPLETE]',
    correctAnswer: 'A[0..i-1] is sorted permutation',
    optimalSequence: ['IDENTIFY_INVARIANT', 'INDUCTIVE_STEP', 'VERIFY_INVARIANT'],
    stepTransformations: [
      {
        stepIndex: 0,
        operationKey: 'IDENTIFY_INVARIANT',
        resultingState: 'Candidate Invariant: At start of iteration i, subarray A[0..i-1] consists of original elements in sorted order.',
        explanation: 'Stated formal loop invariant: Subarray prefix A[0..i-1] is sorted and maintains conservation of elements.',
        damageValue: 40,
      },
      {
        stepIndex: 1,
        operationKey: 'INDUCTIVE_STEP',
        resultingState: 'Init (i=1): Single element A[0] is trivially sorted. Maint: Step i shifts elements > key right, inserting key at proper position.',
        explanation: 'Proved Initialization (base case) and Maintenance (inductive step preserving sortedness after element insertion).',
        damageValue: 45,
      },
      {
        stepIndex: 2,
        operationKey: 'VERIFY_INVARIANT',
        resultingState: 'Invariant: A[0..i-1] is sorted permutation of original elements. At i=n, A[0..n-1] is sorted [PROOF COMPLETE]',
        explanation: 'Proved Termination: Loop terminates when i = n. Invariant holds at termination, proving A[0..n-1] is fully sorted.',
        damageValue: 35,
      },
    ],
    alternativePaths: [
      {
        id: 'dsa_m1_06_alt_induct_first',
        name: 'Method B: Inductive Verification First',
        operations: ['INDUCTIVE_STEP', 'IDENTIFY_INVARIANT', 'VERIFY_INVARIANT'],
        educationalMethod: 'Direct Inductive Maintenance',
        difficulty: 3,
        completionCondition: 'Invariant: A[0..i-1] is sorted permutation of original elements. At i=n, A[0..n-1] is sorted [PROOF COMPLETE]',
        transformations: [
          {
            stepIndex: 0,
            operationKey: 'INDUCTIVE_STEP',
            resultingState: 'Verified inner while loop shifts elements to preserve sorted prefix order.',
            explanation: 'Confirmed shifting step preserves inductive sorting invariant.',
            damageValue: 40,
          },
          {
            stepIndex: 1,
            operationKey: 'IDENTIFY_INVARIANT',
            resultingState: 'Formal invariant established for prefix subarray A[0..i-1].',
            explanation: 'Framed formal invariant property for iteration i.',
            damageValue: 45,
          },
          {
            stepIndex: 2,
            operationKey: 'VERIFY_INVARIANT',
            resultingState: 'Invariant: A[0..i-1] is sorted permutation of original elements. At i=n, A[0..n-1] is sorted [PROOF COMPLETE]',
            explanation: 'Terminated with full correctness proof.',
            damageValue: 35,
          },
        ],
      },
    ],
    misconceptions: [
      {
        triggerOperation: 'COUNT_OPERATIONS',
        atStepIndex: 0,
        diagnosisType: 'conceptual_misconception',
        title: 'Step Counting vs Invariant Proof',
        diagnosisExplanation: 'Proving algorithm correctness requires demonstrating invariant preservation, not counting operations.',
        enemyAdaptationName: 'Truth Fracture Field',
        enemyAdaptationEffect: 'Adversary resists non-proof operations.',
        repairConcept: 'Formulate the invariant property holding across all iterations.',
        echoVaultId: 'vault_dsa_asymptotics',
      },
    ],
    enemy: {
      name: 'Axiom Sentinel',
      title: 'Judge of Inductive Rigor',
      hp: 145,
      attack: 24,
      visualType: 'algorithmic_horror',
      flavorQuote: 'An algorithm without proof is merely a lucky guess.',
    },
    rewardXp: 175,
    rewardMastery: 20,
  },

  // -------------------------------------------------------------------------
  // LEVEL 7 (dsa_m1_07): Recurrence Relations & Iteration Method
  // -------------------------------------------------------------------------
  {
    id: 'dsa_m1_07',
    levelNumber: 7,
    levelTitle: 'The Telescoping Veil',
    subject: 'data_structures_algorithms',
    topic: 'Recurrence Relations & Iteration Method',
    conceptName: 'Algebraic Unrolling & Telescoping Series',
    pathType: 'main',
    objective: 'Solve the divide-and-conquer recurrence: T(n) = 2T(n/2) + 3n, T(1) = 1 (assume n = 2^k). Unroll the recurrence to the k-th step and evaluate the closed form.',
    problemStatement: 'Solve the divide-and-conquer recurrence: T(n) = 2T(n/2) + 3n, T(1) = 1 (assume n = 2^k). Unroll the recurrence to the k-th step and evaluate the closed form.',
    initialEquationOrState: 'T(n) = 2T(n/2) + 3n | Unrolled Form: T(n) = 2^k T(n/2^k) + ?',
    targetState: 'T(n) = 2^k T(1) + 3n * k = n + 3n log₂ n = Θ(n log n) [EXPANSION RESOLVED]',
    correctAnswer: 'T(n) = 3n log₂ n + n',
    optimalSequence: ['EXPAND_RECURRENCE', 'SUM_SERIES', 'BOUND_ASYMPTOTIC'],
    stepTransformations: [
      {
        stepIndex: 0,
        operationKey: 'EXPAND_RECURRENCE',
        resultingState: 'Step 1: T(n) = 2[2T(n/4) + 3(n/2)] + 3n = 4T(n/4) + 2(3n). Step k: T(n) = 2^k T(n/2^k) + k(3n).',
        explanation: 'Unrolled recurrence: Substituted repeatedly to identify general k-th step pattern: 2^k T(n/2^k) + 3nk.',
        damageValue: 45,
      },
      {
        stepIndex: 1,
        operationKey: 'SUM_SERIES',
        resultingState: 'Base case reached at n/2^k = 1 => k = log₂ n. T(n) = 2^(log₂ n) T(1) + 3n(log₂ n) = n + 3n log₂ n.',
        explanation: 'Evaluated base condition and substituted k = log2(n) into algebraic expansion.',
        damageValue: 45,
      },
      {
        stepIndex: 2,
        operationKey: 'BOUND_ASYMPTOTIC',
        resultingState: 'T(n) = 2^k T(1) + 3n * k = n + 3n log₂ n = Θ(n log n) [EXPANSION RESOLVED]',
        explanation: 'Concluded closed-form solution T(n) = 3n log2 n + n = Theta(n log n).',
        damageValue: 40,
      },
    ],
    alternativePaths: [
      {
        id: 'dsa_m1_07_alt_asymp_direct',
        name: 'Method B: Direct Telescoping Sum',
        operations: ['EXPAND_RECURRENCE', 'BOUND_ASYMPTOTIC', 'SUM_SERIES'],
        educationalMethod: 'Direct Telescoping Summation',
        difficulty: 3,
        completionCondition: 'T(n) = 2^k T(1) + 3n * k = n + 3n log₂ n = Θ(n log n) [EXPANSION RESOLVED]',
        transformations: [
          {
            stepIndex: 0,
            operationKey: 'EXPAND_RECURRENCE',
            resultingState: 'Expanded: T(n)/n = T(n/2)/(n/2) + 3. Telescoping sum of constant 3 across log₂ n steps.',
            explanation: 'Divided recurrence by n to form telescoping sequence of differences.',
            damageValue: 45,
          },
          {
            stepIndex: 1,
            operationKey: 'BOUND_ASYMPTOTIC',
            resultingState: 'T(n)/n = T(1) + 3 log₂ n => T(n) = n + 3n log₂ n.',
            explanation: 'Summed constant differences over log2(n) steps.',
            damageValue: 45,
          },
          {
            stepIndex: 2,
            operationKey: 'SUM_SERIES',
            resultingState: 'T(n) = 2^k T(1) + 3n * k = n + 3n log₂ n = Θ(n log n) [EXPANSION RESOLVED]',
            explanation: 'Verified Theta(n log n) closed form.',
            damageValue: 40,
          },
        ],
      },
    ],
    misconceptions: [
      {
        triggerOperation: 'APPLY_MASTER_THEOREM',
        atStepIndex: 0,
        diagnosisType: 'procedural_error',
        title: 'Shortcut on First-Principles Recurrence',
        diagnosisExplanation: 'Master this encounter using the algebraic iteration method before applying the Master Theorem formula.',
        enemyAdaptationName: 'Recurrence Shell',
        enemyAdaptationEffect: 'Adversary negates formula shortcuts.',
        repairConcept: 'Unroll T(n) algebraically step-by-step.',
        echoVaultId: 'vault_dsa_asymptotics',
      },
    ],
    enemy: {
      name: 'Recurrence Shade',
      title: 'Weaver of Nested Unrollings',
      hp: 150,
      attack: 25,
      visualType: 'algorithmic_horror',
      flavorQuote: 'Each expansion pulls you deeper into the recursive spiral!',
    },
    rewardXp: 185,
    rewardMastery: 20,
  },

  // -------------------------------------------------------------------------
  // LEVEL 8 (dsa_m1_08): Substitution Method & Inductive Proofs
  // -------------------------------------------------------------------------
  {
    id: 'dsa_m1_08',
    levelNumber: 8,
    levelTitle: 'The Inductive Hypothesis',
    subject: 'data_structures_algorithms',
    topic: 'Recurrence Relations & Substitution Method',
    conceptName: 'Mathematical Induction & Boundary Constant Tuning',
    pathType: 'main',
    objective: 'Prove by mathematical induction that recurrence T(n) = 2T(⌊n/2⌋) + 17 is O(n). Formulate inductive hypothesis T(n) ≤ cn - d to balance boundary constants and establish required c and n₀.',
    problemStatement: 'Prove by mathematical induction that recurrence T(n) = 2T(⌊n/2⌋) + 17 is O(n). Formulate inductive hypothesis T(n) ≤ cn - d to balance boundary constants and establish required c and n₀.',
    initialEquationOrState: 'T(n) = 2T(⌊n/2⌋) + 17 | Inductive Hypothesis: T(n) ≤ ?',
    targetState: 'T(n) ≤ c(n) - 17 for c ≥ 34, n ≥ 2 => T(n) = O(n) [INDUCTION PROVEN]',
    correctAnswer: 'T(n) ≤ cn - 17, c ≥ 34',
    optimalSequence: ['INDUCTIVE_STEP', 'BOUND_ASYMPTOTIC', 'VERIFY_INVARIANT'],
    stepTransformations: [
      {
        stepIndex: 0,
        operationKey: 'INDUCTIVE_STEP',
        resultingState: 'Inductive Hypothesis: Assume T(m) <= cm - d for all m < n. Then T(n) <= 2[c(n/2) - d] + 17 = cn - 2d + 17.',
        explanation: 'Subtracted lower-order constant d to overcome additive constant 17 during inductive substitution.',
        damageValue: 45,
      },
      {
        stepIndex: 1,
        operationKey: 'BOUND_ASYMPTOTIC',
        resultingState: 'Enforce induction: cn - 2d + 17 <= cn - d <=> d >= 17. Setting d = 17 guarantees T(n) <= cn - 17.',
        explanation: 'Equated terms to prove inductive maintenance: d = 17 satisfies the inequality for all n.',
        damageValue: 45,
      },
      {
        stepIndex: 2,
        operationKey: 'VERIFY_INVARIANT',
        resultingState: 'T(n) ≤ c(n) - 17 for c ≥ 34, n ≥ 2 => T(n) = O(n) [INDUCTION PROVEN]',
        explanation: 'Base case verification: Pick c >= 34 for base cases n = 2, 3, establishing formal proof that T(n) = O(n).',
        damageValue: 40,
      },
    ],
    alternativePaths: [
      {
        id: 'dsa_m1_08_alt_bound_first',
        name: 'Method B: Constant Analysis First',
        operations: ['BOUND_ASYMPTOTIC', 'INDUCTIVE_STEP', 'VERIFY_INVARIANT'],
        educationalMethod: 'Subtractive Constant Tuning',
        difficulty: 4,
        completionCondition: 'T(n) ≤ c(n) - 17 for c ≥ 34, n ≥ 2 => T(n) = O(n) [INDUCTION PROVEN]',
        transformations: [
          {
            stepIndex: 0,
            operationKey: 'BOUND_ASYMPTOTIC',
            resultingState: 'Identified that naive guess T(n) <= cn fails because cn + 17 is not <= cn.',
            explanation: 'Diagnosed standard substitution pitfall: additive constants require subtractive terms in hypothesis.',
            damageValue: 45,
          },
          {
            stepIndex: 1,
            operationKey: 'INDUCTIVE_STEP',
            resultingState: 'Strengthened hypothesis to T(n) <= cn - 17. Substitution yields cn - 34 + 17 = cn - 17.',
            explanation: 'Substituted strengthened hypothesis into recurrence.',
            damageValue: 45,
          },
          {
            stepIndex: 2,
            operationKey: 'VERIFY_INVARIANT',
            resultingState: 'T(n) ≤ c(n) - 17 for c ≥ 34, n ≥ 2 => T(n) = O(n) [INDUCTION PROVEN]',
            explanation: 'Verified base cases for c >= 34, completing the formal induction.',
            damageValue: 40,
          },
        ],
      },
    ],
    misconceptions: [
      {
        triggerOperation: 'IDENTIFY_DOMINANT',
        atStepIndex: 0,
        diagnosisType: 'procedural_error',
        title: 'Dropping Boundary Constants in Induction',
        diagnosisExplanation: 'You cannot drop constants during mathematical induction. Strengthen the hypothesis by subtracting a lower-order term.',
        enemyAdaptationName: 'Inductive Gap Trap',
        enemyAdaptationEffect: 'Adversary gains ward against unproved constants.',
        repairConcept: 'Use hypothesis T(n) <= cn - d.',
        echoVaultId: 'vault_dsa_asymptotics',
      },
    ],
    enemy: {
      name: 'Inductive Warden',
      title: 'Guardian of Boundary Constants',
      hp: 155,
      attack: 25,
      visualType: 'algorithmic_horror',
      flavorQuote: 'A single unproven constant will collapse your entire inductive tower!',
    },
    rewardXp: 200,
    rewardMastery: 25,
  },

  // -------------------------------------------------------------------------
  // LEVEL 9 (dsa_m1_09): Recursion Trees & Leaf Summations (MINI-BOSS: Chronos)
  // -------------------------------------------------------------------------
  {
    id: 'dsa_m1_09',
    levelNumber: 9,
    levelTitle: 'The Fractal Depths',
    subject: 'data_structures_algorithms',
    topic: 'Recursion Trees & Leaf Summations',
    conceptName: 'Level-by-Level Work Tallying & Geometric Convergence',
    pathType: 'main',
    isBoss: true,
    objective: 'Construct a complete recursion tree to evaluate root-dominated vs leaf-dominated divide-and-conquer recurrences.',
    problemStatement: 'Chronos challenges you with branching recurrence T(n) = 3T(n/4) + cn². Construct the full recursion tree: compute work at depth i, calculate total leaves, and sum all levels to evaluate whether root or leaves dominate.',
    initialEquationOrState: 'Recurrence: T(n) = 3T(n/4) + cn² | Tree Levels: ? | Dominance: ?',
    targetState: 'Level i work: (3/16)^i cn² => Geometric sum converges to cn²/(1 - 3/16) = Θ(n²) [ROOT DOMINATED]',
    correctAnswer: 'T(n) = Θ(n²) [Root Dominated]',
    optimalSequence: ['BUILD_RECURSION_TREE', 'SUM_SERIES', 'BOUND_ASYMPTOTIC'],
    stepTransformations: [
      {
        stepIndex: 0,
        operationKey: 'BUILD_RECURSION_TREE',
        resultingState: 'Level i has 3^i subproblems, each of size n/4^i. Cost at level i = 3^i * c(n/4^i)² = (3/16)^i * cn².',
        explanation: 'Constructed recursive tree levels: Work per level decreases geometrically by ratio 3/16.',
        damageValue: 50,
      },
      {
        stepIndex: 1,
        operationKey: 'SUM_SERIES',
        resultingState: 'Total cost = cn² * sum_{i=0}^{log_4 n} (3/16)^i < cn² * sum_{i=0}^inf (3/16)^i = cn² / (1 - 3/16) = (16/13)cn².',
        explanation: 'Summed decreasing geometric series: Ratio 3/16 < 1 guarantees geometric sum is dominated by root term.',
        damageValue: 55,
      },
      {
        stepIndex: 2,
        operationKey: 'BOUND_ASYMPTOTIC',
        resultingState: 'Level i work: (3/16)^i cn² => Geometric sum converges to cn²/(1 - 3/16) = Θ(n²) [ROOT DOMINATED]',
        explanation: 'Verified root dominance: Total leaf cost is Theta(n^(log_4 3)) approx Theta(n^0.793), strictly dominated by Theta(n²).',
        damageValue: 45,
      },
    ],
    alternativePaths: [
      {
        id: 'dsa_m1_09_alt_sum_first',
        name: 'Method B: Geometric Summation First',
        operations: ['SUM_SERIES', 'BUILD_RECURSION_TREE', 'BOUND_ASYMPTOTIC'],
        educationalMethod: 'Geometric Ratio Analysis',
        difficulty: 4,
        completionCondition: 'Level i work: (3/16)^i cn² => Geometric sum converges to cn²/(1 - 3/16) = Θ(n²) [ROOT DOMINATED]',
        transformations: [
          {
            stepIndex: 0,
            operationKey: 'SUM_SERIES',
            resultingState: 'Identified geometric ratio r = a / b² = 3 / 4² = 3/16 < 1. Decreasing series.',
            explanation: 'Calculated work ratio between adjacent tree levels.',
            damageValue: 50,
          },
          {
            stepIndex: 1,
            operationKey: 'BUILD_RECURSION_TREE',
            resultingState: 'Constructed tree depth log_4 n and confirmed level i cost is (3/16)^i cn².',
            explanation: 'Mapped level cost into recursion tree depth.',
            damageValue: 55,
          },
          {
            stepIndex: 2,
            operationKey: 'BOUND_ASYMPTOTIC',
            resultingState: 'Level i work: (3/16)^i cn² => Geometric sum converges to cn²/(1 - 3/16) = Θ(n²) [ROOT DOMINATED]',
            explanation: 'Concluded root domination: Theta(n²).',
            damageValue: 45,
          },
        ],
      },
    ],
    misconceptions: [
      {
        triggerOperation: 'COUNT_OPERATIONS',
        atStepIndex: 0,
        diagnosisType: 'procedural_error',
        title: 'Flat Counting on Branching Trees',
        diagnosisExplanation: 'Branching recurrences require building tree levels and calculating the geometric decay ratio, not flat counting.',
        enemyAdaptationName: 'Fractal Barrier',
        enemyAdaptationEffect: 'Chronos manifests a temporal reflection barrier.',
        repairConcept: 'Compute level i cost = a^i * f(n/b^i).',
        echoVaultId: 'vault_dsa_asymptotics',
      },
    ],
    enemy: {
      name: 'Chronos the Asymptotic Arbiter',
      title: 'Warden of Geometric Expansions',
      hp: 160,
      attack: 25,
      visualType: 'algorithmic_horror',
      flavorQuote: 'Witness the infinite branches of computation collapse into a single point!',
    },
    rewardXp: 240,
    rewardMastery: 30,
  },

  // -------------------------------------------------------------------------
  // LEVEL 10 (dsa_m1_10): Master Theorem & Asymptotic Synthesis (MODULE BOSS)
  // -------------------------------------------------------------------------
  {
    id: 'dsa_m1_10',
    levelNumber: 10,
    levelTitle: 'The Complexity Gatekeeper',
    subject: 'data_structures_algorithms',
    topic: 'Master Theorem & Invariant Synthesis',
    conceptName: 'Polynomial Separation Watershed & Multi-Case Invariant Proof',
    pathType: 'main',
    isBoss: true,
    objective: 'Synthesize Master Theorem case conditions, verify polynomial separation vs logarithmic gaps, and prove the asymptotic bound under adversarial perturbation.',
    problemStatement: 'The Asymptotic Colossus challenges your understanding of divide-and-conquer recurrences: T(n) = 8T(n/2) + 1000n² + n³ log n. Compute the watershed exponent n^(log_b a), test Master Theorem conditions, and establish the tight asymptotic bound.',
    initialEquationOrState: 'Colossus Recurrence: T(n) = 8T(n/2) + 1000n² + n³ log n | Master Case: ?',
    targetState: 'a=8, b=2 => n^(log_2 8) = n³. Extended Case 2: f(n)=n³ log n => T(n) = Θ(n³ log² n) [COLOSSUS SHATTERED]',
    correctAnswer: 'Θ(n³ log² n)',
    optimalSequence: ['APPLY_MASTER_THEOREM', 'EXPAND_RECURRENCE', 'BOUND_ASYMPTOTIC', 'VERIFY_INVARIANT'],
    stepTransformations: [
      {
        stepIndex: 0,
        operationKey: 'APPLY_MASTER_THEOREM',
        resultingState: 'Parameters: a = 8, b = 2. Critical watershed exponent: n^(log_b a) = n^(log_2 8) = n³.',
        explanation: 'Extracted divide-and-conquer parameters and computed leaf watershed growth rate n³.',
        damageValue: 50,
      },
      {
        stepIndex: 1,
        operationKey: 'EXPAND_RECURRENCE',
        resultingState: 'Driving function f(n) = 1000n² + n³ log n. Dominant driving term is n³ log n = n^(log_b a) * log^k n with k = 1.',
        explanation: 'Analyzed driving function: 1000n² is lower-order; dominant term matches watershed exponent with extra factor log n.',
        damageValue: 50,
      },
      {
        stepIndex: 2,
        operationKey: 'BOUND_ASYMPTOTIC',
        resultingState: 'Extended Master Case 2 applies (k = 1): T(n) = Theta(n^(log_b a) * log^{k+1} n) = Theta(n³ log² n).',
        explanation: 'Evaluated Extended Master Case 2: Multiplying watershed by log^(k+1) n yields Theta(n³ log² n).',
        damageValue: 55,
      },
      {
        stepIndex: 3,
        operationKey: 'VERIFY_INVARIANT',
        resultingState: 'a=8, b=2 => n^(log_2 8) = n³. Extended Case 2: f(n)=n³ log n => T(n) = Θ(n³ log² n) [COLOSSUS SHATTERED]',
        explanation: 'Verified asymptotic proof: Lower-order term 1000n² is strictly absorbed, proving Colossus recurrence solution.',
        damageValue: 45,
      },
    ],
    alternativePaths: [
      {
        id: 'dsa_m1_10_alt_expand_first',
        name: 'Method B: Recursion Tree Decomposition',
        operations: ['EXPAND_RECURRENCE', 'APPLY_MASTER_THEOREM', 'BOUND_ASYMPTOTIC', 'VERIFY_INVARIANT'],
        educationalMethod: 'Level Summation Decomposition',
        difficulty: 5,
        completionCondition: 'a=8, b=2 => n^(log_2 8) = n³. Extended Case 2: f(n)=n³ log n => T(n) = Θ(n³ log² n) [COLOSSUS SHATTERED]',
        transformations: [
          {
            stepIndex: 0,
            operationKey: 'EXPAND_RECURRENCE',
            resultingState: 'Decomposed work per level i: 8^i * (n/2^i)³ log(n/2^i) = n³ * (log n - i).',
            explanation: 'Decomposed level work showing each of log2 n levels performs Theta(n³ log n) work.',
            damageValue: 50,
          },
          {
            stepIndex: 1,
            operationKey: 'APPLY_MASTER_THEOREM',
            resultingState: 'Sum of log₂ n levels of cost n³(log n - i) yields n³ * sum_{i=0}^{log n} (log n - i) = n³ * (log² n)/2.',
            explanation: 'Summed arithmetic progression of logarithmic factors over depth log2 n.',
            damageValue: 50,
          },
          {
            stepIndex: 2,
            operationKey: 'BOUND_ASYMPTOTIC',
            resultingState: 'Total summation evaluates to (1/2) n³ log² n = Theta(n³ log² n).',
            explanation: 'Evaluated leading summation term.',
            damageValue: 55,
          },
          {
            stepIndex: 3,
            operationKey: 'VERIFY_INVARIANT',
            resultingState: 'a=8, b=2 => n^(log_2 8) = n³. Extended Case 2: f(n)=n³ log n => T(n) = Θ(n³ log² n) [COLOSSUS SHATTERED]',
            explanation: 'Confirmed equivalence with Extended Master Case 2.',
            damageValue: 45,
          },
        ],
      },
    ],
    misconceptions: [
      {
        triggerOperation: 'ANALYZE_CASES',
        atStepIndex: 0,
        diagnosisType: 'procedural_error',
        title: 'Conflating Input Cases with Master Method Cases',
        diagnosisExplanation: 'Input case analysis (best/worst) is distinct from Master Theorem cases (comparing f(n) against n^(log_b a)).',
        enemyAdaptationName: 'Axiomatic Wall',
        enemyAdaptationEffect: 'The Colossus absorbs non-asymptotic inquiries.',
        repairConcept: 'Compute n^(log_b a) and compare with f(n).',
        echoVaultId: 'vault_dsa_asymptotics',
      },
    ],
    enemy: {
      name: 'The Asymptotic Colossus',
      title: 'Titan of the Complexity Gate',
      hp: 200,
      attack: 30,
      visualType: 'algorithmic_horror',
      flavorQuote: 'Unless your bounds are tight across all orders of growth, you shall be ground to dust!',
    },
    rewardXp: 300,
    rewardMastery: 40,
  },

  // -------------------------------------------------------------------------
  // PRESERVED PROTOTYPE LEVELS FOR FUTURE MODULES (BACKWARDS COMPATIBILITY)
  // -------------------------------------------------------------------------
  // Module 2 Prototype (AVL)
  {
    id: 'dsa_lvl_2',
    levelNumber: 11,
    levelTitle: 'The Structure Forge',
    subject: 'data_structures_algorithms',
    topic: 'Balanced Binary Search Trees',
    conceptName: 'AVL Tree Self-Balancing Rotations',
    pathType: 'main',
    objective: 'Compute the node balance factor and execute the required rotation to restore the AVL tree invariant.',
    problemStatement: 'Binary Search Tree violates AVL condition after key insertion: Left-heavy subtree balance factor BF = +2 with Left-Right child configuration. Restore height balance.',
    initialEquationOrState: 'Node Balance Factor: BF = +2 (Left-Right Heavy) | Rotation: ?',
    targetState: 'LR Double Rotation: Left Rotate Child -> Right Rotate Root [AVL RESTORED]',
    correctAnswer: 'LR Double Rotation',
    optimalSequence: ['AVL_ROTATE', 'PARTITION_PIVOT', 'VERIFY_INVARIANT'],
    stepTransformations: [
      {
        stepIndex: 0,
        operationKey: 'AVL_ROTATE',
        resultingState: 'Left rotate left child node to convert LR configuration into LL configuration.',
        explanation: 'Step 1 of Double Rotation: Aligned left child and grandchild along linear left-heavy axis.',
        damageValue: 40,
      },
      {
        stepIndex: 1,
        operationKey: 'PARTITION_PIVOT',
        resultingState: 'Right rotate root node around the newly aligned pivot.',
        explanation: 'Step 2 of Double Rotation: Elevated median key to root, reducing left subtree height by 1.',
        damageValue: 45,
      },
      {
        stepIndex: 2,
        operationKey: 'VERIFY_INVARIANT',
        resultingState: 'Node Balance Factor: BF = 0 (-1 <= BF <= +1) [AVL RESTORED]',
        explanation: 'Confirmed all node balance factors strictly satisfy AVL height invariant in O(1) rotation time.',
        damageValue: 35,
      },
    ],
    misconceptions: [],
    enemy: {
      name: 'Imbalance Golem',
      title: 'Fractured BST Titan',
      hp: 130,
      attack: 22,
      visualType: 'algorithmic_horror',
      flavorQuote: 'A skewed tree collapses into degenerate O(n) traversal!',
    },
    rewardXp: 175,
    rewardMastery: 25,
  },

  // Module 3 Prototype (Quicksort)
  {
    id: 'dsa_lvl_3',
    levelNumber: 25,
    levelTitle: 'The Algorithmic Arsenal',
    subject: 'data_structures_algorithms',
    topic: 'Divide and Conquer & Backtracking',
    conceptName: 'Quicksort Median Partitioning & Pruning',
    pathType: 'main',
    objective: 'Partition the array buffer around a chosen pivot to prove the sorting partition invariant in O(n).',
    problemStatement: 'Unsorted array buffer B[0..n-1] requires Hoare/Lomuto partitioning around pivot P. Establish the two monotonic sub-arrays.',
    initialEquationOrState: 'Array: B[0..n-1] (Unpartitioned) | Invariant: B[i] <= P <= B[j]',
    targetState: 'Partition Boundary Verified: B[low..p-1] <= P <= B[p+1..high] [PARTITION PROVEN]',
    correctAnswer: 'Partition Invariant Satisfied',
    optimalSequence: ['PARTITION_PIVOT', 'BOUND_ASYMPTOTIC', 'VERIFY_INVARIANT'],
    stepTransformations: [
      {
        stepIndex: 0,
        operationKey: 'PARTITION_PIVOT',
        resultingState: 'Pivot selected: P = B[high]. Two-pointer scan initialized: i = low - 1, j = low.',
        explanation: 'Isolated pivot element and established running pointer indices.',
        damageValue: 40,
      },
      {
        stepIndex: 1,
        operationKey: 'BOUND_ASYMPTOTIC',
        resultingState: 'Linear scan completed in O(n) time with swaps moving elements <= P to the left segment.',
        explanation: 'Demonstrated that partitioning requires exactly single-pass O(n) comparisons.',
        damageValue: 45,
      },
      {
        stepIndex: 2,
        operationKey: 'VERIFY_INVARIANT',
        resultingState: 'B[low..p-1] <= P <= B[p+1..high] [PARTITION PROVEN]',
        explanation: 'Proved partition invariant: All elements to the left are <= P and all elements to the right are >= P.',
        damageValue: 40,
      },
    ],
    misconceptions: [],
    enemy: {
      name: 'Entropy Partitioner',
      title: 'Disruptor of Pivot Bounds',
      hp: 140,
      attack: 24,
      visualType: 'algorithmic_horror',
      flavorQuote: 'Without balanced pivots, your algorithm degrades to quadratic ruin!',
    },
    rewardXp: 200,
    rewardMastery: 25,
  },

  // Module 4 Prototype (Dijkstra)
  {
    id: 'dsa_lvl_4',
    levelNumber: 35,
    levelTitle: 'The Optimization Forge',
    subject: 'data_structures_algorithms',
    topic: 'Greedy Shortest Path & Dynamic Programming',
    conceptName: 'Dijkstra Priority Relaxation & Optimal Substructure',
    pathType: 'main',
    objective: 'Apply greedy priority relaxation to compute minimum-cost shortest paths across a weighted network.',
    problemStatement: 'Town water-pipeline network represented as weighted graph G = (V, E) with non-negative edge weights. Compute shortest pipeline distance from source junction s in O((V + E) log V).',
    initialEquationOrState: 'Graph: G=(V,E) | Source: s | Unrelaxed Distances: dist[v] = ∞',
    targetState: 'All Pipeline Distances Relaxed: Shortest Path Tree Established [DIJKSTRA OPTIMAL]',
    correctAnswer: 'O((V + E) log V)',
    optimalSequence: ['RELAX_EDGE', 'MEMOIZE_SUBPROBLEM', 'VERIFY_INVARIANT'],
    stepTransformations: [
      {
        stepIndex: 0,
        operationKey: 'RELAX_EDGE',
        resultingState: 'Min-Priority Queue extracted minimum vertex u. Relaxed adjacent edges: dist[v] = dist[u] + w(u, v).',
        explanation: 'Greedy choice: Extracted unvisited junction with minimal tentative distance and relaxed outgoing pipeline conduits.',
        damageValue: 45,
      },
      {
        stepIndex: 1,
        operationKey: 'MEMOIZE_SUBPROBLEM',
        resultingState: 'Predecessor array and shortest distance matrix memoized into optimal substructure table.',
        explanation: 'Stored optimal subpaths: Any subpath of a shortest path is itself a shortest path.',
        damageValue: 45,
      },
      {
        stepIndex: 2,
        operationKey: 'VERIFY_INVARIANT',
        resultingState: 'All junctions processed in O((V + E) log V) [DIJKSTRA OPTIMAL]',
        explanation: 'Triangle inequality confirmed for all edges: dist[v] <= dist[u] + w(u, v).',
        damageValue: 40,
      },
    ],
    misconceptions: [],
    enemy: {
      name: 'Geodesic Behemoth',
      title: 'Warden of the Shortest Paths',
      hp: 155,
      attack: 26,
      visualType: 'algorithmic_horror',
      flavorQuote: 'Negative cycles will devour all who stumble into non-Euclidean voids!',
    },
    rewardXp: 225,
    rewardMastery: 25,
  },

  // Module 5 Prototype (Turing Archon Boss)
  {
    id: 'dsa_boss',
    levelNumber: 54,
    levelTitle: 'The Complexity Abyss',
    subject: 'data_structures_algorithms',
    topic: 'NP-Completeness & Sovereign Reducibility',
    conceptName: 'Intractability & Polynomial Reductions',
    isBoss: true,
    pathType: 'main',
    objective: 'Demonstrate polynomial-time reduction from 3SAT to Vertex Cover and prove the NP-completeness invariant.',
    problemStatement: 'Sovereign Intractability Gate: Prove that if 3SAT ≤_p Vertex Cover, then Vertex Cover is NP-Complete assuming NP-membership.',
    initialEquationOrState: 'Reduction: 3SAT ≤_p Vertex Cover | Complexity Proof: ?',
    targetState: 'Polynomial Reduction Verified: Vertex Cover is NP-Complete [COMPLEXITY ABYSS MASTERED]',
    correctAnswer: 'NP-Complete via Polynomial Reduction',
    optimalSequence: ['BOUND_ASYMPTOTIC', 'PARTITION_PIVOT', 'MEMOIZE_SUBPROBLEM', 'VERIFY_INVARIANT'],
    stepTransformations: [
      {
        stepIndex: 0,
        operationKey: 'BOUND_ASYMPTOTIC',
        resultingState: 'Verification certificate: Proposed vertex cover of size k verifiable in deterministic polynomial time O(V + E) => Vertex Cover ∈ NP.',
        explanation: 'Demonstrated polynomial-time verifiability: Checking that every edge touches at least one chosen vertex takes linear time.',
        damageValue: 45,
      },
      {
        stepIndex: 1,
        operationKey: 'PARTITION_PIVOT',
        resultingState: 'Gadget Construction: Created literal clause triangles and variable pair gadgets in polynomial time O(n + m).',
        explanation: 'Mapped boolean formula φ into graph G such that φ is satisfiable iff G has a vertex cover of target size k.',
        damageValue: 45,
      },
      {
        stepIndex: 2,
        operationKey: 'MEMOIZE_SUBPROBLEM',
        resultingState: 'Bidirectional proof established: φ is satisfiable <=> Vertex Cover of size k exists.',
        explanation: 'Proved correctness: Truth assignment directly selects vertices covering clause triangles and variable edges.',
        damageValue: 45,
      },
      {
        stepIndex: 3,
        operationKey: 'VERIFY_INVARIANT',
        resultingState: '3SAT ≤_p Vertex Cover proven: Vertex Cover is NP-Complete [COMPLEXITY ABYSS MASTERED]',
        explanation: 'Concluded Cook-Levin reduction hierarchy: Vertex Cover is NP-hard and in NP, hence NP-Complete.',
        damageValue: 50,
      },
    ],
    misconceptions: [],
    enemy: {
      name: 'The Turing Archon',
      title: 'Sovereign of the Algorithmic Abyss',
      hp: 190,
      attack: 28,
      visualType: 'turing_archon',
      flavorQuote: 'Unless P = NP, the abyss of exponential intractability shall consume you!',
    },
    rewardXp: 300,
    rewardMastery: 40,
  },
];

// Helper to inject valid cards into encounters
function buildValidCardsForEncounter(enc) {
  const opKeys = new Set();
  enc.optimalSequence.forEach(op => opKeys.add(op));
  if (enc.alternativePaths) {
    enc.alternativePaths.forEach(ap => ap.operations.forEach(op => opKeys.add(op)));
  }
  // Default fallback cards for strategic choice and distractors
  opKeys.add('BOUND_ASYMPTOTIC');
  opKeys.add('VERIFY_INVARIANT');
  opKeys.add('IDENTIFY_DOMINANT');
  opKeys.add('COUNT_OPERATIONS');

  const cards = [];
  opKeys.forEach(op => {
    const card = DSA_STARTER_CARDS.find(c => c.operationKey === op);
    if (card) cards.push(card);
  });
  return cards;
}

// Assign valid cards to each encounter
encounters.forEach(enc => {
  enc.validCards = buildValidCardsForEncounter(enc);
});

// Also alias dsa_lvl_1 to dsa_m1_01 for 100% backward compatibility
const dsaLvl1Alias = {
  ...encounters[0],
  id: 'dsa_lvl_1',
};
encounters.push(dsaLvl1Alias);

console.log(`Generated ${encounters.length} encounters.`);
