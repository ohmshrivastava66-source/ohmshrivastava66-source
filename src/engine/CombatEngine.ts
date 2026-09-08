import { PlayerState, EnemyState, BattleActionLog, Card, BossModifier } from '../types/game';
import { EncounterDefinition } from '../types/curriculum';
import { telemetry } from './Telemetry';
import { DiagnosticEngine } from '../ai/DiagnosticEngine';
import { DiagnosisResult, DangerEventDefinition } from '../types/telemetry';
import { sounds } from '../audio/SoundEffects';
import { dangerEngine } from './DangerEngine';
import { StorageManager } from '../persistence/StorageManager';
import { questionSelectionEngine } from './QuestionSelectionEngine';
import { QuestionVariant } from '../curriculum/questionPools';
import { solutionPathEngine, SolutionGraph } from './SolutionPathEngine';

export interface CombatEngineState {
  player: PlayerState;
  enemy: EnemyState;
  currentStepIndex: number;
  currentEquationState: string;
  currentObjective?: string;
  encounterId?: string;
  challengeIndex?: number;
  turnNumber: number;
  combatStatus: 'PLAYER_TURN' | 'PROCESSING' | 'ENEMY_TURN' | 'VICTORY' | 'DEFEAT';
  logs: BattleActionLog[];
  activeDiagnosis: DiagnosisResult | null;
  showAdaptationModal: boolean;
  echoVaultAvailable: boolean;
  echoVaultId?: string;
  activeDanger?: DangerEventDefinition;
  lastCardPlayed?: Card;
  hiddenCards?: string[];
  costModifiers?: Record<string, number>;
}

export class CombatEngine {
  private state: CombatEngineState;
  private encounter: EncounterDefinition;
  private solutionGraph: SolutionGraph;
  private activePathId: string;

  constructor(encounter: EncounterDefinition, activeDanger?: DangerEventDefinition) {
    this.encounter = encounter;
    telemetry.reset();

    // 1. Generate & Lock Solution Graph
    this.solutionGraph = solutionPathEngine.generateSolutionGraph(encounter);

    const initialCards = [...encounter.validCards];
    // Ensure the expected first operation card is present in opening hand
    const firstExpectedOp = encounter.optimalSequence[0];
    const neededIdx = initialCards.findIndex(c => c.operationKey === firstExpectedOp);
    if (neededIdx > 4) {
      const [neededCard] = initialCards.splice(neededIdx, 1);
      initialCards.unshift(neededCard);
    }
    const startingHand = initialCards.slice(0, 5);
    const drawPile = initialCards.slice(5);

    // Calculate starting enemy shield including any active danger anomaly
    let initialEnemyShield = 0;
    if (activeDanger?.modifierEffect?.type === 'shield') {
      initialEnemyShield += activeDanger.modifierEffect.value;
    }

    const initialLogs: BattleActionLog[] = [
      {
        id: `log_init_${Date.now()}`,
        turn: 1,
        sender: 'system',
        message: `Encounter commenced: ${encounter.problemStatement}`,
        type: 'card',
        timestamp: Date.now(),
      },
    ];

    if (activeDanger) {
      initialLogs.unshift({
        id: `log_danger_${Date.now()}`,
        turn: 1,
        sender: 'system',
        message: `⚠️ ${activeDanger.hazardName}: ${activeDanger.flavorWarning}`,
        type: 'adapt',
        timestamp: Date.now(),
      });
    }

    this.state = {
      player: {
        name: 'Knowledge Hunter',
        maxHp: 100,
        currentHp: 100,
        maxEnergy: 3,
        currentEnergy: 3,
        shield: 0,
        hand: startingHand,
        drawPile: drawPile,
        discardPile: [],
        statusEffects: [],
        relics: ['Focus Rune'],
        hiddenCards: [],
        costModifiers: {},
      },
      enemy: {
        id: encounter.enemy.name.toLowerCase().replace(/\s+/g, '_'),
        name: encounter.enemy.name,
        title: encounter.enemy.title,
        maxHp: encounter.enemy.hp,
        currentHp: encounter.enemy.hp,
        shield: initialEnemyShield,
        attackPower: encounter.enemy.attack,
        subject: encounter.subject,
        visualType: encounter.enemy.visualType,
        intent: {
          type: 'attack',
          value: encounter.enemy.attack,
          description: `Strikes with ${encounter.enemy.attack} chaos damage next turn`,
        },
        statusEffects: [],
        phase: 1,
        maxPhases: encounter.isBoss ? 3 : 1,
      },
      currentStepIndex: 0,
      currentEquationState: encounter.initialEquationOrState,
      currentObjective: encounter.objective || encounter.problemStatement,
      encounterId: encounter.id,
      challengeIndex: 0,
      turnNumber: 1,
      combatStatus: 'PLAYER_TURN',
      logs: initialLogs,
      activeDiagnosis: null,
      showAdaptationModal: false,
      echoVaultAvailable: false,
      activeDanger,
      hiddenCards: [],
      costModifiers: {},
    };
    this.activePathId = this.solutionGraph.primaryPath.id;

    // 2. Guarantee Starting Hand Solvability
    this.state = solutionPathEngine.ensureStartingHandSolvability(this.solutionGraph, this.state);
  }

