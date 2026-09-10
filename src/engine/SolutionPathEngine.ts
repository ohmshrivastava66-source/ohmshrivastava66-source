import { SubjectId, Card, BossModifier } from '../types/game';
import { EncounterDefinition, StepTransformation, MisconceptionRule, SolutionPathDefinition, RecoveryPathDefinition } from '../types/curriculum';
import { CombatEngineState } from './CombatEngine';
import { QuestionVariant, QUESTION_POOLS } from '../curriculum/questionPools';
import { Mulberry32PRNG } from './DangerEngine';

export interface SolutionPath {
  id: string;
  name: string;
  operations: string[];
  states: string[];
  educationalMethod: string;
  difficulty: number;
  completionCondition: string;
  transformations: StepTransformation[];
}

export interface RecoveryTransition {
  failedStepIndex: number;
  triggerOperation: string;
  recoveryOperation: string;
  resultingState: string;
  remainingSequence: string[];
  explanation: string;
}

export interface SolutionGraph {
  questionId: string;
  subject: SubjectId;
  levelNumber: number;
  initialState: string;
  targetState: string;
  correctAnswer: string; // IMMUTABLE INVARIANT LOCKED AT GENERATION
  primaryPath: SolutionPath;
  alternativePaths: SolutionPath[];
  allPaths: SolutionPath[];
  validTransitions: Record<string, Record<string, { nextState: string; transformation: StepTransformation; pathId: string }>>;
  recoveryTransitions: Record<string, Record<string, RecoveryTransition>>;
  invalidTransitions: Record<string, string[]>;
}

export interface SolvabilityReport {
  solvable: boolean;
  reachableWinningPaths: number;
  reachableFirstActions: string[];
  guaranteedPath: string[] | null;
  activePathId?: string;
  reason?: string;
  reachableFromHand: boolean;
  reachableWithDraws: boolean;
  unreachableReasons?: string[];
}

export class SolutionPathEngine {
  private static instance: SolutionPathEngine;
  private graphCache: Map<string, SolutionGraph> = new Map();
  private prng: Mulberry32PRNG;

  constructor(seed?: number) {
    this.prng = new Mulberry32PRNG(seed !== undefined ? seed : Date.now());
  }

  public static getInstance(): SolutionPathEngine {
    if (!SolutionPathEngine.instance) {
      SolutionPathEngine.instance = new SolutionPathEngine();
    }
    return SolutionPathEngine.instance;
  }

  public setSeed(seed: number) {
    this.prng = new Mulberry32PRNG(seed);
  }

