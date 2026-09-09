import React, { useState } from 'react';
import { PlayerProfile } from '../types/telemetry';
import { KingdomId, ClassId } from '../types/game';
import {
  getAllKingdoms,
  getKingdom,
  resolveEducationalContext,
  AcademicClass,
} from '../curriculum/educationHierarchy';
import { ALL_SUBJECTS } from '../curriculum/registry';
import { ParticleCanvas } from '../components/ParticleCanvas';
import {
  GraduationCap,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Layers,
} from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface EducationSelectScreenProps {
  profile: PlayerProfile;
  onSelectKingdomAndClass?: (kingdomId: KingdomId, classId: ClassId) => void;
  onSelectTier?: (tierId: string) => void;
  onBack: () => void;
}

export const EducationSelectScreen: React.FC<EducationSelectScreenProps> = ({
  profile,
  onSelectKingdomAndClass,
  onSelectTier,
  onBack,
}) => {
  const context = resolveEducationalContext(profile);
  const currentKingdomId = (profile.activeKingdom as KingdomId) || context.kingdomId;
  const currentClassId = (profile.activeClass as ClassId) || context.classId;

  // Selected kingdom in the UI (defaults to player's current kingdom)
  const [selectedKingdomId, setSelectedKingdomId] = useState<KingdomId>(currentKingdomId);
  // View mode: 'kingdoms' (Step 1) or 'classes' (Step 2)
  const [step, setStep] = useState<'kingdoms' | 'classes'>('kingdoms');

  const kingdoms = getAllKingdoms();
  const selectedKingdom = getKingdom(selectedKingdomId) || kingdoms[2]; // Default to Secondary Bastion

  const handleSelectKingdom = (kingdomId: KingdomId) => {
    sounds.playClick();
    setSelectedKingdomId(kingdomId);
    setStep('classes');
  };

  const handleSelectClass = (cls: AcademicClass) => {
    sounds.playClick();
    if (onSelectKingdomAndClass) {
      onSelectKingdomAndClass(cls.kingdomId, cls.id);
    } else if (onSelectTier) {
      onSelectTier(cls.id);
    }
  };

  return (
    <div className="relative min-h-[calc(100dvh-54px)] p-4 sm:p-8 flex flex-col items-center select-none overflow-y-auto bg-slate-950">
      <ParticleCanvas color="#a855f7" count={30} />

      {/* Screen Header & Breadcrumb */}
      <header className="z-10 text-center max-w-2xl mb-6">
        {/* Breadcrumb Indicator */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-mono-code uppercase tracking-wider mb-3 shadow-md">
          <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
          <button
            onClick={() => { sounds.playClick(); setStep('kingdoms'); }}
            className={`hover:text-white transition-colors ${step === 'kingdoms' ? 'font-bold text-white' : 'underline'}`}
          >
            Kingdoms
          </button>
          <ChevronRight className="w-3 h-3 text-purple-400/60" />
          <span className={step === 'classes' ? 'font-bold text-white' : 'text-purple-400/70'}>
            {step === 'classes' ? selectedKingdom.name : 'Choose Rank'}
          </span>
        </div>

        <h2 className="font-cinzel-dec font-extrabold text-2xl sm:text-3xl text-slate-100 tracking-wide">
          {step === 'kingdoms' ? 'Choose Your Kingdom' : `Academic Ranks — ${selectedKingdom.name}`}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl mx-auto">
          {step === 'kingdoms'
            ? 'Select your realm of learning. The Spire structures knowledge from elementary foundations through university computation.'
            : selectedKingdom.description}
        </p>
      </header>

      {/* STEP 1: KINGDOM SELECTION */}
      {step === 'kingdoms' && (
        <main className="z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
          {kingdoms.map(kingdom => {
            const isCurrentKingdom = kingdom.id === currentKingdomId;
            const hasPlayableClasses = kingdom.classes.some(c => c.status === 'playable');

            return (
              <div
                key={kingdom.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectKingdom(kingdom.id)}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleSelectKingdom(kingdom.id)}
                className={`glass-panel p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-[0_15px_30px_rgba(0,0,0,0.8)] relative overflow-hidden group ${
                  isCurrentKingdom
                    ? 'border-purple-400/90 bg-purple-950/30 ring-1 ring-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                    : 'border-slate-800/90 hover:border-purple-500/60 hover:bg-slate-900/70'
                }`}
              >
                {/* Background glow flare */}
                <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 blur-xl pointer-events-none transition-all" />

                <div>
                  {/* Top Bar: Badge & Rank Count */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-purple-300 font-bold">
                      {kingdom.badge}
                    </span>
                    <span className="text-[11px] font-mono-code text-slate-400 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-slate-400" />
                      {kingdom.classes.length} Ranks
                    </span>
                  </div>

                  <h3 className="font-cinzel font-bold text-lg text-slate-100 group-hover:text-purple-200 transition-colors">
                    {kingdom.name}
                  </h3>
                  <span className="text-xs font-mono-code text-purple-300/80 block mt-0.5">
                    {kingdom.subtitle}
                  </span>

                  <p className="text-xs text-slate-300/80 mt-2.5 leading-relaxed">
                    {kingdom.description}
                  </p>
                </div>

                {/* Bottom Footer */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-mono-code">
                    {hasPlayableClasses ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Playable Realms
                      </span>
                    ) : (
                      <span className="text-amber-400/80">Future Expansion</span>
                    )}
                  </span>

                  <span className="text-xs font-cinzel font-bold text-purple-300 group-hover:text-white flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Enter Kingdom →
                  </span>
                </div>
              </div>
            );
          })}
        </main>
      )}

      {/* STEP 2: CLASS / ACADEMIC RANK SELECTION */}
      {step === 'classes' && (
        <main className="z-10 w-full max-w-4xl flex flex-col gap-4 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedKingdom.classes.map(cls => {
              const isSelected = cls.id === currentClassId;
              const isPlayable = cls.status === 'playable';

              return (
                <div
                  key={cls.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectClass(cls)}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleSelectClass(cls)}
                  className={`glass-panel p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1 relative overflow-hidden group ${
                    isSelected
                      ? 'border-purple-400 bg-purple-950/40 ring-1 ring-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.35)]'
                      : isPlayable
                      ? 'border-slate-800 hover:border-purple-500/70 hover:bg-slate-900/60'
                      : 'border-slate-800/60 opacity-85 hover:opacity-100 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Header: Class Name and Status Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono-code text-purple-300 font-bold uppercase tracking-wider">
                        {cls.name}
                      </span>
                      {isPlayable ? (
                        <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> Playable
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-amber-300/90 font-medium">
                          Future Expansion
                        </span>
                      )}
                    </div>

                    <h3 className="font-cinzel font-bold text-base text-slate-100 group-hover:text-purple-200 transition-colors">
                      {cls.rankTitle}
                    </h3>

                    <p className="text-xs text-slate-300/80 mt-1.5 leading-relaxed">
                      {cls.description}
                    </p>

                    {/* Curricular Realms Available */}
                    <div className="mt-3">
                      <span className="text-[10px] font-mono-code text-slate-400 uppercase tracking-wider block mb-1">
                        Curriculum Realms:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {cls.availableSubjectIds.map(subId => {
                          const subj = ALL_SUBJECTS[subId];
                          return (
                            <span
                              key={subId}
                              className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center gap-1"
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: subj?.themeColor || '#a855f7' }}
                              />
                              {subj?.name || subId}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Footer Selection State */}
                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] font-cinzel text-slate-400">
                      {isSelected ? 'Active Academic Rank' : isPlayable ? 'Click to Begin Expedition' : 'Future Academic Realm'}
                    </span>
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-purple-400 fill-purple-400/20" />
                    ) : (
                      <span className="text-xs font-cinzel font-bold text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Select Rank →
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => { sounds.playClick(); setStep('kingdoms'); }}
              className="px-4 py-2 rounded-xl glass-panel text-xs font-cinzel font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Kingdoms
            </button>
          </div>
        </main>
      )}

      {/* Footer Return Action */}
      <footer className="z-10 mt-auto pb-4 flex items-center justify-center">
        <button
          onClick={() => { sounds.playClick(); onBack(); }}
          className="px-6 py-2.5 rounded-2xl glass-panel text-xs font-cinzel font-bold text-slate-300 hover:text-white hover:border-purple-400/60 flex items-center gap-2 transition-all shadow-md active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Spire Citadel
        </button>
      </footer>
    </div>
  );
};
