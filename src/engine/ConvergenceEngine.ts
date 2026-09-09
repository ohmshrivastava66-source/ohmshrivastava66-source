import { SubjectId, CanonicalRealmId } from '../types/game';
import { PlayerProfile } from '../types/telemetry';
import { ConvergenceTrial, BossCouncilMember, BossRageState } from '../types/convergence';
import { ALL_SUBJECTS } from '../curriculum/registry';
import { CONVERGENCE_STATIC_TRIALS } from '../curriculum/convergenceTrials';
import { Mulberry32PRNG } from './DangerEngine';

// Required boss level numbers across all 8 realms
export const REALM_BOSS_LEVELS: Record<CanonicalRealmId, number> = {
  mathematics: 5,
  computerScience: 5,
  physics: 3,
  chemistry: 3,
  biology: 3,
  history: 3,
  geography: 3,
  language: 3,
};

export const BOSS_COUNCIL_MEMBERS: Record<CanonicalRealmId, BossCouncilMember> = {
  mathematics: {
    id: 'mathematics',
    name: 'The Singularity Archon',
    title: 'Axiomatic Sovereign',
    domain: 'Fractured Polynomials & Singularities',
    color: '#06b6d4',
    accentColor: '#38bdf8',
    emblem: '∑',
    taunts: {
      rage1: {
        correct: ['"Correct. A trivial polynomial. Do not celebrate yet."', '"Acceptable decomposition. Nothing more."'],
        wrong: ['"That sign was your downfall."', '"An arithmetic fracture. How elementary."'],
      },
      rage2: {
        correct: ['"You balanced the equation. Again."', '"A momentary equilibrium. It will not last."'],
        wrong: ['"Premature root extraction. You rushed."', '"The Zero Product Property eluded you."'],
      },
      rage3: {
        correct: ['"Still standing? Your axiomatic defenses irritate me."', '"You survived the transformation. Fascinating."'],
        wrong: ['"Your logic shattered under quadratic pressure."', '"A catastrophic misstep in the domain constraints."'],
      },
      rage4: {
        correct: ['"Fine. We stop being gentle. The curvature steepens."', '"Enough precision. Let us see you break."'],
        wrong: ['"Predictable. The singularity crushes careless calculations."', '"Your proof collapsed into contradiction."'],
      },
      rage5: {
        correct: ['"IMPOSSIBLE. The singularity refuses to collapse you!"', '"You proved every axiom... I am silent."'],
        wrong: ['"FRACTURED! The entire council witnessed that breakdown!"', '"Absolute collapse. The Spire reigns."'],
      },
    },
  },
  computerScience: {
    id: 'computerScience',
    name: 'The Turing Archon',
    title: 'Warden of Asymptotics',
    domain: 'Algorithmic Complexity & State Machines',
    color: '#8b5cf6',
    accentColor: '#a78bfa',
    emblem: '⟨⟩',
    taunts: {
      rage1: {
        correct: ['"Interesting. You remembered the invariant."', '"O(1) recognition. Standard baseline."'],
        wrong: ['"Your algorithm had one job."', '"Off-by-one boundary error. Typical."'],
      },
      rage2: {
        correct: ['"You navigated the logarithmic divide."', '"The recursion terminated safely. For now."'],
        wrong: ['"Infinite loop detected in your reasoning."', '"You degraded to quadratic complexity in your thoughts."'],
      },
      rage3: {
        correct: ['"You\'re still optimizing? Unacceptable efficiency."', '"You saw through the memory trade-off."'],
        wrong: ['"Memory overflow. You attempted to brute force truth."', '"State space exploded. Your invariant died."'],
      },
      rage4: {
        correct: ['"No more logarithmic grace. Full adversarial testing."', '"You anticipate my branch predictions?!"'],
        wrong: ['"A segmentation fault in your cognitive buffer."', '"Null pointer in your logic. Complete halt."'],
      },
      rage5: {
        correct: ['"UNBELIEVABLE. You mastered every subproblem!"', '"The machine halts in optimal victory..."'],
        wrong: ['"SYSTEM HALTED. Your algorithm was crushed!"', '"Stack overflow. The Turing test failed you."'],
      },
    },
  },
  physics: {
    id: 'physics',
    name: 'The Entropy Colossus',
    title: 'Master of Invariant Fields',
    domain: 'Thermodynamics & Gravitational Wells',
    color: '#f59e0b',
    accentColor: '#fbbf24',
    emblem: 'Δ',
    taunts: {
      rage1: {
        correct: ['"One correct answer proves almost nothing."', '"The vector held. Proceed."'],
        wrong: ['"You were almost convincing."', '"Conservation violated. Energy bleeds away."'],
      },
      rage2: {
        correct: ['"Momentum conserved. The colossus stirs."', '"A stable trajectory. For now."'],
        wrong: ['"Friction destroyed your momentum."', '"You ignored net gravitational pull."'],
      },
      rage3: {
        correct: ['"You defy my gravitational gradient?!"', '"The symplectic phase-space remained invariant."'],
        wrong: ['"Entropy increases. Your reasoning decays."', '"Orbital decay. You spiraled into the sun."'],
      },
      rage4: {
        correct: ['"The field collapse accelerates! Stand firm if you can!"', '"Absolute zero will freeze your mind."'],
        wrong: ['"Crushed under atmospheric pressure!"', '"Dissipative chaos consumed your hypothesis."'],
      },
      rage5: {
        correct: ['"THE LAWS OF PHYSICS BOW TO YOUR RIGOR."', '"A perpetual conservation of true mastery."'],
        wrong: ['"TOTAL ENTROPY. You are extinguished."'],
      },
    },
  },
  chemistry: {
    id: 'chemistry',
    name: 'The Molecular Hydra',
    title: 'Catalyst of Reaction Depths',
    domain: 'Stoichiometry & Chemical Equilibrium',
    color: '#10b981',
    accentColor: '#34d399',
    emblem: '⇌',
    taunts: {
      rage1: {
        correct: ['"Balanced. A simple mole ratio."', '"The reaction reached dynamic equilibrium."'],
        wrong: ['"A reaction has consequences."', '"Unbalanced moles yielded corrosive acid."'],
      },
      rage2: {
        correct: ['"Activation energy overcome."', '"Le Chatelier shifts in your favor... briefly."'],
        wrong: ['"Precipitate formed. Your logic clouded."', '"Exothermic runaway in your thoughts."'],
      },
      rage3: {
        correct: ['"You catalyzed that synthesis effortlessly?! How?!"', '"The hydra heads recoil from your stoichiometry."'],
        wrong: ['"Toxic byproduct detected. You miscalculated the reagent."', '"Neutralization failed."'],
      },
      rage4: {
        correct: ['"Boiling point reached! The hydra breathes plasma!"', '"You resist my chemical corrosives?!"'],
        wrong: ['"Dissolved in your own misconceptions!"', '"Limiting reactant exhausted."'],
      },
      rage5: {
        correct: ['"THE LATTICE REMAINS UNBROKEN. YOU CATALYZED TRUTH."', '"Every bond held firm."'],
        wrong: ['"DISSOLVED TO ASHES."'],
      },
    },
  },
  biology: {
    id: 'biology',
    name: 'The Genetic Chimera',
    title: 'Architect of Evolution',
    domain: 'Cellular Transcription & Genetic Synapses',
    color: '#14b8a6',
    accentColor: '#2dd4bf',
    emblem: '🧬',
    taunts: {
      rage1: {
        correct: ['"Accurate codon translation."', '"The cell survived this cycle."'],
        wrong: ['"The mistake was small. The consequences weren\'t."', '"Frameshift mutation in your answer."'],
      },
      rage2: {
        correct: ['"Enzymatic proofreading held."', '"Mitosis proceeded without defect."'],
        wrong: ['"Point mutation slipped through your defenses."', '"Cellular apoptosis triggered."'],
      },
      rage3: {
        correct: ['"Your genetic transcript is flawless? Infuriating."', '"The chimera adapts, yet you adapt faster."'],
        wrong: ['"Unregulated transcription caused systemic collapse."', '"The codon was nonsense."'],
      },
      rage4: {
        correct: ['"Unleash the viral vector! Break their sequence!"', '"Evolution demands your extinction!"'],
        wrong: ['"Evolutionary dead end."', '"Natural selection eliminated your premise."'],
      },
      rage5: {
        correct: ['"APEX ORGANISM. YOU HAVE TRANSCENDED THE BIOME."', '"The genetic code is unshakeable."'],
        wrong: ['"EXTINCT."'],
      },
    },
  },
  history: {
    id: 'history',
    name: 'The Chrono Sovereign',
    title: 'Keeper of Historical Epochs',
    domain: 'Dialectics & Temporal Causation',
    color: '#f59e0b',
    accentColor: '#fbbf24',
    emblem: '⌛',
    taunts: {
      rage1: {
        correct: ['"Enjoy that victory. It will be brief."', '"A factual anchor. Nothing profound."'],
        wrong: ['"History repeats itself. Apparently, so do your mistakes."', '"Correlation is not causation, student."'],
      },
      rage2: {
        correct: ['"You traced the causal lineage."', '"An epoch preserved. The clock ticks on."'],
        wrong: ['"Anachronism. You confused cause with consequence."', '"Primary source misinterpreted."'],
      },
      rage3: {
        correct: ['"You untangled the geopolitical dialectic?!"', '"The sovereign\'s astrolabe fails to mislead you."'],
        wrong: ['"Your empire collapsed from internal fallacies."', '"The historical record disproves you."'],
      },
      rage4: {
        correct: ['"The entire timeline fractures upon your obstinacy!"', '"You challenge centuries of established dogma?!"'],
        wrong: ['"Lost in the sands of forgotten dynasties."', '"Relegated to a footnote of error."'],
      },
      rage5: {
        correct: ['"THE SOVEREIGN BOWS. YOU WEAVE THE THREADS OF TIME."', '"History shall record your absolute triumph."'],
        wrong: ['"FORGOTTEN BY HISTORY."'],
      },
    },
  },
  geography: {
    id: 'geography',
    name: 'The Tectonic Leviathan',
    title: 'Ruler of Planetary Gradients',
    domain: 'Lithospheric Faults & Climatology',
    color: '#0ea5e9',
    accentColor: '#38bdf8',
    emblem: '🌍',
    taunts: {
      rage1: {
        correct: ['"You charted the contour."', '"The tectonic plate stabilizes momentarily."'],
        wrong: ['"You fell into the trench."', '"Coriolis deflection blew your answer off course."'],
      },
      rage2: {
        correct: ['"Pressure gradient navigated."', '"Topographical precision confirmed."'],
        wrong: ['"Subduction swallowed your hypothesis."', '"You confused longitude with latitude."'],
      },
      rage3: {
        correct: ['"The leviathan shakes the continents, yet you remain upright?!"', '"Atmospheric circulation mastered."'],
        wrong: ['"A 9.0 magnitude error."', '"Flash flood of logical inconsistencies."'],
      },
      rage4: {
        correct: ['"Volcanic eruption! The magma chambers rupture!"', '"The tectonic rift splits beneath your feet!"'],
        wrong: ['"Engulfed in basalt magma."', '"Continental drift tore your logic apart."'],
      },
      rage5: {
        correct: ['"THE PLANETARY CRUST IS AT PEACE. YOU MAPPED THE GLOBE."', '"Solid rock under your feet."'],
        wrong: ['"SWALLOWED BY THE ABYSS."'],
      },
    },
  },
  language: {
    id: 'language',
    name: 'The Semantic Overlord',
    title: 'Warden of Rhetoric',
    domain: 'Syntactic Dependencies & Rhetoric',
    color: '#ec4899',
    accentColor: '#f472b6',
    emblem: '¶',
    taunts: {
      rage1: {
        correct: ['"Correct syntax. Barely."', '"The sentence stands."'],
        wrong: ['"Perhaps read the question again."', '"Dangling modifier in your thoughts."'],
      },
      rage2: {
        correct: ['"You resolved the rhetorical ambiguity."', '"A coherent clause. Do not be proud."'],
        wrong: ['"Equivocation fallacy detected."', '"Semantically hollow. Words without meaning."'],
      },
      rage3: {
        correct: ['"You parsed my recursive labyrinth of clauses?!"', '"The rhetoric held against my cross-examination."'],
        wrong: ['"Circular reasoning. You chased your own tail."', '"Unsound argument structure."'],
      },
      rage4: {
        correct: ['"Lexical paradox! Deconstruct their grammar!"', '"You dare dispute semantics with the Overlord?!"'],
        wrong: ['"Silenced by grammatical chaos."', '"Your rhetoric was mere noise."'],
      },
      rage5: {
        correct: ['"THE LEXICON IS SEALED. YOUR RHETORIC IS UNASSAILABLE."', '"A master of truth and syntax."'],
        wrong: ['"UNREADABLE AND ERACED."'],
      },
    },
  },
};

