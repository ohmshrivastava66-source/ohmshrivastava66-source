import React, { useState } from 'react';
import { AppScreen, SubjectId, KingdomId, ClassId } from '../types/game';
import { ALL_SUBJECTS } from '../curriculum/registry';
import {
  getKingdom,
  getClass,
  resolveEducationalContext,
} from '../curriculum/educationHierarchy';
import { PlayerProfile } from '../types/telemetry';
import { Volume2, VolumeX, Sparkles, Compass, Shield, User, PlayCircle, GraduationCap } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface TopNavigationProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  activeSubject?: SubjectId;
  profile: PlayerProfile;
  onLaunchJudgeDemo: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentScreen,
  onNavigate,
  activeSubject,
  profile,
  onLaunchJudgeDemo,
}) => {
  const [isMuted, setIsMuted] = useState(sounds.getMuted());

  const toggleSound = () => {
    const next = !isMuted;
    sounds.setMuted(next);
    setIsMuted(next);
    if (!next) sounds.playClick();
  };

  const subjectInfo = activeSubject ? ALL_SUBJECTS[activeSubject] : null;
  const context = resolveEducationalContext(profile);
  const activeK = getKingdom((profile.activeKingdom as KingdomId) || context.kingdomId);
  const activeC = getClass((profile.activeClass as ClassId) || context.classId);

  return (
    <header className="w-full z-40 bg-[#070911]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between select-none">
      {/* Brand Title / Logo */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          sounds.playClick();
          onNavigate('HOME');
        }}
        className="flex items-center gap-2.5 cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-sky-400 border border-cyan-300/60 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.5)] group-hover:scale-105 transition-transform">
          <Sparkles className="w-4 h-4 text-white fill-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-cinzel font-bold text-sm tracking-widest text-slate-100 group-hover:text-cyan-300 transition-colors">
            ALGO-SPIRE
          </span>
          <span className="text-[9px] font-mono-code text-cyan-400/80 tracking-tight">
            MASTER KNOWLEDGE
          </span>
        </div>
      </div>

      {/* Active Educational Hierarchy Breadcrumb Pill */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          sounds.playClick();
          onNavigate('EDUCATION_SELECT');
        }}
        className="hidden sm:flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/60 hover:border-purple-500/50 px-3 py-1 rounded-full text-xs cursor-pointer transition-all shadow-sm group"
        title="Click to change Kingdom or Academic Rank"
      >
        <GraduationCap className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
        <span className="font-cinzel text-slate-300 text-[11px] font-semibold">
          {activeK?.name || 'Kingdom'}
        </span>
        <span className="text-slate-500 text-[10px]">›</span>
        <span className="font-mono-code font-bold text-purple-300 text-[11px]">
          {activeC?.name || 'Class'}
        </span>
        {subjectInfo && (
          <>
            <span className="text-slate-500 text-[10px]">›</span>
            <span
              className="font-cinzel font-bold text-[11px]"
              style={{ color: subjectInfo.accentColor }}
            >
              {subjectInfo.realmName}
            </span>
          </>
        )}
      </div>

      {/* Center Navigation Links (Hidden on small mobile) */}
      <nav className="hidden md:flex items-center gap-1.5 text-xs font-cinzel font-semibold text-slate-300">
        <button
          onClick={() => { sounds.playClick(); onNavigate('EDUCATION_SELECT'); }}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
            currentScreen === 'EDUCATION_SELECT'
              ? 'bg-purple-950/80 text-purple-300 border border-purple-500/40'
              : 'hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          Kingdom
        </button>
        <button
          onClick={() => { sounds.playClick(); onNavigate('SUBJECT_SELECT'); }}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
            currentScreen === 'SUBJECT_SELECT'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
              : 'hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          Realms
        </button>
        <button
          onClick={() => { sounds.playClick(); onNavigate('DECK'); }}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
            currentScreen === 'DECK'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
              : 'hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          Cards
        </button>
        <button
          onClick={() => { sounds.playClick(); onNavigate('PROFILE'); }}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
            currentScreen === 'PROFILE'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
              : 'hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Profile
        </button>
      </nav>

      {/* Right Controls: Level/XP, Judge Demo Shortcut, Audio */}
      <div className="flex items-center gap-2.5">
        {/* Judge Demo Run Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onLaunchJudgeDemo();
          }}
          className="btn-fantasy-gold px-2.5 sm:px-3 py-1 rounded-lg text-[11px] font-cinzel font-bold text-slate-950 flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
          title="Launch deterministic 5-minute Judge Demo encounter"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Judge Demo</span>
        </button>

        {/* Player Level Pill */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigate('PROFILE')}
          className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded-lg text-xs cursor-pointer hover:border-cyan-500/50 transition-colors"
        >
          <span className="text-[10px] font-mono-code text-cyan-400">LV.{profile.level}</span>
          <div className="w-12 bg-slate-950 h-1.5 rounded-full overflow-hidden hidden sm:block">
            <div
              className="bg-cyan-400 h-full rounded-full"
              style={{ width: `${Math.min(100, (profile.xp / profile.xpToNextLevel) * 100)}%` }}
            />
          </div>
        </div>

        {/* Audio Mute Toggle */}
        <button
          onClick={toggleSound}
          className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg hover:bg-slate-800/60 transition-colors"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