  public getState(): CombatEngineState {
    return { ...this.state };
  }

  public getSolutionGraph(): SolutionGraph {
    return this.solutionGraph;
  }

  public getEncounter(): EncounterDefinition {
    return this.encounter;
  }

  public playCard(cardId: string): CombatEngineState {
    if (this.state.combatStatus !== 'PLAYER_TURN') return this.state;
    if (this.state.player.currentHp <= 0 || this.state.enemy.currentHp <= 0) return this.state;

    const cardIndex = this.state.player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return this.state;
    const card = this.state.player.hand[cardIndex];

    // Check if card is hidden by boss interference
    const hiddenCards = this.state.hiddenCards || this.state.player.hiddenCards || [];
    if (hiddenCards.includes(card.id) || hiddenCards.includes(card.operationKey)) {
      this.addLog('system', `${card.name} is shrouded in dark mist and cannot be played!`, 'error');
      return this.state;
    }

    // Compute effective energy cost (including boss costModifiers, enemy adaptations, or danger effects)
    const costMods = this.state.costModifiers || this.state.player.costModifiers || {};
    let effectiveCost = card.cost + (costMods[card.id] || costMods[card.operationKey] || 0);

    if (
      this.state.enemy.adaptedModifier?.penaltyCost &&
      this.state.enemy.adaptedModifier.trappedOperation === card.operationKey
    ) {
      effectiveCost += this.state.enemy.adaptedModifier.penaltyCost;
    }
    if (this.state.activeDanger?.modifierEffect?.type === 'cost_penalty') {
      effectiveCost += this.state.activeDanger.modifierEffect.value;
    }

    if (this.state.player.currentEnergy < effectiveCost) {
      this.addLog('system', `Insufficient Energy: Card requires ${effectiveCost} Energy`, 'error');
      return this.state;
    }

    // Deduct energy & play SFX
    this.state.player.currentEnergy -= effectiveCost;
    sounds.playCardCast();

    // Evaluate transition using SolutionPathEngine across primary and alternative routes
    const transition = solutionPathEngine.evaluateCardTransition(
      this.solutionGraph,
      this.state.currentEquationState,
      this.state.currentStepIndex,
      card.operationKey,
      this.activePathId
    );

    const isCorrect = !!transition?.isValid;
    const expectedOp = this.encounter.optimalSequence[this.state.currentStepIndex] || card.operationKey;

    // Record Telemetry
    const actionItem = telemetry.recordAction(
      this.state.currentStepIndex,
      card.operationKey,
      card.name,
      isCorrect,
      expectedOp,
      isCorrect ? undefined : 'Misconception Deviation'
    );

    // Remove from hand, add to discard
    this.state.lastCardPlayed = card;
    this.state.player.hand.splice(cardIndex, 1);
    this.state.player.discardPile.push(card);

    // Record performance internally for danger tracking
    const conceptKey = this.encounter.conceptName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    try {
      const profile = StorageManager.loadProfile();
      dangerEngine.recordPerformance(
        profile,
        conceptKey,
        this.encounter.subject,
        this.encounter.conceptName,
        isCorrect ? 'success' : 'mistake'
      );
      StorageManager.saveProfile(profile);
    } catch {
      // In-memory safety
    }

    if (isCorrect && transition) {
      // SUCCESSFUL STEP RESOLUTION (Primary or Legitimate Alternative Path)
      this.activePathId = transition.pathId;
      const stepTrans = transition.transformation;
      const damage = Math.max(card.damage, stepTrans?.damageValue || 30);
      const shieldGained = card.shield || 10;

      // Apply damage to enemy
      this.damageEnemy(damage);
      this.state.player.shield += shieldGained;

      // Update problem equation state
      this.state.currentEquationState = transition.nextState;

      const altTag = transition.isAlternative ? ' [Alternative Proof]' : '';
      this.addLog('player', `Played ${card.name}: ${stepTrans?.explanation || card.effectText}${altTag}`, 'card', damage);

      // Advance step index
      this.state.currentStepIndex += 1;

      // Check if all steps complete on current active path or enemy destroyed
      const currentActivePath = this.solutionGraph.allPaths.find(p => p.id === this.activePathId) || this.solutionGraph.primaryPath;
      if (
        this.state.currentStepIndex >= currentActivePath.operations.length ||
        this.state.enemy.currentHp <= 0
      ) {
        this.state.enemy.currentHp = 0;
        this.state.combatStatus = 'VICTORY';
        sounds.playVictoryFanfare();
        this.addLog('system', `VICTORY! ${this.encounter.conceptName} mastered.`, 'damage');
        return this.state;
      }
    } else {
      // MISCONCEPTION / MISTAKE DETECTED
      sounds.playMistakeDetected();
      this.addLog('player', `Played ${card.name} — Sub-optimal operation for state: ${this.state.currentEquationState}`, 'error');

      // Run Cognitive Diagnostic Engine
      const diagnosis = DiagnosticEngine.diagnoseAction(
        this.encounter,
        this.state.currentStepIndex,
        card.operationKey,
        actionItem
      );

      this.state.activeDiagnosis = diagnosis;
      this.state.showAdaptationModal = true;
      sounds.playAdaptationAlert();

      // Invoke SolutionPathEngine Branching Recovery (Target Answer REMAINS INVARIANT)
      const recovery = solutionPathEngine.handleMistakeRecovery(
        this.solutionGraph,
        this.state,
        card.operationKey
      );

      if (recovery.recoveryAvailable && recovery.nextPathId) {
        this.activePathId = recovery.nextPathId;
        this.addLog('system', `Tactical route shifted: ${recovery.explanation}`, 'adapt');
      }

      // Mutate Enemy with Adaptive Counter-Shield
      this.state.enemy.adaptedModifier = diagnosis.adaptation;
      if (diagnosis.adaptation.penaltyCost) {
        this.state.enemy.shield += 15;
      }

      // Unlock Secret Echo Dungeon Vault
      if (diagnosis.echoVaultId) {
        this.state.echoVaultAvailable = true;
        this.state.echoVaultId = diagnosis.echoVaultId;
        sounds.playPortalOpen();
      }

      // Enemy Counter-Strike on mistake
      const recoilDamage = 12;
      this.damagePlayer(recoilDamage);
      this.addLog('enemy', `${this.state.enemy.name} reacted: Deployed ${diagnosis.adaptation.name}!`, 'adapt');

      if (this.state.player.currentHp <= 0) {
        this.state.player.currentHp = 0;
        this.state.combatStatus = 'DEFEAT';
        sounds.playDefeat();
        return this.state;
      }
    }

    // In-combat Solvability Guarantee Harness:
    // Ensure state remains solvable from the current hand/draw state!
    solutionPathEngine.repairUnsolvableState(this.solutionGraph, this.state);

    return this.state;
  }

