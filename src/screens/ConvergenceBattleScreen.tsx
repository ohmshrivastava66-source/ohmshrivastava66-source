import React, { useState, useEffect } from 'react';
import { ConvergenceTrial } from '../types/convergence';
import { PlayerProfile } from '../types/telemetry';
import { SubjectId } from '../types/game';
import { convergenceEngine, BOSS_COUNCIL_MEMBERS } from '../engine/ConvergenceEngine';
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
  Flame,
  MessageSquare,
} from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface ConvergenceBattleScreenProps {
  profile: PlayerProfile;
  onVictory: (score: number) => void;
  onDefeat: (weaknessName: string) => void;
  onEnterEchoVault: (vaultId: string) => void;
  onReturnToMap: () => void;
}

const ALL_COUNCIL_IDS: SubjectId[] = [
  'mathematics',
  'computerScience',
  'physics',
  'chemistry',
  'biology',
  'history',
  'geography',
  'language',
];

export const ConvergenceBattleScreen: React.FC<ConvergenceBattleScreenProps> = ({
  profile,
  onVictory,
  onDefeat,
  onEnterEchoVault,
  onReturnToMap,
}) => {
  const [trials, setTrials] = useState<ConvergenceTrial[]>(() =>
    convergenceEngine.generateTrialSequence(profile)
  );
  const [currentTrialIndex, setCurrentTrialIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState<number>(0);
  const [bossRageLevel, setBossRageLevel] = useState<number>(1);
  const [activeDialogue, setActiveDialogue] = useState<{
    speaker: string;
    title: string;
    quote: string;
    color: string;
  } | null>(null);
  const [battleState, setBattleState] = useState<'IN_PROGRESS' | 'DEFEAT'>('IN_PROGRESS');
  const [diagnosedWeakness, setDiagnosedWeakness] = useState<string>('Cross-Domain Synthesis Misalignment');
  const [recoveryVaultId, setRecoveryVaultId] = useState<string>('vault_factorization');
  const [actionStartTime, setActionStartTime] = useState<number>(Date.now());

  const currentTrial = trials[currentTrialIndex] || trials[0];
  const primaryBoss = BOSS_COUNCIL_MEMBERS[currentTrial.primaryBoss];

  // Set initial boss intro dialogue on trial change
  useEffect(() => {
    setActionStartTime(Date.now());
    setSelectedOptionId(null);
    setIsAnswered(false);

    const initialQuote =
      currentTrial.dialogueIntro ||
      `"${primaryBoss.name} summons the combined domain constraints of the Council."`;
    setActiveDialogue({
      speaker: primaryBoss.name,
      title: primaryBoss.title,
      quote: initialQuote,
      color: primaryBoss.color,
    });
  }, [currentTrialIndex]);

  const handleSelectOption = (optionId: string) => {
    if (isAnswered) return;
    sounds.playCardHover();
    setSelectedOptionId(optionId);
  };

  const handleSubmit = () => {
    if (!selectedOptionId || isAnswered) return;

    const responseTimeMs = Date.now() - actionStartTime;
    const selectedOption = currentTrial.options.find(o => o.id === selectedOptionId);
    if (!selectedOption) return;

    sounds.playCardCast();
    setIsAnswered(true);

    if (selectedOption.isCorrect) {
      sounds.playMonsterHit();
      const newConsecutive = consecutiveCorrect + 1;
      setConsecutiveCorrect(newConsecutive);

      // Escalate Boss Rage Level dynamically
      const newRage = convergenceEngine.calculateBossRage(
        newConsecutive,
        currentTrial.tier,
        responseTimeMs
      );
      setBossRageLevel(newRage);

      // Reactive boss banter
      const reaction = convergenceEngine.getBossReaction(
        currentTrial.primaryBoss,
        newRage,
        'correct'
      );
      setActiveDialogue(reaction);
    } else {
      sounds.playPlayerHurt();
      setConsecutiveCorrect(0);
      setDiagnosedWeakness(
        selectedOption.distractorMisconception || 'Cross-Domain Synthesis Disruption'
      );
      if (currentTrial.recoveryEchoVaultId) {
        setRecoveryVaultId(currentTrial.recoveryEchoVaultId);
      }

      // Sarcastic villain reaction
      const reaction = convergenceEngine.getBossReaction(
        currentTrial.primaryBoss,
        bossRageLevel,
        'wrong'
      );
      setActiveDialogue(reaction);
    }
  };

  const handleProceed = () => {
    const selectedOption = currentTrial.options.find(o => o.id === selectedOptionId);
    if (!selectedOption) return;

    if (selectedOption.isCorrect) {
      if (currentTrialIndex + 1 < trials.length) {
        setCurrentTrialIndex(prev => prev + 1);
      } else {
        // All Convergence trials cleared! Victory!
        sounds.playVictoryFanfare();
        const finalScore = 1500 + consecutiveCorrect * 100;
        onVictory(finalScore);
      }
    } else {
      // Failed a trial in the Convergence
      sounds.playDefeat();
      setBattleState('DEFEAT');
    }
  };

  // DEFEAT VIEW
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
              THE COUNCIL OVERWHELMED YOU
            </h1>
            <p className="text-xs sm:text-sm text-rose-200/80 font-serif italic mt-1 max-w-md">
              "The Council's cross-disciplinary pressure broke your concentration. Your ascent pauses, but your foundational mastery remains intact."
            </p>
          </div>

          {/* Diagnostic Gap Box */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-rose-900/60 w-full text-left flex flex-col gap-1.5">
            <span className="text-[10px] font-mono-code text-amber-300 uppercase font-bold">
              CROSS-DOMAIN GAP DETECTED:
            </span>
            <span className="text-sm font-mono-code font-bold text-rose-200">
              {diagnosedWeakness}
            </span>
            <p className="text-xs text-slate-300 leading-relaxed mt-1 font-sans">
              The Council exploited this conceptual link. Fortify it in the Echo Dungeon before attempting the Final Examination again.
            </p>
          </div>

          {/* Reassurance Banner */}
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono-code bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>All cleared bosses, levels, cards, and mastery are completely preserved.</span>
          </div>

          {/* Recovery Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md mt-2">
            <button
              onClick={() => {
                sounds.playClick();
                onEnterEchoVault(recoveryVaultId);
              }}
              className="btn-fantasy-void flex-1 py-3 px-4 rounded-xl font-cinzel font-bold text-white text-xs tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.6)]"
            >
              <DoorOpen className="w-4 h-4" />
              <span>Enter Echo Dungeon</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onDefeat(diagnosedWeakness);
                onReturnToMap();
              }}
              className="glass-panel flex-1 py-3 px-4 rounded-xl font-cinzel font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 text-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Return to the Spire</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE ARENA VIEW
  const selectedOption = currentTrial.options.find(o => o.id === selectedOptionId);

  return (
    <div className="relative min-h-[calc(100dvh-54px)] p-4 sm:p-8 flex flex-col items-center justify-between select-none overflow-y-auto bg-gradient-to-b from-[#0b0314] via-[#05010a] to-[#020004]">
      <ParticleCanvas color="#a855f7" count={40} speed={0.7} />

      {/* TOP: THE COUNCIL OF EIGHT AVATAR ROW */}
      <div className="z-10 w-full max-w-4xl flex flex-col items-center gap-2 mb-3">
        <div className="flex items-center justify-center gap-2">
          <span className="text-[10px] font-mono-code font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/60 text-purple-300 shadow-sm flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            {currentTrial.tierLabel} • CONVERGENCE TRIAL {currentTrial.trialNumber < 10 ? `0${currentTrial.trialNumber}` : currentTrial.trialNumber}
          </span>
        </div>

        {/* Council Row */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap pt-2">
          {ALL_COUNCIL_IDS.map(id => {
            const member = BOSS_COUNCIL_MEMBERS[id];
            const isPrimary = currentTrial.primaryBoss === id;
            const isCollaborating = currentTrial.collaboratingBosses.includes(id);
            const isActive = isPrimary || isCollaborating;

            return (
              <div
                key={id}
                className={`relative flex flex-col items-center transition-all ${
                  isActive ? 'scale-110 z-20' : 'opacity-40 grayscale-[40%]'
                }`}
              >
                <div
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 flex items-center justify-center font-cinzel font-bold text-xs sm:text-sm shadow-md transition-all"
                  style={{
                    backgroundColor: `${member.color}22`,
                    borderColor: isActive ? member.accentColor : '#334155',
                    color: isActive ? member.accentColor : '#94a3b8',
                    boxShadow: isActive ? `0 0 20px ${member.color}88` : 'none',
                  }}
                  title={`${member.name} (${member.domain})`}
                >
                  {member.emblem}
                </div>
                {isPrimary && (
                  <span className="text-[9px] font-mono-code text-amber-300 font-bold uppercase mt-1 tracking-tight">
                    SPEAKER
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* REACTIVE BOSS DIALOGUE BOX */}
      {activeDialogue && (
        <div className="z-10 w-full max-w-2xl glass-panel-void px-5 py-3 rounded-2xl border border-purple-500/50 shadow-lg flex items-start gap-3 mb-3 animate-fadeIn">
          <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-400/40 text-purple-300 flex-shrink-0 mt-0.5">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span
              className="text-xs font-mono-code font-bold uppercase tracking-wider"
              style={{ color: activeDialogue.color }}
            >
              {activeDialogue.speaker} <span className="text-slate-400 font-normal">[{activeDialogue.title}]</span>
            </span>
            <p className="text-xs sm:text-sm font-serif italic text-slate-200 mt-0.5 leading-relaxed">
              {activeDialogue.quote}
            </p>
          </div>
        </div>
      )}

      {/* CENTRAL CHALLENGE CARD */}
      <div className="z-10 w-full max-w-2xl glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/40 shadow-2xl flex flex-col gap-5 my-auto">
        {/* Scenario */}
        <div className="bg-slate-950/90 p-4 rounded-2xl border border-purple-950/80">
          <div className="text-[10px] font-mono-code text-purple-400 uppercase tracking-wider font-bold mb-1">
            CROSS-DOMAIN EXAMINATION SCENARIO
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
            {currentTrial.scenario}
          </p>
        </div>

        {/* Objective */}
        <div className="bg-amber-950/30 p-3 rounded-xl border border-amber-500/40 flex items-start gap-2">
          <span className="text-[10px] font-mono-code text-amber-300 font-bold uppercase tracking-wide flex-shrink-0">
            OBJECTIVE:
          </span>
          <span className="text-xs text-amber-200/90 font-sans">
            {currentTrial.objective}
          </span>
        </div>

        {/* Options (Neutrally rendered as A., B., C., D. before submission) */}
        <div className="flex flex-col gap-3">
          {currentTrial.options.map(option => {
            const isSelected = selectedOptionId === option.id;

            let optionStyle =
              'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-900/90';
            if (isSelected && !isAnswered) {
              optionStyle =
                'bg-purple-950/80 border-purple-500 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.4)]';
            } else if (isAnswered) {
              if (option.isCorrect) {
                optionStyle =
                  'bg-emerald-950/80 border-emerald-500 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
              } else if (isSelected && !option.isCorrect) {
                optionStyle =
                  'bg-rose-950/80 border-rose-500 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.5)]';
              } else {
                optionStyle = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={option.id}
                disabled={isAnswered}
                onClick={() => handleSelectOption(option.id)}
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

        {/* Post-Submission Rationale */}
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
                  <span>SYNTHESIS PROVEN — THE COUNCIL CONCEDES THIS STEP</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>FRACTURED PROOF — THE COUNCIL EXPLOITED YOUR GAP</span>
                </>
              )}
            </div>

            <p className="text-xs font-sans leading-relaxed text-slate-200">
              {selectedOption.rationale}
            </p>

            {selectedOption.isCorrect && (
              <div className="text-[11px] font-sans text-emerald-300/90 pt-1 border-t border-emerald-900/60">
                <strong>Underlying Law:</strong> {currentTrial.correctExplanation}
              </div>
            )}
          </div>
        )}

        {/* Submit vs Proceed Buttons */}
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
              onClick={handleProceed}
              className="py-3 px-8 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-cinzel font-bold text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(168,85,247,0.6)] flex items-center gap-2"
            >
              <span>{selectedOption?.isCorrect ? 'Next Trial' : 'Inspect Outcome'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
