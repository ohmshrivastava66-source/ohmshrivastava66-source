import { SubjectId, BossModifier, Card } from '../types/game';
import { EncounterDefinition } from '../types/curriculum';
import { CombatEngineState } from './CombatEngine';
import { SolutionGraph, SolutionPathEngine, solutionPathEngine } from './SolutionPathEngine';

export type BossAbilityCategory =
  | 'CARD_SHROUD'
  | 'ENERGY_DRAIN'
  | 'FRACTURED_STATE'
  | 'DISTORTION'
  | 'GUARDIAN_PHASE'
  | 'COUNTERSIGN';

export interface ThemedBossAbility {
  id: string;
  name: string;
  category: BossAbilityCategory;
  bossIdentifier: string; // e.g. 'singularity_archon', 'turing_archon', 'quadratic_beast'
  description: string;
  phaseRequirement: number; // 1 (Observation), 2 (Focused), 3 (Climax)
  costIncrease?: number;
  targetOperation?: string;
  flavorText: string;
}

export interface BossInterferenceProposal {
  modifiers: BossModifier[];
  phase: number;
  phaseTransition: boolean;
  activatedAbilityNames: string[];
  bannerMessage?: string;
}

export class BossAbilityEngine {
  private static instance: BossAbilityEngine;

  // Curated subject-specific boss ability catalog
  private abilities: ThemedBossAbility[] = [
    // -------------------------------------------------------------
    // 1. MATHEMATICS — SINGULARITY ARCHON (Level 5 Boss)
    // -------------------------------------------------------------
    {
      id: 'archon_equation_fracture',
      name: 'Equation Fracture',
      category: 'FRACTURED_STATE',
      bossIdentifier: 'singularity_archon',
      description: 'The Singularity Archon fractures the coordinate space.',
      phaseRequirement: 2,
      flavorText: 'Dimensional axioms warp. Re-evaluate the fundamental state!',
    },
    {
      id: 'archon_dimensional_rewrite',
      name: 'Dimensional Rewrite',
      category: 'CARD_SHROUD',
      bossIdentifier: 'singularity_archon',
      description: 'Envelops an alternative path in dark dimensional mist.',
      phaseRequirement: 2,
      flavorText: 'The Archon shrouds parallel derivations in void mist.',
    },
    {
      id: 'archon_contradiction_field',
      name: 'Contradiction Field',
      category: 'ENERGY_DRAIN',
      bossIdentifier: 'singularity_archon',
      description: 'Increases the energy cost of redundant operations by +1.',
      phaseRequirement: 3,
      costIncrease: 1,
      flavorText: 'Contradictions permeate the void. Non-essential operations require greater focus.',
    },
    {
      id: 'archon_crown_barrier',
      name: 'Crown of Proof',
      category: 'GUARDIAN_PHASE',
      bossIdentifier: 'singularity_archon',
      description: 'Manifests a crystalline barrier of proof.',
      phaseRequirement: 3,
      flavorText: 'The Singularity Archon conjures the Crown of Proof!',
    },
    {
      id: 'archon_axiomatic_countersign',
      name: 'Axiomatic Countersign',
      category: 'COUNTERSIGN',
      bossIdentifier: 'singularity_archon',
      description: 'Retaliates with a temporary runic ward.',
      phaseRequirement: 2,
      flavorText: 'The Archon registers your proof and hardens its core.',
    },

    // -------------------------------------------------------------
    // 2. MATHEMATICS — QUADRATIC BEAST (Tier 1 / Level 1 Boss)
    // -------------------------------------------------------------
    {
      id: 'qb_root_distortion',
      name: 'Root Distortion',
      category: 'DISTORTION',
      bossIdentifier: 'quadratic_beast',
      description: 'Ripples the polynomial space, shifting card alignment.',
      phaseRequirement: 2,
      flavorText: 'Roots oscillate between truth and illusion.',
    },
    {
      id: 'qb_factor_shatter',
      name: 'Factor Shatter',
      category: 'ENERGY_DRAIN',
      bossIdentifier: 'quadratic_beast',
      description: 'Pressures factorization with +1 energy drain.',
      phaseRequirement: 2,
      costIncrease: 1,
      flavorText: 'Fractured polynomials resist decomposition.',
    },
    {
      id: 'qb_coefficient_corruption',
      name: 'Coefficient Corruption',
      category: 'FRACTURED_STATE',
      bossIdentifier: 'quadratic_beast',
      description: 'Distorts the visual balance of terms.',
      phaseRequirement: 3,
      flavorText: 'Coefficients pulse with volatile energy.',
    },

    // -------------------------------------------------------------
    // 3. COMPUTER SCIENCE — TURING ARCHON (Level 5 Boss)
    // -------------------------------------------------------------
    {
      id: 'turing_halting_barrier',
      name: 'Halting Barrier',
      category: 'GUARDIAN_PHASE',
      bossIdentifier: 'turing_archon',
      description: 'Deploys an undecidable halting barrier.',
      phaseRequirement: 3,
      flavorText: 'The Turing Archon asserts the uncomputable barrier!',
    },
    {
      id: 'turing_tesseract_shroud',
      name: 'Tesseract Shroud',
      category: 'CARD_SHROUD',
      bossIdentifier: 'turing_archon',
      description: 'Folds non-critical subroutines into higher dimensions.',
      phaseRequirement: 2,
      flavorText: 'An auxiliary instruction is trapped in a 4D recursion loop.',
    },
    {
      id: 'turing_stack_drain',
      name: 'Stack Overflow Drain',
      category: 'ENERGY_DRAIN',
      bossIdentifier: 'turing_archon',
      description: 'Stack pressure increases action cost by +1.',
      phaseRequirement: 2,
      costIncrease: 1,
      flavorText: 'Call stack limits constrain auxiliary operations.',
    },
    {
      id: 'turing_tape_glitch',
      name: 'Tape Glitch',
      category: 'DISTORTION',
      bossIdentifier: 'turing_archon',
      description: 'Shifts tape cells, altering card focus.',
      phaseRequirement: 2,
      flavorText: 'The Turing tape flickers with static.',
    },
    {
      id: 'turing_recursive_countersign',
      name: 'Recursive Countersign',
      category: 'COUNTERSIGN',
      bossIdentifier: 'turing_archon',
      description: 'Counter-computes player logic with an adaptive shield.',
      phaseRequirement: 2,
      flavorText: 'A counter-invariant compiles across the tape.',
    },

    // -------------------------------------------------------------
    // 4. COMPUTER SCIENCE — ALGORITHMIC HORROR (Tier 1 / Level 1 Boss)
    // -------------------------------------------------------------
    {
      id: 'ah_recursive_loop',
      name: 'Recursive Loop',
      category: 'DISTORTION',
      bossIdentifier: 'algorithmic_horror',
      description: 'Distorts memory addresses, cycling non-critical operations.',
      phaseRequirement: 2,
      flavorText: 'Infinite recurrence echoes through the abyss.',
    },
    {
      id: 'ah_boundary_collapse',
      name: 'Boundary Collapse',
      category: 'CARD_SHROUD',
      bossIdentifier: 'algorithmic_horror',
      description: 'Envelops an auxiliary card in boundary shadow.',
      phaseRequirement: 2,
      flavorText: 'Index bounds contract under horror pressure.',
    },
    {
      id: 'ah_search_distortion',
      name: 'Search Space Distortion',
      category: 'FRACTURED_STATE',
      bossIdentifier: 'algorithmic_horror',
      description: 'Distorts interval boundaries visually.',
      phaseRequirement: 3,
      flavorText: 'The search buffer warps into non-linear topology.',
    },

    // -------------------------------------------------------------
    // 5. CHEMISTRY — REACTION GOLEM (Alchemical Titan)
    // -------------------------------------------------------------
    {
      id: 'chem_catalyst_shift',
      name: 'Catalyst Shift',
      category: 'DISTORTION',
      bossIdentifier: 'reaction_golem',
      description: 'Shifts activation energy, redistributing auxiliary cards.',
      phaseRequirement: 2,
      flavorText: 'Catalytic equilibrium fluctuates.',
    },
    {
      id: 'chem_equilibrium_lock',
      name: 'Equilibrium Lock',
      category: 'GUARDIAN_PHASE',
      bossIdentifier: 'reaction_golem',
      description: 'Le Chatelier barrier absorbs direct force.',
      phaseRequirement: 3,
      flavorText: 'Dynamic equilibrium neutralizes the incoming reaction!',
    },
    {
      id: 'chem_reagent_freeze',
      name: 'Reagent Freeze',
      category: 'CARD_SHROUD',
      bossIdentifier: 'reaction_golem',
      description: 'Crystallizes an optional reagent in frost.',
      phaseRequirement: 2,
      flavorText: 'Endothermic crystallization shrouds the flask.',
    },
    {
      id: 'chem_reaction_chain',
      name: 'Reaction Chain',
      category: 'COUNTERSIGN',
      bossIdentifier: 'reaction_golem',
      description: 'Exothermic counter-reaction generates protective vapor.',
      phaseRequirement: 2,
      flavorText: 'A secondary precipitate forms defensive shielding.',
    },

    // -------------------------------------------------------------
    // 6. BIOLOGY — DARWINIAN BEHEMOTH (Mutating Titan)
    // -------------------------------------------------------------
    {
      id: 'bio_mutation',
      name: 'Mutation',
      category: 'DISTORTION',
      bossIdentifier: 'darwinian_behemoth',
      description: 'Genetic drift reshuffles non-critical card states.',
      phaseRequirement: 2,
      flavorText: 'Spontaneous mutation alters phenotypic presentation.',
    },
    {
      id: 'bio_cellular_chitin',
      name: 'Cellular Chitin',
      category: 'GUARDIAN_PHASE',
      bossIdentifier: 'darwinian_behemoth',
      description: 'Hardened chitinous wall absorbs direct damage.',
      phaseRequirement: 3,
      flavorText: 'Chitinous plates interlock across the nucleus!',
    },
    {
      id: 'bio_adaptation_pressure',
      name: 'Adaptation Pressure',
      category: 'ENERGY_DRAIN',
      bossIdentifier: 'darwinian_behemoth',
      description: 'Selective pressure raises energy cost of secondary steps.',
      phaseRequirement: 2,
      costIncrease: 1,
      flavorText: 'Metabolic cost rises under natural selection.',
    },
    {
      id: 'bio_trait_shift',
      name: 'Trait Shift',
      category: 'FRACTURED_STATE',
      bossIdentifier: 'darwinian_behemoth',
      description: 'Cellular morphology morphs dynamically.',
      phaseRequirement: 2,
      flavorText: 'The behemoth mutates its structural markers.',
    },

    // -------------------------------------------------------------
    // 7. HISTORY — TIMELINE GUARDIAN (Chrono Colossus)
    // -------------------------------------------------------------
    {
      id: 'hist_timeline_split',
      name: 'Timeline Split',
      category: 'DISTORTION',
      bossIdentifier: 'timeline_guardian',
      description: 'Bifurcates the historical sequence, reordering auxiliary cards.',
      phaseRequirement: 2,
      flavorText: 'Contingency splits the timeline into divergent branches.',
    },
    {
      id: 'hist_causal_distortion',
      name: 'Causal Distortion',
      category: 'FRACTURED_STATE',
      bossIdentifier: 'timeline_guardian',
      description: 'Warps historical causality presentation.',
      phaseRequirement: 3,
      flavorText: 'Cause and effect blur across historical eras.',
    },
    {
      id: 'hist_chronological_reversal',
      name: 'Chronological Reversal',
      category: 'CARD_SHROUD',
      bossIdentifier: 'timeline_guardian',
      description: 'Temporarily obscures a subsequent stage in temporal mist.',
      phaseRequirement: 2,
      flavorText: 'A temporal rift cloaks future records.',
    },
    {
      id: 'hist_aegis_of_eras',
      name: 'Aegis of Eras',
      category: 'GUARDIAN_PHASE',
      bossIdentifier: 'timeline_guardian',
      description: 'The mantle of recorded history shields the colossus.',
      phaseRequirement: 3,
      flavorText: 'Centuries of stone form an impenetrable historic aegis!',
    },

    // -------------------------------------------------------------
    // 8. PHYSICS — ENTROPY COLOSSUS (Singularity Titan)
    // -------------------------------------------------------------
    {
      id: 'phys_entropy_surge',
      name: 'Entropy Surge',
      category: 'ENERGY_DRAIN',
      bossIdentifier: 'entropy_colossus',
      description: 'Second Law of Thermodynamics increases system cost.',
      phaseRequirement: 2,
      costIncrease: 1,
      flavorText: 'Dissipated heat makes auxiliary actions harder to sustain.',
    },
    {
      id: 'phys_state_collapse',
      name: 'State Collapse',
      category: 'CARD_SHROUD',
      bossIdentifier: 'entropy_colossus',
      description: 'Event horizon swallows an optional card.',
      phaseRequirement: 2,
      flavorText: 'The accretion disk traps light and optional paths.',
    },
    {
      id: 'phys_gravitational_distortion',
      name: 'Gravitational Distortion',
      category: 'FRACTURED_STATE',
      bossIdentifier: 'entropy_colossus',
      description: 'Massive gravitational field distorts field presentation.',
      phaseRequirement: 3,
      flavorText: 'Space-time curves steeply around the black hole core.',
    },
    {
      id: 'phys_event_horizon_barrier',
      name: 'Event Horizon Barrier',
      category: 'GUARDIAN_PHASE',
      bossIdentifier: 'entropy_colossus',
      description: 'Light and force cannot escape the event horizon.',
      phaseRequirement: 3,
      flavorText: 'The Event Horizon bends incoming attacks into the void!',
    },

    // -------------------------------------------------------------
    // 9. LANGUAGE — SEMANTIC SPHINX (Linguistic Sovereign)
    // -------------------------------------------------------------
    {
      id: 'lang_meaning_shift',
      name: 'Meaning Shift',
      category: 'DISTORTION',
      bossIdentifier: 'semantic_sphinx',
      description: 'Polysemous ambiguity scrambles card arrangement.',
      phaseRequirement: 2,
      flavorText: 'Words shift nuance under the Sphinx\'s gaze.',
    },
    {
      id: 'lang_context_distortion',
      name: 'Context Distortion',
      category: 'FRACTURED_STATE',
      bossIdentifier: 'semantic_sphinx',
      description: 'Syntactic ambiguity distorts question frame.',
      phaseRequirement: 3,
      flavorText: 'Syntax fragments into multiple interpretive trees.',
    },
    {
      id: 'lang_interpretation_lock',
      name: 'Interpretation Lock',
      category: 'CARD_SHROUD',
      bossIdentifier: 'semantic_sphinx',
      description: 'Shrouds an optional parse in runic mist.',
      phaseRequirement: 2,
      flavorText: 'An alternative reading is sealed in ancient hieroglyphs.',
    },
    {
      id: 'lang_riddle_of_ages',
      name: 'Riddle of Ages',
      category: 'GUARDIAN_PHASE',
      bossIdentifier: 'semantic_sphinx',
      description: 'An ancient riddle shields the Sphinx from physical blows.',
      phaseRequirement: 3,
      flavorText: 'The Sphinx demands intellectual proof over brute force!',
    },

    // -------------------------------------------------------------
    // 10. DATA STRUCTURES & ALGORITHMS — ASYMPTOTIC COLOSSUS (Module 1 Boss)
    // -------------------------------------------------------------
    {
      id: 'colossus_watershed_distortion',
      name: 'Watershed Distortion',
      category: 'DISTORTION',
      bossIdentifier: 'asymptotic_colossus',
      description: 'The Colossus bends recurrence branches, shifting card focus.',
      phaseRequirement: 2,
      flavorText: 'The watershed boundary ripples between polynomial powers.',
    },
    {
      id: 'colossus_polylog_shroud',
      name: 'Polylog Shroud',
      category: 'CARD_SHROUD',
      bossIdentifier: 'asymptotic_colossus',
      description: 'Envelops an alternative decomposition path in asymptotic mist.',
      phaseRequirement: 2,
      flavorText: 'Higher-order logarithmic terms obscure the alternative path.',
    },
    {
      id: 'colossus_stack_drain',
      name: 'Recurrence Depth Drain',
      category: 'ENERGY_DRAIN',
      bossIdentifier: 'asymptotic_colossus',
      description: 'Deep recursion levels increase non-critical action cost by +1.',
      phaseRequirement: 3,
      costIncrease: 1,
      flavorText: 'Recurrence depth drains mental energy for auxiliary steps.',
    },
    {
      id: 'colossus_complexity_barrier',
      name: 'Complexity Aegis',
      category: 'GUARDIAN_PHASE',
      bossIdentifier: 'asymptotic_colossus',
      description: 'A crystalline barrier of asymptotic lower-bounds.',
      phaseRequirement: 3,
      flavorText: 'The Asymptotic Colossus hardens behind a tight complexity barrier!',
    },
    {
      id: 'colossus_asymptotic_countersign',
      name: 'Asymptotic Countersign',
      category: 'COUNTERSIGN',
      bossIdentifier: 'asymptotic_colossus',
      description: 'Retaliates with an adaptive complexity ward upon being struck.',
      phaseRequirement: 2,
      flavorText: 'The Colossus tallies your derivation and hardens its core.',
    },

    // -------------------------------------------------------------
    // 11. DATA STRUCTURES & ALGORITHMS — IMBALANCE GOLEM (Module 2 Boss)
    // -------------------------------------------------------------
    {
      id: 'golem_balance_distortion',
      name: 'Balance Distortion',
      category: 'DISTORTION',
      bossIdentifier: 'imbalance_golem',
      description: 'The Imbalance Golem twists subtree heights, shifting card focus.',
      phaseRequirement: 2,
      flavorText: 'Height factors skew wildly as stone branches tremble.',
    },
    {
      id: 'golem_node_shroud',
      name: 'Crystalline Node Shroud',
      category: 'CARD_SHROUD',
      bossIdentifier: 'imbalance_golem',
      description: 'Envelops an alternative rotation or search path in mineral fog.',
      phaseRequirement: 2,
      flavorText: 'Dense quartz mist obscures an alternative rotation path.',
    },
    {
      id: 'golem_collision_pressure',
      name: 'Structural Friction',
      category: 'ENERGY_DRAIN',
      bossIdentifier: 'imbalance_golem',
      description: 'Severe structural imbalance increases non-critical operation cost by +1.',
      phaseRequirement: 3,
      costIncrease: 1,
      flavorText: 'Frictional stress in the unbalanced tree drains mental energy.',
    },
    {
      id: 'golem_equilibrium_aegis',
      name: 'Equilibrium Aegis',
      category: 'GUARDIAN_PHASE',
      bossIdentifier: 'imbalance_golem',
      description: 'A fortified wall of dense granite absorbing direct strikes.',
      phaseRequirement: 3,
      flavorText: 'The Imbalance Golem hardens its core behind the Equilibrium Aegis!',
    },
    {
      id: 'golem_structural_countersign',
      name: 'Structural Countersign',
      category: 'COUNTERSIGN',
      bossIdentifier: 'imbalance_golem',
      description: 'Retaliates with an adaptive stone barrier upon correct balance proof.',
      phaseRequirement: 2,
      flavorText: 'The Golem detects your balancing pivot and reinforces its foundation.',
    },
    // -------------------------------------------------------------
    // 12. DATA STRUCTURES & ALGORITHMS — VAEL, STRATEGY WARDEN (Module 3 Mini-Boss)
    // -------------------------------------------------------------
    {
      id: 'vael_paradigm_fracture',
      name: 'Paradigm Fracture',
      category: 'FRACTURED_STATE',
      bossIdentifier: 'vael_strategy_warden',
      description: 'Fractures the algorithmic paradigm, distorting auxiliary state projections.',
      phaseRequirement: 2,
      flavorText: 'Contrasting paradigms collide, refracting the decision surface.',
    },
    {
      id: 'vael_strategy_shroud',
      name: 'Strategy Shroud',
      category: 'CARD_SHROUD',
      bossIdentifier: 'vael_strategy_warden',
      description: 'Envelops an alternative algorithmic pathway in strategic mist.',
      phaseRequirement: 2,
      flavorText: 'Dense mist conceals an alternative exploration path.',
    },
    {
      id: 'vael_decision_pressure',
      name: 'Decision Pressure',
      category: 'ENERGY_DRAIN',
      bossIdentifier: 'vael_strategy_warden',
      description: 'Intense algorithmic trade-offs increase non-critical action cost by +1.',
      phaseRequirement: 3,
      costIncrease: 1,
      flavorText: 'The cognitive burden of contrasting paradigms drains focus.',
    },
    {
      id: 'vael_warden_aegis',
      name: 'Warden\'s Aegis',
      category: 'GUARDIAN_PHASE',
      bossIdentifier: 'vael_strategy_warden',
      description: 'A resolute barrier forged from algorithmic synthesis bounds.',
      phaseRequirement: 3,
      flavorText: 'Vael summons the Warden\'s Aegis, demanding optimal paradigm choice!',
    },
    {
      id: 'vael_tactical_countersign',
      name: 'Tactical Countersign',
      category: 'COUNTERSIGN',
      bossIdentifier: 'vael_strategy_warden',
      description: 'Retaliates with an adaptive paradigm ward upon being struck.',
      phaseRequirement: 2,
      flavorText: 'Vael counters by demanding rigorous proof of optimality.',
    },

    // -------------------------------------------------------------
    // 13. DATA STRUCTURES & ALGORITHMS — ENTROPY PARTITIONER (Module 3 Boss)
    // -------------------------------------------------------------
    {
      id: 'entropy_partition_warp',
      name: 'Partition Distortion',
      category: 'DISTORTION',
      bossIdentifier: 'entropy_partitioner',
      description: 'The Partitioner warps subset boundaries, shifting card focus.',
      phaseRequirement: 2,
      flavorText: 'Partition boundaries vibrate between disconnected subgraphs.',
    },
    {
      id: 'entropy_cycle_shroud',
      name: 'Cycle Shroud',
      category: 'CARD_SHROUD',
      bossIdentifier: 'entropy_partitioner',
      description: 'Envelops an alternative spanning cut in turbulent cycle mist.',
      phaseRequirement: 2,
      flavorText: 'Turbulent cyclic noise obscures an alternative cut edge.',
    },
    {
      id: 'entropy_spanning_drain',
      name: 'Spanning Tension Drain',
      category: 'ENERGY_DRAIN',
      bossIdentifier: 'entropy_partitioner',
      description: 'High graph cut tension increases non-critical operation cost by +1.',
      phaseRequirement: 3,
      costIncrease: 1,
      flavorText: 'Edge tension across graph partitions drains mental stamina.',
    },
    {
      id: 'entropy_barrier_aegis',
      name: 'Minimal Spanning Aegis',
      category: 'GUARDIAN_PHASE',
      bossIdentifier: 'entropy_partitioner',
      description: 'A crystalline lattice of minimum-weight edges absorbing direct force.',
      phaseRequirement: 3,
      flavorText: 'The Entropy Partitioner fortifies its core behind a Minimal Spanning Aegis!',
    },
    {
      id: 'entropy_cut_countersign',
      name: 'Cut Countersign',
      category: 'COUNTERSIGN',
      bossIdentifier: 'entropy_partitioner',
      description: 'Retaliates with an adaptive cut barrier upon correct edge selection.',
      phaseRequirement: 2,
      flavorText: 'The Partitioner detects cut crossing and reinforces opposing vertices.',
    },

    // -------------------------------------------------------------
    // 14. DATA STRUCTURES & ALGORITHMS — THE METRIC ARBITER (Module 4 Mini-Boss)
    // -------------------------------------------------------------
    {
      id: 'arbiter_matrix_distortion',
      name: 'Matrix Distortion',
      category: 'DISTORTION',
      bossIdentifier: 'metric_arbiter',
      description: 'The Arbiter warps the all-pairs distance matrix, shifting card alignments.',
      phaseRequirement: 2,
      flavorText: 'Intermediate distance coordinates warp between non-Euclidean geodesics.',
    },
    {
      id: 'arbiter_pivot_shroud',
      name: 'Pivot Shroud',
      category: 'CARD_SHROUD',
      bossIdentifier: 'metric_arbiter',
      description: 'Envelops an alternative intermediate vertex path in metric mist.',
      phaseRequirement: 2,
      flavorText: 'Thick fog cloaks an alternative intermediate vertex relaxation.',
    },
    {
      id: 'arbiter_path_tension',
      name: 'Path Tension Drain',
      category: 'ENERGY_DRAIN',
      bossIdentifier: 'metric_arbiter',
      description: 'Dense all-pairs metric tensions increase non-critical action cost by +1.',
      phaseRequirement: 3,
      costIncrease: 1,
      flavorText: 'Evaluating all-pairs intermediate routes drains cognitive focus.',
    },
    {
      id: 'arbiter_all_pairs_aegis',
      name: 'All-Pairs Geodesic Aegis',
      category: 'GUARDIAN_PHASE',
      bossIdentifier: 'metric_arbiter',
      description: 'An impenetrable shield forged from the complete all-pairs distance matrix.',
      phaseRequirement: 3,
      flavorText: 'The Metric Arbiter establishes the All-Pairs Geodesic Aegis!',
    },
    {
      id: 'arbiter_triangle_countersign',
      name: 'Triangle Countersign',
      category: 'COUNTERSIGN',
      bossIdentifier: 'metric_arbiter',
      description: 'Retaliates with an adaptive metric ward upon correct relaxation.',
      phaseRequirement: 2,
      flavorText: 'The Arbiter reinforces intermediate vertex paths with metric tension.',
    },

    // -------------------------------------------------------------
    // 15. DATA STRUCTURES & ALGORITHMS — GEODESIC SOVEREIGN (Module 4 Boss)
    // -------------------------------------------------------------
    {
      id: 'geodesic_subproblem_collapse',
      name: 'Subproblem Collapse',
      category: 'FRACTURED_STATE',
      bossIdentifier: 'geodesic_sovereign',
      description: 'The Sovereign fractures DP subproblem states, distorting visual projections.',
      phaseRequirement: 2,
      flavorText: 'Overlapping subproblem states oscillate violently across the table.',
    },
    {
      id: 'geodesic_optimal_shroud',
      name: 'Optimal Path Shroud',
      category: 'CARD_SHROUD',
      bossIdentifier: 'geodesic_sovereign',
      description: 'Veils an alternative branch in the decision space in dense shadows.',
      phaseRequirement: 2,
      flavorText: 'Shadows obscure an alternative dynamic programming transition.',
    },
    {
      id: 'geodesic_state_drain',
      name: 'State Space Drain',
      category: 'ENERGY_DRAIN',
      bossIdentifier: 'geodesic_sovereign',
      description: 'High dimensional state space complexity increases non-critical operation cost by +1.',
      phaseRequirement: 3,
      costIncrease: 1,
      flavorText: 'The weight of multi-dimensional DP tables drains mental stamina.',
    },
    {
      id: 'geodesic_sovereign_aegis',
      name: 'Sovereign Optimization Aegis',
      category: 'GUARDIAN_PHASE',
      bossIdentifier: 'geodesic_sovereign',
      description: 'A crystalline shield forged from global optimal substructure bounds.',
      phaseRequirement: 3,
      flavorText: 'The Geodesic Sovereign summons the Sovereign Optimization Aegis!',
    },
    {
      id: 'geodesic_bellman_countersign',
      name: 'Bellman Countersign',
      category: 'COUNTERSIGN',
      bossIdentifier: 'geodesic_sovereign',
      description: 'Retaliates with an adaptive optimality ward upon being struck by correct steps.',
      phaseRequirement: 2,
      flavorText: 'The Sovereign counters by demanding rigorous proof of subproblem optimality.',
    },

    // -------------------------------------------------------------
    // 16. DATA STRUCTURES & ALGORITHMS — INTRACTABILITY SOVEREIGN (Level 50 Mini-Boss)
    // -------------------------------------------------------------
    {
      id: 'intractability_inversion_ward',
      name: 'Directional Inversion Ward',
      category: 'DISTORTION',
      bossIdentifier: 'intractability_sovereign',
      description: 'Distorts reduction mappings, demanding rigorous certificate verification.',
      phaseRequirement: 2,
      flavorText: 'The Sovereign attempts to invert the reduction conduit!',
    },
    {
      id: 'intractability_gadget_shroud',
      name: 'Combinatorial Gadget Shroud',
      category: 'CARD_SHROUD',
      bossIdentifier: 'intractability_sovereign',
      description: 'Enshrouds an alternative reduction branch in combinatorial shadow.',
      phaseRequirement: 2,
      flavorText: 'Clause gadgets are shrouded in exponential ambiguity.',
    },
    {
      id: 'intractability_certificate_drain',
      name: 'Certificate Entropy Drain',
      category: 'ENERGY_DRAIN',
      bossIdentifier: 'intractability_sovereign',
      description: 'Verification witness checking increases non-critical card costs by +1.',
      phaseRequirement: 3,
      costIncrease: 1,
      flavorText: 'Checking complex certificates drains mental energy.',
    },
    {
      id: 'intractability_sovereign_aegis',
      name: 'Sovereign Intractability Aegis',
      category: 'GUARDIAN_PHASE',
      bossIdentifier: 'intractability_sovereign',
      description: 'An impenetrable shield forged from the complete polynomial reduction chain.',
      phaseRequirement: 3,
      flavorText: 'The Intractability Sovereign erects the Sovereign Intractability Aegis!',
    },
    {
      id: 'intractability_witness_countersign',
      name: 'Witness Countersign',
      category: 'COUNTERSIGN',
      bossIdentifier: 'intractability_sovereign',
      description: 'Retaliates with an adaptive verification ward upon being struck by correct steps.',
      phaseRequirement: 2,
      flavorText: 'The Sovereign demands immediate verification of the certificate invariant.',
    },

    // -------------------------------------------------------------
    // 17. DATA STRUCTURES & ALGORITHMS — THE TURING ARCHON (Level 54 Final Boss)
    // -------------------------------------------------------------
    {
      id: 'dsa_turing_witness_horizon',
      name: 'Witness Horizon',
      category: 'FRACTURED_STATE',
      bossIdentifier: 'dsa_turing_archon',
      description: 'The Archon distorts deterministic polynomial bounds with non-deterministic fog.',
      phaseRequirement: 2,
      flavorText: 'Non-deterministic branches obscure the deterministic polynomial boundary.',
    },
    {
      id: 'dsa_turing_reduction_paradox',
      name: 'Reduction Paradox',
      category: 'CARD_SHROUD',
      bossIdentifier: 'dsa_turing_archon',
      description: 'Veils alternative reduction gadget choices in recursive shadows.',
      phaseRequirement: 2,
      flavorText: 'Shadows envelop an alternative graph gadget mapping.',
    },
    {
      id: 'dsa_turing_approximation_drain',
      name: 'Intractability Mists Drain',
      category: 'ENERGY_DRAIN',
      bossIdentifier: 'dsa_turing_archon',
      description: 'Worst-case metric intractability increases non-critical card costs by +1.',
      phaseRequirement: 3,
      costIncrease: 1,
      flavorText: 'The mists of combinatorial explosion sap cognitive focus.',
    },
    {
      id: 'dsa_turing_abyssal_aegis',
      name: 'Abyssal Complexity Aegis',
      category: 'GUARDIAN_PHASE',
      bossIdentifier: 'dsa_turing_archon',
      description: 'The ultimate shield of the Algorithmic Abyss, shattered only by verified approximation bounds.',
      phaseRequirement: 3,
      flavorText: 'The Turing Archon calls forth the Abyssal Complexity Aegis!',
    },
    {
      id: 'dsa_turing_metric_countersign',
      name: 'Metric Shortcut Countersign',
      category: 'COUNTERSIGN',
      bossIdentifier: 'dsa_turing_archon',
      description: 'Retaliates with an adaptive triangle-inequality ward upon correct step execution.',
      phaseRequirement: 2,
      flavorText: 'The Archon tests whether your tour truly obeys the metric invariant.',
    },
  ];