  public applyBossModifier(modifier: BossModifier): { applied: boolean; replacement?: BossModifier } {
    const result = solutionPathEngine.applySafeBossModifier(this.solutionGraph, this.state, modifier);
    this.state = result.state;
    if (result.replacement) {
      this.addLog('enemy', `${this.state.enemy.name} modified tactics: ${result.replacement.description}`, 'adapt');
    } else {
      this.addLog('enemy', `${this.state.enemy.name} invoked: ${modifier.description}`, 'adapt');
    }
    return { applied: result.applied, replacement: result.replacement };
  }

  public endTurn(): CombatEngineState {
    if (this.state.combatStatus !== 'PLAYER_TURN') return this.state;
    this.state.combatStatus = 'ENEMY_TURN';

    // Enemy attacks
    const attack = this.state.enemy.attackPower;
    this.damagePlayer(attack);
    this.addLog('enemy', `${this.state.enemy.name} attacked for ${attack} damage.`, 'damage', attack);

    if (this.state.player.currentHp <= 0) {
      this.state.player.currentHp = 0;
      this.state.combatStatus = 'DEFEAT';
      sounds.playDefeat();
      return this.state;
    }

    // Advance turn
    this.state.turnNumber += 1;
    this.state.player.currentEnergy = this.state.player.maxEnergy;
    this.state.player.shield = Math.floor(this.state.player.shield * 0.5); // retain 50% shield

    // Draw cards up to 5
    while (this.state.player.hand.length < 5) {
      if (this.state.player.drawPile.length === 0) {
        if (this.state.player.discardPile.length === 0) break;
        this.state.player.drawPile = [...this.state.player.discardPile];
        this.state.player.discardPile = [];
      }
      const drawn = this.state.player.drawPile.pop();
      if (drawn) this.state.player.hand.push(drawn);
    }

    // If boss battle, boss may attempt safe interference
    if (this.encounter.isBoss && this.state.turnNumber % 2 === 0 && this.state.player.hand.length > 0) {
      const candidate = this.state.player.hand[this.state.player.hand.length - 1];
      const bossMod: BossModifier = {
        id: `boss_turn_${this.state.turnNumber}_mod`,
        name: 'Shadow Shroud',
        type: 'hide_card',
        targetCardId: candidate.id,
        description: `Shrouded ${candidate.name} in mist.`,
      };
      this.applyBossModifier(bossMod);
    }

    // Guarantee that the new turn state is 100% solvable
    solutionPathEngine.repairUnsolvableState(this.solutionGraph, this.state);

    this.state.combatStatus = 'PLAYER_TURN';
    return this.state;
  }

