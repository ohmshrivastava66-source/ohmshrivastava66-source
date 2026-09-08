import React, { useState, useEffect } from 'react';
import { EncounterDefinition } from '../types/curriculum';
import { Card } from '../types/game';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { CardComponent } from '../components/CardComponent';
import { Trophy, Sparkles, ArrowRight, User, Compass, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../audio/SoundEffects';

interface VictoryScreenProps {
  encounter: EncounterDefinition;
  turnsUsed: number;
  unlockedCard?: Card;
  onProceedToNextLevel: () => void;
  onViewProfile: () => void;
  onReturnToMap: () => void;
  isAllBossesDefeated?: boolean;
  onTriggerConvergence?: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  encounter,
  turnsUsed,
  unlockedCard,
  onProceedToNextLevel,
  onViewProfile,
  onReturnToMap,
  isAllBossesDefeated = false,
  onTriggerConvergence,
}) => {
  const [isGlitching, setIsGlitching] = useState<boolean>(false);
  const [glitchText, setGlitchText] = useState<string>('');

  useEffect(() => {
    // Triumphant confetti shower
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#38bdf8', '#fbbf24', '#34d399', '#c084fc'],
    });

    // If final boss was defeated and all realm bosses are conquered -> False Ending Transition
    if (encounter.isBoss && isAllBossesDefeated && onTriggerConvergence) {
      const glitchTimer = setTimeout(() => {
        setIsGlitching(true);
        sounds.playAmbushAlarm();
      }, 3200);

      const text1Timer = setTimeout(() => {
        setGlitchText('THE SPIRE SHOULD HAVE ENDED HERE.');
      }, 4500);

      const text2Timer = setTimeout(() => {
        setGlitchText('BUT YOU WERE NEVER THE FINAL SUBJECT.');
      }, 6200);

      const transitionTimer = setTimeout(() => {
        onTriggerConvergence();
      }, 8000);

      return () => {
        clearTimeout(glitchTimer);
        clearTimeout(text1Timer);
        clearTimeout(text2Timer);
        clearTimeout(transitionTimer);
      };
    }
  }, [encounter.isBoss, isAllBossesDefeated, onTriggerConvergence]);

  return (
    <div className={`relative min-h-[calc(100dvh-54px)] p-4 sm:p-8 flex flex-col items-center justify-between select-none overflow-y-auto ${
      isGlitching 
        ? 'bg-black animate-pulse transition-colors duration-1000' 
        : 'bg-gradient-to-b from-[#04141d] via-[#050b12] to-[#020508]'
    }`}>
      <ParticleCanvas color={isGlitching ? '#ef4444' : '#38bdf8'} count={50} speed={isGlitching ? 3.0 : 0.9} />

      {/* Secret False Ending Glitch Overlay */}
      {isGlitching && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn select-none pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-red-950/80 border-2 border-red-500/80 flex items-center justify-center text-red-400 mb-6 shadow-[0_0_50px_rgba(239,68,68,0.8)] animate-ping">
            <AlertTriangle className="w-10 h-10" />
          </div>

          <div className="font-mono-code text-xs text-red-500 tracking-widest uppercase mb-4 animate-pulse">
            [ FATAL ANOMALY DETECTED IN SPIRE ARCHITECTURE ]
          </div>

          <h2 className="font-cinzel-dec font-black text-2xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-300 to-amber-500 tracking-wider max-w-2xl min-h-[5rem] flex items-center justify-center">
            {glitchText || 'SIGNAL COMPROMISED...'}
          </h2>

          <p className="font-mono-code text-xs text-rose-400/80 mt-6 tracking-widest uppercase">
            CONVERGING SOVEREIGN CONSTRUCTS...
          </p>
        </div>
      )}

      {/* Victory Crest Header */}
      <div className="z-10 text-center max-w-xl mt-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 mx-auto mb-3 shadow-[0_0_35px_rgba(245,158,11,0.8)] animate-bounce">
          <Trophy className="w-9 h-9 text-amber-300 fill-amber-300/20" />
        </div>

        <h2 className="font-cinzel-dec font-black text-3xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-100 to-amber-400 tracking-wider">
          VICTORY ACHIEVED
        </h2>

        <p className="font-cinzel text-sm sm:text-base text-cyan-300 tracking-widest uppercase font-semibold mt-1">
          {encounter.levelTitle} Complete
        </p>

        <div className="inline-block mt-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-mono-code text-xs">
          NEXT LEVEL UNLOCKED
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="z-10 w-full max-w-xl my-auto glass-panel p-6 rounded-3xl border border-cyan-500/40 shadow-2xl flex flex-col gap-5">
        <h3 className="font-cinzel font-bold text-center text-slate-100 text-sm tracking-wider uppercase flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Encounter Conquest Rewards
        </h3>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-cyan-900/60 flex flex-col items-center">
            <span className="text-[10px] font-mono-code text-slate-400">XP GAINED</span>
            <span className="font-mono-code text-lg sm:text-xl font-bold text-cyan-300 mt-1">
              +{encounter.rewardXp}
            </span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-emerald-900/60 flex flex-col items-center">
            <span className="text-[10px] font-mono-code text-slate-400">MASTERY</span>
            <span className="font-mono-code text-lg sm:text-xl font-bold text-emerald-300 mt-1">
              +{encounter.rewardMastery}%
            </span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-amber-900/60 flex flex-col items-center">
            <span className="text-[10px] font-mono-code text-slate-400">TURNS</span>
            <span className="font-mono-code text-lg sm:text-xl font-bold text-amber-300 mt-1">
              {turnsUsed}
            </span>
          </div>
        </div>

        {/* Verified Solution State Proof (Revealed Post-Victory) */}
        <div className="bg-slate-950/80 p-3 rounded-2xl border border-emerald-500/40 flex flex-col items-center gap-1 text-center">
          <span className="text-[10px] font-mono-code text-emerald-400 uppercase tracking-widest font-bold">
            ✦ AXIOMATIC PROOF VERIFIED ✦
          </span>
          <span className="text-xs sm:text-sm font-mono-code text-emerald-200 font-bold">
            {encounter.targetState}
          </span>
        </div>

        {/* Unlocked Card Reward Showcase */}
        {unlockedCard && (
          <div className="flex flex-col items-center gap-2 pt-2 border-t border-slate-800/80">
            <span className="text-xs font-cinzel font-bold text-amber-300 uppercase tracking-wider">
              ✦ New Cognitive Card Added to Your Deck ✦
            </span>
            <CardComponent card={unlockedCard} onClick={() => {}} compact />
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="z-10 pb-6 flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
        <button
          onClick={() => { sounds.playClick(); onProceedToNextLevel(); }}
          className="btn-fantasy-gold w-full sm:flex-1 py-3 px-6 rounded-xl font-cinzel font-bold text-slate-950 text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.6)]"
        >
          Next Level <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => { sounds.playClick(); onViewProfile(); }}
          className="glass-panel w-full sm:w-auto py-3 px-4 rounded-xl font-cinzel font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-1.5 text-xs"
        >
          <User className="w-4 h-4" /> Profile
        </button>

        <button
          onClick={() => { sounds.playClick(); onReturnToMap(); }}
          className="glass-panel w-full sm:w-auto py-3 px-4 rounded-xl font-cinzel font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-1.5 text-xs"
        >
          <Compass className="w-4 h-4" /> Map
        </button>
      </div>
    </div>
  );
};
