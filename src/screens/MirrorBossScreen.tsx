import React, { useState } from 'react';
import { MirrorBossDefinition } from '../types/learningDna';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { ShieldAlert, Award, Sparkles, CheckCircle2, XCircle, ArrowRight, DoorOpen } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface MirrorBossScreenProps {
  mirrorBoss: MirrorBossDefinition;
  onVictory: (xpReward: number, mirrorMark: string) => void;
  onDefeat: (weaknessName: string, echoVaultId: string) => void;
  onEnterEchoVault: (vaultId: string) => void;
  onReturnToMap: () => void;
}

export const MirrorBossScreen: React.FC<MirrorBossScreenProps> = ({
  mirrorBoss,
  onVictory,
  onDefeat,
  onEnterEchoVault,
  onReturnToMap,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  const handleSubmit = () => {
    if (!selectedOptionId || hasSubmitted) return;
    const chosen = mirrorBoss.options.find(o => o.id === selectedOptionId);
    const win = chosen?.isCorrect ?? false;
    setIsCorrect(win);
    setHasSubmitted(true);

    if (win) {
      sounds.playVictoryFanfare();
    } else {
      sounds.playMistakeDetected();
    }
  };

  return (
    <div className="relative min-h-[calc(100dvh-54px)] p-4 sm:p-8 flex flex-col items-center justify-between select-none bg-gradient-to-b from-[#0f0717] via-[#08020d] to-[#020005] text-slate-100 overflow-y-auto">
      <ParticleCanvas color="#c084fc" count={45} speed={1.2} />

      {/* Header with Mirror Reflection Aesthetic */}
      <div className="z-10 w-full max-w-3xl text-center mt-2 animate-fadeIn flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/60 text-purple-300 font-mono-code text-xs mb-3 shadow-[0_0_25px_rgba(192,132,252,0.4)]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>✦ THE MIRROR CONFRONTATION ✦</span>
        </div>

        <h1 className="font-cinzel-dec font-black text-2xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-rose-300 to-amber-200 tracking-wider">
          {mirrorBoss.mirrorName}
        </h1>
        <p className="font-cinzel text-xs sm:text-sm text-purple-300/80 tracking-widest uppercase font-semibold mt-1">
          {mirrorBoss.mirrorTitle}
        </p>

        {/* Thematic Quote */}
        <div className="mt-3 max-w-xl bg-slate-950/70 border border-purple-900/50 p-3.5 rounded-xl shadow-lg">
          <p className="font-cinzel text-xs sm:text-sm text-purple-200/90 italic">
            "{mirrorBoss.dialogueIntro}"
          </p>
        </div>
      </div>

      {/* Challenge Card */}
      <div className="z-10 w-full max-w-3xl my-4 glass-panel p-5 sm:p-7 rounded-3xl border border-purple-500/40 shadow-2xl flex flex-col gap-5">
        {/* Scenario Context */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-purple-900/40">
          <span className="text-[10px] font-mono-code text-purple-400 uppercase tracking-widest font-bold block mb-1">
            TARGETED COGNITIVE WEAKNESS: {mirrorBoss.targetedWeakness.toUpperCase()}
          </span>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
            {mirrorBoss.scenario}
          </p>
        </div>

        {/* Objective */}
        <div className="bg-purple-950/30 p-3.5 rounded-xl border border-purple-500/30">
          <span className="text-[10px] font-mono-code text-purple-300 uppercase tracking-widest font-bold block mb-0.5">
            CHALLENGE OBJECTIVE
          </span>
          <p className="text-xs sm:text-sm text-purple-100 font-semibold font-cinzel">
            {mirrorBoss.objective}
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2.5">
          {mirrorBoss.options.map(opt => {
            const isSelected = selectedOptionId === opt.id;
            let style =
              'bg-slate-950/70 border-slate-800 hover:border-purple-600/60 text-slate-300';

            if (hasSubmitted) {
              if (opt.isCorrect) {
                style =
                  'bg-emerald-950/60 border-emerald-500 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.3)]';
              } else if (isSelected && !opt.isCorrect) {
                style = 'bg-rose-950/60 border-rose-500 text-rose-200';
              } else {
                style = 'bg-slate-950/30 border-slate-900 text-slate-600 opacity-60';
              }
            } else if (isSelected) {
              style =
                'bg-purple-950/70 border-purple-400 text-purple-100 shadow-[0_0_20px_rgba(192,132,252,0.3)]';
            }

            return (
              <button
                key={opt.id}
                disabled={hasSubmitted}
                onClick={() => {
                  sounds.playClick();
                  setSelectedOptionId(opt.id);
                }}
                className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start justify-between gap-3 ${style}`}
              >
                <span className="leading-relaxed font-sans">{opt.label}</span>
                {hasSubmitted && opt.isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                )}
                {hasSubmitted && isSelected && !opt.isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Post-Submission Result */}
        {hasSubmitted && (
          <div
            className={`p-4 rounded-2xl border animate-fadeIn ${
              isCorrect
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              {isCorrect ? (
                <>
                  <Award className="w-5 h-5 text-emerald-400" />
                  <span className="font-cinzel font-bold text-xs sm:text-sm text-emerald-300 uppercase">
                    Mirror Sovereign Mastered (+{mirrorBoss.rewardXp} XP)
                  </span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <span className="font-cinzel font-bold text-xs sm:text-sm text-rose-300 uppercase">
                    The Mirror Fades — 0% Progress Lost
                  </span>
                </>
              )}
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
              {mirrorBoss.correctExplanation}
            </p>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="z-10 pb-4 flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
        {!hasSubmitted ? (
          <button
            disabled={!selectedOptionId}
            onClick={handleSubmit}
            className={`w-full py-3 px-6 rounded-xl font-cinzel font-bold text-xs uppercase tracking-wider transition-all ${
              selectedOptionId
                ? 'btn-fantasy-gold text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.5)] cursor-pointer'
                : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            Shatter The Reflection
          </button>
        ) : isCorrect ? (
          <button
            onClick={() => {
              sounds.playClick();
              onVictory(mirrorBoss.rewardXp, mirrorBoss.mirrorMark);
            }}
            className="btn-fantasy-gold w-full py-3 px-6 rounded-xl font-cinzel font-bold text-slate-950 text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.6)]"
          >
            Claim Mirror Mark & Return <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <button
              onClick={() => {
                sounds.playClick();
                onEnterEchoVault(mirrorBoss.echoVaultId);
              }}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-500/60 text-indigo-100 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
            >
              <DoorOpen className="w-4 h-4" /> Repair In Echo Vault
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                onReturnToMap();
              }}
              className="glass-panel w-full sm:w-auto py-3 px-4 rounded-xl font-cinzel font-semibold text-slate-300 hover:text-white text-xs"
            >
              Return To Map
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
