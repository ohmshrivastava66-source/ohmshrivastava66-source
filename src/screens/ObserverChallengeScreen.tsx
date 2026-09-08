import React, { useState, useEffect } from 'react';
import { Eye, ShieldAlert, ArrowRight, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { observerEngine } from '../engine/ObserverEngine';
import { sounds } from '../audio/SoundEffects';

interface ObserverChallengeScreenProps {
  onVictory: (unlockedAskAnything: boolean) => void;
  onDefeat: () => void;
}

export const ObserverChallengeScreen: React.FC<ObserverChallengeScreenProps> = ({
  onVictory,
  onDefeat,
}) => {
  const [stage, setStage] = useState<number>(0);
  const [accepted, setAccepted] = useState<boolean>(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  const question = observerEngine.getObserverChallengeQuestion();

  useEffect(() => {
    sounds.playAmbushAlarm();

    const timers = [
      setTimeout(() => setStage(1), 800),
      setTimeout(() => setStage(2), 2400),
      setTimeout(() => setStage(3), 4200),
    ];

    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const handleSubmit = () => {
    if (!selectedOptionId || hasSubmitted) return;
    const chosen = question.options.find(o => o.id === selectedOptionId);
    const win = chosen?.isCorrect ?? false;
    setIsCorrect(win);
    setHasSubmitted(true);

    if (win) {
      sounds.playVictoryFanfare();
    } else {
      sounds.playMistakeDetected();
    }
  };

  return (
    <div className="relative min-h-[calc(100dvh-54px)] p-6 sm:p-12 flex flex-col items-center justify-center select-none bg-black text-slate-100 overflow-y-auto">
      {/* Visual Ambiance: Absolute Minimal Void */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,27,75,0.2)_0%,black_80%)] pointer-events-none" />

      {!accepted ? (
        <div className="z-10 max-w-xl text-center flex flex-col items-center gap-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 shadow-[0_0_40px_rgba(255,255,255,0.05)]">
            <Eye className="w-8 h-8 animate-pulse text-indigo-400" />
          </div>

          <div className="min-h-[140px] flex flex-col items-center justify-center gap-4">
            {stage >= 1 && (
              <p className="font-mono-code text-xs text-slate-500 tracking-widest uppercase animate-fadeIn">
                [ ANOMALOUS PRESENCE DETECTED ]
              </p>
            )}

            {stage >= 2 && (
              <h2 className="font-cinzel-dec text-2xl sm:text-3xl text-slate-200 font-bold tracking-wider animate-fadeIn">
                "The Observer is watching."
              </h2>
            )}

            {stage >= 3 && (
              <p className="font-cinzel text-slate-400 text-sm sm:text-base italic animate-fadeIn">
                "You have finally done something worth asking about."
              </p>
            )}
          </div>

          {stage >= 3 && (
            <div className="animate-fadeIn mt-4">
              <button
                onClick={() => {
                  sounds.playClick();
                  setAccepted(true);
                }}
                className="px-8 py-3.5 rounded-xl border border-indigo-500/50 bg-indigo-950/40 text-indigo-200 hover:bg-indigo-900/50 hover:text-white font-cinzel font-bold text-sm tracking-widest uppercase transition-all shadow-[0_0_25px_rgba(99,102,241,0.25)] flex items-center gap-2"
              >
                Accept The Challenge <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="z-10 w-full max-w-3xl flex flex-col gap-6 animate-fadeIn my-auto">
          {/* Header */}
          <div className="text-center border-b border-slate-800 pb-4">
            <span className="font-mono-code text-xs text-indigo-400 uppercase tracking-widest font-bold">
              ✦ THE OBSERVER'S TRIAL OF INVARIANCE ✦
            </span>
            <p className="text-xs text-slate-500 mt-1 font-cinzel">
              Prove your conceptual foundation across unified scientific domains.
            </p>
          </div>

          {/* Scenario Context */}
          <div className="bg-slate-950/90 border border-slate-800 p-5 rounded-2xl">
            <span className="text-[10px] font-mono-code text-slate-400 uppercase tracking-wider block mb-2">
              OBSERVATION SCENARIO
            </span>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
              {question.scenario}
            </p>
          </div>

          {/* Objective */}
          <div className="bg-indigo-950/20 border border-indigo-500/30 p-4 rounded-xl">
            <span className="text-[10px] font-mono-code text-indigo-400 uppercase tracking-widest block mb-1">
              EDUCATIONAL OBJECTIVE
            </span>
            <p className="text-xs sm:text-sm text-indigo-200 font-semibold font-cinzel">
              {question.objective}
            </p>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-3">
            {question.options.map(opt => {
              const isSelected = selectedOptionId === opt.id;
              let style =
                'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300';

              if (hasSubmitted) {
                if (opt.isCorrect) {
                  style =
                    'bg-emerald-950/50 border-emerald-500 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.2)]';
                } else if (isSelected && !opt.isCorrect) {
                  style = 'bg-rose-950/50 border-rose-500 text-rose-200';
                } else {
                  style = 'bg-slate-950/30 border-slate-900 text-slate-600 opacity-60';
                }
              } else if (isSelected) {
                style =
                  'bg-indigo-950/60 border-indigo-500 text-indigo-100 shadow-[0_0_20px_rgba(99,102,241,0.25)]';
              }

              return (
                <button
                  key={opt.id}
                  disabled={hasSubmitted}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedOptionId(opt.id);
                  }}
                  className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start justify-between gap-4 ${style}`}
                >
                  <span className="leading-relaxed font-sans">{opt.label}</span>
                  {hasSubmitted && opt.isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {hasSubmitted && isSelected && !opt.isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Post-Submission Result */}
          {hasSubmitted && (
            <div
              className={`p-5 rounded-2xl border animate-fadeIn ${
                isCorrect
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <>
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <span className="font-cinzel font-bold text-sm text-emerald-300 uppercase">
                      The Observer Acknowledges You
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                    <span className="font-cinzel font-bold text-sm text-rose-300 uppercase">
                      The Mirror Remains Incomplete
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
                {question.correctExplanation}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {!hasSubmitted ? (
              <button
                disabled={!selectedOptionId}
                onClick={handleSubmit}
                className={`px-6 py-3 rounded-xl font-cinzel font-bold text-xs uppercase tracking-wider transition-all ${
                  selectedOptionId
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_25px_rgba(99,102,241,0.5)] cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                Submit Axiomatic Synthesis
              </button>
            ) : isCorrect ? (
              <button
                onClick={() => {
                  sounds.playClick();
                  onVictory(true);
                }}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-cinzel font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center gap-2"
              >
                Receive The Observer's Recognition <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  sounds.playClick();
                  onDefeat();
                }}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-cinzel font-bold text-xs uppercase tracking-wider"
              >
                Return To The Spire
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