  /**
   * Generates or retrieves a cached immutable SolutionGraph for a question/encounter.
   * Locks the correct answer as an invariant from the very start.
   */
  public generateSolutionGraph(encounter: EncounterDefinition | QuestionVariant): SolutionGraph {
    const cacheKey = `${encounter.id}_${encounter.initialEquationOrState}`;
    if (this.graphCache.has(cacheKey)) {
      return this.graphCache.get(cacheKey)!;
    }

    // 1. Calculate and lock the Correct Answer Invariant
    let correctAnswer = encounter.correctAnswer;
    if (!correctAnswer) {
      // Derive clean canonical answer from target state
      correctAnswer = encounter.targetState.replace(/\[.*?\]/g, '').trim();
    }

    // 2. Build Primary Solution Path
    const primaryOps = [...encounter.optimalSequence];
    const primaryTransformations = encounter.stepTransformations.map(st => ({ ...st }));
    const primaryStates: string[] = [encounter.initialEquationOrState];
    primaryTransformations.forEach(st => primaryStates.push(st.resultingState));

    const primaryPath: SolutionPath = {
      id: 'path_primary',
      name: 'Primary Method',
      operations: primaryOps,
      states: primaryStates,
      educationalMethod: 'Canonical Optimal Derivation',
      difficulty: 'difficulty' in encounter ? encounter.difficulty : 1,
      completionCondition: encounter.targetState,
      transformations: primaryTransformations,
    };

    // 3. Build Alternative Solution Paths (Genuinely educationally valid)
    const alternativePaths: SolutionPath[] = [];

    // Check if explicit alternative paths are defined on encounter
    if (encounter.alternativePaths && encounter.alternativePaths.length > 0) {
      encounter.alternativePaths.forEach((altDef, idx) => {
        const altStates: string[] = [encounter.initialEquationOrState];
        altDef.transformations.forEach(st => altStates.push(st.resultingState));
        alternativePaths.push({
          id: altDef.id || `path_alt_${idx + 1}`,
          name: altDef.name,
          operations: [...altDef.operations],
          states: altStates,
          educationalMethod: altDef.educationalMethod,
          difficulty: altDef.difficulty || primaryPath.difficulty,
          completionCondition: altDef.completionCondition || encounter.targetState,
          transformations: altDef.transformations.map(st => ({ ...st })),
        });
      });
    } else {
      // Intelligently infer educationally legitimate alternative routes based on subject & concept
      const altInferred = this.inferLegitimateAlternatives(encounter, primaryPath);
      altInferred.forEach(alt => alternativePaths.push(alt));
    }

    const allPaths = [primaryPath, ...alternativePaths];

    // 4. Construct Valid Transitions Map: currentState -> operationKey -> { nextState, transformation, pathId }
    const validTransitions: Record<string, Record<string, { nextState: string; transformation: StepTransformation; pathId: string }>> = {};

    allPaths.forEach(path => {
      for (let i = 0; i < path.operations.length; i++) {
        const stateFrom = path.states[i];
        const stateTo = path.states[i + 1] || path.completionCondition;
        const op = path.operations[i];
        const trans = path.transformations[i] || {
          stepIndex: i,
          operationKey: op,
          resultingState: stateTo,
          explanation: `Advanced via ${path.educationalMethod}.`,
          damageValue: 35,
        };

        if (!validTransitions[stateFrom]) {
          validTransitions[stateFrom] = {};
        }
        // If state already has transition for this op, preserve primary or register both
        if (!validTransitions[stateFrom][op]) {
          validTransitions[stateFrom][op] = {
            nextState: stateTo,
            transformation: trans,
            pathId: path.id,
          };
        }
      }
    });

    // 5. Construct Recovery Transitions Map: failedState -> mistakeOp -> RecoveryTransition
    const recoveryTransitions: Record<string, Record<string, RecoveryTransition>> = {};
    if (encounter.recoveryPaths && encounter.recoveryPaths.length > 0) {
      encounter.recoveryPaths.forEach(rec => {
        const failedState = primaryStates[rec.failedStepIndex] || encounter.initialEquationOrState;
        if (!recoveryTransitions[failedState]) {
          recoveryTransitions[failedState] = {};
        }
        recoveryTransitions[failedState][rec.triggerOperation] = { ...rec };
      });
    }

    // Also populate default recovery transitions for known misconceptions
    encounter.misconceptions.forEach(m => {
      const failedState = primaryStates[m.atStepIndex] || encounter.initialEquationOrState;
      if (!recoveryTransitions[failedState]) {
        recoveryTransitions[failedState] = {};
      }
      if (!recoveryTransitions[failedState][m.triggerOperation]) {
        // Recovery op returns to the expected first op or alternative
        const recoveryOp = primaryOps[m.atStepIndex] || primaryOps[0];
        recoveryTransitions[failedState][m.triggerOperation] = {
          failedStepIndex: m.atStepIndex,
          triggerOperation: m.triggerOperation,
          recoveryOperation: recoveryOp,
          resultingState: primaryStates[m.atStepIndex + 1] || primaryStates[primaryStates.length - 1],
          remainingSequence: primaryOps.slice(m.atStepIndex + 1),
          explanation: `Recovered from ${m.title}. Resume with ${recoveryOp}.`,
        };
      }
    });

    // 6. Construct Invalid Transitions Map
    const invalidTransitions: Record<string, string[]> = {};
    encounter.misconceptions.forEach(m => {
      const stateKey = primaryStates[m.atStepIndex] || encounter.initialEquationOrState;
      if (!invalidTransitions[stateKey]) {
        invalidTransitions[stateKey] = [];
      }
      if (!invalidTransitions[stateKey].includes(m.triggerOperation)) {
        invalidTransitions[stateKey].push(m.triggerOperation);
      }
    });

    const graph: SolutionGraph = {
      questionId: encounter.id,
      subject: encounter.subject,
      levelNumber: encounter.levelNumber,
      initialState: encounter.initialEquationOrState,
      targetState: encounter.targetState,
      correctAnswer,
      primaryPath,
      alternativePaths,
      allPaths,
      validTransitions,
      recoveryTransitions,
      invalidTransitions,
    };

    this.graphCache.set(cacheKey, graph);
    return graph;
  }

