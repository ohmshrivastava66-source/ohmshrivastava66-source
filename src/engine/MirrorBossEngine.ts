import { SubjectId } from '../types/game';
import { PlayerProfile } from '../types/telemetry';
import { MirrorBossDefinition, MirrorBossState } from '../types/learningDna';
import { Mulberry32PRNG } from './DangerEngine';
import { REALM_BOSS_LEVELS } from './ConvergenceEngine';
import { learningDNAEngine } from './LearningDNAEngine';

export const DEFAULT_MIRROR_STATE: MirrorBossState = {
  defeatedMirrors: [],
  encounteredMirrors: [],
  cooldownEncounters: 0,
};

export const MIRROR_BOSS_DEFINITIONS: Record<SubjectId, MirrorBossDefinition> = {
  mathematics: {
    id: 'mirror_math_boss',
    subject: 'mathematics',
    baseBossId: 'math_boss',
    mirrorName: 'The Mirror of the Singularity',
    mirrorTitle: 'Spectral Axiom of Fractures',
    corruptedConcept: 'Discriminant Interpretation & Root Multiplicity',
    dialogueIntro:
      'A fractured reflection coalesces: "You defeated my outward form. But did you actually understand the discriminant, or did you merely memorize the formula?"',
    dialogueVictory:
      'The mirror cracks peacefully: "You see past the signs into the bedrock of the polynomial."',
    dialogueDefeat:
      'The mirror absorbs your attack: "The mirror fades. Your calculation was fast, but your conceptual foundation wavered."',
    targetedWeakness: 'Quadratic Polynomial Factoring & Sign Rules',
    scenario:
      'Consider quadratic equation ax² + bx + c = 0 where a ≠ 0. The discriminant is calculated as Δ = b² - 4ac = 0. The student asserts this means there are no real roots because nothing is being added or subtracted in the quadratic formula numerator.',
    objective:
      'Evaluate the student’s claim and identify the exact geometric and algebraic meaning of Δ = 0.',
    options: [
      {
        id: 'opt_m_math_a',
        label:
          'A. The claim is incorrect: Δ = 0 implies exactly one unique real root with multiplicity 2 (x = -b / 2a), where the parabola touches the x-axis tangentially.',
        isCorrect: true,
        rationale:
          'When Δ = 0, ±√0 = 0, leaving x = -b / 2a as a single repeated real root. The vertex of the parabola rests directly on the horizontal axis.',
      },
      {
        id: 'opt_m_math_b',
        label:
          'B. The claim is correct: because the square root term vanishes, the quadratic formula breaks down and has no valid real solution.',
        isCorrect: false,
        rationale: 'Misconception: confusing zero discriminant with negative discriminant.',
        distractorMisconception: 'Conflating Δ = 0 with Δ < 0',
      },
      {
        id: 'opt_m_math_c',
        label:
          'C. Δ = 0 implies two distinct complex conjugate roots with zero imaginary component.',
        isCorrect: false,
        rationale: 'Unnecessary complex terminology for what is simply a real repeated root.',
      },
      {
        id: 'opt_m_math_d',
        label:
          'D. Δ = 0 means the equation is not quadratic, reducing to a linear equation bx + c = 0.',
        isCorrect: false,
        rationale: 'The leading coefficient a is non-zero; the equation remains quadratic.',
      },
    ],
    correctExplanation:
      'Δ = b² - 4ac = 0 guarantees that ±√Δ = 0, leaving x = -b / 2a as a real root of algebraic multiplicity 2, geometrically representing tangency at the x-axis.',
    echoVaultId: 'vault_factorization',
    rewardXp: 150,
    mirrorMark: 'Mirror Mark of the Singularity',
  },
  computerScience: {
    id: 'mirror_cs_boss',
    subject: 'computerScience',
    baseBossId: 'cs_boss',
    mirrorName: 'The Mirror of the Turing Archon',
    mirrorTitle: 'Phantom of Infinite Loops',
    corruptedConcept: 'Halting Invariants & Asymptotic Proofs',
    dialogueIntro:
      'A translucent automaton emerges: "You executed the steps. But did you prove why the loop terminates?"',
    dialogueVictory:
      'The automaton dissipates into pure code: "Your invariant was unbreakable."',
    dialogueDefeat:
      'The automaton glitches away: "The mirror fades. You chased the output without safeguarding the loop invariant."',
    targetedWeakness: 'Algorithmic Invariants & State Halting',
    scenario:
      'An algorithm maintains a variant function V(n) = high - low. At each iteration of a binary search loop, if high and low do not strictly converge, what guarantees that the loop cannot cycle infinitely?',
    objective:
      'Formulate the formal loop termination proof using the strictly decreasing integer bound V(n).',
    options: [
      {
        id: 'opt_m_cs_a',
        label:
          'A. In each iteration, mid is strictly between low and high (when low < high), and updating low = mid + 1 or high = mid - 1 ensures V(n) decreases by at least 1 each step, well-founded on positive integers.',
        isCorrect: true,
        rationale:
          'Because the interval [low, high] strictly shrinks by an integer amount ≥ 1 and terminates when low > high, infinite looping is mathematically impossible.',
      },
      {
        id: 'opt_m_cs_b',
        label:
          'B. Setting high = mid without subtraction guarantees faster termination.',
        isCorrect: false,
        rationale:
          'Classic off-by-one infinite loop bug when low and high differ by 1 and mid rounds down.',
        distractorMisconception: 'Off-by-one mid assignment bug',
      },
      {
        id: 'opt_m_cs_c',
        label:
          'C. Binary search terminates because modern processors enforce a hardware timeout.',
        isCorrect: false,
        rationale: 'Hardware cannot fix algorithmic termination logic.',
      },
      {
        id: 'opt_m_cs_d',
        label:
          'D. The loop terminates only if the target key actually exists in the array.',
        isCorrect: false,
        rationale:
          'Binary search is proven to terminate whether the target exists or not (returning -1 or not found).',
      },
    ],
    correctExplanation:
      'The variant function V = high - low + 1 strictly decreases by at least 1 on every step. Since V is bounded below by 0, the principle of well-ordering guarantees termination.',
    echoVaultId: 'vault_recursion',
    rewardXp: 150,
    mirrorMark: 'Mirror Mark of the Turing Archon',
  },
  physics: {
    id: 'mirror_phys_boss',
    subject: 'physics',
    baseBossId: 'phys_boss',
    mirrorName: 'The Mirror of the Quantum Sovereign',
    mirrorTitle: 'Echo of Superposition',
    corruptedConcept: 'Wave-Particle Duality & Conservation',
    dialogueIntro:
      'The quantum wave collapses into a mirror: "You calculated momentum. Can you interpret the uncertainty?"',
    dialogueVictory: 'The wave stabilizes: "Observed and understood."',
    dialogueDefeat: 'The wave disperses: "The mirror fades. Return to the core conservation laws."',
    targetedWeakness: 'Conservation of Momentum & Quantum Duality',
    scenario:
      'A student measures an electron’s momentum with near-infinite precision (Δp → 0). According to the Heisenberg Uncertainty Principle (Δx · Δp ≥ ℏ/2), what occurs to the uncertainty in its spatial position Δx?',
    objective:
      'Analyze the conjugate observable relationship between position and momentum.',
    options: [
      {
        id: 'opt_m_phys_a',
        label: 'A. Spatial uncertainty Δx approaches infinity (the position becomes completely indeterminate across space).',
        isCorrect: true,
        rationale: 'Since Δx ≥ ℏ / (2Δp), as Δp → 0, Δx → ∞.',
      },
      {
        id: 'opt_m_phys_b',
        label: 'B. Spatial uncertainty Δx also becomes 0 because precision in one variable increases precision in the other.',
        isCorrect: false,
        rationale: 'Opposite of the uncertainty principle: position and momentum are Fourier conjugate variables.',
      },
      {
        id: 'opt_m_phys_c',
        label: 'C. The electron ceases to exist.',
        isCorrect: false,
        rationale: 'Unphysical claim.',
      },
      {
        id: 'opt_m_phys_d',
        label: 'D. Δx equals the speed of light.',
        isCorrect: false,
        rationale: 'Dimensional mismatch.',
      },
    ],
    correctExplanation:
      'Conjugate observables obey the Fourier transform bound. Precise localization in momentum space spreads the position wave packet over all space.',
    echoVaultId: 'vault_factorization',
    rewardXp: 150,
    mirrorMark: 'Mirror Mark of the Quantum Sovereign',
  },
  chemistry: {
    id: 'mirror_chem_boss',
    subject: 'chemistry',
    baseBossId: 'chem_boss',
    mirrorName: 'The Mirror of the Valence Monarch',
    mirrorTitle: 'Reflection of the Catalyst',
    corruptedConcept: 'Thermodynamics vs Kinetics',
    dialogueIntro:
      'A mercurial silhouette manifests: "You balanced the reaction. But do you know if it proceeds spontaneously?"',
    dialogueVictory: 'The mercury solidifies: "Thermodynamic equilibrium achieved."',
    dialogueDefeat: 'The mercury evaporates: "The mirror fades. Revisit activation energy."',
    targetedWeakness: 'Gibbs Free Energy & Catalysis',
    scenario:
      'A catalyst is added to an exothermic reaction with positive activation energy. Does the catalyst alter the overall equilibrium constant K_eq or the Gibbs free energy change ΔG° of the reaction?',
    objective: 'Distinguish between kinetic acceleration and thermodynamic equilibrium state functions.',
    options: [
      {
        id: 'opt_m_chem_a',
        label: 'A. Neither K_eq nor ΔG° changes; a catalyst lowers activation energy E_a to increase rate, without altering initial or final state energies.',
        isCorrect: true,
        rationale: 'Catalysts alter kinetic pathways (reaction rates) but never state functions like ΔG° or equilibrium constants.',
      },
      {
        id: 'opt_m_chem_b',
        label: 'B. The catalyst increases K_eq by making the reaction produce more product at equilibrium.',
        isCorrect: false,
        rationale: 'Catalysts speed up forward and reverse rates by the same factor, leaving K_eq unchanged.',
      },
      {
        id: 'opt_m_chem_c',
        label: 'C. The catalyst makes ΔG° more negative.',
        isCorrect: false,
        rationale: 'ΔG° depends solely on the chemical potentials of products and reactants.',
      },
      {
        id: 'opt_m_chem_d',
        label: 'D. The catalyst turns an endothermic reaction exothermic.',
        isCorrect: false,
        rationale: 'Enthalpy of reaction is unchanged by catalyst.',
      },
    ],
    correctExplanation:
      'A catalyst provides an alternative transition state with lower activation energy, accelerating approach to equilibrium without shifting the thermodynamic position (ΔG° and K_eq remain constant).',
    echoVaultId: 'vault_factorization',
    rewardXp: 150,
    mirrorMark: 'Mirror Mark of the Valence Monarch',
  },
  biology: {
    id: 'mirror_bio_boss',
    subject: 'biology',
    baseBossId: 'bio_boss',
    mirrorName: 'The Mirror of the Genetic Primordial',
    mirrorTitle: 'Shadow of the Helix',
    corruptedConcept: 'Gene Expression & Epigenetic Invariants',
    dialogueIntro: 'The double helix twists into a mirror: "You sequenced the alleles. But how does the code express?"',
    dialogueVictory: 'The strands anneal: "Epigenetic mastery confirmed."',
    dialogueDefeat: 'The strand unzips: "The mirror fades. Revisit central dogma principles."',
    targetedWeakness: 'Dihybrid Cross & Central Dogma',
    scenario:
      'DNA methylation at CpG islands in promoter regions typically has what effect on downstream gene transcription?',
    objective: 'Explain the molecular mechanism of epigenetic gene silencing.',
    options: [
      {
        id: 'opt_m_bio_a',
        label: 'A. It represses transcription by condensing chromatin and preventing transcription factors from binding.',
        isCorrect: true,
        rationale: 'DNA methylation recruits histone deacetylases and methyl-CpG-binding proteins to condense chromatin into heterochromatin, silencing transcription.',
      },
      {
        id: 'opt_m_bio_b',
        label: 'B. It permanently mutates the adenine bases into cytosine.',
        isCorrect: false,
        rationale: 'Epigenetic modifications do not alter the underlying nucleotide sequence.',
      },
      {
        id: 'opt_m_bio_c',
        label: 'C. It accelerates ribosomal translation in the cytoplasm directly.',
        isCorrect: false,
        rationale: 'Methylation acts at the nuclear transcriptional level.',
      },
      {
        id: 'opt_m_bio_d',
        label: 'D. It prevents DNA replication exclusively during meiosis.',
        isCorrect: false,
        rationale: 'Applies broadly to somatic and germ cells to control expression.',
      },
    ],
    correctExplanation:
      'CpG island methylation in promoters recruits chromatin remodeling complexes that condense DNA, sterically blocking transcription factor access and silencing expression.',
    echoVaultId: 'vault_factorization',
    rewardXp: 150,
    mirrorMark: 'Mirror Mark of the Genetic Primordial',
  },
  history: {
    id: 'mirror_hist_boss',
    subject: 'history',
    baseBossId: 'hist_boss',
    mirrorName: 'The Mirror of the Chronos Emperor',
    mirrorTitle: 'Reflection of Causality',
    corruptedConcept: 'Historiography & Causal Biases',
    dialogueIntro: 'The hourglass inverts: "You remembered the date. But do you comprehend the economic catalyst?"',
    dialogueVictory: 'The sands settle: "You perceive historical causality without distortion."',
    dialogueDefeat: 'The sands scatter: "The mirror fades. Do not confuse coincidence with causation."',
    targetedWeakness: 'Primary Source Analysis & Causality',
    scenario:
      'When analyzing post-World War I hyperinflation in the Weimar Republic, an observer asserts that the printing of money was an isolated monetary choice rather than a consequence of systemic pressures. What primary causal driver is overlooked?',
    objective: 'Synthesize the interplay of war reparations, Ruhr occupation, and industrial collapse.',
    options: [
      {
        id: 'opt_m_hist_a',
        label: 'A. Massive passive resistance in the occupied Ruhr and London ultimatum reparation obligations payable in foreign gold currency.',
        isCorrect: true,
        rationale: 'The German government paid striking Ruhr workers by printing fiat marks while lacking hard currency to settle London reparations, triggering hyperinflation.',
      },
      {
        id: 'opt_m_hist_b',
        label: 'B. An immediate sudden surplus of consumer goods.',
        isCorrect: false,
        rationale: 'Hyperinflation coexisted with acute real goods shortages.',
      },
      {
        id: 'opt_m_hist_c',
        label: 'C. Adoption of the US gold standard.',
        isCorrect: false,
        rationale: 'Weimar Germany had abandoned the gold mark.',
      },
      {
        id: 'opt_m_hist_d',
        label: 'D. A decrease in government debt.',
        isCorrect: false,
        rationale: 'Debt ballooned exponentially.',
      },
    ],
    correctExplanation:
      'Weimar hyperinflation was catalyzed by the French-Belgian occupation of the Ruhr and massive structural debt obligations, prompting the state to monetize deficit spending to support passive resistance.',
    echoVaultId: 'vault_factorization',
    rewardXp: 150,
    mirrorMark: 'Mirror Mark of the Chronos Emperor',
  },
  geography: {
    id: 'mirror_geo_boss',
    subject: 'geography',
    baseBossId: 'geo_boss',
    mirrorName: 'The Mirror of the Tectonic Leviathan',
    mirrorTitle: 'Chasm of the Gradients',
    corruptedConcept: 'Geomorphology & Coriolis Deflection',
    dialogueIntro: 'The tectonic plates shiver: "You named the mountain. Can you explain the thermal circulation?"',
    dialogueVictory: 'The faults lock in harmony: "Planetary dynamics understood."',
    dialogueDefeat: 'The earth shakes: "The mirror fades. Revisit planetary pressure cells."',
    targetedWeakness: 'Plate Tectonics & Atmospheric Cells',
    scenario:
      'In the Northern Hemisphere, why do cyclonic weather systems rotate counterclockwise around low-pressure centers?',
    objective: 'Explain the interaction between the pressure gradient force and the Coriolis effect.',
    options: [
      {
        id: 'opt_m_geo_a',
        label: 'A. Air flows inward toward the low-pressure center and is deflected to the right by the Coriolis effect, producing net counterclockwise circulation.',
        isCorrect: true,
        rationale: 'The pressure gradient draws air inward; rightward Coriolis deflection curves the inward trajectory counterclockwise around the low.',
      },
      {
        id: 'opt_m_geo_b',
        label: 'B. Air flows outward from low pressure and Coriolis deflects it to the left.',
        isCorrect: false,
        rationale: 'Air flows inward toward low pressure, and deflection is rightward in the Northern Hemisphere.',
      },
      {
        id: 'opt_m_geo_c',
        label: 'C. Gravitational tides from the moon force all storms to turn counterclockwise.',
        isCorrect: false,
        rationale: 'Tidal forces are negligible compared to pressure gradients and Coriolis acceleration.',
      },
      {
        id: 'opt_m_geo_d',
        label: 'D. Solar radiation heats the ocean water solely on the western side of storms.',
        isCorrect: false,
        rationale: 'Incorrect physical mechanism.',
      },
    ],
    correctExplanation:
      'Inward pressure gradient force combined with rightward Coriolis deflection in the Northern Hemisphere creates a cyclostrophic balance with counterclockwise rotation.',
    echoVaultId: 'vault_factorization',
    rewardXp: 150,
    mirrorMark: 'Mirror Mark of the Tectonic Leviathan',
  },
  language: {
    id: 'mirror_lang_boss',
    subject: 'language',
    baseBossId: 'lang_boss',
    mirrorName: 'The Mirror of the Semantic Overlord',
    mirrorTitle: 'Specter of Ambiguity',
    corruptedConcept: 'Syntactic Ambiguity & Rhetorical Proof',
    dialogueIntro: 'The glyphs scramble into a mirror: "You parsed the sentence. Can you disentangle structural ambiguity?"',
    dialogueVictory: 'The syntax settles: "Unambiguous rhetorical precision."',
    dialogueDefeat: 'The words blur: "The mirror fades. Reexamine modifier attachments."',
    targetedWeakness: 'Syntactic Parsing & Structural Ambiguity',
    scenario:
      'Analyze the classic sentence: "The professor saw the student with the telescope." What structural ambiguity is present?',
    objective: 'Identify prepositional phrase attachment ambiguity in constituent trees.',
    options: [
      {
        id: 'opt_m_lang_a',
        label: 'A. Prepositional phrase attachment: "with the telescope" can modify either the verb "saw" (instrument used) or the noun "student" (possession).',
        isCorrect: true,
        rationale: 'Classic syntactic ambiguity arising from whether PP attaches to the Verb Phrase or the Noun Phrase.',
      },
      {
        id: 'opt_m_lang_b',
        label: 'B. Lexical ambiguity because "professor" has multiple unrelated dictionary definitions.',
        isCorrect: false,
        rationale: 'The ambiguity is structural (attachment), not lexical homonymy.',
      },
      {
        id: 'opt_m_lang_c',
        label: 'C. Tense ambiguity because "saw" could be future tense.',
        isCorrect: false,
        rationale: '"saw" is unequivocally simple past tense.',
      },
      {
        id: 'opt_m_lang_d',
        label: 'D. There is no ambiguity; the sentence has only one parse tree.',
        isCorrect: false,
        rationale: 'Both parse trees are syntactically valid without pragmatic disambiguation.',
      },
    ],
    correctExplanation:
      'High attachment links the PP to VP [saw [the student] [with the telescope]] (using the telescope to see), while low attachment links to NP [the student [with the telescope]] (the student holding the telescope).',
    echoVaultId: 'vault_factorization',
    rewardXp: 150,
    mirrorMark: 'Mirror Mark of the Semantic Overlord',
  },
};

