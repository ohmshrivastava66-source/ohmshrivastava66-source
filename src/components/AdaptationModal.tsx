import React from 'react';
import { DiagnosisResult } from '../types/telemetry';
import { Brain, ShieldAlert, Sparkles, AlertTriangle, ArrowRight, X } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface AdaptationModalProps {
  diagnosis: DiagnosisResult;
  onClose: () => void;
  onEnterEchoVault?: (vaultId: string) => void;
}

export const AdaptationModal: React.FC<AdaptationModalProps> = ({
  diagnosis,
  onClose,
  onEnterEchoVault,
}) => {
  const hasEchoVault = !!diagnosis.echoVaultId && !!onEnterEchoVault;

  const handleEnterVault = () => {
    sounds.playClick();
    if (diagnosis.echoVaultId && onEnterEchoVault) {
      onEnterEchoVault(diagnosis.echoVaultId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel-void relative max-w-lg w-full rounded-2xl p-6 border-2 border-purple-500/60 shadow-[0_0_50px_rgba(168,85,247,0.35)] flex flex-col gap-5">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-purple-500/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-950 border border-purple-400 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(192,132,252,0.6)]">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cinzel font-bold text-lg text-purple-100 tracking-wide">
                Why Did The Game Adapt?
              </h3>
              <span className="text-[11px] font-mono-code text-purple-300/80">
                Cognitive Diagnostic Engine Active
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagnosis Body */}
        <div className="flex flex-col gap-3.5 text-sm">
          {/* Observed Behavior & Mistake Step */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-purple-900/60 flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-purple-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Observed Sequence
              </span>
              <span className="font-mono-code text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40 text-[10px]">
                Step {diagnosis.mistakeStep} Deviation
              </span>
            </div>
            <p className="text-slate-200 font-mono-code text-xs mt-1">
              {diagnosis.observedPattern}
            </p>
            <div className="flex items-center justify-between text-xs mt-1 pt-1 border-t border-purple-900/40">
              <span className="text-slate-400">Cognitive Focus:</span>
              <span className="text-purple-300 font-mono-code font-bold">{diagnosis.recommendedRepair}</span>
            </div>
          </div>

          {/* AI Cognitive Diagnosis */}
          <div className="bg-purple-950/40 p-3.5 rounded-xl border border-purple-500/40 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-purple-200 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Cognitive Diagnosis: {diagnosis.diagnosisType.replace('_', ' ')}
              </span>
              <span className="font-mono-code text-cyan-300 text-xs">
                {Math.round(diagnosis.confidence * 100)}% Confidence
              </span>
            </div>
            <p className="text-slate-200 text-xs leading-relaxed">
              {diagnosis.explanation}
            </p>
          </div>

          {/* Enemy Adaptation */}
          <div className="bg-rose-950/40 p-3 rounded-xl border border-rose-500/40 flex flex-col gap-1">
            <span className="text-rose-300 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Enemy Adaptation: {diagnosis.adaptation.name}
            </span>
            <p className="text-rose-200/90 text-xs">
              {diagnosis.adaptation.description}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-purple-500/30">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Continue Combat
          </button>

          {hasEchoVault && (
            <button
              onClick={handleEnterVault}
              className="btn-fantasy-void px-5 py-2.5 rounded-xl text-xs font-cinzel font-bold text-white flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.7)]"
            >
              Enter Echo Dungeon (Repair)
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