  /**
   * Helper to infer legitimate alternative educational pathways where mathematically sound.
   */
  private inferLegitimateAlternatives(
    encounter: EncounterDefinition | QuestionVariant,
    primaryPath: SolutionPath
  ): SolutionPath[] {
    const alts: SolutionPath[] = [];
    const eq = encounter.initialEquationOrState;
    const subj = encounter.subject;

    // Mathematics Systems of Linear Equations (e.g. Level 2 or Crucible)
    // Primary is often SIMPLIFY (Elimination). Alternative is SUBSTITUTE (Substitution)
    if (subj === 'mathematics' && (eq.includes('{') || eq.includes('y =') || encounter.levelNumber === 2)) {
      if (primaryPath.operations[0] === 'SIMPLIFY') {
        alts.push({
          id: 'path_alt_substitution',
          name: 'Method B: Substitution',
          operations: ['SUBSTITUTE', 'SOLVE', 'VERIFY'],
          states: [
            eq,
            'Substituted y in second equation => Linear Equation in single variable',
            'x = 3, y = 1 [SUBSTITUTION RESULT]',
            encounter.targetState,
          ],
          educationalMethod: 'Algebraic Substitution Method',
          difficulty: 2,
          completionCondition: encounter.targetState,
          transformations: [
            {
              stepIndex: 0,
              operationKey: 'SUBSTITUTE',
              resultingState: 'Substituted y => single variable linear equation',
              explanation: 'Substituted variable expression from Equation 1 into Equation 2.',
              damageValue: 35,
            },
            {
              stepIndex: 1,
              operationKey: 'SOLVE',
              resultingState: 'x = 3, y = 1 [SUBSTITUTION RESULT]',
              explanation: 'Solved isolated single variable and back-substituted.',
              damageValue: 45,
            },
            {
              stepIndex: 2,
              operationKey: 'VERIFY',
              resultingState: encounter.targetState,
              explanation: 'Substituted (3, 1) into both equations to verify balance.',
              damageValue: 30,
            },
          ],
        });
      } else if (primaryPath.operations[0] === 'SUBSTITUTE') {
        alts.push({
          id: 'path_alt_elimination',
          name: 'Method B: Elimination',
          operations: ['SIMPLIFY', 'SOLVE', 'VERIFY'],
          states: [
            eq,
            'Aligned coefficients and summed equations => Eliminated variable y',
            'x = 3, y = 1 [ELIMINATION RESULT]',
            encounter.targetState,
          ],
          educationalMethod: 'Linear Elimination Method',
          difficulty: 2,
          completionCondition: encounter.targetState,
          transformations: [
            {
              stepIndex: 0,
              operationKey: 'SIMPLIFY',
              resultingState: 'Summed equations => Eliminated y',
              explanation: 'Added equations directly to eliminate opposite terms (+y and -y).',
              damageValue: 35,
            },
            {
              stepIndex: 1,
              operationKey: 'SOLVE',
              resultingState: 'x = 3, y = 1 [ELIMINATION RESULT]',
              explanation: 'Solved reduced equation for x and back-substituted.',
              damageValue: 45,
            },
            {
              stepIndex: 2,
              operationKey: 'VERIFY',
              resultingState: encounter.targetState,
              explanation: 'Verified solution in initial system.',
              damageValue: 30,
            },
          ],
        });
      }
    }

    // Mathematics Quadratics (Level 1 / Level 5):
    // Factoring is primary. Completing the square / direct simplification is alternative.
    if (subj === 'mathematics' && (encounter.levelNumber === 1 || encounter.levelNumber === 5)) {
      alts.push({
        id: 'path_alt_completing_square',
        name: 'Method B: Completing the Square',
        operations: ['SIMPLIFY', 'SOLVE', 'VERIFY'],
        states: [
          eq,
          '(x + p)² = q [COMPLETED SQUARE]',
          'x = p ± √q [ROOTS EXTRACTED]',
          encounter.targetState,
        ],
        educationalMethod: 'Completing the Square / Direct Square Root',
        difficulty: 3,
        completionCondition: encounter.targetState,
        transformations: [
          {
            stepIndex: 0,
            operationKey: 'SIMPLIFY',
            resultingState: '(x + p)² = q [COMPLETED SQUARE]',
            explanation: 'Rewrote trinomial as perfect square binomial.',
            damageValue: 40,
          },
          {
            stepIndex: 1,
            operationKey: 'SOLVE',
            resultingState: 'x = p ± √q [ROOTS EXTRACTED]',
            explanation: 'Applied square root extraction to isolate roots.',
            damageValue: 45,
          },
          {
            stepIndex: 2,
            operationKey: 'VERIFY',
            resultingState: encounter.targetState,
            explanation: 'Verified roots in original quadratic equation.',
            damageValue: 30,
          },
        ],
      });
    }

    // Computer Science Binary Search (Level 2):
    // Primary: INITIALIZE -> COMPARE -> TERMINATE
    // Alt: INITIALIZE -> COMPARE -> SWAP -> TERMINATE (in case of two-pointer inflection swap)
    if (subj === 'computerScience' && encounter.levelNumber === 2) {
      alts.push({
        id: 'path_alt_two_pointer_check',
        name: 'Method B: Two-Pointer Boundary Check',
        operations: ['INITIALIZE', 'COMPARE', 'TERMINATE'],
        states: [
          eq,
          'Pointers set: low=0, high=n-1, mid=mid',
          'Monotonic partition verified',
          encounter.targetState,
        ],
        educationalMethod: 'Logarithmic Boundary Pruning',
        difficulty: 2,
        completionCondition: encounter.targetState,
        transformations: primaryPath.transformations.map(st => ({ ...st })),
      });
    }

    // Computer Science Sorting (Level 1):
    // Primary: INITIALIZE -> COMPARE -> SWAP -> TERMINATE
    // Alt: INITIALIZE -> COMPARE -> TERMINATE (when checking invariant after adjacent swap)
    if (subj === 'computerScience' && encounter.levelNumber === 1) {
      alts.push({
        id: 'path_alt_direct_invariant',
        name: 'Method B: Invariant Verification Pass',
        operations: ['INITIALIZE', 'COMPARE', 'SWAP', 'TERMINATE'],
        states: primaryPath.states,
        educationalMethod: 'Two-Pointer Partitioning Invariant',
        difficulty: 2,
        completionCondition: encounter.targetState,
        transformations: primaryPath.transformations.map(st => ({ ...st })),
      });
    }

    // Physics Newton Laws:
    // Primary: ISOLATE_VARIABLE -> COMPUTE -> VERIFY
    // Alt: RESOLVE_FORCES -> COMPUTE -> VERIFY
    if (subj === 'physics') {
      alts.push({
        id: 'path_alt_direct_substitution',
        name: 'Method B: Direct Vector Resolution',
        operations: ['RESOLVE_FORCES', 'COMPUTE', 'VERIFY'],
        states: [eq, 'F_net isolated along 1D axis: Net force = 20 N.', 'a = 20 / 5 = 4 m/s²', encounter.targetState],
        educationalMethod: 'Direct Vector Resolution',
        difficulty: 1,
        completionCondition: encounter.targetState,
        transformations: [
          {
            stepIndex: 0,
            operationKey: 'RESOLVE_FORCES',
            resultingState: 'F_net isolated along 1D axis: Net force = 20 N.',
            explanation: 'Decomposed vectors along coordinate axis.',
            damageValue: 35,
          },
          {
            stepIndex: 1,
            operationKey: 'COMPUTE',
            resultingState: 'a = 20 / 5 = 4 m/s²',
            explanation: 'Substituted directly into scalar formula.',
            damageValue: 45,
          },
          {
            stepIndex: 2,
            operationKey: 'VERIFY',
            resultingState: encounter.targetState,
            explanation: 'Dimensional analysis verified.',
            damageValue: 30,
          },
        ],
      });
    }

    return alts;
  }

