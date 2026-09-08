import React, { useEffect, useState, useCallback } from 'react';
import { Crown, Sparkles } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface BossIntroCinematicProps {
  bossName: string;
  bossTitle: string;
  flavorQuote: string;
  realmName: string;
  themeColor?: string;
  onComplete: () => void;
}

/**
 * 2.5-Second Cinematic Boss Introduction Banner
 * Builds dark-fantasy anticipation with a dramatic silhouette reveal,
 * glowing eye/core awakening, and sovereign title card before dissolving into combat.
 * Fully skippable via click, Escape, Enter, or Space.
 */
export const BossIntroCinematic: React.FC<BossIntroCinematicProps> = ({
  bossName,
  bossTitle,
  flavorQuote,
  realmName,
  themeColor = '#06b6d4',
  onComplete,
}) => {
  const [phase, setPhase] = useState<1 | 2 | 3>(1); // 1: vignette/silhouette, 2: eyes/aura, 3: title card
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleFinish = useCallback(() => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 400);
  }, [onComplete]);

  // Phase timer progression
  useEffect(() => {
    sounds.playVictory(); // Subtle atmospheric fanfare / cue

    const p2Timer = setTimeout(() => setPhase(2), 650);
    const p3Timer = setTimeout(() => setPhase(3), 1350);
    const finishTimer = setTimeout(() => handleFinish(), 2800);

    return () => {
      clearTimeout(p2Timer);
      clearTimeout(p3Timer);
      clearTimeout(finishTimer);
    };
  }, [handleFinish]);

  // Keyboard skip listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Escape', 'Enter', ' ', 'Space'].includes(e.key)) {
        e.preventDefault();
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFinish]);

  return (
    <div
      onClick={handleFinish}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer select-none bg-black/95 transition-opacity duration-400 overflow-hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="banner"
      aria-label={`Boss Awakening: ${bossName}`}
    >
      {/* 1. Dramatic Dark Vignette & Volumetric Radial Fog */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${themeColor}22 0%, #000000 75%)`,
          opacity: phase >= 2 ? 0.9 : 0.4,
        }}
      />

      {/* 2. Silhouette Awakening Rays */}
      <div className="relative flex flex-col items-center justify-center max-w-2xl px-6 text-center z-10">
        {/* Realm Sovereign Crown Icon */}
        <div
          className={`w-16 h-16 rounded-3xl flex items-center justify-center border transition-all duration-700 ${
            phase >= 2
              ? 'scale-110 shadow-[0_0_35px_rgba(245,158,11,0.6)] bg-amber-950/40 border-amber-400 text-amber-300'
              : 'scale-90 opacity-40 bg-slate-900 border-slate-700 text-slate-500'
          }`}
        >
          <Crown className="w-9 h-9" />
        </div>

        {/* Sovereign Domain Tag */}
        <span
          className={`mt-4 text-xs font-mono-code uppercase tracking-widest px-3 py-1 rounded-full border transition-all duration-500 ${
            phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
          style={{
            borderColor: `${themeColor}60`,
            color: themeColor,
            backgroundColor: `${themeColor}15`,
          }}
        >
          {realmName} • Sovereign Challenge
        </span>

        {/* 3. Epic Boss Title Card */}
        <h1
          className={`mt-3 font-cinzel-dec font-extrabold text-3xl sm:text-5xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-amber-200 to-slate-200 drop-shadow-[0_4px_25px_rgba(0,0,0,1)] transition-all duration-700 ${
            phase >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          {bossName}
        </h1>

        <h2
          className={`mt-1 font-cinzel font-bold text-sm sm:text-base tracking-widest text-amber-400 uppercase transition-all duration-500 ${
            phase >= 3 ? 'opacity-90' : 'opacity-0'
          }`}
        >
          {bossTitle}
        </h2>

        {/* Flavor Quote */}
        {flavorQuote && (
          <p
            className={`mt-4 text-xs sm:text-sm text-slate-300 font-cinzel italic max-w-lg leading-relaxed transition-all duration-700 delay-100 ${
              phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            "{flavorQuote}"
          </p>
        )}

        {/* Skip Prompt */}
        <span className="mt-8 text-[10px] font-mono-code text-slate-500 hover:text-slate-400 flex items-center gap-1.5 transition-colors">
          <Sparkles className="w-3 h-3 text-amber-400/80" /> Click anywhere or press ESC to begin combat
        </span>
      </div>
    </div>
  );
};
