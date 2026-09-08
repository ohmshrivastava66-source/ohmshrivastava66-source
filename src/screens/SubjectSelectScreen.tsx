import React from 'react';
import { SubjectId } from '../types/game';
import { ALL_SUBJECTS } from '../curriculum/registry';
import { PlayerProfile } from '../types/telemetry';
import { ParticleCanvas } from '../components/ParticleCanvas';
import * as Icons from 'lucide-react';
import { sounds } from '../audio/SoundEffects';
import { Compass, Sparkles, ArrowLeft } from 'lucide-react';

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
    <div className="relative min-h-[calc(100dvh-54px)] p-4 sm:p-8 flex flex-col items-center select-none overflow-y-auto bg-slate-950">
      <ParticleCanvas color="#0ea5e9" count={35} />

      {/* Screen Header */}
      <header className="z-10 text-center max-w-2xl mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono-code uppercase tracking-widest mb-2 shadow-sm">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          Choose Your World
        </div>

        <h2 className="font-cinzel-dec font-extrabold text-3xl sm:text-4xl text-slate-100 tracking-wide drop-shadow-md">
          The Eight Realms of the Spire
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg mx-auto">
          Explore independent educational realms. Each world features unique curriculum challenges, cards, and legendary Sovereigns.
        </p>
      </header>

      {/* 8-World Grid (Matching Concept Art: Choose Your World) */}
      <main className="z-10 w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pb-8">
        {subjectsList.map(subj => {
          const mastery = profile.subjectMastery[subj.id] || 0;
          const cleared = profile.clearedLevels[subj.id] || [];
          const currentLvl = cleared.length + 1;

          // Dynamic icon
          const IconComp =
            (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
              subj.iconName
            ] || Icons.BookOpen;

          return (
            <div
              key={subj.id}
              role="button"
              tabIndex={0}
              onClick={() => handleSelect(subj.id)}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleSelect(subj.id)}
              className="glass-panel group relative rounded-3xl p-5 border border-slate-700/80 hover:border-cyan-400/90 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-2.5 hover:shadow-[0_20px_35px_rgba(0,0,0,0.9)] overflow-hidden min-h-[44px]"
              aria-label={`Enter ${subj.realmName}`}
            >
              {/* Top Atmospheric Radial Flare */}
              <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 group-hover:opacity-45 transition-opacity duration-300 pointer-events-none"
                style={{ backgroundColor: subj.themeColor }}
              />

              <div>
                {/* Top Bar with Icon & Mastery */}
                <div className="flex items-center justify-between mb-3.5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 border border-white/20"
                    style={{
                      backgroundColor: `${subj.themeColor}cc`,
                      boxShadow: `0 0 20px ${subj.themeColor}60`,
                    }}
                  >
                    <IconComp className="w-6 h-6 drop-shadow-sm" />
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-mono-code text-slate-400 uppercase tracking-widest font-semibold">
                      Mastery
                    </span>
                    <span
                      className="font-mono-code text-xs font-bold"
                      style={{ color: subj.accentColor }}
                    >
                      {mastery}%
                    </span>
                  </div>
                </div>

                {/* Realm Title & Subject Label */}
                <span className="text-[10px] font-mono-code uppercase tracking-widest text-slate-400 block font-semibold">
                  {subj.name}
                </span>
                <h3 className="font-cinzel font-extrabold text-base text-slate-100 group-hover:text-cyan-200 transition-colors mt-0.5">
                  {subj.realmName}
                </h3>

                <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {subj.realmDescription}
                </p>
              </div>

              {/* Bottom Status & Enter Portal Link */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono-code text-slate-400">
                  Tier: Level {currentLvl}
                </span>
                <span
                  className="font-cinzel font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  style={{ color: subj.accentColor }}
                >
                  <Sparkles className="w-3 h-3" /> Enter →
                </span>
              </div>
            </div>
          );
        })}
      </main>

      {/* Footer Return Action */}
      <footer className="z-10 mt-auto pb-4 flex items-center justify-start w-full max-w-6xl">
        <button
          onClick={() => {
            sounds.playClick();
            onBack();
          }}
          className="min-h-[44px] min-w-[44px] px-6 py-2.5 rounded-2xl glass-panel text-xs font-cinzel font-bold text-slate-200 hover:text-white hover:border-cyan-400/60 flex items-center gap-2 transition-all shadow-md active:scale-95"
          aria-label="Return to previous screen"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Spire
        </button>
      </footer>
    </div>
  );
};
