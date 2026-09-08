import { ConvergenceTrial } from '../types/convergence';

export const CONVERGENCE_STATIC_TRIALS: ConvergenceTrial[] = [
  // TIER 1: THE COUNCIL TESTS YOU (Single Domain Elite)
  {
    id: 'conv_tier1_math',
    trialNumber: 1,
    tier: 1,
    tierLabel: 'TIER 1 — THE COUNCIL TESTS YOU',
    primaryBoss: 'mathematics',
    collaboratingBosses: [],
    scenario:
      'The Singularity Archon opens the examination: A non-linear matrix equation det(A - λI) = 0 generates eigenvalues from the characteristic polynomial P(λ) = λ³ - 6λ² + 11λ - 6 = 0. An axiomatic ward requires determining all three distinct eigenvalues to stabilize the dimensional rift.',
    objective:
      'Apply rational root theorem, factor the cubic polynomial into linear factors, and state the complete spectrum of eigenvalues.',
    combinedSubjects: ['mathematics'],
    combinedConcepts: ['math_factorization', 'math_roots_radicals'],
    dialogueIntro: 'The Singularity Archon: "Let us see if your mathematical foundation holds under solitary scrutiny."',
    dialogueCorrect: 'The Singularity Archon: "Correct. A trivial cubic. Do not flatter yourself."',
    dialogueWrong: 'The Singularity Archon: "A basic factoring breakdown. Predictable."',
    options: [
      {
        id: 'opt_c1_a',
        label: 'A. Test λ = 1 → (λ - 1)(λ² - 5λ + 6) = 0 → factors into (λ - 1)(λ - 2)(λ - 3) = 0; spectrum is {1, 2, 3}.',
        isCorrect: true,
        rationale:
          'P(1) = 1 - 6 + 11 - 6 = 0. Polynomial division gives quotient λ² - 5λ + 6, which factors cleanly into (λ - 2)(λ - 3). Thus eigenvalues are λ = 1, 2, 3.',
      },
      {
        id: 'opt_c1_b',
        label: 'B. Factor by grouping: λ²(λ - 6) + 11(λ - 6) = 0; roots are {6, ±√11}.',
        isCorrect: false,
        rationale:
          'Incorrect grouping: 11λ - 6 cannot factor out (λ - 6) because 11 * 6 ≠ 6.',
        distractorMisconception: 'Invalid grouping algebraic factorization',
      },
      {
        id: 'opt_c1_c',
        label: 'C. Roots are {-1, -2, -3} by direct negation of coefficients.',
        isCorrect: false,
        rationale:
          'Root sign reversal misconception: factors (λ - r) correspond to positive roots λ = r.',
        distractorMisconception: 'Root sign reversal misconception',
      },
      {
        id: 'opt_c1_d',
        label: 'D. Cubic has only one real root λ = 1; the remaining two are complex conjugates.',
        isCorrect: false,
        rationale:
          'The quadratic discriminant Δ = (-5)² - 4(1)(6) = 25 - 24 = 1 > 0, yielding two distinct real roots, not complex.',
        distractorMisconception: 'False complex root assumption',
      },
    ],
    correctExplanation:
      'By the Rational Root Theorem, candidates are factors of -6. λ = 1 yields P(1) = 0. Synthetic division produces λ² - 5λ + 6 = (λ - 2)(λ - 3). The spectrum is {1, 2, 3}.',
    recoveryEchoVaultId: 'vault_factorization',
  },

  // TIER 2: INTRA-DOMAIN SYNTHESIS (Deep multi-concept within CS)
  {
    id: 'conv_tier2_cs',
    trialNumber: 2,
    tier: 2,
    tierLabel: 'TIER 2 — SYNTHESIS',
    primaryBoss: 'computerScience',
    collaboratingBosses: ['mathematics'],
    scenario:
      'The Turing Archon combines algorithmic state machines: You must design an in-place partition that separates even and odd integers while preserving relative order (stable partition) in O(N log N) time and O(log N) auxiliary stack space using divide-and-conquer.',
    objective:
      'Synthesize recursive divide-and-conquer recurrence relations with array rotation invariants to achieve stability.',
    combinedSubjects: ['computerScience'],
    combinedConcepts: ['cs_arrays_invariants', 'cs_sorting', 'cs_dynamic_programming'],
    dialogueIntro: 'The Turing Archon: "Single concepts are child\'s play. Now synthesize stability, memory bounds, and asymptotic recurrence."',
    dialogueCorrect: 'The Turing Archon: "Hmph. You recognized block circular shifts. Proceed."',
    dialogueWrong: 'The Turing Archon: "Your invariant fractured before the base case even returned."',
    options: [
      {
        id: 'opt_c2_a',
        label: 'A. Two-pointer swap from opposite ends inward: left seeks odd, right seeks even, swap until pointers cross.',
        isCorrect: false,
        rationale:
          'Hoare-style two-pointer swap is unstable: it reverses the relative order of elements within the same parity class.',
        distractorMisconception: 'In-place two-pointer partitioning destroys stability',
      },
      {
        id: 'opt_c2_b',
        label: 'B. Divide array into halves [L..M] and [M+1..R], recursively stably partition each half, then swap the inner adjacent blocks (odds of left half with evens of right half) via block rotation.',
        isCorrect: true,
        rationale:
          'Divide-and-conquer with block rotation (via three array reversals) takes O(N) merge work per level. Recurrence T(N) = 2T(N/2) + O(N) gives O(N log N) time and O(log N) recursion stack space, preserving strict stability.',
      },
      {
        id: 'opt_c2_c',
        label: 'C. Allocate an auxiliary hash map of linked lists to bucket even and odd elements.',
        isCorrect: false,
        rationale:
          'Violates the O(log N) auxiliary space constraint by using O(N) auxiliary heap memory.',
        distractorMisconception: 'Violating auxiliary space constraints',
      },
      {
        id: 'opt_c2_d',
        label: 'D. Stable partition cannot be achieved in better than O(N²) time without O(N) extra space.',
        isCorrect: false,
        rationale:
          'False impossibility assertion; block-reversal divide-and-conquer accomplishes it in O(N log N) time.',
        distractorMisconception: 'False algorithmic lower-bound belief',
      },
    ],
    correctExplanation:
      'Stable in-place partition is achieved recursively: solve left and right halves, then exchange the inner contiguous segments (left-odds and right-evens) using cyclic block rotation in O(len) time.',
    recoveryEchoVaultId: 'vault_sorting',
  },

  // TIER 3: CROSS-DOMAIN (Mathematics + Computer Science)
  {
    id: 'conv_tier3_math_cs',
    trialNumber: 3,
    tier: 3,
    tierLabel: 'TIER 3 — CROSS-DOMAIN',
    primaryBoss: 'mathematics',
    collaboratingBosses: ['computerScience'],
    scenario:
      'The Singularity Archon and Turing Archon unite their constraints: You must compute the square root of a large integer N to precision ε = 10⁻⁶. One archon demands numerical Newton-Raphson iteration x_{k+1} = (x_k + N/x_k)/2, while the other demands discrete Binary Search over [1..N].',
    objective:
      'Evaluate the convergence rate and bit-complexity of both methods to determine why Newton-Raphson achieves quadratic convergence O(log(log(1/ε))) iterations compared to binary search O(log(1/ε)).',
    combinedSubjects: ['mathematics', 'computerScience'],
    combinedConcepts: ['math_roots_radicals', 'cs_binary_search'],
    dialogueIntro: 'The Singularity Archon: "Mathematics governs the tangent." The Turing Archon: "Computation counts the bits. Reconcile them."',
    dialogueCorrect: 'The Turing Archon: "Quadratic error doubling confirmed." The Singularity Archon: "A temporary reprieve."',
    dialogueWrong: 'The Singularity Archon: "Linear convergence was your ceiling." The Turing Archon: "Logarithmic ignorance."',
    options: [
      {
        id: 'opt_c3_a',
        label: 'A. Binary search is always faster because division is an O(1) hardware operation.',
        isCorrect: false,
        rationale:
          'Binary search halves the interval each step (linear convergence: 1 bit per step). For high precision, it requires far more iterations than Newton-Raphson.',
        distractorMisconception: 'Conflating iteration count with step latency',
      },
      {
        id: 'opt_c3_b',
        label: 'B. Newton-Raphson doubles the number of correct significant digits each iteration (quadratic convergence: ε_{k+1} ≈ M ε_k²), whereas binary search only gains 1 bit of precision per iteration.',
        isCorrect: true,
        rationale:
          'Taylor expansion of f(x) = x² - N around root √N reveals error recurrence e_{k+1} ≈ e_k² / (2√N). Once in the neighborhood of convergence, the correct digits double every step, achieving precision ε in O(log(log(1/ε))) steps.',
      },
      {
        id: 'opt_c3_c',
        label: 'C. Both algorithms have identical linear convergence O(log(1/ε)) because all root finding is bounded by Shannon information entropy.',
        isCorrect: false,
        rationale:
          'Newton-Raphson uses derivative curvature information (slope), breaking the 1-bit-per-query comparison bound of binary search.',
        distractorMisconception: 'Misapplying comparison-based information bounds to gradient methods',
      },
      {
        id: 'opt_c3_d',
        label: 'D. Newton-Raphson fails to converge on integer square roots if the initial guess is greater than N/2.',
        isCorrect: false,
        rationale:
          'For f(x) = x² - N, any positive initial guess x_0 > 0 converges monotonically to √N from above after the first iteration.',
        distractorMisconception: 'False divergence domain assumption',
      },
    ],
    correctExplanation:
      'Binary search exhibits linear convergence, adding 1 bit of accuracy per step (O(log(1/ε)) steps). Newton-Raphson exhibits quadratic convergence (ε_{k+1} ∝ ε_k²), doubling the accurate digits every iteration (O(log log(1/ε)) steps).',
    recoveryEchoVaultId: 'vault_binary_search',
  },

  // TIER 4: MULTI-DOMAIN COLLISION (Math + Physics + CS)
  {
    id: 'conv_tier4_math_phys_cs',
    trialNumber: 4,
    tier: 4,
    tierLabel: 'TIER 4 — MULTI-DOMAIN',
    primaryBoss: 'physics',
    collaboratingBosses: ['mathematics', 'computerScience'],
    scenario:
      'The Entropy Colossus, Singularity Archon, and Turing Archon construct a tri-domain ward: A planetary satellite orbits in a gravitational potential V(r) = -GM/r. A computational physics simulation must integrate equations of motion over 1,000,000 timesteps without the orbit decaying due to artificial numerical dissipation.',
    objective:
      'Synthesize Hamiltonian energy conservation (Physics), phase-space area preservation (Mathematics), and algorithmic numerical stability (Computer Science) to identify the required integrator.',
    combinedSubjects: ['physics', 'mathematics', 'computerScience'],
    combinedConcepts: ['math_linear_systems', 'cs_dynamic_programming', 'phys_energy_conservation'],
    dialogueIntro: 'The Entropy Colossus: "Energy cannot be created or destroyed, yet naive algorithms bleed orbital energy into the void."',
    dialogueCorrect: 'The Entropy Colossus: "The symplectic invariant holds. The orbit does not spiral."',
    dialogueWrong: 'The Entropy Colossus: "Your satellite spiraled into the singularity. Energy was not conserved."',
    options: [
      {
        id: 'opt_c4_a',
        label: 'A. Standard Forward Euler (Explicit Euler): x_{n+1} = x_n + v_n Δt, v_{n+1} = v_n + a_n Δt.',
        isCorrect: false,
        rationale:
          'Explicit Euler increases phase-space volume and energy artificially at every timestep, causing the satellite to spiral outward to infinity.',
        distractorMisconception: 'Believing Forward Euler is energy-conserving for orbital mechanics',
      },
      {
        id: 'opt_c4_b',
        label: 'B. Runge-Kutta 4th Order (RK4) with variable micro-step halving to force zero error.',
        isCorrect: false,
        rationale:
          'While RK4 has high local order O(Δt⁴), it is NOT symplectic. Over 1,000,000 steps, energy drifts secularly, causing long-term orbital collapse.',
        distractorMisconception: 'Conflating high local truncation order with symplectic conservation',
      },
      {
        id: 'opt_c4_c',
        label: 'C. Symplectic Verlet / Leapfrog integration: v_{n+1/2} = v_n + a_n(Δt/2), x_{n+1} = x_n + v_{n+1/2} Δt, v_{n+1} = v_{n+1/2} + a_{n+1}(Δt/2).',
        isCorrect: true,
        rationale:
          'Symplectic integrators preserve the Poincaré phase-space differential 2-form (dx ∧ dp) exactly. Consequently, the numerical solution exactly conserves a shadow Hamiltonian, bounding energy oscillations within O(Δt²) with zero secular drift indefinitely.',
      },
      {
        id: 'opt_c4_d',
        label: 'D. Backward Implicit Euler with fixed point iteration.',
        isCorrect: false,
        rationale:
          'Backward Euler introduces excessive numerical damping/dissipation, causing the satellite to rapidly lose energy and crash into the planet.',
        distractorMisconception: 'Overdamped numerical dissipation in implicit Euler',
      },
    ],
    correctExplanation:
      'For Hamiltonian systems, symplectic integrators (such as Verlet / Leapfrog) conserve phase-space volume and bound energy errors without secular drift over millions of steps, whereas standard Euler and RK4 bleed or gain energy.',
    recoveryEchoVaultId: 'vault_verification',
  },
];
