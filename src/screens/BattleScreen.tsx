import React, { useState, useEffect } from 'react';
import { EncounterDefinition } from '../types/curriculum';
import { Card } from '../types/game';
import { CombatEngine, CombatEngineState } from '../engine/CombatEngine';
import { CharacterRenderer, CharacterActionState } from '../components/CharacterRenderer';
import { MonsterRenderer } from '../components/MonsterRenderer';
import { CardComponent } from '../components/CardComponent';
import { HealthBar, EnergyOrbs } from '../components/HealthEnergyBar';
import { TelemetryPanel } from '../components/TelemetryPanel';
import { AdaptationModal } from '../components/AdaptationModal';
import { telemetry } from '../engine/Telemetry';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { RotateCcw, Shield, Swords, Sparkles, AlertCircle, DoorOpen } from 'lucide-react';
import { DiagnosisResult, DangerEventDefinition } from '../types/telemetry';
import { sounds } from '../audio/SoundEffects';

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
  const [engine] = useState(() => new CombatEngine(encounter, activeDanger));
  const [gameState, setGameState] = useState<CombatEngineState>(() => engine.getState());
  const [characterPose, setCharacterPose] = useState<CharacterActionState>('idle');
  const [monsterHurt, setMonsterHurt] = useState(false);

  // Synchronize state changes & transitions
  useEffect(() => {
    if (gameState.combatStatus === 'VICTORY') {
      const timer = setTimeout(() => {
        onVictory(encounter, gameState.turnNumber);
      }, 900);
      return () => clearTimeout(timer);
    }

    if (gameState.combatStatus === 'DEFEAT') {
      const timer = setTimeout(() => {
        onDefeat(
          encounter,
          gameState.activeDiagnosis?.concept || 'Procedural Error',
          gameState.currentStepIndex,
          gameState.lastCardPlayed?.operationKey
        );
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [gameState.combatStatus, encounter, gameState.turnNumber, gameState.activeDiagnosis, gameState.currentStepIndex, gameState.lastCardPlayed, onVictory, onDefeat]);

  // Play a card
  const handlePlayCard = (card: Card) => {
    if (gameState.combatStatus !== 'PLAYER_TURN') return;

    // Trigger visual cast animation
    setCharacterPose('cast');

    setTimeout(() => {
      const nextState = engine.playCard(card.id);
      setGameState({ ...nextState });

      // Check if monster took damage
      if (nextState.enemy.currentHp < gameState.enemy.currentHp) {
        setMonsterHurt(true);
        setTimeout(() => setMonsterHurt(false), 400);
      }

      // Check if player took recoil damage
      if (nextState.player.currentHp < gameState.player.currentHp) {
        setCharacterPose('hurt');
        setTimeout(() => setCharacterPose('idle'), 400);
      } else {
        setTimeout(() => setCharacterPose('idle'), 250);
      }
    }, 150);
  };

  // End Turn
  const handleEndTurn = () => {
    if (gameState.combatStatus !== 'PLAYER_TURN') return;
    sounds.playClick();
    setCharacterPose('hurt');

    const nextState = engine.endTurn();
    setGameState({ ...nextState });

    setTimeout(() => {
      setCharacterPose('idle');
    }, 450);
  };

  // Quick intentional demo trigger: plays the misconception card
  const handleSimulateMisconception = () => {
    if (gameState.combatStatus !== 'PLAYER_TURN') return;
    sounds.playClick();
    const misconceptionCard = gameState.player.hand.find(c => c.operationKey === 'EXPAND' || c.operationKey === 'SWAP') || gameState.player.hand[0];
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
  };

  const metrics = telemetry.getLiveMetrics();

  return (
    <div className="relative min-h-[calc(100dvh-54px)] flex flex-col justify-between p-3 sm:p-6 select-none overflow-hidden bg-gradient-to-b from-[#070911] via-[#0a0d18] to-[#04060b]">
      <ParticleCanvas color="#0ea5e9" count={30} />

      {/* TOP COMBAT HUD */}
      <div className="z-10 w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 glass-panel p-3 sm:p-4 rounded-2xl border border-slate-800">
        {/* Player Status */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex flex-col">
            <span className="font-cinzel font-bold text-xs text-cyan-300">
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

        {/* Turn Counter & Problem Banner */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono-code text-slate-400 bg-slate-900/80 px-2.5 py-0.5 rounded-full border border-slate-700">
              TURN {gameState.turnNumber}
            </span>
            {gameState.echoVaultAvailable && (
              <button
                onClick={() => gameState.echoVaultId && onEnterEchoVault(gameState.echoVaultId)}
                className="btn-fantasy-void px-2.5 py-0.5 rounded-full text-[11px] font-cinzel font-bold text-white flex items-center gap-1 shadow-[0_0_15px_rgba(168,85,247,0.7)] animate-bounce"
              >
                <DoorOpen className="w-3.5 h-3.5" />
                Echo Vault Open!
              </button>
            )}
          </div>
        </div>

        {/* Enemy Status */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5">
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
        </div>
      </div>

      {/* Atmospheric Realm Hazard Banner (Natural Game Event) */}
      {gameState.activeDanger && (
        <div className="z-10 w-full max-w-6xl mx-auto mt-2 bg-gradient-to-r from-purple-950/90 via-slate-950/90 to-purple-950/90 border border-purple-500/50 rounded-xl px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-[0_0_25px_rgba(168,85,247,0.3)] animate-fadeIn">
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

      {/* CENTER ARENA: HUNTER vs. PROBLEM vs. MONSTER */}
      <div className="z-10 w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 items-center gap-4 my-auto py-2">
        {/* Knowledge Hunter */}
        <div className="flex flex-col items-center justify-center order-2 md:order-1">
          <CharacterRenderer state={characterPose} size={220} />
          <div className="mt-1 flex items-center gap-1 text-[11px] font-mono-code text-cyan-400/80">
            <Shield className="w-3 h-3" /> Shield: {gameState.player.shield}
          </div>
        </div>

        {/* Transforming Equation / Problem Invariant */}
        <div className="flex flex-col items-center justify-center order-1 md:order-2 text-center">
          <div className="glass-panel-glow w-full max-w-sm p-4 rounded-2xl border border-cyan-500/40 shadow-xl flex flex-col gap-2">
            <span className="text-[10px] font-mono-code uppercase tracking-widest text-cyan-300 flex items-center justify-center gap-1 font-bold">
              <Sparkles className="w-3 h-3" />
              {encounter.conceptName}
            </span>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-700/60 font-mono-code text-base sm:text-lg font-bold text-cyan-200 tracking-wide break-words shadow-inner">
              {gameState.currentEquationState}
            </div>

            <div className="flex flex-col gap-0.5 text-center mt-1 border-t border-slate-800/80 pt-1.5">
              <span className="text-[10px] font-mono-code uppercase tracking-wider text-slate-400 font-bold">
                Objective
              </span>
              <p className="text-[11px] text-cyan-200/90 leading-relaxed font-sans">
                {encounter.objective || encounter.problemStatement}
              </p>
            </div>
          </div>

          {/* Quick Demo Assist Button for Judges */}
          <button
            onClick={handleSimulateMisconception}
            className="mt-2 text-[11px] font-mono-code text-amber-300/80 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-500/40 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
            title="Triggers the intentional misconception to test the AI diagnostic engine"
          >
            <AlertCircle className="w-3 h-3 text-amber-400" />
            [Judge Assist: Trigger Misconception]
          </button>
        </div>

        {/* Enemy Monster */}
        <div className="flex flex-col items-center justify-center order-3">
          <MonsterRenderer
            visualType={gameState.enemy.visualType}
            isHurt={monsterHurt}
            hasAdapted={!!gameState.enemy.adaptedModifier}
            adaptedLabel={gameState.enemy.adaptedModifier?.name}
            size={220}
            phase={gameState.enemy.phase}
          />
          <span className="text-xs text-slate-400 font-cinzel italic mt-1 text-center">
            "{encounter.enemy.flavorQuote}"
          </span>
        </div>
      </div>

      {/* BOTTOM CONTROLS & HAND TRAY */}
      <div className="z-10 w-full max-w-6xl mx-auto flex flex-col gap-3">
        {/* Telemetry & Action Bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="w-full max-w-md hidden lg:block">
            <TelemetryPanel
              metrics={metrics}
              stepCurrent={gameState.currentStepIndex}
              stepTotal={encounter.optimalSequence.length}
              compact
            />
          </div>

          {/* End Turn & Reset Controls */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleResetEncounter}
              className="glass-panel p-2 rounded-xl text-slate-400 hover:text-white border border-slate-700/60"
              title="Reset encounter (Anti-softlock safety)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleEndTurn}
              disabled={gameState.combatStatus !== 'PLAYER_TURN'}
              className="btn-fantasy-primary px-5 py-2.5 rounded-xl font-cinzel font-bold text-white text-xs tracking-wider flex items-center gap-2 disabled:opacity-50"
            >
              <Swords className="w-4 h-4" />
              End Turn
            </button>
          </div>
        </div>

        {/* Hand of Cards Carousel */}
        <div className="w-full overflow-x-auto pb-2 flex items-center justify-center gap-3">
          {gameState.player.hand.map(card => {
            const hasPenalty =
              gameState.enemy.adaptedModifier?.trappedOperation === card.operationKey;
            return (
              <CardComponent
                key={card.id}
                card={card}
                onClick={handlePlayCard}
                disabled={
                  gameState.combatStatus !== 'PLAYER_TURN' ||
                  gameState.player.currentEnergy < card.cost + (hasPenalty ? 1 : 0)
                }
                costModifier={hasPenalty ? 1 : 0}
              />
            );
          })}
        </div>
      </div>

      {/* Adaptation Modal Overlay */}
      {gameState.showAdaptationModal && gameState.activeDiagnosis && (
        <AdaptationModal
          diagnosis={gameState.activeDiagnosis}
          onClose={() => {
            sounds.playClick();
            engine.closeAdaptationModal();
            setGameState({ ...engine.getState() });
          }}
          onEnterEchoVault={(vaultId) => {
            sounds.playClick();
            engine.closeAdaptationModal();
            onEnterEchoVault(vaultId);
          }}
        />
      )}
    </div>
  );
};
