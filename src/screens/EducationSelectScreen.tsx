import React from 'react';
import { EDUCATION_TIERS } from '../curriculum/registry';
import { PlayerProfile } from '../types/telemetry';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { GraduationCap, CheckCircle2 } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface EducationSelectScreenProps {
  profile: PlayerProfile;
  onSelectTier: (tierId: string) => void;
  onBack: () => void;
}

export const EducationSelectScreen: React.FC<EducationSelectScreenProps> = ({
  profile,
  onSelectTier,
  onBack,
}) => {
  const handleSelect = (tierId: string) => {
    sounds.playClick();
    onSelectTier(tierId);
  };

  return (
    <div className="relative min-h-[calc(100dvh-54px)] p-4 sm:p-8 flex flex-col items-center select-none overflow-y-auto">
      <ParticleCanvas color="#a855f7" count={30} />

      <div className="z-10 text-center max-w-xl mb-6">
        <div className="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-500/50 flex items-center justify-center text-purple-300 mx-auto mb-3 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h2 className="font-cinzel font-bold text-2xl sm:text-3xl text-slate-100 tracking-wide">
          Education Level & Curriculum Tier
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Algo-Spire scales academic complexity to match your educational grade while preserving the dark-fantasy game loop.
        </p>
      </div>

      <div className="z-10 w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
        {EDUCATION_TIERS.map(tier => {
          const isSelected = profile.activeEducationLevel === tier.id;
          return (
            <div
              key={tier.id}
              role="button"
              tabIndex={0}
              onClick={() => handleSelect(tier.id)}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleSelect(tier.id)}
              className={`glass-panel p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-purple-400 bg-purple-950/40 shadow-[0_0_25px_rgba(168,85,247,0.4)] ring-1 ring-purple-400'
                  : 'border-slate-800 hover:border-slate-600 hover:bg-slate-900/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-code text-purple-300 font-bold uppercase tracking-wider">
                    {tier.sublabel}
                  </span>
                  <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                    {tier.badge}
                  </span>
                </div>
                <h3 className="font-cinzel font-bold text-base text-slate-100 mt-1.5">
                  {tier.label}
                </h3>
                <p className="text-xs text-slate-300/80 mt-1.5 leading-relaxed">
                  {tier.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-cinzel text-slate-400">
                  {isSelected ? 'Active Tier' : 'Click to Activate'}
                </span>
                {isSelected ? (
                  <CheckCircle2 className="w-4 h-4 text-purple-400 fill-purple-400/20" />
                ) : (
                  <span className="text-xs font-cinzel font-bold text-cyan-400">Select →</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

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
