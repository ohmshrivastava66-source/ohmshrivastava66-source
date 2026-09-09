import React, { useState } from 'react';
import { SubjectId, KingdomId, ClassId } from '../types/game';
import { ALL_SUBJECTS, ENCOUNTERS_MAP } from '../curriculum/registry';
import {
  getKingdom,
  getClass,
  getAvailableSubjectsForClass,
  resolveEducationalContext,
} from '../curriculum/educationHierarchy';
import { PlayerProfile } from '../types/telemetry';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { StorageManager } from '../persistence/StorageManager';
import * as Icons from 'lucide-react';
import { sounds } from '../audio/SoundEffects';
import { Compass, Sparkles, ArrowLeft, GraduationCap, X, AlertCircle } from 'lucide-react';

interface SubjectSelectScreenProps {
  profile: PlayerProfile;
  onSelectSubject: (subject: SubjectId) => void;
  onChangeEducationRank?: () => void;
  onBack: () => void;
}

export const SubjectSelectScreen: React.FC<SubjectSelectScreenProps> = ({
  profile,
  onSelectSubject,
  onChangeEducationRank,
  onBack,
}) => {
  const context = resolveEducationalContext(profile);
  const activeKingdomId = (profile.activeKingdom as KingdomId) || context.kingdomId;
  const activeClassId = (profile.activeClass as ClassId) || context.classId;
  const kingdom = getKingdom(activeKingdomId);
  const academicClass = getClass(activeClassId);

  // Future expansion notice modal state
  const [modalSubject, setModalSubject] = useState<string | null>(null);

  // Authoritative class-aware subject filtering
  const allowedSubjectIds = getAvailableSubjectsForClass(activeClassId);
  const subjectsList = allowedSubjectIds
    .map(id => ALL_SUBJECTS[id])
    .filter(Boolean);

  const handleSelect = (subject: SubjectId, isPlayable: boolean) => {
    sounds.playClick();
    if (!isPlayable) {
      setModalSubject(ALL_SUBJECTS[subject]?.name || subject);
      return;
    }
    onSelectSubject(subject);
  };

  return (
    <div className="relative min-h-[calc(100dvh-54px)] p-4 sm:p-8 flex flex-col items-center select-none overflow-y-auto bg-slate-950">
      <ParticleCanvas color="#0ea5e9" count={35} />

      {/* Screen Header with Dynamic Breadcrumb */}
      <header className="z-10 text-center max-w-3xl mb-8">
        {/* Authoritative Hierarchy Breadcrumb */}
        <div className="inline-flex flex-wrap items-center justify-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono-code uppercase tracking-wider mb-3 shadow-md">
          <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold">{kingdom?.name || 'Kingdom'}</span>
          <span className="text-cyan-600">›</span>
          <span className="font-semibold text-white">{academicClass?.name || 'Class'}</span>
          <span className="text-cyan-600">›</span>
          <span className="text-cyan-300">Choose Realm</span>

          {onChangeEducationRank && (
            <button
              onClick={() => { sounds.playClick(); onChangeEducationRank(); }}
              className="ml-2 px-2 py-0.5 rounded bg-cyan-900/60 hover:bg-cyan-800/80 border border-cyan-400/50 text-[10px] text-cyan-200 font-bold hover:text-white transition-colors"
            >
              Change Rank
            </button>
          )}
        </div>

        <h2 className="font-cinzel-dec font-extrabold text-3xl sm:text-4xl text-slate-100 tracking-wide drop-shadow-md">
          {academicClass?.rankTitle ? `${academicClass.rankTitle} — Realms` : 'Curriculum Realms'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl mx-auto">
          {academicClass?.description || 'Select an educational realm aligned with your active academic rank.'}
        </p>
      </header>

      {/* Dynamic Class-Aware Realms Grid */}
      <main className="z-10 w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 pb-8">
        {subjectsList.map(subj => {
          const ctxProgress = StorageManager.getContextProgress(profile, activeKingdomId, activeClassId, subj.id);
          const mastery = ctxProgress.mastery;
          const cleared = ctxProgress.clearedLevels;
          const currentLvl = cleared.length + 1;

          // Check whether encounters actually exist and are playable for this subject
          const encounters = ENCOUNTERS_MAP[subj.id] || [];
          const isClassPlayable = academicClass?.status === 'playable';
          const isPlayable = isClassPlayable && encounters.length > 0;

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
              onClick={() => handleSelect(subj.id, isPlayable)}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleSelect(subj.id, isPlayable)}
              className={`glass-panel group relative rounded-3xl p-5 border transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-2 hover:shadow-[0_20px_35px_rgba(0,0,0,0.9)] overflow-hidden min-h-[44px] ${
                isPlayable
                  ? 'border-slate-700/80 hover:border-cyan-400/90'
                  : 'border-slate-800/60 opacity-80 hover:opacity-100 hover:border-amber-500/50'
              }`}
              aria-label={`Enter ${subj.realmName}`}
            >
              {/* Atmospheric Radial Flare */}
              <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none"
                style={{ backgroundColor: subj.themeColor }}
              />

              <div>
                {/* Top Bar with Icon & Status / Mastery */}
                <div className="flex items-center justify-between mb-3.5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300 border border-white/20"
                    style={{
                      backgroundColor: `${subj.themeColor}cc`,
                      boxShadow: `0 0 20px ${subj.themeColor}50`,
                    }}
                  >
                    <IconComp className="w-6 h-6 drop-shadow-sm" />
                  </div>

                  <div className="flex flex-col items-end">
                    {isPlayable ? (
                      <>
                        <span className="text-[9px] font-mono-code text-slate-400 uppercase tracking-widest font-semibold">
                          Mastery
                        </span>
                        <span
                          className="font-mono-code text-xs font-bold"
                          style={{ color: subj.accentColor }}
                        >
                          {mastery}%
                        </span>
                      </>
                    ) : (
                      <span className="text-[9px] font-mono-code px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 font-semibold">
                        In Forging
                      </span>
                    )}
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

              {/* Bottom Status & Portal Link */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                {isPlayable ? (
                  <>
                    <span className="text-[11px] font-mono-code text-slate-400">
                      Tier: Level {currentLvl}
                    </span>
                    <span
                      className="font-cinzel font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                      style={{ color: subj.accentColor }}
                    >
                      <Sparkles className="w-3 h-3" /> Enter →
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-mono-code text-amber-400/80">
                      Uncharted Realm
                    </span>
                    <span className="text-xs font-cinzel font-bold text-slate-400 group-hover:text-amber-300 transition-colors">
                      Inspect →
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </main>

      {/* Future Expansion Modal / Notice */}
      {modalSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-amber-500/50 shadow-2xl relative">
            <button
              onClick={() => setModalSubject(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-900 border border-slate-700 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-300">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-cinzel font-bold text-base text-slate-100">
                  Uncharted Realm: {modalSubject}
                </h3>
                <span className="text-[11px] font-mono-code text-amber-400">
                  Curriculum In Forging
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mt-2">
              The scholars of the <strong className="text-white">{kingdom?.name}</strong> are currently transcribing and validating the curriculum for <strong className="text-white">{modalSubject}</strong> for academic rank <strong className="text-white">{academicClass?.name}</strong>.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed mt-2">
              The educational hierarchy strictly prevents fabricated or placeholder questions. Playable encounters will be unlocked as official curricula are completed.
            </p>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setModalSubject(null)}
                className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-xs font-cinzel font-bold text-amber-200 hover:bg-amber-500/30 transition-colors"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Return Action */}
      <footer className="z-10 mt-auto pb-4 flex items-center justify-between w-full max-w-6xl">
        <button
          onClick={() => {
            sounds.playClick();
            onBack();
          }}
          className="min-h-[44px] min-w-[44px] px-6 py-2.5 rounded-2xl glass-panel text-xs font-cinzel font-bold text-slate-200 hover:text-white hover:border-cyan-400/60 flex items-center gap-2 transition-all shadow-md active:scale-95"
          aria-label="Return to previous screen"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Citadel
        </button>

        {onChangeEducationRank && (
          <button
            onClick={() => {
              sounds.playClick();
              onChangeEducationRank();
            }}
            className="min-h-[44px] px-5 py-2.5 rounded-2xl glass-panel text-xs font-cinzel font-bold text-cyan-300 hover:text-white hover:border-cyan-400/60 flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            <GraduationCap className="w-4 h-4" /> Change Kingdom / Class
          </button>
        )}
      </footer>
    </div>
  );
};
