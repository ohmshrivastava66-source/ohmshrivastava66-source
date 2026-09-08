import React, { useState } from 'react';
import { Eye, Send, ArrowRight, Sparkles } from 'lucide-react';
import { observerEngine } from '../engine/ObserverEngine';
import { sounds } from '../audio/SoundEffects';

interface ObserverDialogueScreenProps {
  onComplete: () => void;
}

export const ObserverDialogueScreen: React.FC<ObserverDialogueScreenProps> = ({
  onComplete,
}) => {
  const [questionInput, setQuestionInput] = useState<string>('');
  const [response, setResponse] = useState<string | null>(null);
  const [hasAsked, setHasAsked] = useState<boolean>(false);

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim() || hasAsked) return;

    sounds.playClick();
    const answer = observerEngine.respondToStudentQuestion(questionInput);
    setResponse(answer);
    setHasAsked(true);
  };

  return (
    <div className="relative min-h-[calc(100dvh-54px)] p-6 sm:p-12 flex flex-col items-center justify-center select-none bg-black text-slate-100 overflow-y-auto">
      {/* Background radial atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(49,46,129,0.15)_0%,black_80%)] pointer-events-none" />

      <div className="z-10 w-full max-w-2xl flex flex-col items-center gap-8 animate-fadeIn">
        {/* Mystic Eye Emblem */}
        <div className="w-16 h-16 rounded-full bg-slate-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-[0_0_50px_rgba(99,102,241,0.25)] animate-pulse">
          <Eye className="w-8 h-8" />
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="font-cinzel-dec font-bold text-2xl sm:text-4xl text-slate-100 tracking-wider">
            THE OBSERVER
          </h2>
          <p className="font-cinzel text-indigo-300/80 text-sm mt-2 italic">
            "You have earned one question."
          </p>
        </div>

        {!hasAsked ? (
          <form onSubmit={handleAsk} className="w-full flex flex-col gap-4 animate-fadeIn">
            <div className="relative">
              <textarea
                value={questionInput}
                onChange={e => setQuestionInput(e.target.value)}
                placeholder="Ask about the Spire, its guardians, your journey, or the nature of knowledge..."
                rows={4}
                maxLength={300}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl p-4 text-sm text-slate-200 placeholder:text-slate-600 outline-none transition-all resize-none font-sans"
              />
              <span className="absolute bottom-3 right-4 font-mono-code text-[10px] text-slate-600">
                {questionInput.length}/300
              </span>
            </div>

            <button
              type="submit"
              disabled={!questionInput.trim()}
              className={`w-full py-3.5 px-6 rounded-xl font-cinzel font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                questionInput.trim()
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_30px_rgba(99,102,241,0.4)] cursor-pointer'
                  : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" /> Ask The Observer
            </button>
          </form>
        ) : (
          <div className="w-full flex flex-col gap-6 animate-fadeIn">
            {/* Student's Question */}
            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl text-left">
              <span className="font-mono-code text-[10px] text-slate-500 uppercase tracking-widest block mb-1">
                YOU ASKED
              </span>
              <p className="text-sm text-slate-300 italic font-cinzel">"{questionInput}"</p>
            </div>

            {/* The Observer's Answer */}
            <div className="bg-indigo-950/20 border border-indigo-500/40 p-6 rounded-2xl shadow-[0_0_35px_rgba(99,102,241,0.15)] text-left flex flex-col gap-3 animate-fadeIn">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="font-mono-code text-xs text-indigo-400 uppercase tracking-wider font-bold">
                  THE OBSERVER RESPONDS
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-cinzel italic">
                "{response}"
              </p>
              <p className="text-[11px] font-mono-code text-slate-500 mt-2 tracking-widest uppercase">
                "You have asked enough."
              </p>
            </div>

            {/* Return Button */}
            <button
              onClick={() => {
                sounds.playClick();
                onComplete();
              }}
              className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-cinzel font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)]"
            >
              Return To The Spire <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
