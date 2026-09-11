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
import { bossAbilityEngine } from './BossAbilityEngine';
import { learningDNAEngine } from './LearningDNAEngine';
import { getDefaultEchoVaultForSubject } from '../curriculum/registry';

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
  isJudgeDemo?: boolean;
}

export class CombatEngine {
  private state: CombatEngineState;
  private encounter: EncounterDefinition;
  private solutionGraph: SolutionGraph;
  private activePathId: string;

  constructor(
    encounter: EncounterDefinition,
    activeDanger?: DangerEventDefinition,
    isJudgeDemo?: boolean
  ) {
    this.encounter = encounter;
    telemetry.reset();

    // 1. Generate & Lock Solution Graph
    this.solutionGraph = solutionPathEngine.generateSolutionGraph(encounter);

    // ANTI-EXPLOIT HAND FAIR SHUFFLE WITH GUARANTEED FIRST-ACTION SOLVABILITY
    const cardPool = [...encounter.validCards];

    // Ensure all misconception trigger cards exist in card pool if available
    if (encounter.misconceptions && encounter.misconceptions.length > 0) {
      for (const misc of encounter.misconceptions) {
        if (!cardPool.some(c => c.operationKey === misc.triggerOperation)) {
          const distractorCard: Card = {
            id: `distractor_${misc.triggerOperation.toLowerCase()}_${Date.now()}`,
            name: misc.triggerOperation.replace(/_/g, ' '),
            cost: 1,
            subject: encounter.subject,
            rarity: 'common',
            operationKey: misc.triggerOperation,
            description: `Alternative conceptual operation for ${encounter.subject}`,
            effectText: `Execute ${misc.triggerOperation}.`,
            damage: 25,
            shield: 5,
            iconName: 'Sparkles',
          };
          cardPool.push(distractorCard);
        }
      }
    }

    // Identify first required card for the starting hand (guaranteed first-action solvability)
    const primaryOps = encounter.optimalSequence;
    const poolRemaining = [...cardPool];
    const initialHandPool: Card[] = [];

    const firstOp = primaryOps[0];
    const firstIdx = poolRemaining.findIndex(c => c.operationKey === firstOp);
    if (firstIdx !== -1) {
      initialHandPool.push(poolRemaining.splice(firstIdx, 1)[0]);
    }

    // Shuffle poolRemaining so remaining solution cards and distractors are randomized
    for (let i = poolRemaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [poolRemaining[i], poolRemaining[j]] = [poolRemaining[j], poolRemaining[i]];
    }

    // Fill up to 5 cards for starting hand from randomized pool
    while (initialHandPool.length < 5 && poolRemaining.length > 0) {
      initialHandPool.push(poolRemaining.shift()!);
    }

    // Fair Fisher-Yates shuffle of starting hand
    // This distributes the required first action randomly across slots 0..4 (never pinned to slot 0)
    for (let i = initialHandPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [initialHandPool[i], initialHandPool[j]] = [initialHandPool[j], initialHandPool[i]];
    }

    const startingHand = initialHandPool;
    const drawPile = poolRemaining;

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
      echoVaultId: getDefaultEchoVaultForSubject(encounter.subject, encounter.levelNumber).id,
      activeDanger,
      hiddenCards: [],
      costModifiers: {},
      isJudgeDemo: isJudgeDemo || (encounter as any).isJudgeDemo || false,
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

    // Record Telemetry with real slot index and verification identification
    const isVerificationCard =
      card.operationKey.startsWith('VERIFY_') ||
      card.operationKey.startsWith('CHECK_') ||
      card.name.toLowerCase().includes('verify');

    const actionItem = telemetry.recordAction(
      this.state.currentStepIndex,
      card.operationKey,
      card.name,
      isCorrect,
      expectedOp,
      isCorrect ? undefined : 'Misconception Deviation',
      cardIndex,
      isVerificationCard
    );

    // Remove from hand, add to discard
    this.state.lastCardPlayed = card;
    this.state.player.hand.splice(cardIndex, 1);
    this.state.player.discardPile.push(card);

    // Tactical Dispersion: Dynamic pressure shuffles remaining hand slots
    // and ensures the next solution card is dispersed away from slot 0
    if (this.state.player.hand.length > 1) {
      for (let i = this.state.player.hand.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.state.player.hand[i], this.state.player.hand[j]] = [this.state.player.hand[j], this.state.player.hand[i]];
      }
      // Tactical counter: Disperse next solution card away from slot 0 to thwart blind macro spamming
      const nextStepIndex = this.state.currentStepIndex + (isCorrect ? 1 : 0);
      const nextOp = this.solutionGraph.primaryPath.operations[nextStepIndex];
      if (nextOp && this.state.player.hand[0]?.operationKey === nextOp) {
        const otherSlot = 1 + Math.floor(Math.random() * (this.state.player.hand.length - 1));
        [this.state.player.hand[0], this.state.player.hand[otherSlot]] = [this.state.player.hand[otherSlot], this.state.player.hand[0]];
      }
    }

