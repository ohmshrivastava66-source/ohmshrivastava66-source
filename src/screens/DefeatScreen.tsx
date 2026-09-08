import React from 'react';
import { EncounterDefinition } from '../types/curriculum';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { MasteryCompressionEngine } from '../engine/MasteryCompressionEngine';
import { Skull, RotateCcw, Compass, DoorOpen, ShieldAlert, ArrowRight, CheckCircle } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface DefeatScreenProps {
  encounter: EncounterDefinition;
  weaknessName?: string;
  echoVaultId?: string;
  failedStepIndex?: number;
  lastAttemptedOp?: string;
  onRetry: () => void;
  onEnterEchoVault?: (vaultId: string) => void;
  onReturnToMap: () => void;
  onReturnToMainPathStage?: (stageNumber: number) => void;
}

export const DefeatScreen: React.FC<DefeatScreenProps> = ({
  encounter,
  weaknessName,
  echoVaultId,
  failedStepIndex = 0,
  lastAttemptedOp = '',
  onRetry,
  onEnterEchoVault,
  onReturnToMap,
  onReturnToMainPathStage,
}) => {
  const isHiddenTrial = encounter.pathType === 'hidden_trial';
  const compressionDiagnosis = isHiddenTrial
    ? MasteryCompressionEngine.analyzeHiddenPathFailure(encounter, failedStepIndex, lastAttemptedOp)
    : null;

  return (
    <div className="relative min-h-[calc(100dvh-54px)] p-4 sm:p-8 flex flex-col items-center justify-between select-none overflow-y-auto bg-gradient-to-b from-[#180509] via-[#0d0205] to-[#050002]">
      <ParticleCanvas color="#ef4444" count={40} speed={0.5} />

      {/* Defeat Banner */}
      <div className="z-10 text-center max-w-xl mt-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-rose-400 mx-auto mb-3 shadow-[0_0_35px_rgba(244,63,94,0.7)]">
          <Skull className="w-9 h-9" />
        </div>

        <h2 className="font-cinzel-dec font-black text-3xl sm:text-5xl text-rose-200 tracking-wider">
          {isHiddenTrial ? 'MASTERY GAP DETECTED' : 'STRUCK DOWN'}
        </h2>

        <p className="font-cinzel text-xs sm:text-sm text-rose-300/80 tracking-widest uppercase font-semibold mt-1">
          {encounter.levelTitle} {isHiddenTrial ? 'Strained' : 'Overwhelmed'}
        </p>
      </div>

      {/* Diagnostic Insight Box */}
      <div className="z-10 w-full max-w-lg my-auto glass-panel-danger p-6 rounded-3xl border border-rose-500/40 shadow-2xl flex flex-col gap-4 text-center">
        <div className="flex items-center justify-center gap-2 text-rose-300 font-cinzel font-bold text-xs uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          {isHiddenTrial ? 'Compressed Trial Breakdown' : 'The Spire Exploited Your Weakness'}
        </div>

        {isHiddenTrial && compressionDiagnosis ? (
          <div className="bg-slate-950/90 p-4 rounded-2xl border border-purple-900/60 flex flex-col gap-2.5 text-left">
            <div className="flex items-center justify-between border-b border-purple-950 pb-1.5">
              <span className="text-[10px] font-mono-code text-amber-300 uppercase font-bold">
                DIAGNOSED CONCEPT GAP:
              </span>
              <span className="text-[10px] font-mono-code text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/40">
                {compressionDiagnosis.failedConcept.replace('math_', '').replace('cs_', '').toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {compressionDiagnosis.conceptExplanation}
            </p>

            <div className="mt-1 p-2.5 rounded-xl bg-purple-950/50 border border-purple-500/30 flex items-center justify-between">
              <span className="text-[11px] font-cinzel font-semibold text-purple-200">
                Recommended recovery: Main Path Stage {compressionDiagnosis.recommendedMainPathLevel}
              </span>
              {onReturnToMainPathStage && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onReturnToMainPathStage(compressionDiagnosis.recommendedMainPathLevel);
                  }}
                  className="btn-fantasy-primary px-3 py-1 rounded-lg text-xs font-cinzel font-bold text-white flex items-center gap-1 shadow-md"
                >
                  Return to Stage {compressionDiagnosis.recommendedMainPathLevel} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Reassurance Banner */}
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400/90 font-mono-code mt-1">
              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Your previous Main Path progress is preserved.</span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-rose-900/60 flex flex-col gap-1.5">
            <span className="text-[11px] font-mono-code text-slate-400">DETECTED GAP:</span>
            <span className="font-mono-code text-sm sm:text-base font-bold text-rose-200">
              {weaknessName || 'Procedural Misalignment'}
            </span>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              In Algo-Spire, defeat is not a dead end—it is diagnostic data. Repair this misconception in the Echo Vault to conquer the encounter.
            </p>
          </div>
        )}

        {/* Echo Dungeon Repair for standard main path errors */}
        {!isHiddenTrial && echoVaultId && onEnterEchoVault && (
          <button
            onClick={() => { sounds.playClick(); onEnterEchoVault(echoVaultId); }}
            className="btn-fantasy-void py-3 px-6 rounded-xl font-cinzel font-bold text-white text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.7)]"
          >
            <DoorOpen className="w-4 h-4" />
            Repair in Echo Dungeon
          </button>
        )}
      </div>

      {/* Retry & Navigation Buttons */}
      <div className="z-10 pb-6 flex items-center gap-3 w-full max-w-md">
        <button
          onClick={() => { sounds.playClick(); onRetry(); }}
          className="btn-fantasy-primary flex-1 py-3 px-6 rounded-xl font-cinzel font-bold text-white text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          {isHiddenTrial ? 'Retry Trial' : 'Retry Encounter'}
        </button>

        <button
          onClick={() => { sounds.playClick(); onReturnToMap(); }}
          className="glass-panel py-3 px-5 rounded-xl font-cinzel font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 text-xs"
        >
          <Compass className="w-4 h-4" /> Realm Map
        </button>
      </div>
    </div>
  );
};