  public closeAdaptationModal() {
    this.state.showAdaptationModal = false;
  }

  public resetEncounter(): CombatEngineState {
    const nextEncounter = questionSelectionEngine.getEncounterWithSelectedQuestion(this.encounter);
    this.encounter = nextEncounter;
    const fresh = new CombatEngine(this.encounter, this.state.activeDanger);
    this.state = fresh.state;
    this.solutionGraph = fresh.solutionGraph;
    return this.state;
  }

  public advanceToQuestion(question: QuestionVariant): CombatEngineState {
    this.encounter.optimalSequence = [...question.optimalSequence];
    this.encounter.stepTransformations = question.stepTransformations.map(st => ({ ...st }));
    this.encounter.misconceptions = [...question.misconceptions];
    this.encounter.initialEquationOrState = question.initialEquationOrState;
    this.encounter.targetState = question.targetState;
    this.encounter.objective = question.objective;
    this.encounter.problemStatement = question.problemStatement;
    if (question.correctAnswer) {
      this.encounter.correctAnswer = question.correctAnswer;
    }
    if (question.alternativePaths) {
      this.encounter.alternativePaths = question.alternativePaths;
    }
    if (question.recoveryPaths) {
      this.encounter.recoveryPaths = question.recoveryPaths;
    }

    this.solutionGraph = solutionPathEngine.generateSolutionGraph(this.encounter);

    this.state.currentEquationState = question.initialEquationOrState;
    this.state.currentObjective = question.objective;
    this.state.currentStepIndex = 0;
    this.state.challengeIndex = (this.state.challengeIndex || 0) + 1;
    this.activePathId = this.solutionGraph.primaryPath.id;
    this.state.hiddenCards = [];
    this.state.costModifiers = {};

    this.state = solutionPathEngine.ensureStartingHandSolvability(this.solutionGraph, this.state);
    this.addLog('system', `Next challenge presented: ${question.objective}`, 'card');
    return this.state;
  }

  private damageEnemy(amount: number) {
    sounds.playMonsterHit();
    if (this.state.enemy.shield > 0) {
      if (this.state.enemy.shield >= amount) {
        this.state.enemy.shield -= amount;
        return;
      } else {
        const remaining = amount - this.state.enemy.shield;
        this.state.enemy.shield = 0;
        this.state.enemy.currentHp = Math.max(0, this.state.enemy.currentHp - remaining);
        return;
      }
    }
    this.state.enemy.currentHp = Math.max(0, this.state.enemy.currentHp - amount);
  }

  private damagePlayer(amount: number) {
    sounds.playPlayerHurt();
    if (this.state.player.shield > 0) {
      if (this.state.player.shield >= amount) {
        this.state.player.shield -= amount;
        return;
      } else {
        const remaining = amount - this.state.player.shield;
        this.state.player.shield = 0;
        this.state.player.currentHp = Math.max(0, this.state.player.currentHp - remaining);
        return;
      }
    }
    this.state.player.currentHp = Math.max(0, this.state.player.currentHp - amount);
  }

  private addLog(
    sender: 'player' | 'enemy' | 'system',
    message: string,
    type: 'card' | 'damage' | 'shield' | 'error' | 'adapt' | 'heal',
    value?: number
  ) {
    this.state.logs.unshift({
      id: `log_${Date.now()}_${Math.random()}`,
      turn: this.state.turnNumber,
      sender,
      message,
      type,
      value,
      timestamp: Date.now(),
    });
    if (this.state.logs.length > 25) this.state.logs.pop();
  }
}