  public static getInstance(): BossAbilityEngine {
    if (!BossAbilityEngine.instance) {
      BossAbilityEngine.instance = new BossAbilityEngine();
    }
    return BossAbilityEngine.instance;
  }

  public getAbilitiesForBoss(bossId: string): ThemedBossAbility[] {
    return this.abilities.filter(a => a.bossIdentifier === bossId);
  }

  /**
   * Identifies which boss archetype matches the encounter enemy.
   */
  public getBossIdentifier(encounter: EncounterDefinition): string {
    const visual = (encounter.enemy.visualType || '').toLowerCase();
    const name = (encounter.enemy.name || '').toLowerCase();
    const title = (encounter.enemy.title || '').toLowerCase();
    const subj = encounter.subject;

    if ((name.includes('entropy') && subj === 'data_structures_algorithms') || (subj === 'data_structures_algorithms' && encounter.id.includes('m3_10'))) {
      return 'entropy_partitioner';
    }
    if ((name.includes('intractability') || encounter.id.includes('m5_06')) && subj === 'data_structures_algorithms') {
      return 'intractability_sovereign';
    }
    if ((name.includes('turing') || encounter.id.includes('m5_10') || encounter.id === 'dsa_boss') && subj === 'data_structures_algorithms') {
      return 'dsa_turing_archon';
    }
    if ((name.includes('metric') || encounter.id.includes('m4_09')) && subj === 'data_structures_algorithms') {
      return 'metric_arbiter';
    }
    if ((name.includes('geodesic') || encounter.id.includes('m4_10')) && subj === 'data_structures_algorithms' && !name.includes('sentinel')) {
      return 'geodesic_sovereign';
    }
    if ((name.includes('vael') || title.includes('strategy') || name.includes('warden')) && subj === 'data_structures_algorithms') {
      return 'vael_strategy_warden';
    }
    if (name.includes('imbalance') || visual.includes('imbalance') || (name.includes('golem') && subj === 'data_structures_algorithms') || (subj === 'data_structures_algorithms' && encounter.id.includes('m2_14'))) {
      return 'imbalance_golem';
    }
    if (name.includes('asymptotic') || visual.includes('asymptotic') || (subj === 'data_structures_algorithms' && encounter.id.includes('m1_10'))) {
      return 'asymptotic_colossus';
    }
    if (visual.includes('singularity') || title.includes('archon') || name.includes('archon')) {
      return subj === 'computerScience' ? 'turing_archon' : 'singularity_archon';
    }
    if (visual.includes('quadratic') || name.includes('quadratic')) {
      return 'quadratic_beast';
    }
    if (visual.includes('algorithmic') || visual.includes('turing') || name.includes('algorithmic') || subj === 'computerScience') {
      return 'turing_archon';
    }
    if (visual.includes('reaction') || visual.includes('alchem') || subj === 'chemistry') {
      return 'reaction_golem';
    }
    if (visual.includes('darwin') || visual.includes('mutat') || subj === 'biology') {
      return 'darwinian_behemoth';
    }
    if (visual.includes('timeline') || visual.includes('chrono') || subj === 'history') {
      return 'timeline_guardian';
    }
    if (visual.includes('entropy') || visual.includes('momentum') || subj === 'physics') {
      return 'entropy_colossus';
    }
    if (visual.includes('sphinx') || visual.includes('lexicon') || subj === 'language') {
      return 'semantic_sphinx';
    }
    return 'singularity_archon';
  }