    // Record performance internally for danger tracking & update Learning DNA in real-time
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
      if (profile.learningDNA) {
        profile.learningDNA = learningDNAEngine.recordActionTelemetry(
          profile.learningDNA,
          actionItem,
          this.solutionGraph.primaryPath.operations.length
        );
      }
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

      // Apply damage to enemy (unless absorbed by Guardian Barrier)
      if (this.state.enemy.isGuardianBarrierActive) {
        this.state.enemy.isGuardianBarrierActive = false;
        this.addLog('enemy', `${this.state.enemy.name}'s Guardian Barrier absorbed the blow and shattered! Educational proof held firm!`, 'adapt');
      } else {
        this.damageEnemy(damage);
      }
      this.state.player.shield += shieldGained;

      // Update problem equation state
      this.state.currentEquationState = transition.nextState;

      const altTag = transition.isAlternative ? ' [Alternative Proof]' : '';
      this.addLog('player', `Played ${card.name}: ${stepTrans?.explanation || card.effectText}${altTag}`, 'card', damage);

      // Advance step index
      this.state.currentStepIndex += 1;

      // Escalate boss phase if HP crossed phase boundary
      const currentPhase = bossAbilityEngine.evaluatePhase(this.state.enemy.currentHp, this.state.enemy.maxHp);
      this.state.enemy.phase = currentPhase;

      // Evaluate boss CounterSign response in Phase 2+
      const countersign = bossAbilityEngine.evaluateCountersign(
        this.solutionGraph,
        this.state,
        this.encounter,
        card.operationKey,
        this.state.isJudgeDemo
      );
      if (countersign) {
        this.applyBossModifier(countersign);
      }

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
      const counterShield = (this.encounter.isBoss || this.encounter.pathType === 'hidden_trial') ? 25 : 15;
      this.state.enemy.shield += counterShield;

      // Unlock Secret Echo Dungeon Vault
      const resolvedVaultId = diagnosis.echoVaultId || getDefaultEchoVaultForSubject(this.encounter.subject, this.encounter.levelNumber).id;
      this.state.echoVaultAvailable = true;
      this.state.echoVaultId = resolvedVaultId;
      sounds.playPortalOpen();

      // Enemy Counter-Strike on mistake (scaled for high-stakes boss and hidden mastery trials)
      const recoilDamage = (this.encounter.pathType === 'hidden_trial' || this.encounter.isBoss) ? 30 : 12;
      this.damagePlayer(recoilDamage);
      this.addLog('enemy', `${this.state.enemy.name} reacted: Deployed ${diagnosis.adaptation.name}!`, 'adapt');

      if (this.state.player.currentHp <= 0) {
        this.state.player.currentHp = 0;
        this.state.combatStatus = 'DEFEAT';
        sounds.playDefeat();
        return this.state;
      }
    }

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

    // PHASE 2: Discard all remaining unplayed cards from hand into discardPile
    while (this.state.player.hand.length > 0) {
      this.state.player.discardPile.push(this.state.player.hand.pop()!);
    }

    // Draw a fresh hand of up to 5 cards from drawPile (rebuilding from discardPile when necessary)
    const TARGET_HAND_SIZE = 5;
    while (this.state.player.hand.length < TARGET_HAND_SIZE) {
      if (this.state.player.drawPile.length === 0) {
        if (this.state.player.discardPile.length === 0) break;
        // Reshuffle discardPile into drawPile
        const recycled = [...this.state.player.discardPile];
        for (let i = recycled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [recycled[i], recycled[j]] = [recycled[j], recycled[i]];
        }
        this.state.player.drawPile = recycled;
        this.state.player.discardPile = [];
      }
      const drawn = this.state.player.drawPile.pop();
      if (drawn) this.state.player.hand.push(drawn);
    }

    // If boss battle, evaluate intelligent fair interference via BossAbilityEngine
    const interference = bossAbilityEngine.evaluateTurnInterference(
      this.solutionGraph,
      this.state,
      this.encounter,
      this.state.isJudgeDemo
    );
    if (interference.phaseTransition) {
      this.state.enemy.phase = interference.phase;
    }
    for (const mod of interference.modifiers) {
      this.applyBossModifier(mod);
    }
    if (interference.bannerMessage) {
      this.addLog('enemy', interference.bannerMessage, 'adapt');
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
