import React from 'react';
import { SubjectId } from '../types/game';
import { ALL_SUBJECTS } from '../curriculum/registry';
import { PlayerProfile } from '../types/telemetry';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { StorageManager } from '../persistence/StorageManager';
import { MasteryCompressionEngine } from '../engine/MasteryCompressionEngine';
import { Crown, Swords, CheckCircle2, Lock, BookOpen, ArrowLeft, Sparkles, Layers, ShieldCheck } from 'lucide-react';
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
  const clearedLevels = profile.clearedLevels[subject] || [];
  const clearedTrials = profile.clearedHiddenTrials?.[subject] || [];
  const bossAccess = MasteryCompressionEngine.canAccessFinalBoss(subject, profile);

  const mainLevels = subjectInfo.levels.filter(lvl => lvl.pathType !== 'hidden_trial');
  const hiddenTrials = subjectInfo.levels.filter(lvl => lvl.pathType === 'hidden_trial');

  const handleLevelClick = (levelIdentifier: number | string, levelNumber: number) => {
    if (StorageManager.isLevelUnlocked(subject, levelIdentifier)) {
      sounds.playClick();
      onSelectLevel(levelNumber);
    }
  };

  return (
    <div className="relative min-h-[calc(100dvh-54px)] p-4 sm:p-8 flex flex-col items-center select-none overflow-y-auto">
      <ParticleCanvas color={subjectInfo.themeColor} count={35} />

      {/* Realm Banner Header */}
      <div className="z-10 text-center max-w-2xl mb-6">
        <span
          className="text-xs font-mono-code font-bold uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm"
          style={{
            backgroundColor: `${subjectInfo.themeColor}1a`,
            borderColor: subjectInfo.themeColor,
            color: subjectInfo.accentColor,
          }}
        >
          {subjectInfo.name} Expedition
        </span>

        <h2 className="font-cinzel-dec font-bold text-3xl sm:text-4xl text-slate-100 tracking-wide mt-2">
          {subjectInfo.realmName}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Choose between gradual progression along the Meridian or dense mastery compression in the Crucible.
        </p>

        <div className="flex items-center justify-center gap-3 mt-3">
          <button
            onClick={() => { sounds.playClick(); onOpenStory(); }}
            className="glass-panel px-3 py-1.5 rounded-lg text-xs font-cinzel font-semibold text-cyan-300 hover:text-white flex items-center gap-1.5 border border-cyan-500/40"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Realm Lore & Cards
          </button>
        </div>
      </div>

      {/* Dual Progression Paths Grid */}
      <div className="z-10 w-full max-w-5xl my-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* ROUTE 1: THE GRAND MERIDIAN (MAIN PATH) */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-700/80 shadow-xl flex flex-col gap-5 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
                <Layers className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-cinzel font-bold text-sm sm:text-base text-slate-100">
                  THE GRAND MERIDIAN
                </h3>
                <p className="text-[11px] text-slate-400 font-mono-code">
                  Main Path • Progressive Single-Concept Mastery
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono-code text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-700/50">
              4 STAGES + BOSS
            </span>
          </div>

          <div className="flex flex-col gap-3.5 relative">
            {mainLevels.map((lvl) => {
              const isCleared = clearedLevels.includes(lvl.levelNumber);
              const isUnlocked = StorageManager.isLevelUnlocked(subject, lvl.levelNumber);
              const isBoss = lvl.isBoss;

              let nodeStyle = 'border-slate-800 bg-slate-900/60 text-slate-500 opacity-60 cursor-not-allowed';
              if (isCleared) {
                nodeStyle = 'border-emerald-500/70 bg-emerald-950/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer hover:scale-[1.02]';
              } else if (isUnlocked) {
                nodeStyle = isBoss
                  ? 'border-rose-500 bg-rose-950/80 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.5)] animate-pulse cursor-pointer hover:scale-[1.02]'
                  : 'border-cyan-400 bg-cyan-950/70 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.4)] animate-pulse cursor-pointer hover:scale-[1.02]';
              }

              return (
                <div
                  key={lvl.id}
                  role="button"
                  tabIndex={isUnlocked ? 0 : -1}
                  onClick={() => handleLevelClick(lvl.id, lvl.levelNumber)}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleLevelClick(lvl.id, lvl.levelNumber)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all duration-200 ${nodeStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-cinzel font-bold text-base border border-current">
                      {isBoss ? (
                        <Crown className="w-5 h-5 fill-current" />
                      ) : isCleared ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isUnlocked ? (
                        <Swords className="w-5 h-5" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono-code uppercase tracking-wider text-slate-400">
                          {isBoss ? 'FINAL REALM BOSS' : `STAGE ${lvl.levelNumber}`}
                        </span>
                        {isCleared && (
                          <span className="text-[9px] font-mono-code text-emerald-400 bg-emerald-950/90 px-1.5 py-0.2 rounded border border-emerald-500/40">
                            MASTERED
                          </span>
                        )}
                        {!isCleared && isUnlocked && (
                          <span className="text-[9px] font-mono-code text-cyan-300 bg-cyan-950/90 px-1.5 py-0.2 rounded border border-cyan-500/40">
                            READY
                          </span>
                        )}
                      </div>
                      <h4 className="font-cinzel font-bold text-sm text-slate-100">
                        {lvl.title}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono-code">
                        {lvl.topic}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    {isUnlocked && (
                      <span className="btn-fantasy-primary px-3 py-1 rounded-lg text-xs font-cinzel font-bold text-white shadow-sm">
                        {isCleared ? 'Replay' : 'Engage'} →
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ROUTE 2: THE CRUCIBLE OF COMPRESSION (HIDDEN PATH) */}
        <div className="glass-panel-accent p-5 sm:p-6 rounded-3xl border-2 border-purple-500/50 shadow-2xl flex flex-col gap-5 relative overflow-hidden bg-gradient-to-b from-[#140b22]/90 via-[#0d0718]/90 to-[#07030e]/95">
          <div className="flex items-center justify-between border-b border-purple-900/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-950/90 border border-purple-400/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-cinzel font-bold text-sm sm:text-base text-purple-200">
                    THE CRUCIBLE OF COMPRESSION
                  </h3>
                  <span className="text-[9px] font-mono-code text-amber-300 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-500/40">
                    COMPRESSION ROUTE
                  </span>
                </div>
                <p className="text-[11px] text-purple-300/80 font-mono-code">
                  Denser Multi-Concept Trials • Early Boss Access
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono-code text-purple-300 bg-purple-950/70 px-2 py-0.5 rounded border border-purple-500/50">
              2 TRIALS → BOSS
            </span>
          </div>

          <div className="bg-purple-950/40 p-3 rounded-2xl border border-purple-900/50 text-[11px] text-purple-200/90 leading-relaxed font-sans">
            <span className="font-bold text-amber-300">Mastery Compression:</span> Prove that you can synthesize multiple curriculum concepts together under pressure. Conquering both trials earns direct access to the Archon Boss without skipping learning!
          </div>

          <div className="flex flex-col gap-3.5 relative">
            {hiddenTrials.map((trial) => {
              const isCleared = clearedTrials.includes(trial.id);
              const isUnlocked = StorageManager.isLevelUnlocked(subject, trial.id);

              let nodeStyle = 'border-purple-950/80 bg-purple-950/20 text-purple-400/40 opacity-60 cursor-not-allowed';
              if (isCleared) {
                nodeStyle = 'border-emerald-500/80 bg-emerald-950/60 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer hover:scale-[1.02]';
              } else if (isUnlocked) {
                nodeStyle = 'border-purple-400 bg-purple-950/80 text-purple-200 shadow-[0_0_25px_rgba(168,85,247,0.6)] animate-pulse cursor-pointer hover:scale-[1.02]';
              }

              const conceptLabels = (trial.compressedConcepts || []).map(c => 
                c.replace('math_', '').replace('cs_', '').replace('_', ' ').toUpperCase()
              ).join(' + ');

              return (
                <div
                  key={trial.id}
                  role="button"
                  tabIndex={isUnlocked ? 0 : -1}
                  onClick={() => handleLevelClick(trial.id, trial.levelNumber)}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleLevelClick(trial.id, trial.levelNumber)}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all duration-200 ${nodeStyle}`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center font-cinzel font-bold text-base border border-current bg-purple-950/60 shadow-inner">
                      {isCleared ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : isUnlocked ? (
                        <Swords className="w-5 h-5 text-purple-300" />
                      ) : (
                        <Lock className="w-4 h-4 text-purple-500/50" />
                      )}
                    </div>

                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono-code uppercase tracking-wider text-amber-300 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-500/30">
                          COMPRESSED MASTERY
                        </span>
                        {isCleared && (
                          <span className="text-[9px] font-mono-code text-emerald-400 bg-emerald-950/90 px-1.5 py-0.2 rounded border border-emerald-500/40">
                            PROVEN
                          </span>
                        )}
                        {!isCleared && isUnlocked && (
                          <span className="text-[9px] font-mono-code text-purple-200 bg-purple-950/90 px-1.5 py-0.2 rounded border border-purple-400/50">
                            READY TO TEST
                          </span>
                        )}
                      </div>

                      <h4 className="font-cinzel font-bold text-sm sm:text-base text-slate-100 mt-0.5">
                        {trial.title}
                      </h4>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-purple-300 font-mono-code bg-purple-900/40 px-2 py-0.5 rounded border border-purple-500/30">
                          Combined: {conceptLabels}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    {isUnlocked && (
                      <span className="btn-fantasy-void px-3.5 py-1.5 rounded-xl text-xs font-cinzel font-bold text-white shadow-md">
                        {isCleared ? 'Replay' : 'Enter Trial'} →
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Direct Boss Unlock Status Indicator */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className={`w-5 h-5 ${bossAccess.allowed ? 'text-emerald-400' : 'text-slate-500'}`} />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-mono-code text-slate-400 uppercase">
                  Archon Boss Access Status
                </span>
                <span className="text-xs font-bold font-cinzel text-slate-200">
                  {bossAccess.allowed
                    ? (bossAccess.route === 'compressed' ? 'Unlocked via Compression Route!' : 'Unlocked via Meridian Stage 4!')
                    : 'Locked: Requires Meridian Stage 4 OR Compression Trial 2'}
                </span>
              </div>
            </div>
            {bossAccess.allowed && (
              <button
                onClick={() => {
                  const bossLevel = mainLevels.find(l => l.isBoss);
                  if (bossLevel) handleLevelClick(bossLevel.id, bossLevel.levelNumber);
                }}
                className="btn-fantasy-primary px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold text-white"
              >
                Face Boss →
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Back to Subject Select */}
      <div className="z-10 mt-auto pb-4">
        <button
          onClick={() => { sounds.playClick(); onBackToSubjects(); }}
          className="px-4 py-2 rounded-xl glass-panel text-xs font-cinzel text-slate-300 hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Choose Another Realm
        </button>
      </div>
    </div>
  );
};
