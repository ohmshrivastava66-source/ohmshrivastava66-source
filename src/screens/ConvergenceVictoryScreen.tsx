import React, { useEffect } from 'react';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { Crown, Award, Sparkles, Compass, ShieldCheck, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../audio/SoundEffects';

interface ConvergenceVictoryScreenProps {
  score: number;
  onReturnToSpire: () => void;
}

export const ConvergenceVictoryScreen: React.FC<ConvergenceVictoryScreenProps> = ({
  score,
  onReturnToSpire,
}) => {
  useEffect(() => {
    sounds.playVictoryFanfare();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.4 },
      colors: ['#c084fc', '#38bdf8', '#fbbf24', '#34d399', '#f472b6'],
    });
  }, []);

  return (
    <div className="relative min-h-[calc(100dvh-54px)] p-6 sm:p-10 flex flex-col items-center justify-between select-none overflow-y-auto bg-gradient-to-b from-[#0e031a] via-[#05000c] to-[#010003]">
      <ParticleCanvas color="#c084fc" count={60} speed={0.9} />

      {/* Triumphant Header */}
      <div className="z-10 text-center max-w-2xl mt-4 animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center text-purple-300 mx-auto mb-3 shadow-[0_0_50px_rgba(192,132,252,0.8)] animate-bounce-short">
          <Crown className="w-11 h-11 text-amber-300 fill-amber-300/30" />
        </div>

        <div className="inline-block px-4 py-1 rounded-full bg-purple-950/80 border border-purple-500/60 text-purple-300 font-mono-code text-xs font-bold uppercase tracking-widest mb-2 shadow-sm">
          ✦ THE COUNCIL FALLS SILENT ✦
        </div>

        <h1 className="font-cinzel-dec font-black text-3xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-amber-100 to-cyan-200 tracking-wider">
          APEX OF THE SPIRE
        </h1>

        <p className="font-cinzel text-xs sm:text-sm text-purple-200/90 tracking-widest uppercase font-semibold mt-1">
          You Have Survived The Convergence
        </p>
      </div>

      {/* Council Reactions Banter Card */}
      <div className="z-10 w-full max-w-2xl my-4 glass-panel-void p-6 rounded-3xl border border-purple-500/50 shadow-2xl flex flex-col gap-4">
        <div className="text-[11px] font-mono-code text-purple-300 font-bold uppercase tracking-widest text-center border-b border-purple-950 pb-2">
          THE GUARDIANS CONCEDE
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-cyan-900/60 flex flex-col">
            <span className="font-mono-code font-bold text-cyan-400 text-[10px] uppercase">
              The Singularity Archon [Math]
            </span>
            <p className="text-slate-200 font-serif italic mt-1 leading-relaxed">
              "...Acceptable. Your axiomatic proofs withstood the curvature."
            </p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-purple-900/60 flex flex-col">
            <span className="font-mono-code font-bold text-purple-400 text-[10px] uppercase">
              The Turing Archon [CS]
            </span>
            <p className="text-slate-200 font-serif italic mt-1 leading-relaxed">
              "Impossible. Optimal termination across all subproblems."
            </p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-900/60 flex flex-col">
            <span className="font-mono-code font-bold text-amber-400 text-[10px] uppercase">
              The Entropy Colossus [Physics]
            </span>
            <p className="text-slate-200 font-serif italic mt-1 leading-relaxed">
              "They adapted. The conserved invariants never drifted."
            </p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-rose-900/60 flex flex-col">
            <span className="font-mono-code font-bold text-rose-400 text-[10px] uppercase">
              The Chrono Sovereign [History]
            </span>
            <p className="text-slate-200 font-serif italic mt-1 leading-relaxed">
              "Remember this moment. You shattered the Spire's cycle."
            </p>
          </div>
        </div>

        {/* Rewards Summary */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="bg-slate-950/90 p-3 rounded-2xl border border-purple-800/60 flex flex-col items-center text-center">
            <Sparkles className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-[10px] text-slate-400 uppercase font-mono-code">Mastery XP</span>
            <span className="text-sm font-mono-code font-bold text-amber-300">+350 XP</span>
          </div>

          <div className="bg-slate-950/90 p-3 rounded-2xl border border-purple-800/60 flex flex-col items-center text-center">
            <ShieldCheck className="w-5 h-5 text-cyan-400 mb-1" />
            <span className="text-[10px] text-slate-400 uppercase font-mono-code">Supreme Relic</span>
            <span className="text-xs font-mono-code font-bold text-cyan-300 truncate w-full text-center">
              Prism of Council
            </span>
          </div>

          <div className="bg-slate-950/90 p-3 rounded-2xl border border-purple-800/60 flex flex-col items-center text-center">
            <Award className="w-5 h-5 text-purple-400 mb-1" />
            <span className="text-[10px] text-slate-400 uppercase font-mono-code">Trial Score</span>
            <span className="text-sm font-mono-code font-bold text-purple-300">{score}</span>
          </div>
        </div>

        {/* Secret Ending Lore Card */}
        <div className="bg-black/70 p-5 rounded-2xl border border-purple-500/40 text-center flex flex-col gap-2">
          <div className="text-[10px] font-mono-code text-amber-300 uppercase tracking-widest font-bold">
            ✦ SECRET ENDING: THE TRUE PURPOSE ✦
          </div>
          <p className="text-xs sm:text-sm text-slate-200 font-serif italic leading-relaxed">
            "You defeated every guardian. Then you defeated them together. But the Spire was never testing whether you could defeat its monsters. It was testing whether you could adapt."
          </p>
          <div className="text-xs font-mono-code text-purple-300 font-bold uppercase tracking-widest mt-1">
            YOU DID. ALGO-SPIRE: CONVERGENCE COMPLETE.
          </div>
        </div>
      </div>

      {/* Action Return Button */}
      <div className="z-10 pb-4 w-full max-w-sm">
        <button
          onClick={() => {
            sounds.playClick();
            onReturnToSpire();
          }}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-cinzel font-bold text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(168,85,247,0.7)] flex items-center justify-center gap-2"
        >
          <Compass className="w-4 h-4" />
          <span>Return as Master of the Spire</span>
        </button>
      </div>
    </div>
  );
};