  /**
   * Evaluates boss combat phase based on HP ratio.
   * Phase 1: 100% - 70% (Observation)
   * Phase 2: 70% - 35% (Focused Interference)
   * Phase 3: 35% - 0% (Climax Pressure)
   */
  public evaluatePhase(currentHp: number, maxHp: number): number {
    if (maxHp <= 0) return 1;
    const ratio = currentHp / maxHp;
    if (ratio > 0.70) return 1;
    if (ratio > 0.35) return 2;
    return 3;
  }

  /**
   * Evaluates and proposes safe boss interference modifiers for the upcoming turn.
   * STRICT INVARIANT: Must NEVER reduce reachableWinningPaths to 0.
   */
  public evaluateTurnInterference(
    graph: SolutionGraph,
    state: CombatEngineState,
    encounter: EncounterDefinition,
    isJudgeDemo?: boolean
  ): BossInterferenceProposal {
    // 1. Strict Judge Demo Protection: No dynamic abilities in Judge Demo or Level 1 Demo
    if (isJudgeDemo || encounter.id === 'math_lvl_1') {
      return {
        modifiers: [],
        phase: 1,
        phaseTransition: false,
        activatedAbilityNames: [],
      };
    }

    // Only active for Boss encounters
    const isBossFight =
      encounter.isBoss ||
      (encounter.subject !== 'data_structures_algorithms' && encounter.levelNumber === 5) ||
      encounter.id.includes('boss');
    if (!isBossFight) {
      return {
        modifiers: [],
        phase: 1,
        phaseTransition: false,
        activatedAbilityNames: [],
      };
    }

    const currentPhase = this.evaluatePhase(state.enemy.currentHp, state.enemy.maxHp);
    const previousPhase = state.enemy.phase || 1;
    const phaseTransition = currentPhase !== previousPhase;

    // Phase 1 (Observation): Boss studies player, no harsh modifiers
    if (currentPhase === 1) {
      return {
        modifiers: [],
        phase: 1,
        phaseTransition,
        activatedAbilityNames: [],
        bannerMessage: phaseTransition ? `${state.enemy.name} is observing your reasoning...` : undefined,
      };
    }

    const bossId = this.getBossIdentifier(encounter);
    const candidatePool = this.abilities.filter(
      a => a.bossIdentifier === bossId && a.phaseRequirement <= currentPhase
    );

    if (candidatePool.length === 0) {
      return {
        modifiers: [],
        phase: currentPhase,
        phaseTransition,
        activatedAbilityNames: [],
      };
    }

    const acceptedModifiers: BossModifier[] = [];
    const activatedNames: string[] = [];

    // In Phase 2: select 1 ability. In Phase 3: select up to 2 coordinated abilities.
    const maxAbilities = currentPhase === 2 ? 1 : 2;

    // Deterministic selection based on turn number & phase
    for (let i = 0; i < candidatePool.length && acceptedModifiers.length < maxAbilities; i++) {
      const abilityIdx = (state.turnNumber + i) % candidatePool.length;
      const ability = candidatePool[abilityIdx];

      // Convert ability definition to concrete BossModifier
      const candidateMod = this.createCandidateModifier(ability, state, graph);
      if (!candidateMod) continue;

      // FORMAL SOLVABILITY VALIDATION:
      // Simulate state with candidate modifier and check reachableWinningPaths >= 1
      const isSafe = this.validateModifierSafety(graph, state, candidateMod, acceptedModifiers);

      if (isSafe) {
        acceptedModifiers.push(candidateMod);
        activatedNames.push(ability.name);
      } else {
        // If unsafe, attempt safe fallback:
        // Try safe non-critical card shroud or Guardian Barrier
        const fallback = this.createSafeFallbackModifier(graph, state, acceptedModifiers);
        if (fallback) {
          acceptedModifiers.push(fallback);
          activatedNames.push(fallback.name);
        }
      }
    }

    return {
      modifiers: acceptedModifiers,
      phase: currentPhase,
      phaseTransition,
      activatedAbilityNames: activatedNames,
      bannerMessage: phaseTransition
        ? `${state.enemy.name} enters Phase ${currentPhase}! ${activatedNames.join(', ')} activated!`
        : activatedNames.length > 0
        ? `${state.enemy.name} deploys ${activatedNames.join(', ')}!`
        : undefined,
    };
  }

