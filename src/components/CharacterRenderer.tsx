import React from 'react';

export type CharacterActionState = 'idle' | 'cast' | 'strike' | 'hurt' | 'victory';

interface CharacterRendererProps {
  state: CharacterActionState;
  className?: string;
  size?: number;
}

export const CharacterRenderer: React.FC<CharacterRendererProps> = ({
  state = 'idle',
  className = '',
  size = 280,
}) => {
  const isHurt = state === 'hurt';
  const isCasting = state === 'cast';
  const isStriking = state === 'strike';
  const isVictory = state === 'victory';

  return (
    <div
      className={`relative inline-block transition-transform duration-300 select-none ${
        isHurt ? 'animate-shake' : isStriking ? 'animate-strike' : isVictory ? 'scale-105' : 'animate-float'
      } ${className}`}
      style={{ width: size, height: size * 1.15 }}
    >
      {/* Ground Runic Pedestal / Shadow */}
      <svg
        viewBox="0 0 240 280"
        className="w-full h-full drop-shadow-[0_15px_25px_rgba(0,0,0,0.85)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="crystalGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
            <stop offset="50%" stopColor="#0284c7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="victoryAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#07080d" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="cloakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="staffGold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <filter id="glowFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Victory Aura Burst */}
        {isVictory && (
          <ellipse cx="120" cy="140" rx="95" ry="95" fill="url(#victoryAura)" className="animate-pulse" />
        )}

        {/* Base shadow & summon circle */}
        <ellipse cx="115" cy="255" rx="65" ry="14" fill="#000000" opacity="0.65" />
        <ellipse
          cx="115"
          cy="255"
          rx="58"
          ry="10"
          fill="none"
          stroke={isHurt ? '#ef4444' : isVictory ? '#fbbf24' : '#38bdf8'}
          strokeWidth="1.5"
          strokeDasharray="4,3"
          className="animate-spin-slow opacity-75"
        />

        {/* Cloak Back & Mantle */}
        <path
          d={
            isStriking
              ? 'M 85 110 Q 55 190 75 250 Q 115 260 145 250 Q 155 180 135 110 Z'
              : 'M 90 100 Q 60 170 70 245 Q 115 258 160 245 Q 170 170 140 100 Z'
          }
          fill="url(#cloakGradient)"
          stroke="#312e81"
          strokeWidth="1.5"
        />

        {/* Inner Tunic & Belt */}
        <path
          d="M 98 120 L 92 235 L 138 235 L 132 120 Z"
          fill="#1e293b"
          stroke="#475569"
          strokeWidth="1"
        />
        {/* Ornate Rune Sash */}
        <path d="M 94 175 L 136 175 L 134 185 L 96 185 Z" fill="#b45309" stroke="#f59e0b" strokeWidth="1" />
        <path d="M 112 185 L 110 230 L 120 230 L 118 185 Z" fill="#b45309" />
        <circle cx="115" cy="180" r="4.5" fill="#fef08a" stroke="#d97706" strokeWidth="1" />

        {/* Hero Torso / Shoulder Pauldrons */}
        <path
          d="M 85 105 Q 65 112 72 135 Q 90 132 98 120 Z"
          fill="#334155"
          stroke="#64748b"
          strokeWidth="1.5"
        />
        <path
          d="M 145 105 Q 165 112 158 135 Q 140 132 132 120 Z"
          fill="#334155"
          stroke="#64748b"
          strokeWidth="1.5"
        />

        {/* Scholar Hood (Shadowed Face) */}
        <path
          d="M 88 95 Q 115 50 142 95 Q 150 125 115 130 Q 80 125 88 95 Z"
          fill="#090d16"
          stroke="#1e293b"
          strokeWidth="2"
        />

        {/* Dark Hood Void Interior */}
        <path
          d="M 94 96 Q 115 78 136 96 Q 138 120 115 124 Q 92 120 94 96 Z"
          fill="#030712"
        />

        {/* Glowing Mystic Eyes */}
        <ellipse
          cx="106"
          cy="102"
          rx="3.5"
          ry="1.8"
          fill={isHurt ? '#ef4444' : '#38bdf8'}
          filter="url(#glowFilter)"
        />
        <ellipse
          cx="124"
          cy="102"
          rx="3.5"
          ry="1.8"
          fill={isHurt ? '#ef4444' : '#38bdf8'}
          filter="url(#glowFilter)"
        />

        {/* Celestial Knowledge Staff */}
        <g
          transform={
            isCasting
              ? 'translate(0, -15) rotate(-10 160 140)'
              : isStriking
              ? 'translate(25, 0) rotate(20 160 180)'
              : isVictory
              ? 'translate(-10, -25) rotate(-15 160 140)'
              : 'translate(0, 0)'
          }
          className="transition-transform duration-200"
        >
          {/* Staff Shaft */}
          <line
            x1="165"
            y1="45"
            x2="165"
            y2="255"
            stroke="url(#staffGold)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Golden Finial Prongs */}
          <path
            d="M 152 50 Q 155 25 165 18 Q 175 25 178 50 Q 165 42 152 50 Z"
            fill="#d97706"
            stroke="#fef08a"
            strokeWidth="1.5"
          />
          <path
            d="M 146 58 Q 140 32 165 12 Q 190 32 184 58"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
          />

          {/* The Knowledge Crystal (Floating Gem) */}
          <polygon
            points="165,18 175,32 165,46 155,32"
            fill={isHurt ? '#ef4444' : '#38bdf8'}
            stroke="#ffffff"
            strokeWidth="1.5"
            filter="url(#glowFilter)"
          />

          {/* Orbital Mana Ring */}
          <ellipse
            cx="165"
            cy="32"
            rx="18"
            ry="6"
            fill="none"
            stroke={isHurt ? '#f87171' : '#7dd3fc'}
            strokeWidth="1.5"
            transform="rotate(-20 165 32)"
            className="animate-pulse"
          />

          {/* Casting Energy Flare */}
          {isCasting && (
            <circle
              cx="165"
              cy="32"
              r="28"
              fill="url(#crystalGlow)"
              className="animate-ping opacity-60"
            />
          )}
        </g>

        {/* Right Arm & Hand gripping staff */}
        <path
          d={
            isCasting
              ? 'M 130 115 Q 150 95 165 105'
              : 'M 130 115 Q 155 130 165 140'
          }
          fill="none"
          stroke="#1e293b"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <circle
          cx={isCasting ? 165 : 165}
          cy={isCasting ? 105 : 140}
          r="4.5"
          fill="#475569"
          stroke="#94a3b8"
          strokeWidth="1"
        />

        {/* Damage Flash Overlay */}
        {isHurt && (
          <rect
            x="40"
            y="40"
            width="160"
            height="220"
            fill="#ef4444"
            opacity="0.25"
            className="animate-pulse"
          />
        )}
      </svg>
    </div>
  );
};
