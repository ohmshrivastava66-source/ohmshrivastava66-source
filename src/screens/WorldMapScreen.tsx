import React from 'react';
import { SubjectId, KingdomId, ClassId } from '../types/game';
import { ALL_SUBJECTS } from '../curriculum/registry';
import {
  getKingdom,
  getClass,
  resolveEducationalContext,
} from '../curriculum/educationHierarchy';
import { PlayerProfile } from '../types/telemetry';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { StorageManager } from '../persistence/StorageManager';
import { MasteryCompressionEngine } from '../engine/MasteryCompressionEngine';
import {
  Crown,
  Swords,
  CheckCircle2,
  Lock,
  BookOpen,
  ArrowLeft,
  Sparkles,
  Layers,
  ShieldCheck,
  Star,
  Award,
} from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface WorldMapScreenProps {
  subject: SubjectId;
  profile: PlayerProfile;
  onSelectLevel: (levelNumber: number) => void;
  onOpenStory: () => void;
  onBackToSubjects: () => void;
}

export const WorldMapScreen: React.FC<WorldMapScreenProps> = ({
  subject,
  profile,
  onSelectLevel,
  onOpenStory,
  onBackToSubjects,
}) => {
  const subjectInfo = ALL_SUBJECTS[subject];
  const context = resolveEducationalContext(profile);
  const activeK = getKingdom((profile.activeKingdom as KingdomId) || context.kingdomId);
  const activeC = getClass((profile.activeClass as ClassId) || context.classId);
  const ctxProgress = StorageManager.getContextProgress(profile, activeK?.id, activeC?.id, subject);
  const clearedLevels = ctxProgress.clearedLevels;
  const clearedTrials = ctxProgress.clearedHiddenTrials;
  const bossAccess = MasteryCompressionEngine.canAccessFinalBoss(subject, profile);

  const mainLevels = subjectInfo.levels.filter(lvl => lvl.pathType !== 'hidden_trial');
  const hiddenTrials = subjectInfo.levels.filter(lvl => lvl.pathType === 'hidden_trial');

  const isDSA = subject === 'data_structures_algorithms';
  const showCrucible = hiddenTrials.length > 0 && (!isDSA || !!profile.dsaHiddenPathDiscovered);

  const progressPercent = Math.round(
    (clearedLevels.length / Math.max(1, mainLevels.length)) * 100
  );

  const handleLevelClick = (levelIdentifier: number | string, levelNumber: number) => {
    if (StorageManager.isLevelUnlocked(subject, levelIdentifier, profile, activeC?.id, activeK?.id)) {
      sounds.playClick();
      onSelectLevel(levelNumber);
    }
  };

  return (
    <div className="relative min-h-[calc(100dvh-54px)] p-3 sm:p-8 flex flex-col items-center select-none overflow-y-auto bg-slate-950">
      <ParticleCanvas color={subjectInfo.themeColor} count={35} />

      {/* TOP HEADER: REALM BANNER & PROGRESS HUD */}
      <header className="z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
        {/* Left: Realm Identity */}
        <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-mono-code font-bold uppercase tracking-widest px-3 py-0.5 rounded-full border shadow-sm"
              style={{
                backgroundColor: `${subjectInfo.themeColor}1a`,
                borderColor: subjectInfo.themeColor,
                color: subjectInfo.accentColor,
              }}
            >
              {activeK?.name} • {activeC?.name} • {subjectInfo.name} Expedition
            </span>
          </div>

          <h2 className="font-cinzel-dec font-extrabold text-2xl sm:text-4xl text-slate-100 tracking-wide mt-1.5 drop-shadow-md">
            {subjectInfo.realmName}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 max-w-md">
            Advance along the Grand Meridian or demonstrate multi-concept synthesis in the Crucible.
          </p>

          <div className="flex items-center gap-2 mt-2.5">
            <button
              onClick={() => {
                sounds.playClick();
                onOpenStory();
              }}
              className="glass-panel px-3 py-1.5 rounded-xl text-xs font-cinzel font-bold text-cyan-300 hover:text-white flex items-center gap-1.5 border border-cyan-500/40 shadow-sm transition-all min-h-[36px]"
              aria-label="View Realm Lore"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Realm Lore & Cards
            </button>
          </div>
        </div>

        {/* Right: World Progress & Rewards Card (Matching Concept Art HUD) */}
        <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-col gap-2.5 w-full sm:w-auto min-w-[280px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-cinzel font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-yellow-400" />
              World Progress
            </span>
            <span className="text-xs font-mono-code font-bold text-cyan-300">
              {clearedLevels.length} / {mainLevels.length} Levels ({progressPercent}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700/60">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Next Rewards Line */}
          <div className="flex items-center justify-between text-[11px] font-mono-code text-slate-400 border-t border-slate-800/80 pt-1.5">
            <span className="flex items-center gap-1 text-slate-300 font-semibold">
              <Award className="w-3 h-3 text-amber-400" /> Next Rewards:
            </span>
            <span className="text-amber-300 font-bold">+120 XP • Relic Shard</span>
          </div>
        </div>
      </header>

      {/* DUAL PROGRESSION PATHS: GRAND MERIDIAN & CRUCIBLE */}
      <main className="z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start my-auto">
        {/* ROUTE 1: THE GRAND MERIDIAN (MAIN PATH - 7 or 12 COLS) */}
        <section
          className={`${showCrucible ? 'lg:col-span-7' : 'lg:col-span-12'} glass-panel p-5 sm:p-6 rounded-3xl border border-slate-700/80 shadow-2xl flex flex-col gap-4 relative overflow-hidden`}
          aria-label="Grand Meridian Progressive Path"
        >
          <div className="flex items-center justify-between border-b border-slate-800/90 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-sm">
                <Layers className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-cinzel font-bold text-sm sm:text-base text-slate-100">
                  THE GRAND MERIDIAN
                </h3>
                <p className="text-[10px] text-slate-400 font-mono-code">
                  Main Path • Progressive Step-by-Step Mastery
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono-code text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-700/50 font-bold">
              {mainLevels.length} STAGES
            </span>
          </div>

          {/* Connected Winding Node Trail */}
          <div className="flex flex-col gap-3 relative pt-1">
            {mainLevels.map((lvl, index) => {
              const isCleared = clearedLevels.includes(lvl.levelNumber);
              const isUnlocked = StorageManager.isLevelUnlocked(subject, lvl.id, profile, activeC?.id, activeK?.id);
              const isBoss = lvl.isBoss;
              const isCurrent = isUnlocked && !isCleared;

              let nodeBorder = 'border-slate-800 bg-slate-900/60 text-slate-500 opacity-60 cursor-not-allowed';
              if (isCleared) {
                nodeBorder =
                  'border-emerald-500/70 bg-gradient-to-r from-emerald-950/70 to-slate-900/80 text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.3)] cursor-pointer hover:scale-[1.02]';
              } else if (isCurrent) {
                nodeBorder = isBoss
                  ? 'border-rose-500 bg-gradient-to-r from-rose-950/80 to-slate-900/90 text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.6)] animate-pulse cursor-pointer hover:scale-[1.02]'
                  : 'border-cyan-400 bg-gradient-to-r from-cyan-950/80 to-slate-900/90 text-cyan-100 shadow-[0_0_25px_rgba(6,182,212,0.5)] animate-pulse cursor-pointer hover:scale-[1.02]';
              }

              return (
                <div
                  key={lvl.id}
                  role="button"
                  tabIndex={isUnlocked ? 0 : -1}
                  onClick={() => handleLevelClick(lvl.id, lvl.levelNumber)}
                  onKeyDown={e =>
                    (e.key === 'Enter' || e.key === ' ') &&
                    handleLevelClick(lvl.id, lvl.levelNumber)
                  }
                  className={`relative p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between gap-3 min-h-[48px] ${nodeBorder}`}
                  aria-label={`${lvl.title} ${isCleared ? 'Cleared' : isUnlocked ? 'Unlocked' : 'Locked'}`}
                >
                  {/* Left Node Badge & Details */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-cinzel font-bold text-xs shrink-0 shadow-inner ${
                        isCleared
                          ? 'bg-emerald-900/80 border border-emerald-400 text-emerald-300'
                          : isBoss
                          ? 'bg-rose-950/90 border border-rose-400 text-rose-300'
                          : isCurrent
                          ? 'bg-cyan-950/90 border border-cyan-400 text-cyan-200'
                          : 'bg-slate-900 border border-slate-700 text-slate-500'
                      }`}
                    >
                      {isCleared ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isBoss ? (
                        <Crown className="w-4 h-4 text-rose-400" />
                      ) : !isUnlocked ? (
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        lvl.levelNumber
                      )}
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-cinzel font-bold text-xs sm:text-sm text-slate-100">
                          {lvl.title}
                        </span>
                        {isBoss && (
                          <span className="text-[9px] font-mono-code font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-950 border border-rose-600 text-rose-300">
                            SOVEREIGN
                          </span>
                        )}
                        {isCurrent && !isBoss && (
                          <span className="text-[9px] font-mono-code font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-600 text-cyan-300">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-sans">
                        {lvl.topic}
                      </span>
                    </div>
                  </div>

                  {/* Right Status Indicator */}
                  <div className="shrink-0">
                    {isCleared ? (
                      <span className="text-[10px] font-mono-code font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700">
                        CLEARED
                      </span>
                    ) : isUnlocked ? (
                      <button
                        tabIndex={-1}
                        className="btn-fantasy-primary px-3 py-1.5 rounded-xl text-xs font-cinzel font-bold text-white flex items-center gap-1 shadow-sm"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        Enter
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono-code text-slate-500 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                        LOCKED
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ROUTE 2: CRUCIBLE OF COMPRESSION (HIDDEN PATH - 5 COLS) */}
        {showCrucible && (
          <section
            className="lg:col-span-5 glass-panel p-5 sm:p-6 rounded-3xl border border-purple-500/50 shadow-2xl flex flex-col gap-4 relative overflow-hidden bg-gradient-to-b from-purple-950/20 via-slate-950 to-slate-950"
            aria-label="Crucible of Compression Hidden Path"
          >
            <div className="flex items-center justify-between border-b border-purple-500/30 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-purple-950/90 border border-purple-500/50 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-cinzel font-bold text-sm sm:text-base text-purple-100">
                    CRUCIBLE OF COMPRESSION
                  </h3>
                  <p className="text-[10px] text-purple-300 font-mono-code">
                    Hidden Path • Multi-Concept Synthesis
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono-code text-purple-300 bg-purple-950/70 px-2 py-0.5 rounded-full border border-purple-700/60 font-bold">
                {hiddenTrials.length} DENSE TRIALS
              </span>
            </div>

            <p className="text-xs text-slate-300 italic leading-relaxed">
              Prove multi-concept mastery simultaneously to unlock the Sovereign encounter directly.
            </p>

            <div className="flex flex-col gap-3">
              {hiddenTrials.map((trial, index) => {
                const isCleared = clearedTrials.includes(trial.id);
                const isUnlocked = StorageManager.isLevelUnlocked(subject, trial.id, profile, activeC?.id, activeK?.id);

                let cardStyle =
                  'border-slate-800 bg-slate-900/50 text-slate-500 opacity-60 cursor-not-allowed';
                if (isCleared) {
                  cardStyle =
                    'border-emerald-500/70 bg-gradient-to-r from-emerald-950/70 to-slate-900/80 text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.3)] cursor-pointer hover:scale-[1.02]';
                } else if (isUnlocked) {
                  cardStyle =
                    'border-purple-500 bg-gradient-to-r from-purple-950/80 to-slate-900/90 text-purple-100 shadow-[0_0_22px_rgba(168,85,247,0.5)] animate-pulse cursor-pointer hover:scale-[1.02]';
                }

                return (
                  <div
                    key={trial.id}
                    role="button"
                    tabIndex={isUnlocked ? 0 : -1}
                    onClick={() => handleLevelClick(trial.id, trial.levelNumber)}
                    onKeyDown={e =>
                      (e.key === 'Enter' || e.key === ' ') &&
                      handleLevelClick(trial.id, trial.levelNumber)
                    }
                    className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col gap-2 min-h-[48px] ${cardStyle}`}
                    aria-label={`${trial.title} ${isCleared ? 'Cleared' : isUnlocked ? 'Unlocked' : 'Locked'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-cinzel font-bold text-xs ${
                            isCleared
                              ? 'bg-emerald-900 border border-emerald-400 text-emerald-300'
                              : isUnlocked
                              ? 'bg-purple-900 border border-purple-400 text-purple-200'
                              : 'bg-slate-900 border border-slate-700 text-slate-500'
                          }`}
                        >
                          {isCleared ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : trial.isBoss ? (
                            <Crown className="w-3.5 h-3.5 text-rose-400" />
                          ) : (
                            `T${index + 1}`
                          )}
                        </div>
                        <span className="font-cinzel font-bold text-xs sm:text-sm text-slate-100">
                          {trial.title}
                        </span>
                      </div>

                      {isCleared ? (
                        <span className="text-[10px] font-mono-code font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700">
                          COMPRESSED
                        </span>
                      ) : isUnlocked ? (
                        <span className="text-[10px] font-mono-code font-bold text-purple-300 px-2 py-0.5 rounded bg-purple-950 border border-purple-700">
                          AVAILABLE
                        </span>
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </div>

                    {/* Compressed Concept Badges */}
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(trial.compressedConcepts || []).map((concept, i) => (
                        <span
                          key={i}
                          className="text-[9px] font-mono-code px-2 py-0.5 rounded bg-slate-950/80 border border-purple-700/50 text-purple-300"
                        >
                          {concept.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>

                    <div className="text-[10px] font-mono-code text-amber-300 flex items-center gap-1 border-t border-purple-500/20 pt-1.5 mt-1">
                      <Award className="w-3 h-3 text-amber-400" />
                      Mastery Trial: {trial.topic}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Final Boss Access Status Banner */}
            <div
              className={`p-3 rounded-2xl border text-xs flex items-center justify-between mt-auto ${
                bossAccess.allowed
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <Crown
                  className={`w-4 h-4 ${bossAccess.allowed ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`}
                />
                <span className="font-cinzel font-bold text-xs">Sovereign Gate Access:</span>
              </div>
              <span className="font-mono-code font-bold text-[11px]">
                {bossAccess.allowed
                  ? 'UNLOCKED'
                  : isDSA
                  ? 'LOCKED (Clear Level 53 or 12 Hidden Trials)'
                  : 'LOCKED (Clear Stage 4 or Trials 1+2)'}
              </span>
            </div>
          </section>
        )}
      </main>

      {/* FOOTER ACTION */}
      <footer className="z-10 mt-6 pb-4 flex items-center justify-between w-full max-w-6xl">
        <button
          onClick={() => {
            sounds.playClick();
            onBackToSubjects();
          }}
          className="min-h-[44px] min-w-[44px] px-6 py-2.5 rounded-2xl glass-panel text-xs font-cinzel font-bold text-slate-200 hover:text-white hover:border-cyan-400/60 flex items-center gap-2 transition-all shadow-md active:scale-95"
          aria-label="Return to realm selection"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Realms
        </button>
      </footer>
    </div>
  );
};
