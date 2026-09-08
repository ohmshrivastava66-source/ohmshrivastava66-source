import React, { useEffect, useState } from 'react';

export interface FloatingTextEvent {
  id: string;
  text: string;
  type: 'damage_enemy' | 'damage_player' | 'shield' | 'critical' | 'adaptation';
  x: number; // percentage across arena
  y: number; // percentage down arena
}

interface CombatVFXProps {
  floatingEvents: FloatingTextEvent[];
  isScreenShaking?: boolean;
  isCastingProjectile?: boolean;
  onEventExpire?: (id: string) => void;
}

/**
 * Combat Visual Effects (VFX) Layer
 * Renders floating combat text, projectile arcs, impact flares, and screen shake.
 */
export const CombatVFX: React.FC<CombatVFXProps> = ({
  floatingEvents,
  isScreenShaking = false,
  isCastingProjectile = false,
  onEventExpire,
}) => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  }, []);

  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none z-30 overflow-hidden ${
        isScreenShaking && !reducedMotion ? 'animate-shake' : ''
      }`}
    >
      {/* 1. CASTING PROJECTILE BEAM */}
      {isCastingProjectile && !reducedMotion && (
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="spellBeamGrad" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
              <stop offset="60%" stopColor="#38bdf8" stopOpacity="1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </linearGradient>
            <filter id="spellGlow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {/* Energy Beam traveling from Player (~25% x) to Boss (~75% x) */}
          <line
            x1="26%"
            y1="55%"
            x2="74%"
            y2="52%"
            stroke="url(#spellBeamGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            filter="url(#spellGlow)"
            className="animate-pulse"
          />
          {/* Impact Spark Flare on Boss */}
          <circle cx="74%" cy="52%" r="22" fill="#38bdf8" opacity="0.6" filter="url(#spellGlow)" />
          <circle cx="74%" cy="52%" r="10" fill="#ffffff" />
        </svg>
      )}

      {/* 2. FLOATING COMBAT TEXT */}
      {floatingEvents.map(evt => {
        let colorClasses = 'text-rose-400 font-bold';
        if (evt.type === 'shield') {
          colorClasses = 'text-cyan-300 font-bold drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]';
        } else if (evt.type === 'damage_enemy') {
          colorClasses = 'text-amber-300 font-extrabold text-lg sm:text-xl drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]';
        } else if (evt.type === 'critical') {
          colorClasses = 'text-red-400 font-black text-xl sm:text-2xl drop-shadow-[0_0_15px_rgba(239,68,68,1)]';
        } else if (evt.type === 'adaptation') {
          colorClasses = 'text-purple-300 font-bold text-sm drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]';
        }

        return (
          <div
            key={evt.id}
            className={`absolute font-cinzel tracking-wider animate-bounce pointer-events-none transition-all duration-700 ${colorClasses}`}
            style={{
              left: `${evt.x}%`,
              top: `${evt.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {evt.text}
          </div>
        );
      })}
    </div>
  );
};