  /**
   * Validates whether a winning path is reachable from the player's CURRENT combat state.
   * Considers:
   * - current hand
   * - draw pile and discard pile (draw availability)
   * - energy economy
   * - hidden cards (boss interference)
   * - cost modifiers (boss interference)
   * - current step index and active path
   */
  public validateSolvability(graph: SolutionGraph, state: CombatEngineState): SolvabilityReport {
    const hiddenCards = state.hiddenCards || state.player.hiddenCards || [];
    const costModifiers = state.costModifiers || state.player.costModifiers || {};
    const playerEnergy = state.player.maxEnergy; // max energy available per turn (typically 3)

    // Collect all available card operations in deck (hand + drawPile + discardPile)
    // Exclude cards that are hidden!
    const availableCards: Card[] = [
      ...state.player.hand.filter(c => !hiddenCards.includes(c.id) && !hiddenCards.includes(c.operationKey)),
      ...state.player.drawPile.filter(c => !hiddenCards.includes(c.id) && !hiddenCards.includes(c.operationKey)),
      ...state.player.discardPile.filter(c => !hiddenCards.includes(c.id) && !hiddenCards.includes(c.operationKey)),
    ];

    const handNonHidden = state.player.hand.filter(
      c => !hiddenCards.includes(c.id) && !hiddenCards.includes(c.operationKey)
    );

    const availableOpsCount: Record<string, number> = {};
    availableCards.forEach(c => {
      availableOpsCount[c.operationKey] = (availableOpsCount[c.operationKey] || 0) + 1;
    });

    const handOpsCount: Record<string, number> = {};
    handNonHidden.forEach(c => {
      handOpsCount[c.operationKey] = (handOpsCount[c.operationKey] || 0) + 1;
    });

    // Check reachable first actions from current step
    const currentStep = state.currentStepIndex;
    const reachableFirstActions: string[] = [];
    const reachableWinningPaths: SolutionPath[] = [];
    const unreachableReasons: string[] = [];

    // Evaluate each path in the SolutionGraph
    for (const path of graph.allPaths) {
      // Check if current step index is within path bounds
      if (currentStep >= path.operations.length) {
        continue;
      }

      const neededOp = path.operations[currentStep];
      const remainingOps = path.operations.slice(currentStep);

      // 1. Is every required remaining card in the deck and affordable?
      let canAffordAll = true;
      let allCardsPresent = true;
      const neededCounts: Record<string, number> = {};
      remainingOps.forEach(op => {
        neededCounts[op] = (neededCounts[op] || 0) + 1;
      });

      for (const [op, count] of Object.entries(neededCounts)) {
        if ((availableOpsCount[op] || 0) < count) {
          allCardsPresent = false;
          unreachableReasons.push(`Path ${path.id} missing operation ${op} (needed: ${count}, available: ${availableOpsCount[op] || 0})`);
          break;
        }

        // Check cost modifier affordability: card must not cost more than max energy (3)
        const sampleCard = availableCards.find(c => c.operationKey === op);
        if (sampleCard) {
          const mod = costModifiers[sampleCard.id] || costModifiers[op] || 0;
          const effectiveCost = sampleCard.cost + mod;
          if (effectiveCost > playerEnergy) {
            canAffordAll = false;
            unreachableReasons.push(`Path ${path.id} card ${sampleCard.name} unaffordable: cost ${effectiveCost} > max energy ${playerEnergy}`);
            break;
          }
        }
      }

      if (!allCardsPresent || !canAffordAll) {
        continue;
      }

      // 2. Can the player make progress from CURRENT hand or draw on next turn?
      const firstOp = path.operations[currentStep];
      const inHand = (handOpsCount[firstOp] || 0) > 0;

      // If in hand, can player afford it right now with current energy?
      // (If not enough energy right now on current turn, player can click "End Turn" and retain/draw it)
      if (inHand) {
        if (!reachableFirstActions.includes(firstOp)) {
          reachableFirstActions.push(firstOp);
        }
      }

      reachableWinningPaths.push(path);
    }

    const reachableCount = reachableWinningPaths.length;
    const solvable = reachableCount > 0;
    const guaranteedPath = solvable ? reachableWinningPaths[0].operations : null;

    return {
      solvable,
      reachableWinningPaths: reachableCount,
      reachableFirstActions,
      guaranteedPath,
      activePathId: solvable ? reachableWinningPaths[0].id : undefined,
      reachableFromHand: reachableFirstActions.length > 0,
      reachableWithDraws: solvable,
      unreachableReasons: solvable ? undefined : unreachableReasons,
    };
  }

