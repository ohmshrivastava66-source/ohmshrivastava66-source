import React, { useState } from 'react';
import { EchoDungeonDefinition } from '../types/curriculum';
import { SubjectId } from '../types/game';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { StorageManager } from '../persistence/StorageManager';
import { Sparkles, CheckCircle2, XCircle, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';
import confetti from 'canvas-confetti';

interface EchoDungeonScreenProps {
  vault: EchoDungeonDefinition;
  sourceSubject?: SubjectId;
  onCompleteRepair: () => void;
  onExitWithoutRepair: () => void;
}

export const EchoDungeonScreen: React.FC<EchoDungeonScreenProps> = ({
  vault,
  sourceSubject,
  onCompleteRepair,
  onExitWithoutRepair,
}) => {
  // Strict Cross-realm Invariant Enforcement (fail loudly in dev / test mode)
  if (sourceSubject && vault.subject !== sourceSubject) {
    const errorMsg = `[CRITICAL INVARIANT VIOLATION] Echo Dungeon realm contamination detected! Source Subject: "${sourceSubject}", Vault Subject: "${vault.subject}".`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isVaultMastered, setIsVaultMastered] = useState(false);

  const step = vault.steps[currentStepIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOptionIndex(idx);
    setIsAnswered(true);

    const option = step.options[idx];
    if (option.isCorrect) {
      sounds.playCardCast();
      if (currentStepIndex === vault.steps.length - 1) {
        setIsVaultMastered(true);
        sounds.playVictoryFanfare();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#c084fc', '#38bdf8'],
        });
        StorageManager.repairWeakness(vault.weaknessLabel, vault.subject, vault.rewardMastery);
      }
    } else {
      sounds.playPlayerHurt();
    }
  };

  const handleNextStep = () => {
    sounds.playClick();
    setSelectedOptionIndex(null);
    setIsAnswered(false);
    setCurrentStepIndex(prev => prev + 1);
  };

  const handleFinish = () => {
    sounds.playClick();
    onCompleteRepair();
  };

  return (
    <div className="relative min-h-[calc(100dvh-54px)] p-4 sm:p-8 flex flex-col items-center justify-between select-none overflow-y-auto bg-gradient-to-b from-[#120624] via-[#090314] to-[#04010a]">
      <ParticleCanvas color="#c084fc" count={50} speed={0.8} />

      {/* Secret Rift Header */}
      <div className="z-10 text-center max-w-xl mt-2 animate-fadeIn">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/80 border border-purple-500/60 text-purple-200 text-xs font-mono-code mb-2 shadow-[0_0_20px_rgba(168,85,247,0.5)]">
          <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-spin" />
          DIMENSIONAL RIFT • THE ECHO DUNGEON
        </div>

        <h2 className="font-cinzel-dec font-bold text-3xl sm:text-4xl text-purple-100 tracking-wide">
          {vault.title}
        </h2>

        <p className="text-xs font-mono-code text-purple-300/80 mt-1">
          Targeted Cognitive Repair: <span className="text-white font-bold">{vault.weaknessLabel}</span>
        </p>
      </div>

      {/* Main Repair Card */}
      <div className="z-10 w-full max-w-2xl my-auto glass-panel-void p-5 sm:p-8 rounded-3xl border-2 border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.25)] flex flex-col gap-5">
        {/* Problem Context */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-purple-900/60 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-purple-300 font-cinzel font-bold">
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              Problem Encountered
            </span>
            <span className="font-mono-code text-[11px] text-amber-300">
              {vault.problemContext}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            A misconception occurred during this challenge. Reason through the problem below to repair the cognitive gap.
          </p>
        </div>

        {/* Step Challenge */}
        {!isVaultMastered ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-purple-300 font-mono-code">
              <span>Challenge Step {step.stepNumber} of {vault.steps.length}</span>
            </div>

            <h4 className="font-cinzel font-bold text-sm sm:text-base text-slate-100">
              {step.instruction}
            </h4>

            {/* Options */}
            <div className="flex flex-col gap-2.5 mt-2">
              {step.options.map((opt, idx) => {
                const isSelected = selectedOptionIndex === idx;
                const optionLetter = String.fromCharCode(65 + idx);
                let optStyle = 'border-slate-800 bg-slate-900/80 text-slate-200 hover:border-purple-400 hover:bg-purple-950/40';

                if (isAnswered) {
                  if (opt.isCorrect) {
                    optStyle = 'border-emerald-500 bg-emerald-950/80 text-emerald-200 ring-2 ring-emerald-500/60';
                  } else if (isSelected) {
                    optStyle = 'border-rose-500 bg-rose-950/80 text-rose-200 ring-2 ring-rose-500/60';
                  } else {
                    optStyle = 'opacity-40 border-slate-900';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between ${optStyle}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-slate-950/80 border border-slate-700/80 flex items-center justify-center font-mono-code text-xs text-purple-300 font-bold shrink-0">
                        {optionLetter}
                      </span>
                      <span>{opt.label}</span>
                    </div>
                    {isAnswered && (
                      opt.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : isSelected ? (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      ) : null
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback & Post-Attempt Explanation */}
            {isAnswered && selectedOptionIndex !== null && (
              <div className="mt-3 p-4 rounded-xl bg-slate-950/90 border border-purple-500/40 text-xs flex flex-col gap-3 animate-fadeIn">
                <div className="flex items-center gap-2 font-bold text-sm">
                  {step.options[selectedOptionIndex].isCorrect ? (
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Correct
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" /> Incorrect
                    </span>
                  )}
                </div>

                <p className={step.options[selectedOptionIndex].isCorrect ? 'text-emerald-200/90' : 'text-rose-200/90'}>
                  {step.options[selectedOptionIndex].feedback}
                </p>

                {/* Conceptual Lesson Revealed Strictly After Submission */}
                <div className="bg-purple-950/40 p-3 rounded-xl border border-purple-500/30 flex flex-col gap-1.5 mt-1">
                  <span className="text-[10px] font-mono-code uppercase text-purple-300 font-bold">
                    Foundational Principle:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {vault.breakdownExplanation}
                  </p>
                  <div className="text-[11px] font-mono-code text-purple-200 bg-purple-900/50 p-2 rounded border border-purple-500/30 font-semibold mt-1">
                    {vault.coreRule}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-1">
                  {step.options[selectedOptionIndex].isCorrect && currentStepIndex < vault.steps.length - 1 && (
                    <button
                      onClick={handleNextStep}
                      className="btn-fantasy-void py-2 px-4 rounded-lg font-cinzel font-bold text-xs text-white flex items-center gap-1.5"
                    >
                      Next Step <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {!step.options[selectedOptionIndex].isCorrect && (
                    <button
                      onClick={() => {
                        setSelectedOptionIndex(null);
                        setIsAnswered(false);
                      }}
                      className="glass-panel py-1.5 px-3 rounded-lg text-xs text-slate-300 hover:text-white"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Vault Complete Celebration */
          <div className="flex flex-col items-center text-center gap-4 py-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center text-purple-300 shadow-[0_0_30px_rgba(168,85,247,0.8)]">
              <ShieldCheck className="w-9 h-9 text-purple-300" />
            </div>

            <div>
              <h3 className="font-cinzel-dec font-bold text-xl sm:text-2xl text-purple-100">
                Weakness Repaired!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-1">
                You have neutralized "{vault.weaknessLabel}". Your understanding is fortified with +{vault.rewardMastery}% Mastery!
              </p>
            </div>

            <button
              onClick={handleFinish}
              className="btn-fantasy-void px-8 py-3 rounded-xl font-cinzel font-bold text-white text-sm tracking-wider flex items-center gap-2 shadow-[0_0_25px_rgba(168,85,247,0.8)] mt-2"
            >
              Return to Run Empowered
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Exit Button */}
      <div className="z-10 pb-4">
        <button
          onClick={() => { sounds.playClick(); onExitWithoutRepair(); }}
          className="text-xs font-cinzel text-slate-400 hover:text-white transition-colors"
        >
          Exit Echo Vault Without Repair
        </button>
      </div>
    </div>
  );
};