  /**
   * Generates a safe counter-sign response after a player executes a correct step.
   */
  public evaluateCountersign(
    graph: SolutionGraph,
    state: CombatEngineState,
    encounter: EncounterDefinition,
    playedOperation: string,
    isJudgeDemo?: boolean
  ): BossModifier | null {
    if (isJudgeDemo || encounter.id === 'math_lvl_1') return null;
    if (!encounter.isBoss && encounter.levelNumber !== 5) return null;

    const currentPhase = this.evaluatePhase(state.enemy.currentHp, state.enemy.maxHp);
    if (currentPhase < 2) return null; // Countersign only activates in Phase 2+

    const bossId = this.getBossIdentifier(encounter);
    const countersignDef = this.abilities.find(
      a => a.bossIdentifier === bossId && a.category === 'COUNTERSIGN'
    );
    if (!countersignDef) return null;

    // Countersign creates a fair, non-destructive tactical response (e.g. minor temporary shield or non-critical shroud)
    const candidateMod: BossModifier = {
      id: `countersign_${Date.now()}`,
      name: countersignDef.name,
      type: 'countersign',
      description: `${countersignDef.name}: ${countersignDef.flavorText}`,
      countersignEffect: 'shield_boost',
    };

    const isSafe = this.validateModifierSafety(graph, state, candidateMod, []);
    return isSafe ? candidateMod : null;
  }