  /**
   * Guarantees that the starting hand contains at least one valid first action.
   * If not, redeals/swaps the required starter card into hand deterministically.
   */
  public ensureStartingHandSolvability(
    graph: SolutionGraph,
    state: CombatEngineState,
    seed?: number
  ): CombatEngineState {
    const report = this.validateSolvability(graph, state);

    // If already solvable and player can immediately act from hand, all good!
    if (report.solvable && report.reachableFirstActions.length > 0) {
      return state;
    }

    // If starting hand has no valid first action, swap or inject the needed card into hand!
    const targetFirstOp = graph.primaryPath.operations[0];
    const hiddenCards = state.hiddenCards || state.player.hiddenCards || [];

    let neededCard: Card | null = null;

    // Find the needed card in drawPile or discardPile
    let neededCardIdx = state.player.drawPile.findIndex(
      c => c.operationKey === targetFirstOp && !hiddenCards.includes(c.id)
    );

    if (neededCardIdx !== -1) {
      neededCard = state.player.drawPile.splice(neededCardIdx, 1)[0];
    } else {
      // Check discard pile
      neededCardIdx = state.player.discardPile.findIndex(
        c => c.operationKey === targetFirstOp && !hiddenCards.includes(c.id)
      );
      if (neededCardIdx !== -1) {
        neededCard = state.player.discardPile.splice(neededCardIdx, 1)[0];
      }
    }

    if (!neededCard) {
      // Missing from all piles: synthesize required starting card to guarantee 100% solvability
      neededCard = {
        id: `starter_${targetFirstOp.toLowerCase()}_${Date.now()}`,
        name: targetFirstOp.replace(/_/g, ' '),
        cost: 1,
        subject: graph.subject,
        rarity: 'common',
        operationKey: targetFirstOp,
        description: `Primary foundational step for ${graph.subject}`,
        effectText: `Execute ${targetFirstOp} step. Deals 30 DMG & shields 10.`,
        damage: 30,
        shield: 10,
        iconName: 'Sparkles',
      };
    }

    if (state.player.hand.length >= 5) {
      const removed = state.player.hand.pop()!;
      state.player.drawPile.unshift(removed);
    }
    const targetSlot = Math.floor(Math.random() * (state.player.hand.length + 1));
    state.player.hand.splice(targetSlot, 0, neededCard);

    // Ensure all subsequent operations in the primary path exist in deck (hand, draw, or discard)
    for (let step = 1; step < graph.primaryPath.operations.length; step++) {
      const op = graph.primaryPath.operations[step];
      const present = state.player.hand.some(c => c.operationKey === op && !hiddenCards.includes(c.id)) ||
                      state.player.drawPile.some(c => c.operationKey === op && !hiddenCards.includes(c.id)) ||
                      state.player.discardPile.some(c => c.operationKey === op && !hiddenCards.includes(c.id));
      if (!present) {
        state.player.drawPile.push({
          id: `path_req_${op.toLowerCase()}_${step}`,
          name: op.replace(/_/g, ' '),
          cost: 1,
          subject: graph.subject,
          rarity: 'common',
          operationKey: op,
          description: `Required path operation for ${graph.subject}`,
          effectText: `Execute ${op} step. Deals 35 DMG & shields 10.`,
          damage: 35,
          shield: 10,
          iconName: 'CheckCircle',
        });
      }
    }

    return state;
  }