export class MirrorBossEngine {
  private prng: Mulberry32PRNG;

  constructor(seed: number = 777123) {
    this.prng = new Mulberry32PRNG(seed);
  }

  public setSeed(seed: number) {
    this.prng = new Mulberry32PRNG(seed);
  }

  public getMirrorState(profile: PlayerProfile): MirrorBossState {
    if (profile.mirrorBossState) {
      return { ...profile.mirrorBossState };
    }
    return { ...DEFAULT_MIRROR_STATE };
  }

  /**
   * Evaluates if a Mirror Boss encounter should trigger for the given subject
   * Requires:
   * 1. Player has defeated the original realm boss
   * 2. Not already defeated this mirror boss
   * 3. Cooldown encounters === 0
   * 4. Base probability: 1–3% (up to 6% if weakness detected in this subject)
   * 5. Not Judge Demo
   */
  public evaluateMirrorBossOpportunity(
    subject: SubjectId,
    profile: PlayerProfile,
    isJudgeDemo: boolean = false
  ): { shouldTrigger: boolean; probability: number; bossDef?: MirrorBossDefinition } {
    if (isJudgeDemo) return { shouldTrigger: false, probability: 0 };

    const mirrorDef = MIRROR_BOSS_DEFINITIONS[subject];
    if (!mirrorDef) return { shouldTrigger: false, probability: 0 };

    // Condition 1: Player must have defeated the original realm boss
    const requiredBossLevel = REALM_BOSS_LEVELS[subject];
    const clearedLevels = profile.clearedLevels?.[subject] || [];
    if (!clearedLevels.includes(requiredBossLevel)) {
      return { shouldTrigger: false, probability: 0 }; // original boss not cleared yet!
    }

    const state = this.getMirrorState(profile);

    // Condition 2: Not on cooldown
    if (state.cooldownEncounters > 0) {
      return { shouldTrigger: false, probability: 0 };
    }

    // Condition 3: Not already defeated
    if (state.defeatedMirrors.includes(mirrorDef.id)) {
      return { shouldTrigger: false, probability: 0 };
    }

    // Condition 4: Calculate probability (1–3% base, up to 6% if weakness in subject)
    let prob = 0.02; // 2% base
    const dna = learningDNAEngine.getLearningDNA(profile);

    // If learning DNA or weaknesses flag struggle in this realm
    if (
      profile.weaknesses?.some(w => w.toLowerCase().includes(subject.toLowerCase())) ||
      (dna.accuracy <= 55 && dna.riskTaking >= 60)
    ) {
      prob = 0.05; // boosted to 5% (capped at 6%)
    }

    const roll = this.prng.next();
    const shouldTrigger = roll < prob;

    return {
      shouldTrigger,
      probability: prob,
      bossDef: shouldTrigger ? mirrorDef : undefined,
    };
  }
}

export const mirrorBossEngine = new MirrorBossEngine();
