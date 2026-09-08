import React, { useState } from 'react';
import { SubjectId } from '../types/game';
import { ALL_SUBJECTS } from '../curriculum/registry';
import { PlayerProfile } from '../types/telemetry';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { StorageManager } from '../persistence/StorageManager';
import { Network, Crown, ArrowLeft, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface KnowledgeMapScreenProps {
  initialSubject?: SubjectId;
  profile: PlayerProfile;
  onBack: () => void;
  onSelectLevel: (subject: SubjectId, levelNumber: number) => void;
}

export const KnowledgeMapScreen: React.FC<KnowledgeMapScreenProps> = ({
  initialSubject = 'mathematics',
  profile,
  onBack,
  onSelectLevel,
}) => {
  const [activeSubject, setActiveSubject] = useState<SubjectId>(initialSubject);
  const subjectInfo = ALL_SUBJECTS[activeSubject];
  const clearedLevels = profile.clearedLevels[activeSubject] || [];

  const handleSelectSubj = (subjId: SubjectId) => {
    sounds.playClick();
    setActiveSubject(subjId);
  };

  return (
    <div className="relative min-h-[calc(100dvh-54px)] p-4 sm:p-8 flex flex-col items-center select-none overflow-y-auto">
      <ParticleCanvas color={subjectInfo.themeColor} count={30} />

      {/* Screen Title */}
      <div className="z-10 text-center max-w-xl mb-4">
        <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-300 mx-auto mb-2 shadow-md">
          <Network className="w-5 h-5" />
        </div>
        <h2 className="font-cinzel font-bold text-2xl sm:text-3xl text-slate-100 tracking-wide">
          Cognitive Knowledge Map
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Visual prerequisite dependencies and concept mastery states across realms.
        </p>
      </div>

      {/* Subject Tabs */}
      <div className="z-10 flex items-center gap-2 mb-6 flex-wrap justify-center max-w-2xl">
        {Object.values(ALL_SUBJECTS).map(subj => {
          const isSelected = activeSubject === subj.id;
          return (
            <button
              key={subj.id}
              onClick={() => handleSelectSubj(subj.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-cinzel font-bold transition-all ${
                isSelected
                  ? 'border text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'glass-panel text-slate-400 hover:text-white'
              }`}
              style={{
                backgroundColor: isSelected ? `${subj.themeColor}33` : undefined,
                borderColor: isSelected ? subj.themeColor : undefined,
              }}
            >
              {subj.name}
            </button>
          );
        })}
      </div>

      {/* Knowledge Nodes Graph */}
      <div className="z-10 w-full max-w-3xl glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-cinzel font-bold text-base text-slate-100">
              {subjectInfo.realmName} Concept Hierarchy
            </h3>
            <span className="text-xs font-mono-code text-cyan-300">
              Total Realm Mastery: {profile.subjectMastery[activeSubject] || 0}%
            </span>
          </div>

          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono-code">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Mastered
            </span>
            <span className="flex items-center gap-1 text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Unlocked
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <span className="w-2 h-2 rounded-full bg-slate-600" /> Locked
            </span>
          </div>
        </div>

        {/* Nodes Flow */}
        <div className="flex flex-col gap-6 py-4 relative">
          {subjectInfo.levels.map((lvl, index) => {
            const isHidden = lvl.pathType === 'hidden_trial';
            const isCleared = isHidden
              ? (profile.clearedHiddenTrials?.[activeSubject] || []).includes(lvl.id)
              : clearedLevels.includes(lvl.levelNumber);
            const isUnlocked = StorageManager.isLevelUnlocked(activeSubject, lvl.id);
            const isBoss = lvl.isBoss;

            let borderStyle = 'border-slate-800 bg-slate-950/60 text-slate-500';
            if (isCleared) {
              borderStyle = 'border-emerald-500/70 bg-emerald-950/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
            } else if (isUnlocked) {
              borderStyle = isBoss
                ? 'border-rose-500/80 bg-rose-950/50 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse'
                : 'border-cyan-400/80 bg-cyan-950/50 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.4)] animate-pulse';
            }

            return (
              <div
                key={lvl.id}
                role="button"
                tabIndex={isUnlocked ? 0 : -1}
                onClick={() => {
                  if (isUnlocked) {
                    sounds.playClick();
                    onSelectLevel(activeSubject, lvl.levelNumber);
                  }
                }}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all duration-200 cursor-pointer ${borderStyle}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-cinzel font-bold border border-current text-sm">
                    {isBoss ? <Crown className="w-5 h-5" /> : index + 1}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono-code uppercase text-slate-400 tracking-wider">
                      Concept Node {lvl.levelNumber} {isBoss && '• ARCHON BOSS'}
                    </span>
                    <h4 className="font-cinzel font-bold text-sm sm:text-base text-slate-100">
                      {lvl.topic}
                    </h4>
                    <span className="text-xs text-slate-300/80 italic">
                      Encounter: {lvl.title}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isCleared ? (
                    <span className="px-2 py-1 rounded bg-emerald-950 border border-emerald-500/40 text-[10px] font-mono-code text-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Mastered
                    </span>
                  ) : isUnlocked ? (
                    <span className="btn-fantasy-primary px-3 py-1 rounded-lg text-xs font-cinzel font-bold text-white">
                      Engage Node →
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono-code text-slate-500">
                      Prerequisite Locked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Back Button */}
      <div className="z-10 mt-auto pb-4">
        <button
          onClick={() => { sounds.playClick(); onBack(); }}
          className="px-5 py-2 rounded-xl glass-panel text-xs font-cinzel font-semibold text-slate-300 hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Citadel
        </button>
      </div>
    </div>
  );
};
