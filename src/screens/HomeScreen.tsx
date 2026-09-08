import React from 'react';
import { AppScreen } from '../types/game';
import { CharacterRenderer } from '../components/CharacterRenderer';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { Play, Sparkles, Compass, Shield, User, Settings, Layers } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface HomeScreenProps {
  onNavigate: (screen: AppScreen) => void;
  onLaunchJudgeDemo: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, onLaunchJudgeDemo }) => {
  return (
    <div className="relative min-h-[calc(100dvh-54px)] flex flex-col items-center justify-between p-4 sm:p-8 overflow-hidden">
      <ParticleCanvas color="#38bdf8" count={45} />

      {/* Spire Silhouette Backdrop */}
      <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none">
        <svg viewBox="0 0 600 800" className="w-[850px] h-[850px] text-cyan-500/20 fill-current">
          <polygon points="300,40 330,220 380,450 450,750 150,750 220,450 270,220" />
          <line x1="300" y1="40" x2="300" y2="750" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6,6" />
        </svg>
      </div>

      {/* Hero Title & Lore */}
      <div className="z-10 text-center max-w-2xl mt-4 sm:mt-6 animate-fadeIn">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono-code mb-4 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          AI-Powered Adaptive Learning Rogue-Like
        </div>

        <h1 className="font-cinzel-dec font-black text-4xl sm:text-6xl md:text-7xl tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-cyan-300 drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]">
          ALGO-SPIRE
        </h1>

        <p className="font-cinzel text-sm sm:text-lg tracking-[0.25em] text-cyan-300/90 uppercase font-semibold mt-2">
          Master Knowledge. Defeat Weaknesses.
        </p>

        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mt-3 leading-relaxed">
          The Spire observes how you think. When you struggle, it attacks your weakness and manifests secret revision dungeons to forge mastery.
        </p>
      </div>

      {/* Character Visual Hero */}
      <div className="z-10 my-auto flex flex-col items-center justify-center">
        <CharacterRenderer state="idle" size={240} />
      </div>

      {/* Primary Action Buttons */}
      <div className="z-10 w-full max-w-md flex flex-col gap-2.5 mb-4">
        {/* Judge Demo Run (5-Minute Golden Path) */}
        <button
          onClick={() => {
            sounds.playClick();
            onLaunchJudgeDemo();
          }}
          className="btn-fantasy-gold w-full py-3 px-6 rounded-xl font-cinzel font-bold text-slate-950 text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.6)] animate-pulse"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          Judge Demo Run (Quadratic Beast)
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => {
              sounds.playClick();
              onNavigate('SUBJECT_SELECT');
            }}
            className="btn-fantasy-primary py-2.5 px-4 rounded-xl font-cinzel font-bold text-white text-xs tracking-wider flex items-center justify-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Enter Spire
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onNavigate('EDUCATION_SELECT');
            }}
            className="glass-panel py-2.5 px-4 rounded-xl font-cinzel font-bold text-cyan-300 hover:text-white border border-cyan-500/40 hover:border-cyan-400 text-xs tracking-wider flex items-center justify-center gap-2 transition-all hover:bg-cyan-950/40"
          >
            <Layers className="w-3.5 h-3.5" />
            Grade / Tier
          </button>
        </div>

        {/* Secondary Navigation Row */}
        <div className="grid grid-cols-4 gap-2 pt-1 text-[11px] font-cinzel font-semibold">
          <button
            onClick={() => { sounds.playClick(); onNavigate('SUBJECT_SELECT'); }}
            className="glass-panel p-2 rounded-lg flex flex-col items-center gap-1 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span>Worlds</span>
          </button>
          <button
            onClick={() => { sounds.playClick(); onNavigate('DECK'); }}
            className="glass-panel p-2 rounded-lg flex flex-col items-center gap-1 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors"
          >
            <Shield className="w-4 h-4" />
            <span>Deck</span>
          </button>
          <button
            onClick={() => { sounds.playClick(); onNavigate('PROFILE'); }}
            className="glass-panel p-2 rounded-lg flex flex-col items-center gap-1 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors"
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => { sounds.playClick(); onNavigate('SETTINGS'); }}
            className="glass-panel p-2 rounded-lg flex flex-col items-center gap-1 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
