import React from 'react';
import { SubjectId } from '../types/game';
import { ALL_SUBJECTS } from '../curriculum/registry';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface StoryIntroScreenProps {
  subject: SubjectId;
  onContinueToBattle: () => void;
  onBackToMap: () => void;
}

export const StoryIntroScreen: React.FC<StoryIntroScreenProps> = ({
  subject,
  onContinueToBattle,
  onBackToMap,
}) => {
  const subjectInfo = ALL_SUBJECTS[subject];
  const story = subjectInfo.storyIntro;

  const handleEnter = () => {
    sounds.playClick();
    onContinueToBattle();
  };

  return (
    <div className="relative min-h-[calc(100dvh-54px)] p-4 sm:p-8 flex flex-col items-center justify-between select-none overflow-y-auto">
      <ParticleCanvas color={subjectInfo.themeColor} count={40} />

      {/* Title & Lore Scroll */}
      <div className="z-10 max-w-2xl w-full text-center mt-4">
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-mono-code font-bold uppercase tracking-widest mb-3 border shadow-md"
          style={{
            backgroundColor: `${subjectInfo.themeColor}22`,
            borderColor: subjectInfo.themeColor,
            color: subjectInfo.accentColor,
          }}
        >
          {subjectInfo.realmName} — Lore Transmission
        </span>

        <h2 className="font-cinzel-dec font-bold text-2xl sm:text-4xl text-slate-100 tracking-wide">
          {story.title}
        </h2>

        {/* Cinematic Narration Paragraphs */}
        <div className="mt-6 flex flex-col gap-3 text-left glass-panel p-5 sm:p-6 rounded-2xl border border-slate-700/60 shadow-xl">
          {story.narration.map((p, idx) => (
            <p
              key={idx}
              className="text-xs sm:text-sm text-slate-300 font-cinzel leading-relaxed first-letter:text-xl first-letter:font-bold first-letter:text-cyan-300"
            >
              {p}
            </p>
          ))}
        </div>
      </div>

      {/* Cognitive Cards Introduction */}
      <div className="z-10 max-w-2xl w-full my-6">
        <div className="text-center mb-3">
          <span className="font-cinzel text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Your Cognitive Arsenal in this Realm
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {story.conceptCardIntro.map((c, i) => (
            <div
              key={i}
              className="glass-panel p-3.5 rounded-xl border border-slate-700/60 flex flex-col justify-between hover:border-cyan-400/60 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono-code text-cyan-300 font-bold">[{c.cardName}]</span>
                  <span className="text-[10px] text-slate-400 uppercase font-cinzel">{c.role}</span>
                </div>
                <p className="text-xs text-slate-300/90 italic mt-1 leading-snug">
                  "{c.quote}"
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center gap-1 text-[10px] text-emerald-400 font-mono-code">
                <ShieldCheck className="w-3 h-3" />
                Validated Cognitive Tool
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enter Encounter Button */}
      <div className="z-10 pb-6 flex items-center gap-3">
        <button
          onClick={() => { sounds.playClick(); onBackToMap(); }}
          className="px-4 py-2.5 rounded-xl glass-panel text-xs font-cinzel text-slate-300 hover:text-white"
        >
          ← Realm Map
        </button>

        <button
          onClick={handleEnter}
          className="btn-fantasy-primary px-6 py-3 rounded-xl font-cinzel font-bold text-white text-xs sm:text-sm tracking-wider flex items-center gap-2 shadow-[0_0_25px_rgba(2,132,199,0.6)]"
        >
          Now Use What You Have Learned
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
