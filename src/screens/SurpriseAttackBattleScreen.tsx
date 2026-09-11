import React, { useState } from 'react';
import { SurpriseAttackDefinition, EliteSynthesisOption } from '../types/surpriseAttack';
import { PlayerProfile } from '../types/telemetry';
import { ParticleCanvas } from '../components/ParticleCanvas';
import {
  Skull,
  Award,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  DoorOpen,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { sounds } from '../audio/SoundEffects';
import { getDefaultEchoVaultForSubject, ECHO_VAULTS_MAP } from '../curriculum/registry';

interface SurpriseAttackBattleScreenProps {
  attack: SurpriseAttackDefinition;
  profile: PlayerProfile;
  onVictory: (
    attack: SurpriseAttackDefinition,
    xpReward: number,
    masteryReward: number,
    title: string,
    relic: string
  ) => void;
  onDefeat: (attack: SurpriseAttackDefinition, diagnosedWeakness: string) => void;
  onEnterEchoVault: (vaultId: string) => void;
}

export const SurpriseAttackBattleScreen: React.FC<SurpriseAttackBattleScreenProps> = ({
  attack,
  profile: _profile,
  onVictory,
  onDefeat,
  onEnterEchoVault,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [battleState, setBattleState] = useState<'IN_PROGRESS' | 'VICTORY' | 'DEFEAT'>('IN_PROGRESS');
  const [diagnosedWeakness, setDiagnosedWeakness] = useState<string>('Synthesis Misconception');
  const [failedVaultId, setFailedVaultId] = useState<string>(() => {
    const candidate = attack.eliteQuestions[0]?.recoveryEchoVaultId;
    if (candidate && ECHO_VAULTS_MAP[candidate]?.subject === attack.subject) {
      return candidate;
    }
    return getDefaultEchoVaultForSubject(attack.subject).id;
  });

  const question = attack.eliteQuestions[currentQuestionIndex] || attack.eliteQuestions[0];
  const selectedOption = question.options.find(o => o.id === selectedOptionId);

  const handleSelectOption = (option: EliteSynthesisOption) => {
    if (isAnswered) return;
    sounds.playCardHover();
    setSelectedOptionId(option.id);
  };

  const handleSubmit = () => {
    if (!selectedOption || isAnswered) return;

    sounds.playCardCast();
    setIsAnswered(true);

    if (selectedOption.isCorrect) {
      sounds.playMonsterHit();
    } else {
      sounds.playPlayerHurt();
      setDiagnosedWeakness(selectedOption.distractorMisconception || 'Synthesis Error');
      const targetVault = question.recoveryEchoVaultId;
      const safeTarget = (targetVault && ECHO_VAULTS_MAP[targetVault]?.subject === attack.subject)
        ? targetVault
        : getDefaultEchoVaultForSubject(attack.subject).id;
      setFailedVaultId(safeTarget);
    }
  };

  const handleContinueAfterSubmission = () => {
    if (!selectedOption) return;

    if (selectedOption.isCorrect) {
      if (currentQuestionIndex + 1 < attack.eliteQuestions.length) {
        // Move to next synthesis challenge
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOptionId(null);
        setIsAnswered(false);
      } else {
        // All synthesis questions solved! Victory!
        sounds.playVictoryFanfare();
        setBattleState('VICTORY');
      }
    } else {
      // Failed synthesis challenge -> Defeat
      sounds.playDefeat();
      setBattleState('DEFEAT');
    }
  };

  // VICTORY SCREEN
  if (battleState === 'VICTORY') {
    const reward = attack.prestigeReward;
    return (
      <div className="relative min-h-[calc(100dvh-54px)] p-6 flex flex-col items-center justify-center select-none overflow-y-auto bg-gradient-to-b from-[#09151c] via-[#050c12] to-[#020508]">
        <ParticleCanvas color="#06b6d4" count={45} />

        <div className="z-10 w-full max-w-xl glass-panel p-8 rounded-3xl border border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.4)] flex flex-col items-center text-center gap-6 animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-cyan-950/80 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_35px_rgba(6,182,212,0.7)]">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[11px] font-mono-code text-cyan-400 tracking-widest uppercase font-bold px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-700/60">
              ✦ AMBUSH REPELLED ✦
            </span>
            <h1 className="font-cinzel-dec font-black text-3xl sm:text-4xl text-slate-100 tracking-wide mt-2">
              THE HUNT FAILED
            </h1>
            <p className="text-sm text-cyan-200/80 font-serif italic mt-1">
              "The creatures believed your speed was a weakness. They were wrong."
            </p>
          </div>

          {/* Reward Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-md">
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-cyan-900/60 flex flex-col items-center">
              <Sparkles className="w-5 h-5 text-amber-400 mb-1" />
              <span className="text-[10px] text-slate-400 uppercase font-mono-code">Bonus XP</span>
              <span className="text-sm font-mono-code font-bold text-amber-300">+{reward.xp} XP</span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-2xl border border-cyan-900/60 flex flex-col items-center">
              <Zap className="w-5 h-5 text-cyan-400 mb-1" />
              <span className="text-[10px] text-slate-400 uppercase font-mono-code">Mastery</span>
              <span className="text-sm font-mono-code font-bold text-cyan-300">+{reward.masteryBonus}%</span>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-slate-950/80 p-3 rounded-2xl border border-cyan-900/60 flex flex-col items-center">
              <ShieldCheck className="w-5 h-5 text-purple-400 mb-1" />
              <span className="text-[10px] text-slate-400 uppercase font-mono-code">Relic</span>
              <span className="text-xs font-mono-code font-bold text-purple-300 truncate w-full text-center">
                {reward.relic}
              </span>
            </div>
          </div>

          <div className="bg-cyan-950/40 px-4 py-2 rounded-xl border border-cyan-500/30 text-xs font-mono-code text-cyan-300">
            Prestige Title Unlocked: <strong className="text-white">{reward.title}</strong>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onVictory(attack, reward.xp, reward.masteryBonus, reward.title, reward.relic);
            }}
            className="w-full max-w-sm py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-cinzel font-bold text-sm tracking-wider uppercase shadow-lg flex items-center justify-center gap-2"
          >
            <span>Resume Normal Progression</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // DEFEAT SCREEN
  if (battleState === 'DEFEAT') {
    return (
      <div className="relative min-h-[calc(100dvh-54px)] p-6 flex flex-col items-center justify-center select-none overflow-y-auto bg-gradient-to-b from-[#180509] via-[#0d0205] to-[#050002]">
        <ParticleCanvas color="#ef4444" count={40} />

        <div className="z-10 w-full max-w-xl glass-panel-danger p-8 rounded-3xl border border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.4)] flex flex-col items-center text-center gap-5 animate-fadeIn">
          <div className="w-18 h-18 rounded-full bg-rose-950/80 border-2 border-rose-500 flex items-center justify-center text-rose-400 shadow-[0_0_35px_rgba(244,63,94,0.7)]">
            <Skull className="w-9 h-9" />
          </div>

          <div>
            <h1 className="font-cinzel-dec font-black text-2xl sm:text-3xl text-rose-100 tracking-wide">
              THE AMBUSH OVERWHELMED YOU
            </h1>
            <p className="text-xs sm:text-sm text-rose-200/80 font-serif italic mt-1 max-w-md">
              "The creatures caught you off guard. Your ascent continues, but the Spire has revealed a weakness worth studying."
            </p>
          </div>

          {/* Diagnostic Gap Box */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-rose-900/60 w-full text-left flex flex-col gap-1.5">
            <span className="text-[10px] font-mono-code text-amber-300 uppercase font-bold">
              DIAGNOSED SYNTHESIS GAP:
            </span>
            <span className="text-sm font-mono-code font-bold text-rose-200">
              {diagnosedWeakness}
            </span>
            <p className="text-xs text-slate-300 leading-relaxed mt-1 font-sans">
              The ambush targeted cross-concept transfer. Repair this conceptual link in the Echo Dungeon to fortify your cognitive defense.
            </p>
          </div>

          {/* Reassurance Banner */}
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono-code bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>All cleared levels, XP, unlocked cards, and mastery are preserved.</span>
          </div>

          {/* Recovery Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md mt-2">
            <button
              onClick={() => {
                sounds.playClick();
                onEnterEchoVault(failedVaultId);
              }}
              className="btn-fantasy-void flex-1 py-3 px-4 rounded-xl font-cinzel font-bold text-white text-xs tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.6)]"
            >
              <DoorOpen className="w-4 h-4" />
              <span>Enter Echo Dungeon</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onDefeat(attack, diagnosedWeakness);
              }}
              className="glass-panel flex-1 py-3 px-4 rounded-xl font-cinzel font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 text-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Return to Normal Progression</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE BATTLE / QUESTION ARENA
  return (
    <div className="relative min-h-[calc(100dvh-54px)] p-4 sm:p-8 flex flex-col items-center justify-between select-none overflow-y-auto bg-gradient-to-b from-[#140306] via-[#0a0103] to-[#040001]">
      <ParticleCanvas color="#dc2626" count={35} />

      {/* Header Banner */}
      <div className="z-10 text-center max-w-2xl mb-4">
        <div className="flex items-center justify-center gap-2">
          <span className="text-[10px] font-mono-code font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-red-950/80 border border-red-500/60 text-red-400">
            ELITE SYNTHESIS CHALLENGE • STEP {currentQuestionIndex + 1} OF {attack.eliteQuestions.length}
          </span>
        </div>
        <h2 className="font-cinzel-dec font-bold text-xl sm:text-2xl text-slate-100 tracking-wide mt-2">
          {attack.title}
        </h2>
      </div>

      {/* Challenge Card */}
      <div className="z-10 w-full max-w-2xl glass-panel p-6 sm:p-8 rounded-3xl border border-red-500/40 shadow-2xl flex flex-col gap-5 my-auto">
        {/* Scenario Description */}
        <div className="bg-slate-950/90 p-4 rounded-2xl border border-red-950/80">
          <div className="text-[10px] font-mono-code text-red-400 uppercase tracking-wider font-bold mb-1">
            AMBUSH ANOMALY SCENARIO
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
            {question.scenario}
          </p>
        </div>

        {/* Objective Box */}
        <div className="bg-amber-950/30 p-3 rounded-xl border border-amber-500/40 flex items-start gap-2">
          <span className="text-[10px] font-mono-code text-amber-300 font-bold uppercase tracking-wide">
            OBJECTIVE:
          </span>
          <span className="text-xs text-amber-200/90 font-sans">
            {question.objective}
          </span>
        </div>

        {/* Options List (Neutrally formatted as A, B, C, D prior to submission) */}
        <div className="flex flex-col gap-3">
          {question.options.map(option => {
            const isSelected = selectedOptionId === option.id;

            let optionStyle =
              'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-900/90';
            if (isSelected && !isAnswered) {
              optionStyle = 'bg-cyan-950/80 border-cyan-500 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.4)]';
            } else if (isAnswered) {
              if (option.isCorrect) {
                optionStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
              } else if (isSelected && !option.isCorrect) {
                optionStyle = 'bg-rose-950/80 border-rose-500 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.5)]';
              } else {
                optionStyle = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={option.id}
                disabled={isAnswered}
                onClick={() => handleSelectOption(option)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 ${optionStyle}`}
              >
                <div className="flex-1 text-xs sm:text-sm font-sans leading-relaxed">
                  {option.label}
                </div>
                {isAnswered && (
                  <div className="flex-shrink-0 mt-0.5">
                    {option.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : isSelected ? (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Post-Submission Rationale Feedback */}
        {isAnswered && selectedOption && (
          <div
            className={`p-4 rounded-2xl border flex flex-col gap-2 animate-fadeIn ${
              selectedOption.isCorrect
                ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/50 border-rose-500/50 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2 font-mono-code text-xs font-bold uppercase">
              {selectedOption.isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>SYNTHESIS CONFIRMED: RIGOROUS SOLUTION</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>SYNTHESIS FRACTURED: COGNITIVE MISCONCEPTION</span>
                </>
              )}
            </div>

            <p className="text-xs font-sans leading-relaxed text-slate-200">
              {selectedOption.rationale}
            </p>

            {selectedOption.isCorrect && (
              <div className="text-[11px] font-sans text-emerald-300/90 pt-1 border-t border-emerald-900/60">
                <strong>Conceptual Invariant:</strong> {question.correctExplanation}
              </div>
            )}
          </div>
        )}

        {/* Action Button: Submit vs Continue */}
        <div className="pt-2 flex justify-end">
          {!isAnswered ? (
            <button
              disabled={!selectedOptionId}
              onClick={handleSubmit}
              className={`py-3 px-8 rounded-xl font-cinzel font-bold text-xs sm:text-sm tracking-wider uppercase transition-all ${
                selectedOptionId
                  ? 'btn-fantasy-primary text-white shadow-lg cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              Submit Synthesis
            </button>
          ) : (
            <button
              onClick={handleContinueAfterSubmission}
              className="py-3 px-8 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-cinzel font-bold text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(239,68,68,0.6)] flex items-center gap-2"
            >
              <span>{selectedOption?.isCorrect ? 'Proceed' : 'Inspect Outcome'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