  /**
   * Translates a themed ability into a concrete runtime BossModifier.
   */
  private createCandidateModifier(
    ability: ThemedBossAbility,
    state: CombatEngineState,
    graph: SolutionGraph
  ): BossModifier | null {
    const hiddenCards = state.hiddenCards || state.player.hiddenCards || [];

    switch (ability.category) {
      case 'CARD_SHROUD': {
        // Pick an optional or alternative card to shroud, NEVER the only opening action
        const shroudableCards = state.player.hand.filter(
          c => !hiddenCards.includes(c.id) && !hiddenCards.includes(c.operationKey)
        );
        if (shroudableCards.length <= 1) return null; // Keep at least 1 card visible

        // Prefer cards not needed for current immediate step
        const currentOp = graph.primaryPath.operations[state.currentStepIndex];
        const nonImmediate = shroudableCards.filter(c => c.operationKey !== currentOp);
        const targetCard = nonImmediate.length > 0 ? nonImmediate[0] : shroudableCards[shroudableCards.length - 1];

        return {
          id: `boss_shroud_${ability.id}_${Date.now()}`,
          name: ability.name,
          type: 'hide_card',
          targetCardId: targetCard.id,
          description: `${ability.name}: ${targetCard.name} is shrouded in dark mist.`,
        };
      }

      case 'ENERGY_DRAIN': {
        // Find a card to increase cost by +1
        const availableCards = state.player.hand.filter(c => c.cost < state.player.maxEnergy);
        if (availableCards.length === 0) return null;
        const target = availableCards[availableCards.length - 1];

        return {
          id: `boss_drain_${ability.id}_${Date.now()}`,
          name: ability.name,
          type: 'increase_cost',
          targetCardId: target.id,
          costIncrease: ability.costIncrease || 1,
          description: `${ability.name}: ${target.name} costs +1 Energy.`,
        };
      }

      case 'FRACTURED_STATE': {
        return {
          id: `boss_fracture_${ability.id}_${Date.now()}`,
          name: ability.name,
          type: 'fractured_state',
          description: `${ability.name}: ${ability.flavorText}`,
          fracturedVisualPrompt: ability.flavorText,
        };
      }

      case 'GUARDIAN_PHASE': {
        return {
          id: `boss_guardian_${ability.id}_${Date.now()}`,
          name: ability.name,
          type: 'guardian_phase',
          description: `${ability.name}: Absorbs direct damage on the next valid strike.`,
          isGuardianBarrierActive: true,
        };
      }

      case 'DISTORTION': {
        return {
          id: `boss_distortion_${ability.id}_${Date.now()}`,
          name: ability.name,
          type: 'distortion',
          description: `${ability.name}: ${ability.flavorText}`,
        };
      }

      case 'COUNTERSIGN': {
        return {
          id: `boss_countersign_${ability.id}_${Date.now()}`,
          name: ability.name,
          type: 'countersign',
          description: `${ability.name}: ${ability.flavorText}`,
        };
      }

      default:
        return null;
    }
  }