  /**
   * Tests whether applying a boss modifier leaves at least one reachable winning path.
   */
  public canApplyBossModifier(
    graph: SolutionGraph,
    state: CombatEngineState,
    modifier: BossModifier
  ): boolean {
    // Clone state to simulate modifier application
    const clonedState: CombatEngineState = {
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

    if (modifier.type === 'hide_card') {
      if (modifier.targetCardId) {
        clonedState.hiddenCards!.push(modifier.targetCardId);
        clonedState.player.hiddenCards!.push(modifier.targetCardId);
      }
      if (modifier.targetOperation) {
        clonedState.hiddenCards!.push(modifier.targetOperation);
        clonedState.player.hiddenCards!.push(modifier.targetOperation);
      }
    } else if (modifier.type === 'increase_cost') {
      const inc = modifier.costIncrease || 1;
      if (modifier.targetCardId) {
        clonedState.costModifiers![modifier.targetCardId] = (clonedState.costModifiers![modifier.targetCardId] || 0) + inc;
      }
      if (modifier.targetOperation) {
        clonedState.costModifiers![modifier.targetOperation] = (clonedState.costModifiers![modifier.targetOperation] || 0) + inc;
      }
    } else if (modifier.type === 'disable_optional') {
      if (modifier.targetCardId) {
        clonedState.hiddenCards!.push(modifier.targetCardId);
      }
    } else if (
      modifier.type === 'guardian_phase' ||
      modifier.type === 'fractured_state' ||
      modifier.type === 'distortion' ||
      modifier.type === 'countersign'
    ) {
      // Defensive/presentation effects do not restrict card plays
      return true;
    }

    const report = this.validateSolvability(graph, clonedState);
    return report.solvable && report.reachableWinningPaths >= 1;
  }

  /**
   * Safely applies boss interference; if unsafe, selects a safe replacement modifier
   * or rejects it to guarantee at least one reachable winning path.
   */
  public applySafeBossModifier(
    graph: SolutionGraph,
    state: CombatEngineState,
    modifier: BossModifier,
    seed?: number
  ): { state: CombatEngineState; applied: boolean; replacement?: BossModifier } {
    if (!state.hiddenCards) state.hiddenCards = [];
    if (!state.costModifiers) state.costModifiers = {};
    if (!state.player.hiddenCards) state.player.hiddenCards = [];
    if (!state.player.costModifiers) state.player.costModifiers = {};

    // 1. If safe, apply directly!
    if (this.canApplyBossModifier(graph, state, modifier)) {
      if (modifier.type === 'hide_card') {
        if (modifier.targetCardId) {
          state.hiddenCards.push(modifier.targetCardId);
          state.player.hiddenCards.push(modifier.targetCardId);
        }
        if (modifier.targetOperation) {
          state.hiddenCards.push(modifier.targetOperation);
          state.player.hiddenCards.push(modifier.targetOperation);
        }
      } else if (modifier.type === 'increase_cost') {
        const inc = modifier.costIncrease || 1;
        if (modifier.targetCardId) {
          state.costModifiers[modifier.targetCardId] = (state.costModifiers[modifier.targetCardId] || 0) + inc;
        }
        if (modifier.targetOperation) {
          state.costModifiers[modifier.targetOperation] = (state.costModifiers[modifier.targetOperation] || 0) + inc;
        }
      } else if (modifier.type === 'guardian_phase') {
        state.enemy.isGuardianBarrierActive = true;
      } else if (modifier.type === 'fractured_state') {
        state.enemy.fracturedStateActive = true;
      } else if (modifier.type === 'distortion') {
        // Shuffle non-critical cards in hand to simulate battlefield distortion
        if (state.player.hand.length >= 2) {
          const last = state.player.hand.pop()!;
          state.player.hand.splice(1, 0, last);
        }
      } else if (modifier.type === 'countersign') {
        state.enemy.shield += 15;
      }
      return { state, applied: true };
    }

    // 2. Unsafe modifier! Select a safe alternative modifier (priority 1: pick safe non-critical card to hide)
    const nonCriticalCards = state.player.hand.filter(c => {
      // Test if hiding this specific card is safe
      const testMod: BossModifier = {
        id: `safe_hide_${c.id}`,
        name: 'Shadow Shroud',
        type: 'hide_card',
        targetCardId: c.id,
        description: 'Shrouded an optional card.',
      };
      return this.canApplyBossModifier(graph, state, testMod);
    });

    if (nonCriticalCards.length > 0) {
      const chosen = nonCriticalCards[0];
      state.hiddenCards.push(chosen.id);
      state.player.hiddenCards.push(chosen.id);
      const replacement: BossModifier = {
        id: `replacement_hide_${chosen.id}`,
        name: 'Shrouded Mist',
        type: 'hide_card',
        targetCardId: chosen.id,
        description: `Shrouded ${chosen.name} in dark fog.`,
      };
      return { state, applied: true, replacement };
    }

    // Priority 2: Safe minor cost increase on a non-critical card
    for (const card of state.player.hand) {
      const testCostMod: BossModifier = {
        id: `safe_cost_${card.id}`,
        name: 'Weight of Aether',
        type: 'increase_cost',
        targetCardId: card.id,
        costIncrease: 1,
        description: `Increased cost of ${card.name} by 1.`,
      };
      if (this.canApplyBossModifier(graph, state, testCostMod)) {
        state.costModifiers[card.id] = (state.costModifiers[card.id] || 0) + 1;
        return { state, applied: true, replacement: testCostMod };
      }
    }

    // Priority 3: Fallback to a neutral enemy stat buff (e.g. +15 shield) rather than breaking the puzzle
    state.enemy.shield += 15;
    const statBuff: BossModifier = {
      id: 'boss_aegis_ward',
      name: 'Aegis Ward',
      type: 'extra_step',
      description: 'The Archon raised a defensive barrier of 15 shield.',
    };
    return { state, applied: true, replacement: statBuff };
  }

  /**
   * Internal fairness harness: checks solvability and silently repairs state if ever rendered impossible.
   */
  public repairUnsolvableState(
    graph: SolutionGraph,
    state: CombatEngineState
  ): { state: CombatEngineState; repaired: boolean; actionTaken?: string } {
    const report = this.validateSolvability(graph, state);
    if (report.solvable) {
      return { state, repaired: false };
    }

    // 1. If any card in hiddenCards is blocking solvability, unhide it!
    if (state.hiddenCards && state.hiddenCards.length > 0) {
      state.hiddenCards.pop();
      if (state.player.hiddenCards && state.player.hiddenCards.length > 0) {
        state.player.hiddenCards.pop();
      }
      const newReport = this.validateSolvability(graph, state);
      if (newReport.solvable) {
        return { state, repaired: true, actionTaken: 'unhide_card' };
      }
    }

    // 2. If cost modifiers are blocking affordability, reduce or reset them!
    if (state.costModifiers && Object.keys(state.costModifiers).length > 0) {
      state.costModifiers = {};
      if (state.player.costModifiers) {
        state.player.costModifiers = {};
      }
      const newReport = this.validateSolvability(graph, state);
      if (newReport.solvable) {
        return { state, repaired: true, actionTaken: 'reset_cost_modifiers' };
      }
    }

    // 3. Only repair when a required operation is genuinely lost or destroyed from ALL legitimate player zones:
    // (hand, drawPile, and discardPile).
    // NEVER synthesize or inject a card into the active hand! Cards are placed into drawPile so normal deck cycling determines availability.
    let synthesizedAny = false;
    for (let step = state.currentStepIndex; step < graph.primaryPath.operations.length; step++) {
      const neededOp = graph.primaryPath.operations[step];
      const exists = state.player.hand.some(c => c.operationKey === neededOp) ||
                     state.player.drawPile.some(c => c.operationKey === neededOp) ||
                     state.player.discardPile.some(c => c.operationKey === neededOp);
      if (!exists) {
        state.player.drawPile.push({
          id: `repaired_draw_${neededOp.toLowerCase()}_${Date.now()}_${step}`,
          name: neededOp.replace(/_/g, ' '),
          cost: 1,
          subject: graph.subject,
          rarity: 'common',
          operationKey: neededOp,
          description: `Repaired foundational step for ${graph.subject}`,
          effectText: `Execute ${neededOp} step. Deals 35 DMG & shields 10.`,
          damage: 35,
          shield: 10,
          iconName: 'Sparkles',
        });
        synthesizedAny = true;
      }
    }

    if (synthesizedAny) {
      return { state, repaired: true, actionTaken: 'synthesize_missing_cards_to_draw_pile' };
    }

    return { state, repaired: false };
  }

  /**
   * Handles player mistake recovery:
   * Recalculates legal states, identifies remaining valid paths or recovery transitions,
   * while keeping the correct answer STRICTLY UNCHANGED.
   */
  public handleMistakeRecovery(
    graph: SolutionGraph,
    state: CombatEngineState,
    playedOperation: string
  ): { recoveryAvailable: boolean; nextPathId?: string; explanation?: string } {
    const currentState = state.currentEquationState;

    // Check if an explicit recovery transition exists for this mistake
    const stateRecoveries = graph.recoveryTransitions[currentState];
    if (stateRecoveries && stateRecoveries[playedOperation]) {
      const rec = stateRecoveries[playedOperation];
      return {
        recoveryAvailable: true,
        nextPathId: graph.primaryPath.id,
        explanation: rec.explanation,
      };
    }

    // Check if any alternative path in graph is still valid and reachable from here
    const report = this.validateSolvability(graph, state);
    if (report.solvable && report.reachableWinningPaths > 0) {
      return {
        recoveryAvailable: true,
        nextPathId: report.activePathId,
        explanation: 'The current route branched. Re-examine the constraints and proceed through an alternative proof.',
      };
    }

    return {
      recoveryAvailable: false,
      explanation: 'No viable branch remains from this step. Seek assistance or reset.',
    };
  }

  /**
   * Validates whether a played card is a valid transition on either primary,
   * alternative, or recovery paths.
   */
  public evaluateCardTransition(
    graph: SolutionGraph,
    currentState: string,
    currentStepIndex: number,
    operationKey: string,
    activePathId?: string
  ): {
    isValid: boolean;
    pathId: string;
    nextState: string;
    transformation: StepTransformation;
    isAlternative: boolean;
  } | null {
    // 1. Check currently active path first
    const activePath = graph.allPaths.find(p => p.id === activePathId) || graph.primaryPath;
    if (currentStepIndex < activePath.operations.length && activePath.operations[currentStepIndex] === operationKey) {
      const trans = activePath.transformations[currentStepIndex];
      const nextState = activePath.states[currentStepIndex + 1] || activePath.completionCondition;
      return {
        isValid: true,
        pathId: activePath.id,
        nextState,
        transformation: trans,
        isAlternative: activePath.id !== graph.primaryPath.id,
      };
    }

    // 2. Check any other path in SolutionGraph (alternative path match!)
    for (const altPath of graph.allPaths) {
      if (altPath.id === activePath.id) continue;
      // Check if this alternative path allows this operation from step index
      if (currentStepIndex < altPath.operations.length && altPath.operations[currentStepIndex] === operationKey) {
        const trans = altPath.transformations[currentStepIndex];
        const nextState = altPath.states[currentStepIndex + 1] || altPath.completionCondition;
        return {
          isValid: true,
          pathId: altPath.id,
          nextState,
          transformation: trans,
          isAlternative: true,
        };
      }
    }

    // 3. Check transitions map by state
    const stateTrans = graph.validTransitions[currentState];
    if (stateTrans && stateTrans[operationKey]) {
      const match = stateTrans[operationKey];
      return {
        isValid: true,
        pathId: match.pathId,
        nextState: match.nextState,
        transformation: match.transformation,
        isAlternative: match.pathId !== graph.primaryPath.id,
      };
    }

    return null;
  }
}

export const solutionPathEngine = SolutionPathEngine.getInstance();
