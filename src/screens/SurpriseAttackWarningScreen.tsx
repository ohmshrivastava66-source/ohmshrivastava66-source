import React, { useEffect } from 'react';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { ShieldAlert, Skull, Swords } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface SurpriseAttackWarningScreenProps {
  onFaceAttack: () => void;
}

export const SurpriseAttackWarningScreen: React.FC<SurpriseAttackWarningScreenProps> = ({
  onFaceAttack,
}) => {
  useEffect(() => {
    sounds.playAmbushAlarm();
  }, []);

  return (
    <div className="relative min-h-[calc(100dvh-54px)] p-6 flex flex-col items-center justify-center select-none overflow-hidden bg-gradient-to-b from-[#1c0205] via-[#0f0103] to-[#050002] animate-pulse-subtle">
      {/* Ominous Deep Crimson Particles */}
      <ParticleCanvas color="#ef4444" count={50} speed={0.8} />

      {/* Pulsing Vignette Border Effect */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(239,68,68,0.35)]" />

      {/* Dramatic Ambush Card */}
      <div className="z-10 w-full max-w-xl glass-panel-danger p-8 sm:p-10 rounded-3xl border-2 border-red-600/70 shadow-[0_0_60px_rgba(220,38,38,0.5)] flex flex-col items-center text-center gap-6 animate-fadeIn">
        {/* Warning Icon Badge */}
        <div className="w-20 h-20 rounded-full bg-red-950/80 border-2 border-red-500 flex items-center justify-center text-red-500 shadow-[0_0_35px_rgba(239,68,68,0.8)] animate-bounce-short">
          <Skull className="w-10 h-10" />
        </div>

        {/* Warning Header */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/90 border border-red-500/80 text-red-400 font-mono-code text-xs tracking-widest uppercase font-bold shadow-sm">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>⚠ THEY FOUND YOU ⚠</span>
          </div>

          <h1 className="font-cinzel-dec font-black text-3xl sm:text-4xl text-rose-100 tracking-wider mt-2">
            SURPRISE ATTACK
          </h1>
          <span className="font-cinzel text-xs sm:text-sm text-red-400/90 tracking-widest font-bold uppercase">
            THE HUNT BEGINS
          </span>
        </div>

        {/* Ominous Narrative Lore */}
        <div className="bg-black/60 p-5 rounded-2xl border border-red-950/80 flex flex-col gap-3 text-slate-300 font-serif text-sm sm:text-base leading-relaxed max-w-md italic">
          <p>The creatures of the Spire have been watching your ascent.</p>
          <p className="text-red-300 font-semibold">You have advanced too quickly.</p>
          <p>They no longer see you as prey.</p>
          <p className="font-bold text-red-400 uppercase tracking-wide">
            They see you as a threat.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onFaceAttack();
          }}
          className="w-full max-w-sm py-4 px-8 rounded-2xl bg-gradient-to-r from-red-700 via-rose-600 to-red-700 hover:from-red-600 hover:to-rose-500 text-white font-cinzel font-black text-sm sm:text-base tracking-widest uppercase shadow-[0_0_30px_rgba(239,68,68,0.7)] flex items-center justify-center gap-3 transition-transform active:scale-95 border border-red-400/50"
        >
          <Swords className="w-5 h-5 text-rose-200" />
          <span>FACE THE ATTACK</span>
        </button>
      </div>
    </div>
  );
};
