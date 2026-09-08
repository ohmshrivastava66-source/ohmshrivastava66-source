import React from 'react';
import { PlayerProfile } from '../types/telemetry';
import { ALL_SUBJECTS } from '../curriculum/registry';
import { CharacterRenderer } from '../components/CharacterRenderer';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { StorageManager } from '../persistence/StorageManager';
import { User, Award, Shield, Zap, TrendingUp, AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface ProfileScreenProps {
  profile: PlayerProfile;
  onBack: () => void;
  onRefreshProfile: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  onBack,
  onRefreshProfile,
}) => {
  const handleReset = () => {
    if (window.confirm('Reset all demo progression and profile records to default state?')) {
      sounds.playClick();
      StorageManager.resetAllData();
      onRefreshProfile();
    }
  };

  const xpPercent = Math.min(100, Math.round((profile.xp / profile.xpToNextLevel) * 100));

  return (
    <div className="relative min-h-[calc(100dvh-54px)] p-4 sm:p-8 flex flex-col items-center select-none overflow-y-auto">
      <ParticleCanvas color="#06b6d4" count={30} />

      {/* Screen Title */}
      <div className="z-10 text-center max-w-xl mb-6">
        <h2 className="font-cinzel font-bold text-2xl sm:text-3xl text-slate-100 tracking-wide flex items-center justify-center gap-2">
          <User className="w-6 h-6 text-cyan-400" />
          Hunter's Codex & Profile
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Complete persistent record of your cognitive progression, strengths, and realm conquest history.
        </p>
      </div>

      {/* Main RPG Character Sheet Grid */}
      <div className="z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
        {/* Left Column: Hunter Card */}
        <div className="glass-panel p-6 rounded-3xl border border-cyan-500/40 flex flex-col items-center text-center shadow-xl">
          <CharacterRenderer state="idle" size={200} />

          <h3 className="font-cinzel-dec font-bold text-xl text-slate-100 mt-3">
            {profile.name}
          </h3>
          <span className="text-xs font-mono-code text-cyan-400 font-semibold tracking-wider uppercase">
            {profile.title}
          </span>

          {/* Level & XP Bar */}
          <div className="w-full mt-5 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono-code mb-1">
              <span className="text-cyan-300 font-bold">LEVEL {profile.level}</span>
              <span className="text-slate-400">{profile.xp} / {profile.xpToNextLevel} XP</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-500 to-cyan-300 h-full rounded-full transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>

          {/* Active Relics */}
          <div className="w-full mt-4 flex flex-col gap-2 text-left">
            <span className="text-xs font-cinzel font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              Equipped Relics
            </span>
            <div className="flex flex-wrap gap-2">
              {profile.relics.map((relic, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-cyan-500/30 text-[11px] font-mono-code text-cyan-300 flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" /> {relic}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Center & Right Column: Mastery, Strengths, Run History */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* 8-Realm Mastery Bars */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="font-cinzel font-bold text-sm text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-400" />
                Realm Mastery Indices
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
              {Object.values(ALL_SUBJECTS).map(subj => {
                const mastery = profile.subjectMastery[subj.id] || 0;
                return (
                  <div key={subj.id} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-cinzel font-semibold text-slate-200">{subj.name}</span>
                      <span className="font-mono-code font-bold text-cyan-300">{mastery}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${mastery}%`, backgroundColor: subj.themeColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cognitive Strengths & Weaknesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 flex flex-col gap-2">
              <span className="text-xs font-cinzel font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Cognitive Strengths
              </span>
              <ul className="flex flex-col gap-1.5 text-xs text-slate-300">
                {profile.strengths.map((str, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {str}
                  </li>
                ))}
              </ul>
            </div>

            {/* Diagnosed Weaknesses */}
            <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 flex flex-col gap-2">
              <span className="text-xs font-cinzel font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Active Weaknesses (To Fortify)
              </span>
              {profile.weaknesses.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No unrepaired weaknesses active. All concepts aligned!</p>
              ) : (
                <ul className="flex flex-col gap-1.5 text-xs text-slate-300">
                  {profile.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-center gap-2 text-rose-300 font-mono-code">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      {w}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Recent Runs Table */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col gap-3">
            <h4 className="font-cinzel font-bold text-xs text-slate-300 uppercase tracking-wider">
              Recent Expeditions & Run Telemetry
            </h4>

            {profile.runHistory.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No expeditions logged yet. Play an encounter to begin history.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 font-mono-code">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                      <th className="pb-2">DATE</th>
                      <th className="pb-2">REALM</th>
                      <th className="pb-2">LEVEL</th>
                      <th className="pb-2">RESULT</th>
                      <th className="pb-2">SCORE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.runHistory.slice(0, 5).map(run => (
                      <tr key={run.id} className="border-b border-slate-900/60 hover:bg-slate-900/40">
                        <td className="py-2 text-[11px] text-slate-400">{run.date}</td>
                        <td className="py-2 capitalize">{run.subject}</td>
                        <td className="py-2">{run.levelTitle}</td>
                        <td className="py-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              run.result === 'VICTORY'
                                ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/40'
                                : 'text-rose-400 bg-rose-950/60 border border-rose-500/40'
                            }`}
                          >
                            {run.result}
                          </span>
                        </td>
                        <td className="py-2 text-cyan-300">{run.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="z-10 mt-auto pb-4 flex items-center justify-between w-full max-w-5xl">
        <button
          onClick={() => { sounds.playClick(); onBack(); }}
          className="px-5 py-2 rounded-xl glass-panel text-xs font-cinzel font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return
        </button>

        <button
          onClick={handleReset}
          className="px-3 py-1.5 rounded-lg text-xs font-mono-code text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/50 flex items-center gap-1 transition-colors"
          title="Reset profile data for clean judge demo"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Demo Data
        </button>
      </div>
    </div>
  );
};