  /**
   * Validates whether applying candidateMod (along with already accepted modifiers)
   * strictly satisfies reachableWinningPaths >= 1 and starting action availability.
   */
  public validateModifierSafety(
    graph: SolutionGraph,
    state: CombatEngineState,
    candidateMod: BossModifier,
    existingMods: BossModifier[]
  ): boolean {
    const allMods = [...existingMods, candidateMod];

    // Clone state to test composite effect
    const simState: CombatEngineState = {
      ...state,
      hiddenCards: [...(state.hiddenCards || [])],
      costModifiers: { ...(state.costModifiers || {}) },
      player: {
        ...state.player,
        hand: [...state.player.hand],
        drawPile: [...state.player.drawPile],
        discardPile: [...state.player.discardPile],
        hiddenCards: [...(state.player.hiddenCards || [])],
        costModifiers: { ...(state.player.costModifiers || {}) },
      },
    };

    allMods.forEach(mod => {
      if (mod.type === 'hide_card') {
        if (mod.targetCardId) {
          simState.hiddenCards!.push(mod.targetCardId);
          simState.player.hiddenCards!.push(mod.targetCardId);
        }
        if (mod.targetOperation) {
          simState.hiddenCards!.push(mod.targetOperation);
          simState.player.hiddenCards!.push(mod.targetOperation);
        }
      } else if (mod.type === 'increase_cost') {
        const inc = mod.costIncrease || 1;
        if (mod.targetCardId) {
          simState.costModifiers![mod.targetCardId] = (simState.costModifiers![mod.targetCardId] || 0) + inc;
          simState.player.costModifiers![mod.targetCardId] = (simState.player.costModifiers![mod.targetCardId] || 0) + inc;
        }
        if (mod.targetOperation) {
          simState.costModifiers![mod.targetOperation] = (simState.costModifiers![mod.targetOperation] || 0) + inc;
          simState.player.costModifiers![mod.targetOperation] = (simState.player.costModifiers![mod.targetOperation] || 0) + inc;
        }
      }
    });

    const report = solutionPathEngine.validateSolvability(graph, simState);
    // Strict solvability check: must have at least 1 reachable winning path!
    if (!report.solvable || report.reachableWinningPaths < 1) {
      return false;
    }

    // Must also have at least 1 playable action from current hand
    if (report.reachableFirstActions.length < 1) {
      return false;
    }

    return true;
  }

