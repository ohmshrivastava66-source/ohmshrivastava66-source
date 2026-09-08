import React from 'react';
import { Shield, Heart, Zap } from 'lucide-react';

interface HealthBarProps {
  currentHp: number;
  maxHp: number;
  shield?: number;
  label?: string;
  isEnemy?: boolean;
}

export const HealthBar: React.FC<HealthBarProps> = ({
  currentHp,
  maxHp,
  shield = 0,
  label = 'HP',
  isEnemy = false,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));

  return (
    <div className="flex flex-col gap-1 w-full max-w-xs">
      <div className="flex items-center justify-between text-xs font-cinzel font-bold">
        <span className={`flex items-center gap-1.5 ${isEnemy ? 'text-rose-400' : 'text-emerald-400'}`}>
          <Heart className="w-3.5 h-3.5 fill-current" />
          {label}
        </span>
        <div className="flex items-center gap-2 font-mono-code text-[11px]">
          {shield > 0 && (
            <span className="text-cyan-300 font-bold flex items-center gap-0.5 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/40">
              <Shield className="w-3 h-3 fill-current" />
              +{shield}
            </span>
          )}
          <span className="text-slate-300">
            {currentHp} / {maxHp}
          </span>
        </div>
      </div>

      {/* Bar container */}
      <div className="relative h-4 w-full bg-slate-950/90 rounded-full overflow-hidden border border-slate-700/80 shadow-inner">
        {/* HP fill */}
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isEnemy
              ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
              : 'bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]'
          }`}
          style={{ width: `${hpPercent}%` }}
        />

        {/* Shield overlay bar */}
        {shield > 0 && (
          <div
            className="absolute top-0 left-0 h-full bg-cyan-400/45 border-r-2 border-cyan-200 transition-all duration-300"
            style={{ width: `${Math.min(100, (shield / maxHp) * 100)}%` }}
          />
        )}
      </div>
    </div>
  );
};

interface EnergyOrbsProps {
  currentEnergy: number;
  maxEnergy: number;
}

export const EnergyOrbs: React.FC<EnergyOrbsProps> = ({ currentEnergy, maxEnergy }) => {
  return (
    <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
      <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400 animate-pulse" />
      <div className="flex items-center gap-1.5">
        {Array.from({ length: maxEnergy }).map((_, i) => {
          const isActive = i < currentEnergy;
          return (
            <div
              key={i}
              className={`w-5 h-5 rounded-full transition-all duration-200 flex items-center justify-center border ${
                isActive
                  ? 'bg-gradient-to-tr from-sky-500 to-cyan-300 border-cyan-100 shadow-[0_0_10px_rgba(34,211,238,0.8)] scale-105'
                  : 'bg-slate-900 border-slate-700 opacity-40'
              }`}
            >
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
            </div>
          );
        })}
      </div>
      <span className="font-mono-code text-xs font-bold text-cyan-300 ml-1">
        {currentEnergy}/{maxEnergy}
      </span>
    </div>
  );
};
