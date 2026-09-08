import React, { useState, useEffect } from 'react';
import { EndingVariant } from '../types/learningDna';
import { classifyEndingVariant } from '../engine/LearningDNAEngine';
import { Send, Sparkles } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface LastQuestionScreenProps {
  onComplete: (studentResponse: string, endingVariant: EndingVariant) => void;
}

export { classifyEndingVariant };

export const LastQuestionScreen: React.FC<LastQuestionScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<number>(0);
  const [reflection, setReflection] = useState<string>('');

  useEffect(() => {
    // Cinematic silence & staged pauses
    const timers = [
      setTimeout(() => setStage(1), 1000),
      setTimeout(() => setStage(2), 2800),
      setTimeout(() => setStage(3), 5000),
      setTimeout(() => setStage(4), 7200),
    ];

    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflection.trim()) return;

    sounds.playVictoryFanfare();
    const variant = classifyEndingVariant(reflection);
    onComplete(reflection, variant);
  };

  return (
    <div className="relative min-h-[calc(100dvh-54px)] p-6 sm:p-12 flex flex-col items-center justify-center select-none bg-black text-slate-100 overflow-y-auto">
      <div className="z-10 w-full max-w-2xl flex flex-col items-center text-center gap-6 animate-fadeIn my-auto">
        {/* Stage 1: The Silence */}
        {stage >= 1 && (
          <div className="w-12 h-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-300 shadow-[0_0_35px_rgba(251,191,36,0.1)] animate-pulse">
            <Sparkles className="w-6 h-6" />
          </div>
        )}

        {/* Stage 2: The Core Prompt */}
        <div className="min-h-[120px] flex flex-col items-center justify-center gap-3">
          {stage >= 1 && (
            <h2 className="font-cinzel-dec font-bold text-2xl sm:text-4xl text-slate-100 tracking-wider animate-fadeIn">
              ONE QUESTION REMAINS.
            </h2>
          )}

          {stage >= 2 && (
            <p className="font-cinzel text-xs sm:text-sm text-slate-400 max-w-lg leading-relaxed animate-fadeIn">
              The Spire can test what you know. But it cannot decide what you understand.
            </p>
          )}

          {stage >= 3 && (
            <div className="mt-4 p-5 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-2xl animate-fadeIn">
              <p className="font-cinzel text-sm sm:text-base text-amber-200 italic leading-relaxed">
                "You have encountered every kind of problem the Spire could construct.
                <br />
                <strong className="text-white not-italic font-bold">
                  What separates knowing an answer from knowing why it is true?
                </strong>"
              </p>
            </div>
          )}
        </div>

        {/* Stage 4: Reflection Form */}
        {stage >= 4 && (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 animate-fadeIn mt-2">
            <div className="relative">
              <textarea
                value={reflection}
                onChange={e => setReflection(e.target.value)}
                placeholder="Inscribe your reflection... (There are no wrong answers in the realm of understanding)"
                rows={4}
                maxLength={400}
                className="w-full bg-slate-950/90 border border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-2xl p-4 text-sm text-slate-200 placeholder:text-slate-600 outline-none transition-all resize-none font-sans"
              />
              <span className="absolute bottom-3 right-4 font-mono-code text-[10px] text-slate-600">
                {reflection.length}/400
              </span>
            </div>

            <button
              type="submit"
              disabled={!reflection.trim()}
              className={`w-full py-3.5 px-6 rounded-xl font-cinzel font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                reflection.trim()
                  ? 'btn-fantasy-gold text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.5)] cursor-pointer'
                  : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" /> Seal Your Axiomatic Verdict
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