  /**
   * Synthesizes a guaranteed-safe fallback modifier when a candidate modifier is unsafe.
   */
  private createSafeFallbackModifier(
    graph: SolutionGraph,
    state: CombatEngineState,
    existingMods: BossModifier[]
  ): BossModifier | null {
    // Priority 1: Safe non-critical card shroud (find a truly optional card not used in any remaining path)
    const remainingOps = new Set(graph.primaryPath.operations.slice(state.currentStepIndex));
    const optionalCards = state.player.hand.filter(
      c => !remainingOps.has(c.operationKey) && !(state.hiddenCards || []).includes(c.id)
    );

    if (optionalCards.length > 0) {
      const chosen = optionalCards[0];
      const safeMod: BossModifier = {
        id: `safe_shroud_${chosen.id}_${Date.now()}`,
        name: 'Shadow Shroud',
        type: 'hide_card',
        targetCardId: chosen.id,
        description: `Shadow Shroud: ${chosen.name} is shrouded in dark mist.`,
      };
      if (this.validateModifierSafety(graph, state, safeMod, existingMods)) {
        return safeMod;
      }
    }

    // Priority 2: Guardian Barrier (absorbs damage, zero interference with card plays)
    const guardianMod: BossModifier = {
      id: `safe_guardian_${Date.now()}`,
      name: 'Runic Aegis',
      type: 'guardian_phase',
      description: 'Runic Aegis: Absorbs direct damage on the next valid strike.',
      isGuardianBarrierActive: true,
    };
    if (this.validateModifierSafety(graph, state, guardianMod, existingMods)) {
      return guardianMod;
    }

    return null;
  }
}

export const bossAbilityEngine = BossAbilityEngine.getInstance();
