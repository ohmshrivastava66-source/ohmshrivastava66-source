import React, { useState, useEffect, useCallback } from 'react';
import { EncounterDefinition } from '../types/curriculum';
import { Card } from '../types/game';
import { CombatEngine, CombatEngineState } from '../engine/CombatEngine';
import { CharacterActionState } from '../components/CharacterRenderer';
import { CharacterStage } from '../components/CharacterStage';
import { BattlefieldEnvironment } from '../components/BattlefieldEnvironment';
import { CombatVFX, FloatingTextEvent } from '../components/CombatVFX';
import { BossIntroCinematic } from '../components/BossIntroCinematic';
import { CardComponent } from '../components/CardComponent';
import { HealthBar, EnergyOrbs } from '../components/HealthEnergyBar';
import { TelemetryPanel } from '../components/TelemetryPanel';
import { AdaptationModal } from '../components/AdaptationModal';
import { telemetry } from '../engine/Telemetry';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { RotateCcw, Swords, Sparkles, AlertCircle, DoorOpen, Shield } from 'lucide-react';
import { DangerEventDefinition } from '../types/telemetry';
import { sounds } from '../audio/SoundEffects';
import { ALL_SUBJECTS } from '../curriculum/registry';

interface BattleScreenProps {
  encounter: EncounterDefinition;
  activeDanger?: DangerEventDefinition;
  onVictory: (encounter: EncounterDefinition, turnsUsed: number) => void;
  onDefeat: (
    encounter: EncounterDefinition,
    weaknessName?: string,
    failedStepIndex?: number,
    lastAttemptedOp?: string
  ) => void;
  onEnterEchoVault: (vaultId: string) => void;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({
  encounter,
  activeDanger,
  onVictory,
  onDefeat,
  onEnterEchoVault,
}) => {
  const [engine, setEngine] = useState(() => new CombatEngine(encounter, activeDanger));
  const [gameState, setGameState] = useState<CombatEngineState>(() => engine.getState());
  const [characterPose, setCharacterPose] = useState<CharacterActionState>('idle');
  const [monsterHurt, setMonsterHurt] = useState(false);
  const [monsterAttacking, setMonsterAttacking] = useState(false);

  // VFX States
  const [floatingEvents, setFloatingEvents] = useState<FloatingTextEvent[]>([]);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [isCastingProjectile, setIsCastingProjectile] = useState(false);

  // Boss Intro Cinematic Gate
  const isBossFight =
    encounter.isBoss ||
    encounter.levelNumber === 5 ||
    (encounter.enemy.title &&
      (encounter.enemy.title.toLowerCase().includes('archon') ||
        encounter.enemy.title.toLowerCase().includes('sovereign') ||
        encounter.enemy.title.toLowerCase().includes('guardian')));
  const [showBossIntro, setShowBossIntro] = useState(() => !!isBossFight);

  const subjectMeta = ALL_SUBJECTS[encounter.subject];

  // Helper to push floating combat text
  const addFloatingText = useCallback(
    (text: string, type: FloatingTextEvent['type'], x: number, y: number) => {
      const id = `${Date.now()}-${Math.random()}`;
      setFloatingEvents(prev => [...prev, { id, text, type, x, y }]);
      setTimeout(() => {
        setFloatingEvents(prev => prev.filter(e => e.id !== id));
      }, 950);
    },
    []
  );

  // Reactive synchronization: reinitialize engine when encounter changes
  useEffect(() => {
    const freshEngine = new CombatEngine(encounter, activeDanger);
    setEngine(freshEngine);
    setGameState(freshEngine.getState());
    setCharacterPose('idle');
    setMonsterHurt(false);
    setMonsterAttacking(false);
    setFloatingEvents([]);
    if (isBossFight) {
      setShowBossIntro(true);
    }
  }, [encounter.id, encounter.initialEquationOrState, activeDanger, isBossFight]);

  // Synchronize state changes & terminal transitions
  useEffect(() => {
    if (gameState.combatStatus === 'VICTORY') {
      setCharacterPose('victory');
      sounds.playVictory();
      const timer = setTimeout(() => {
        onVictory(encounter, gameState.turnNumber);
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (gameState.combatStatus === 'DEFEAT') {
      setCharacterPose('hurt');
      sounds.playDefeat();
      const timer = setTimeout(() => {
        onDefeat(
          encounter,
          gameState.activeDiagnosis?.concept || 'Procedural Error',
          gameState.currentStepIndex,
          gameState.lastCardPlayed?.operationKey
        );
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [
    gameState.combatStatus,
    encounter,
    gameState.turnNumber,
    gameState.activeDiagnosis,
    gameState.currentStepIndex,
    gameState.lastCardPlayed,
    onVictory,
    onDefeat,
  ]);

  // Play a card
  const handlePlayCard = (card: Card) => {
    if (gameState.combatStatus !== 'PLAYER_TURN') return;

    // Trigger visual cast animation & projectile
    setCharacterPose('cast');
    setIsCastingProjectile(true);
    setTimeout(() => setIsCastingProjectile(false), 350);

    setTimeout(() => {
      const nextState = engine.playCard(card.id);
      setGameState({ ...nextState });

      // Monster damage feedback
      const enemyHpDiff = gameState.enemy.currentHp - nextState.enemy.currentHp;
      if (enemyHpDiff > 0) {
        setMonsterHurt(true);
        sounds.playAttack();
        addFloatingText(`-${enemyHpDiff}`, 'damage_enemy', 75, 42);
        setTimeout(() => setMonsterHurt(false), 450);
      }

      // Player shield feedback
      const playerShieldDiff = nextState.player.shield - gameState.player.shield;
      if (playerShieldDiff > 0) {
        sounds.playShield();
        addFloatingText(`+${playerShieldDiff} SHIELD`, 'shield', 25, 48);
      }

      // Player recoil damage (if any penalty or feedback)
      const playerHpDiff = gameState.player.currentHp - nextState.player.currentHp;
      if (playerHpDiff > 0) {
        setCharacterPose('hurt');
        sounds.playPlayerHurt();
        addFloatingText(`-${playerHpDiff}`, 'damage_player', 25, 42);
        setTimeout(() => setCharacterPose('idle'), 400);
      } else {
        setTimeout(() => setCharacterPose('idle'), 250);
      }
    }, 160);
  };

  // End Turn
  const handleEndTurn = () => {
    if (gameState.combatStatus !== 'PLAYER_TURN') return;
    sounds.playClick();

    // Trigger enemy attack visual
    setMonsterAttacking(true);
    setTimeout(() => {
      setMonsterAttacking(false);
      setCharacterPose('hurt');
      setIsScreenShaking(true);
      sounds.playEnemyAttack();

      const nextState = engine.endTurn();
      setGameState({ ...nextState });

      const playerHpDiff = gameState.player.currentHp - nextState.player.currentHp;
      if (playerHpDiff > 0) {
        addFloatingText(`-${playerHpDiff}`, 'damage_player', 25, 42);
      }

      setTimeout(() => {
        setIsScreenShaking(false);
        setCharacterPose('idle');
      }, 450);
    }, 280);
  };

  // Quick intentional demo trigger: plays the misconception card
  const handleSimulateMisconception = () => {
    if (gameState.combatStatus !== 'PLAYER_TURN') return;
    sounds.playClick();
    const misconceptionCard =
      gameState.player.hand.find(
        c => c.operationKey === 'EXPAND' || c.operationKey === 'SWAP'
      ) || gameState.player.hand[0];
    if (misconceptionCard) {
      handlePlayCard(misconceptionCard);
    }
  };

  // Anti-softlock reset
  const handleResetEncounter = () => {
    sounds.playClick();
    const fresh = engine.resetEncounter();
    setGameState({ ...fresh });
    setCharacterPose('idle');
    setMonsterHurt(false);
    setMonsterAttacking(false);
    setFloatingEvents([]);
  };

  const metrics = telemetry.getLiveMetrics();

  return (
    <div className="relative min-h-[calc(100dvh-54px)] flex flex-col justify-between p-2 sm:p-5 select-none overflow-hidden bg-slate-950">
      {/* 1. LAYER 1-5: 6-LAYER REALM ENVIRONMENT */}
      <BattlefieldEnvironment subject={encounter.subject}>
        <ParticleCanvas color={subjectMeta?.themeColor || '#0ea5e9'} count={28} />
      </BattlefieldEnvironment>

      {/* 2. COMBAT VFX LAYER (Projectiles, Floaters, Shake) */}
      <CombatVFX
        floatingEvents={floatingEvents}
        isScreenShaking={isScreenShaking}
        isCastingProjectile={isCastingProjectile}
      />

      {/* 3. OPTIONAL BOSS INTRO CINEMATIC */}
      {showBossIntro && (
        <BossIntroCinematic
          bossName={encounter.enemy.name}
          bossTitle={encounter.enemy.title}
          flavorQuote={encounter.enemy.flavorQuote}
          realmName={subjectMeta?.realmName || 'The Fractured Realm'}
          themeColor={subjectMeta?.themeColor}
          onComplete={() => setShowBossIntro(false)}
        />
      )}

      {/* 4. TOP COMBAT HUD */}
      <header className="z-10 w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 glass-panel p-2.5 sm:p-3.5 rounded-2xl border border-slate-800/90 shadow-2xl backdrop-blur-md">
        {/* Player Status */}
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-950 to-slate-900 border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-cinzel font-bold text-sm shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            H
          </div>
          <div className="flex flex-col">
            <span className="font-cinzel font-bold text-xs text-cyan-200">
              {gameState.player.name}
            </span>
            <HealthBar
              currentHp={gameState.player.currentHp}
              maxHp={gameState.player.maxHp}
              shield={gameState.player.shield}
              label="HP"
            />
          </div>
          <EnergyOrbs
            currentEnergy={gameState.player.currentEnergy}
            maxEnergy={gameState.player.maxEnergy}
          />
        </div>

        {/* Center Indicators: Turn Counter & Echo Portal */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono-code font-bold text-slate-300 bg-slate-900/90 px-3 py-0.5 rounded-full border border-slate-700/80 shadow-sm">
            TURN {gameState.turnNumber}
          </span>
          {gameState.echoVaultAvailable && (
            <button
              onClick={() => gameState.echoVaultId && onEnterEchoVault(gameState.echoVaultId)}
              className="btn-fantasy-void px-3 py-0.5 rounded-full text-[11px] font-cinzel font-bold text-white flex items-center gap-1.5 shadow-[0_0_18px_rgba(168,85,247,0.8)] animate-bounce min-h-[32px]"
            >
              <DoorOpen className="w-3.5 h-3.5" />
              Echo Vault Open!
            </button>
          )}
        </div>

        {/* Enemy Status */}
        <div className="flex items-center gap-3.5 w-full sm:w-auto justify-end">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5">
              {gameState.enemy.phase > 1 && (
                <span className="text-[9px] font-mono-code font-bold uppercase px-1.5 py-0.5 rounded bg-purple-950 border border-purple-500/80 text-purple-300">
                  PHASE {gameState.enemy.phase}
                </span>
              )}
              {gameState.enemy.isGuardianBarrierActive && (
                <span className="text-[9px] font-mono-code font-bold uppercase px-1.5 py-0.5 rounded bg-amber-950 border border-amber-400 text-amber-300 animate-pulse">
                  AEGIS
                </span>
              )}
              <span className="font-cinzel font-bold text-xs text-rose-300">
                {gameState.enemy.name}
              </span>
              <span className="text-[10px] font-mono-code text-slate-400">
                ({gameState.enemy.intent.description})
              </span>
            </div>
            <HealthBar
              currentHp={gameState.enemy.currentHp}
              maxHp={gameState.enemy.maxHp}
              shield={gameState.enemy.shield}
              label="ENEMY"
              isEnemy
            />
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-950 to-slate-900 border border-rose-500/50 flex items-center justify-center text-rose-300 font-cinzel font-bold text-sm shadow-[0_0_12px_rgba(244,63,94,0.3)]">
            ⚔
          </div>
        </div>
      </header>

      {/* Atmospheric Realm Hazard Banner (Natural Game Event) */}
      {gameState.activeDanger && (
        <div className="z-10 w-full max-w-6xl mx-auto mt-1.5 bg-gradient-to-r from-purple-950/90 via-slate-950/90 to-purple-950/90 border border-purple-500/50 rounded-xl px-4 py-1.5 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-[0_0_25px_rgba(168,85,247,0.35)] animate-fadeIn">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            <span className="font-cinzel font-bold text-xs text-purple-200 uppercase tracking-wider">
              {gameState.activeDanger.hazardName}
            </span>
            <span className="text-xs text-slate-300 italic hidden sm:inline">
              — {gameState.activeDanger.flavorWarning}
            </span>
          </div>
          <span className="text-[11px] font-mono-code text-purple-300 bg-purple-900/60 px-2.5 py-0.5 rounded border border-purple-500/30 whitespace-nowrap">
            {gameState.activeDanger.modifierEffect.description}
          </span>
        </div>
      )}

      {/* 5. CENTER ARENA: CINEMATIC 2.5D CHARACTER STAGE */}
      <main className="relative flex-1 flex flex-col justify-center w-full max-w-6xl mx-auto my-auto z-10">
        <CharacterStage
          playerPose={characterPose}
          playerShield={gameState.player.shield}
          monsterVisualType={gameState.enemy.visualType}
          monsterName={gameState.enemy.name}
          monsterFlavorQuote={encounter.enemy.flavorQuote}
          monsterHurt={monsterHurt}
          monsterAttacking={monsterAttacking}
          monsterAdapted={!!gameState.enemy.adaptedModifier}
          monsterAdaptedLabel={gameState.enemy.adaptedModifier?.name}
          monsterPhase={gameState.enemy.phase}
          isGuardianBarrierActive={gameState.enemy.isGuardianBarrierActive}
          subject={encounter.subject}
        >
          {/* THE ARCANE QUESTION & OBJECTIVE PANEL (Embedded Centrally) */}
          <section
            className={`w-full p-4 rounded-3xl border shadow-2xl flex flex-col gap-2.5 backdrop-blur-lg transition-all duration-300 ${
              gameState.enemy.fracturedStateActive
                ? 'glass-panel border-purple-500/80 shadow-[0_0_30px_rgba(168,85,247,0.4)]'
                : 'glass-panel-glow border-cyan-500/50'
            }`}
            aria-label="Academic Challenge"
          >
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono-code uppercase tracking-widest text-cyan-300 flex items-center gap-1 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  {encounter.conceptName}
                </span>
                {gameState.enemy.fracturedStateActive && (
                  <span className="text-[8px] font-mono-code font-bold uppercase px-1.5 py-0.2 rounded bg-purple-950/90 border border-purple-400 text-purple-300 animate-pulse">
                    FRACTURED
                  </span>
                )}
              </div>
              <span className="text-[9px] font-mono-code text-slate-400 uppercase tracking-wider">
                Step {gameState.currentStepIndex + 1} / {encounter.optimalSequence.length}
              </span>
            </div>

            {/* High-Contrast Equation / Problem State */}
            <div className="bg-slate-950/90 p-3 rounded-2xl border border-cyan-500/30 font-mono-code text-base sm:text-lg font-extrabold text-cyan-100 tracking-wide break-words shadow-inner text-center">
              {gameState.currentEquationState}
            </div>

            {/* Player-Facing Educational Objective (No Answer Leaks) */}
            <div className="flex flex-col gap-0.5 text-center pt-1 border-t border-slate-800/80">
              <span className="text-[9px] font-mono-code uppercase tracking-wider text-slate-400 font-semibold">
                Objective
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
                {gameState.currentObjective || encounter.objective || encounter.problemStatement}
              </p>
            </div>

            {/* Quick Judge Demo Assist Button */}
            <button
              onClick={handleSimulateMisconception}
              className="mt-1 text-[10px] font-mono-code text-amber-300/90 hover:text-amber-100 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-500/40 px-2.5 py-1 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm min-h-[36px]"
              title="Triggers the intentional misconception to demonstrate real-time AI diagnosis"
              aria-label="Trigger intentional misconception demo"
            >
              <AlertCircle className="w-3 h-3 text-amber-400" />
              [Judge Assist: Trigger Misconception]
            </button>
          </section>
        </CharacterStage>
      </main>

      {/* 6. BOTTOM CONTROLS & PREMIUM TAROT CARDS TRAY */}
      <footer className="z-10 w-full max-w-6xl mx-auto flex flex-col gap-2.5 mt-auto pb-1">
        {/* Telemetry & Deck Action Bar */}
        <div className="flex items-center justify-between gap-3 px-1">
          {/* Deck & Discard Badges */}
          <div className="flex items-center gap-2 text-xs font-mono-code text-slate-400">
            <span className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-700/80 text-cyan-300 shadow-sm">
              Deck: {gameState.player.drawPile.length}
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-400 shadow-sm">
              Discard: {gameState.player.discardPile.length}
            </span>
          </div>

          <div className="hidden md:block max-w-sm flex-1 mx-2">
            <TelemetryPanel
              metrics={metrics}
              stepCurrent={gameState.currentStepIndex}
              stepTotal={encounter.optimalSequence.length}
              compact
            />
          </div>

          {/* End Turn & Softlock Safety Controls */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleResetEncounter}
              className="glass-panel p-2.5 rounded-xl text-slate-400 hover:text-white border border-slate-700/80 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shadow-md"
              title="Reset encounter (Anti-softlock safety)"
              aria-label="Reset encounter"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleEndTurn}
              disabled={gameState.combatStatus !== 'PLAYER_TURN'}
              className="btn-fantasy-primary px-6 py-2.5 rounded-2xl font-cinzel font-bold text-white text-xs tracking-wider flex items-center gap-2 disabled:opacity-50 min-h-[44px] min-w-[44px] shadow-lg active:scale-95 transition-all"
              aria-label="End Turn"
            >
              <Swords className="w-4 h-4" />
              End Turn
            </button>
          </div>
        </div>

        {/* Hand of Cards Carousel */}
        <div className="w-full overflow-x-auto pb-1.5 pt-1 flex items-center justify-center gap-2.5 sm:gap-3.5">
          {gameState.player.hand.map(card => {
            const hiddenCards = gameState.hiddenCards || gameState.player.hiddenCards || [];
            const isHidden = hiddenCards.includes(card.id) || hiddenCards.includes(card.operationKey);
            const costMods = gameState.costModifiers || gameState.player.costModifiers || {};
            const modCost = costMods[card.id] || costMods[card.operationKey] || 0;
            const hasPenalty =
              gameState.enemy.adaptedModifier?.trappedOperation === card.operationKey;
            const totalCostMod = (hasPenalty ? 1 : 0) + modCost;

            return (
              <CardComponent
                key={card.id}
                card={card}
                onClick={handlePlayCard}
                isHidden={isHidden}
                disabled={
                  gameState.combatStatus !== 'PLAYER_TURN' ||
                  gameState.player.currentEnergy < card.cost + totalCostMod ||
                  isHidden
                }
                costModifier={totalCostMod}
              />
            );
          })}
        </div>
      </footer>

      {/* 7. ADAPTATION MODAL OVERLAY */}
      {gameState.showAdaptationModal && gameState.activeDiagnosis && (
        <AdaptationModal
          diagnosis={gameState.activeDiagnosis}
          onClose={() => {
            sounds.playClick();
            engine.closeAdaptationModal();
            setGameState({ ...engine.getState() });
          }}
          onEnterEchoVault={vaultId => {
            sounds.playClick();
            engine.closeAdaptationModal();
            onEnterEchoVault(vaultId);
          }}
        />
      )}
    </div>
  );
};
