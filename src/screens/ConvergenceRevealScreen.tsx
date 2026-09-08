import React, { useEffect, useState } from 'react';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { Sparkles, Eye, ShieldAlert, ArrowRight } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface ConvergenceRevealScreenProps {
  onEnterConvergence: () => void;
}

export const ConvergenceRevealScreen: React.FC<ConvergenceRevealScreenProps> = ({
  onEnterConvergence,
}) => {
  const [stage, setStage] = useState<number>(0);

  useEffect(() => {
    sounds.playAmbushAlarm();

    // Cinematic staged text reveal
    const timers = [
      setTimeout(() => setStage(1), 800),
      setTimeout(() => setStage(2), 2200),
      setTimeout(() => setStage(3), 3600),
      setTimeout(() => setStage(4), 5000),
      setTimeout(() => setStage(5), 6500),
    ];

    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <div className="relative min-h-[calc(100dvh-54px)] p-6 flex flex-col items-center justify-center select-none overflow-hidden bg-gradient-to-b from-[#0c0314] via-[#06010a] to-[#020004]">
      {/* Void Astral Particles */}
      <ParticleCanvas color="#c084fc" count={60} speed={0.6} />

      {/* Dramatic Ominous Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(168,85,247,0.4)]" />

      {/* Narrative Card */}
      <div className="z-10 w-full max-w-xl glass-panel-void p-8 sm:p-10 rounded-3xl border-2 border-purple-500/60 shadow-[0_0_80px_rgba(168,85,247,0.5)] flex flex-col items-center text-center gap-6 animate-fadeIn">
        {/* Council Eye Icon */}
        <div className="w-20 h-20 rounded-full bg-purple-950/80 border-2 border-purple-400 flex items-center justify-center text-purple-300 shadow-[0_0_40px_rgba(192,132,252,0.8)] animate-pulse">
          <Eye className="w-10 h-10" />
        </div>

        {/* Narrative Cadence */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/90 border border-purple-500/80 text-purple-300 font-mono-code text-xs tracking-widest uppercase font-bold shadow-sm">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            <span>THE FALSE ENDING FRACTURES</span>
          </div>

          <h1 className="font-cinzel-dec font-black text-2xl sm:text-3xl text-purple-100 tracking-wider mt-2">
            THE SPIRE SHOULD HAVE ENDED HERE.
          </h1>
        </div>

        {/* Staged Dialogue Lore */}
        <div className="bg-black/70 p-6 rounded-2xl border border-purple-950/80 flex flex-col gap-3.5 text-slate-300 font-serif text-sm sm:text-base leading-relaxed max-w-md italic min-h-[160px] justify-center">
          {stage >= 1 && <p className="animate-fadeIn">"But something has changed."</p>}
          {stage >= 2 && <p className="animate-fadeIn text-purple-300 font-semibold">"The guardians are speaking to one another."</p>}
          {stage >= 3 && <p className="animate-fadeIn">"They were never fighting you separately."</p>}
          {stage >= 4 && (
            <p className="animate-fadeIn font-bold text-amber-300 uppercase tracking-wide">
              "They were studying you."
            </p>
          )}
        </div>

        {/* Final Reveal Title */}
        {stage >= 5 && (
          <div className="flex flex-col items-center gap-1 animate-fadeIn">
            <h2 className="font-cinzel-dec font-black text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 tracking-widest">
              THE CONVERGENCE
            </h2>
            <span className="font-cinzel text-xs sm:text-sm text-purple-400 tracking-widest uppercase font-bold">
              THE SPIRE'S FINAL EXAMINATION
            </span>
          </div>
        )}

        {/* Action Button */}
        {stage >= 5 && (
          <button
            onClick={() => {
              sounds.playClick();
              onEnterConvergence();
            }}
            className="w-full max-w-sm py-4 px-8 rounded-2xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 hover:from-purple-600 hover:to-fuchsia-500 text-white font-cinzel font-black text-sm sm:text-base tracking-widest uppercase shadow-[0_0_35px_rgba(192,132,252,0.8)] flex items-center justify-center gap-3 transition-transform active:scale-95 border border-purple-300/50 animate-fadeIn"
          >
            <span>ENTER THE EXAMINATION</span>
            <ArrowRight className="w-5 h-5 text-purple-200" />
          </button>
        )}
      </div>
    </div>
  );
};