export class ConvergenceEngine {
  private prng: Mulberry32PRNG;

  constructor(seed: number = 777777) {
    this.prng = new Mulberry32PRNG(seed);
  }

  public setSeed(seed: number) {
    this.prng = new Mulberry32PRNG(seed);
  }

  /**
   * Secret Unlock Condition:
   * STRICT: Derives strictly from persistent progression.
   * Player must have defeated the designated boss in all 8 realms.
   * Partial boss completion (e.g. 7 of 8) or playerLevel alone strictly returns false.
   */
  public hasDefeatedAllRealmBosses(profile: PlayerProfile): boolean {
    if (!profile || !profile.clearedLevels) {
      return false;
    }

    const allSubjects: CanonicalRealmId[] = [
      'mathematics',
      'computerScience',
      'physics',
      'chemistry',
      'biology',
      'history',
      'geography',
      'language',
    ];

    for (const subj of allSubjects) {
      const requiredBossLevel = REALM_BOSS_LEVELS[subj];
      const cleared = profile.clearedLevels[subj] || [];
      if (!cleared.includes(requiredBossLevel)) {
        return false; // Missing boss victory for this realm!
      }
    }

    return true;
  }

  /**
   * Calculates hidden boss rage level (1 to 5) based on consecutive successes and current tier.
   * Never modifies question correctness.
   */
  public calculateBossRage(
    consecutiveCorrect: number,
    currentTier: number,
    avgResponseTimeMs: number = 20000
  ): number {
    let baseRage = currentTier; // Tiers 1-5 give baseline 1-5

    // Fast correct answers irritate the council further
    if (consecutiveCorrect >= 3 || avgResponseTimeMs < 15000) {
      baseRage += 1;
    }
    if (consecutiveCorrect >= 5) {
      baseRage += 1;
    }

    return Math.max(1, Math.min(5, baseRage));
  }

