import React from 'react';
import { LiveTelemetryMetrics } from '../types/telemetry';
import { Activity, ShieldAlert, Cpu, Timer } from 'lucide-react';

interface TelemetryPanelProps {
  metrics: LiveTelemetryMetrics;
  stepCurrent: number;
  stepTotal: number;
  compact?: boolean;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  metrics,
  stepCurrent,
  stepTotal,
  compact = false,
}) => {
  const validityColor = {
    OPTIMAL: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
    DEVIATED: 'text-amber-400 border-amber-500/40 bg-amber-950/40',
    CRITICAL_MISCONCEPTION: 'text-rose-400 border-rose-500/40 bg-rose-950/40',
  }[metrics.orderValidity];

  return (
    <div
      className={`glass-panel rounded-xl p-3 flex flex-col gap-2 border border-slate-700/60 shadow-lg select-none ${
        compact ? 'text-xs' : 'text-sm'
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
        <div className="flex items-center gap-1.5 text-cyan-400 font-cinzel font-bold text-xs uppercase tracking-wider">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          Live Cognitive Telemetry
        </div>
        <span className="font-mono-code text-[11px] text-slate-400">
          Step {Math.min(stepCurrent + 1, stepTotal)} / {stepTotal}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Sequencing Efficiency */}
        <div className="flex flex-col bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Efficiency</span>
            <Cpu className="w-3 h-3 text-cyan-400" />
          </div>
          <span className="font-mono-code text-sm font-bold text-cyan-300 mt-0.5">
            {metrics.sequencingEfficiency}%
          </span>
          <div className="w-full bg-slate-900 h-1.5 rounded-full mt-1 overflow-hidden">
            <div
              className="bg-cyan-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${metrics.sequencingEfficiency}%` }}
            />
          </div>
        </div>

        {/* Prerequisite Tracking */}
        <div className="flex flex-col bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Prerequisite</span>
            <ShieldAlert className="w-3 h-3 text-purple-400" />
          </div>
          <span className="font-mono-code text-sm font-bold text-purple-300 mt-0.5">
            {metrics.dependencyTrackingScore}%
          </span>
          <div className="w-full bg-slate-900 h-1.5 rounded-full mt-1 overflow-hidden">
            <div
              className="bg-purple-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${metrics.dependencyTrackingScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Order Status Badge */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-slate-400">Cognitive Alignment:</span>
        <span
          className={`text-[10px] font-mono-code font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${validityColor}`}
        >
          {metrics.orderValidity.replace('_', ' ')}
        </span>
      </div>

      {metrics.impulsiveActionDetected && (
        <div className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-500/50 p-1.5 rounded flex items-center gap-1">
          <Timer className="w-3 h-3 shrink-0" />
          Rapid action detected without state deliberation.
        </div>
      )}
    </div>
  );
};
