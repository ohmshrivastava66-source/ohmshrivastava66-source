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
  ];

  public static getInstance(): BossAbilityEngine {
    if (!BossAbilityEngine.instance) {
      BossAbilityEngine.instance = new BossAbilityEngine();
    }
    return BossAbilityEngine.instance;
  }

  /**
   * Identifies which boss archetype matches the encounter enemy.
   */
  public getBossIdentifier(encounter: EncounterDefinition): string {
    const visual = (encounter.enemy.visualType || '').toLowerCase();
    const name = (encounter.enemy.name || '').toLowerCase();
    const title = (encounter.enemy.title || '').toLowerCase();
    const subj = encounter.subject;

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
      encounter.levelNumber === 5 ||
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