  /**
   * Selects reactive dialogue from the responsible boss based on rage level and outcome.
   * Playful villain arrogance, never abusive or personally insulting.
   */
  public getBossReaction(
    bossId: SubjectId,
    rageLevel: number,
    outcome: 'correct' | 'wrong'
  ): { speaker: string; title: string; quote: string; color: string } {
    const member = BOSS_COUNCIL_MEMBERS[bossId as CanonicalRealmId] || BOSS_COUNCIL_MEMBERS.mathematics;
    const clampedRage = Math.max(1, Math.min(5, rageLevel));
    const rageKey = `rage${clampedRage}` as 'rage1' | 'rage2' | 'rage3' | 'rage4' | 'rage5';
    const lines = member.taunts[rageKey]?.[outcome] || ['"..."'];

    const index = Math.floor(this.prng.next() * lines.length);
    const quote = lines[index];

    return {
      speaker: member.name,
      title: member.title,
      quote,
      color: member.color,
    };
  }

  /**
   * Constructs the full sequence of Convergence trials for this attempt.
   * Generates Tiers 1, 2, 3, 4 static/curated trials followed by Tier 5 Personalized Trial.
   */
  public generateTrialSequence(profile: PlayerProfile): ConvergenceTrial[] {
    const trials: ConvergenceTrial[] = [
      ...CONVERGENCE_STATIC_TRIALS,
      this.getPersonalizedFinalTrial(profile),
    ];

    // Re-index trial numbers to ensure continuity
    return trials.map((t, idx) => ({
      ...t,
      trialNumber: idx + 1,
    }));
  }

