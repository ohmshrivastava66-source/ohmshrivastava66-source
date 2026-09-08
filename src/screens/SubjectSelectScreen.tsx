import React from 'react';
import { SubjectId } from '../types/game';
import { ALL_SUBJECTS } from '../curriculum/registry';
import { PlayerProfile } from '../types/telemetry';
import { ParticleCanvas } from '../components/ParticleCanvas';
import * as Icons from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface SubjectSelectScreenProps {
  profile: PlayerProfile;
  onSelectSubject: (subject: SubjectId) => void;
  onBack: () => void;
}

export const SubjectSelectScreen: React.FC<SubjectSelectScreenProps> = ({
  profile,
  onSelectSubject,
  onBack,
}) => {
  const subjectsList = Object.values(ALL_SUBJECTS);

  const handleSelect = (subject: SubjectId) => {
    sounds.playClick();
    onSelectSubject(subject);
  };

  return (
    <div className="relative min-h-[calc(100dvh-54px)] p-4 sm:p-8 flex flex-col items-center select-none overflow-y-auto">
      <ParticleCanvas color="#0ea5e9" count={35} />

      {/* Screen Header */}
      <div className="z-10 text-center max-w-xl mb-6">
        <h2 className="font-cinzel font-bold text-2xl sm:text-3xl text-slate-100 tracking-wide">
          Choose Your Realm
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          All eight subject worlds are independently accessible. Your cognitive journey begins wherever you choose.
        </p>
      </div>

      {/* 8-World Grid */}
      <div className="z-10 w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-8">
        {subjectsList.map(subj => {
          const mastery = profile.subjectMastery[subj.id] || 0;
          const cleared = profile.clearedLevels[subj.id] || [];
          const currentLvl = cleared.length + 1;

          // Dynamic icon
          const IconComp = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
            subj.iconName
          ] || Icons.BookOpen;

          return (
            <div
              key={subj.id}
              role="button"
              tabIndex={0}
              onClick={() => handleSelect(subj.id)}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleSelect(subj.id)}
              className="glass-panel group relative rounded-2xl p-4 border border-slate-700/60 hover:border-cyan-400/80 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
            >
              {/* Top Bar with Icon & Mastery */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: subj.themeColor }}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono-code text-slate-400">MASTERY</span>
                    <span className="font-mono-code text-xs font-bold text-cyan-300">
                      {mastery}%
                    </span>
                  </div>
                </div>

                {/* Realm Name & Subject */}
                <h3 className="font-cinzel font-bold text-base text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {subj.realmName}
                </h3>
                <span className="text-[11px] font-mono-code text-slate-400 uppercase tracking-wider">
                  {subj.name}
                </span>

                <p className="text-xs text-slate-300/80 mt-2 line-clamp-2 leading-relaxed">
                  {subj.realmDescription}
                </p>
              </div>

              {/* Bottom Status & Enter button */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-400 font-mono-code text-[11px]">
                  <span>Tier: Level {currentLvl}</span>
                </div>
                <span className="font-cinzel font-bold text-cyan-400 group-hover:text-cyan-200 flex items-center gap-1">
                  Enter Realm →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Back Button */}
      <div className="z-10 mt-auto pb-4">
        <button
          onClick={() => { sounds.playClick(); onBack(); }}
          className="px-5 py-2 rounded-xl glass-panel text-xs font-cinzel font-semibold text-slate-300 hover:text-white transition-colors"
        >
          ← Return to Citadel
        </button>
      </div>
    </div>
  );
};