  /**
   * Tier 5: The Council's Trial — Personalized Final Challenge.
   * Synthesizes at least one demonstrated cognitive weakness from telemetry
   * with multiple demonstrated strengths across domains.
   */
  public getPersonalizedFinalTrial(profile: PlayerProfile): ConvergenceTrial {
    // Identify student's primary recorded cognitive weakness
    let identifiedWeakness = 'Quadratic Polynomial Factoring & Sign Rules';
    let targetVault = 'vault_factorization';

    if (profile.weaknesses && profile.weaknesses.length > 0) {
      identifiedWeakness = profile.weaknesses[0];
    } else if (profile.conceptPerformance) {
      // Find concept with highest recent mistakes
      let maxStruggle = -1;
      for (const key in profile.conceptPerformance) {
        const c = profile.conceptPerformance[key];
        const struggle = c.recentMistakes + c.repeatedMistakes + c.misconceptionFrequency;
        if (struggle > maxStruggle) {
          maxStruggle = struggle;
          identifiedWeakness = c.conceptName;
        }
      }
    }

    // Determine demonstrated strengths
    const strengths = profile.strengths && profile.strengths.length > 0
      ? profile.strengths.slice(0, 2).join(' & ')
      : 'Asymptotic Complexity & Invariant Analysis';

    return {
      id: 'conv_tier5_personalized_final',
      trialNumber: 5,
      tier: 5,
      tierLabel: "TIER 5 — THE COUNCIL'S ULTIMATE TRIAL",
      primaryBoss: 'mathematics',
      collaboratingBosses: ['computerScience', 'physics', 'history'],
      scenario: `The entire Council of Eight surrounds you. They combine your demonstrated mastery in [${strengths}] with your past struggle in [${identifiedWeakness}]. You are given an adversarial recurrence relation governing relativistic quantum energy states: E(n) = 2 E(n/2) + c·n, constrained by a polynomial boundary matrix where the determinant must be non-zero.`,
      objective:
        'Synthesize Divide-and-Conquer Master Theorem Case 2 (Computer Science), Hamiltonian ground state non-zero determinant (Physics & Mathematics), and avoid sign inversion during characteristic root isolation.',
      combinedSubjects: ['mathematics', 'computerScience', 'physics'],
      combinedConcepts: ['math_factorization', 'cs_dynamic_programming', 'phys_energy_conservation'],
      dialogueIntro:
        'The Council in Unison: "You mastered our separate domains. Now conquer the very weakness you thought you hid from us."',
      dialogueCorrect:
        'The Council in Unison: "THE COUNCIL FALLS SILENT. Every theorem, every law, every invariant has been defended."',
      dialogueWrong:
        'The Singularity Archon: "We knew your weakness. We targeted it. The Council prevails."',
      options: [
        {
          id: 'opt_c5_a',
          label:
            'A. Recurrence E(n) = 2 E(n/2) + c·n yields asymptotic complexity Θ(n log n) by Master Theorem (a = b = 2, f(n) = Θ(n)); and setting det(M - λI) = 0 requires factoring (λ - 1)(λ - 4) = 0 where non-zero ground state mandates λ = 1 or λ = 4.',
          isCorrect: true,
          rationale:
            'Exact synthesis: For T(n) = 2T(n/2) + cn, log_b(a) = log_2(2) = 1, matching f(n) = n¹, so Case 2 of Master Theorem applies, yielding Θ(n log n). The polynomial decomposition strictly avoids sign reversal errors, confirming valid non-zero eigenvalues.',
        },
        {
          id: 'opt_c5_b',
          label:
            'B. Recurrence simplifies to Θ(n²) because recursive branching creates quadratic tree expansion.',
          isCorrect: false,
          rationale:
            'Misunderstanding recurrence tree depth: a = 2 branches at each half level produce n total leaves, not n².',
          distractorMisconception: 'Recurrence tree leaf multiplication error',
        },
        {
          id: 'opt_c5_c',
          label:
            'C. The characteristic polynomial factors into (λ + 1)(λ + 4) = 0, yielding ground state roots λ = -1 and λ = -4.',
          isCorrect: false,
          rationale:
            'Sign reversal misconception: failed to track that the trace term -(5)λ requires factors with negative sum.',
          distractorMisconception: 'Root sign reversal error during characteristic factoring',
        },
        {
          id: 'opt_c5_d',
          label:
            'D. Relativistic constraints eliminate the O(n log n) term, reducing total complexity to constant time O(1).',
          isCorrect: false,
          rationale:
            'Physical boundary constraints do not alter algorithmic information theoretic lower bounds.',
          distractorMisconception: 'Conflating physical conservation with algorithmic bounds',
        },
      ],
      correctExplanation:
        'Master Theorem Case 2 establishes Θ(n log n) complexity for E(n) = 2E(n/2) + cn. The polynomial factoring strictly isolates roots λ ∈ {1, 4}, satisfying the non-zero determinant condition and completing the axiomatic synthesis.',
      recoveryEchoVaultId: targetVault,
    };
  }
}

export const convergenceEngine = new ConvergenceEngine();
