import React from 'react';

interface MonsterRendererProps {
  visualType: string;
  isHurt?: boolean;
  isAttacking?: boolean;
  hasAdapted?: boolean;
  adaptedLabel?: string;
  size?: number;
  phase?: number;
}

export const MonsterRenderer: React.FC<MonsterRendererProps> = ({
  visualType,
  isHurt = false,
  isAttacking = false,
  hasAdapted = false,
  adaptedLabel,
  size = 300,
  phase = 1,
}) => {
  return (
    <div
      className={`relative inline-block select-none transition-all duration-300 ${
        isHurt ? 'animate-shake' : isAttacking ? '-translate-x-6 scale-105' : 'animate-float'
      }`}
      style={{ width: size, height: size * 1.05 }}
    >
      {/* Adaptation Shield / Rune Aura */}
      {hasAdapted && (
        <div className="absolute inset-0 rounded-full border-2 border-purple-500/60 animate-ping opacity-35 pointer-events-none" />
      )}

      {/* Render Monster Visual based on visualType */}
      {visualType === 'algorithmic_horror' ? (
        <AlgorithmicHorrorSVG isHurt={isHurt} hasAdapted={hasAdapted} />
      ) : visualType === 'mathematical_guardian' ? (
        <MathematicalGuardianSVG isHurt={isHurt} phase={phase} hasAdapted={hasAdapted} />
      ) : (
        <QuadraticBeastSVG isHurt={isHurt} hasAdapted={hasAdapted} />
      )}

      {/* Adapted Badge Floating Over Monster */}
      {hasAdapted && adaptedLabel && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-purple-950/90 border border-purple-400 text-purple-200 text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.7)] flex items-center gap-1.5 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          {adaptedLabel}
        </div>
      )}
    </div>
  );
};

/* QUADRATIC BEAST SVG */
const QuadraticBeastSVG: React.FC<{ isHurt: boolean; hasAdapted: boolean }> = ({ isHurt, hasAdapted }) => (
  <svg viewBox="0 0 280 280" className="w-full h-full drop-shadow-[0_20px_30px_rgba(0,0,0,0.9)]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="beastCore" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={isHurt ? '#ef4444' : hasAdapted ? '#c084fc' : '#38bdf8'} />
        <stop offset="70%" stopColor={isHurt ? '#991b1b' : hasAdapted ? '#6b21a8' : '#0369a1'} />
        <stop offset="100%" stopColor="#0b0f19" />
      </radialGradient>
      <linearGradient id="stonePlate" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="50%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="crystalHorns" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={hasAdapted ? '#e9d5ff' : '#67e8f9'} />
        <stop offset="60%" stopColor={hasAdapted ? '#a855f7' : '#0891b2'} />
        <stop offset="100%" stopColor="#1e1b4b" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Ground Shadow */}
    <ellipse cx="140" cy="260" rx="90" ry="16" fill="#000000" opacity="0.75" />

    {/* Adapted Thorns / Chains */}
    {hasAdapted && (
      <g stroke="#c084fc" strokeWidth="2.5" fill="none" opacity="0.85" filter="url(#glow)">
        <path d="M 50 140 Q 140 100 230 140" strokeDasharray="6,4" />
        <path d="M 40 180 Q 140 220 240 180" strokeDasharray="6,4" />
        <polygon points="140,92 145,102 135,102" fill="#c084fc" />
        <polygon points="90,125 95,135 85,135" fill="#c084fc" />
        <polygon points="190,125 195,135 185,135" fill="#c084fc" />
      </g>
    )}

    {/* Massive Horns (Curving Fractured Spikes) */}
    <path
      d="M 100 80 Q 50 40 30 15 Q 65 35 110 65 Z"
      fill="url(#crystalHorns)"
      stroke={hasAdapted ? '#c084fc' : '#38bdf8'}
      strokeWidth="2"
      filter="url(#glow)"
    />
    <path
      d="M 180 80 Q 230 40 250 15 Q 215 35 170 65 Z"
      fill="url(#crystalHorns)"
      stroke={hasAdapted ? '#c084fc' : '#38bdf8'}
      strokeWidth="2"
      filter="url(#glow)"
    />

    {/* Titan Shoulders and Armor Body */}
    <path
      d="M 50 130 L 100 85 L 180 85 L 230 130 L 220 240 L 60 240 Z"
      fill="url(#stonePlate)"
      stroke="#475569"
      strokeWidth="3"
    />

    {/* Fractured Equation Breastplate Plates */}
    <polygon points="140,95 185,125 140,165 95,125" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
    <polygon points="85,135 130,170 115,225 65,190" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
    <polygon points="195,135 215,190 165,225 150,170" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />

    {/* Glowing Algebraic Runes on Armor */}
    <text x="140" y="136" textAnchor="middle" fill={hasAdapted ? '#d8b4fe' : '#67e8f9'} fontSize="18" fontFamily="monospace" fontWeight="bold" filter="url(#glow)">
      x²
    </text>
    <text x="96" y="185" textAnchor="middle" fill={hasAdapted ? '#d8b4fe' : '#67e8f9'} fontSize="14" fontFamily="monospace" fontWeight="bold" opacity="0.8">
      +5x
    </text>
    <text x="184" y="185" textAnchor="middle" fill={hasAdapted ? '#d8b4fe' : '#67e8f9'} fontSize="14" fontFamily="monospace" fontWeight="bold" opacity="0.8">
      +6
    </text>

    {/* Central Core Cavity */}
    <circle cx="140" cy="205" r="22" fill="url(#beastCore)" stroke="#ffffff" strokeWidth="1" filter="url(#glow)" />
    <text x="140" y="210" textAnchor="middle" fill="#ffffff" fontSize="13" fontFamily="monospace" fontWeight="bold">
      = 0
    </text>

    {/* Beast Head / Face Mask */}
    <polygon
      points="140,50 175,78 160,110 120,110 105,78"
      fill="#090d16"
      stroke={hasAdapted ? '#a855f7' : '#0284c7'}
      strokeWidth="2.5"
    />

    {/* Glowing Eyes */}
    <polygon points="122,80 132,84 124,90" fill={isHurt ? '#f87171' : hasAdapted ? '#f0abfc' : '#38bdf8'} filter="url(#glow)" />
    <polygon points="158,80 148,84 156,90" fill={isHurt ? '#f87171' : hasAdapted ? '#f0abfc' : '#38bdf8'} filter="url(#glow)" />
    <circle cx="140" cy="70" r="3.5" fill={isHurt ? '#ef4444' : hasAdapted ? '#c084fc' : '#22d3ee'} filter="url(#glow)" />

    {/* Claws / Arms */}
    <path d="M 45 140 L 25 195 L 45 220" fill="none" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
    <path d="M 235 140 L 255 195 L 235 220" fill="none" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
    <polygon points="20,205 10,225 25,220" fill="#64748b" />
    <polygon points="260,205 270,225 255,220" fill="#64748b" />
  </svg>
);

/* ALGORITHMIC HORROR SVG */
const AlgorithmicHorrorSVG: React.FC<{ isHurt: boolean; hasAdapted: boolean }> = ({ isHurt, hasAdapted }) => (
  <svg viewBox="0 0 280 280" className="w-full h-full drop-shadow-[0_20px_30px_rgba(0,0,0,0.9)]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="algoCore" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={isHurt ? '#ef4444' : '#22d3ee'} />
        <stop offset="70%" stopColor="#0369a1" />
        <stop offset="100%" stopColor="#020617" />
      </radialGradient>
      <filter id="algoGlow">
        <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Cyber Shadow */}
    <ellipse cx="140" cy="255" rx="85" ry="14" fill="#000000" opacity="0.8" />

    {/* Recursive Tendril Legs */}
    <g stroke={hasAdapted ? '#a855f7' : '#0284c7'} strokeWidth="3.5" fill="none" strokeLinecap="round">
      <path d="M 90 150 Q 50 170 30 240" />
      <path d="M 100 170 Q 70 210 55 250" />
      <path d="M 190 150 Q 230 170 250 240" />
      <path d="M 180 170 Q 210 210 225 250" />
    </g>

    {/* Biomechanical Central Shell */}
    <polygon
      points="140,70 205,115 195,190 140,225 85,190 75,115"
      fill="#090d16"
      stroke={isHurt ? '#ef4444' : hasAdapted ? '#c084fc' : '#38bdf8'}
      strokeWidth="2.5"
    />

    {/* Circuit Board Traces */}
    <path
      d="M 140 70 L 140 120 M 110 115 L 140 140 L 170 115 M 100 160 L 140 180 L 180 160"
      stroke={hasAdapted ? '#e879f9' : '#67e8f9'}
      strokeWidth="2"
      fill="none"
      filter="url(#algoGlow)"
    />

    {/* The Recursion Core Void */}
    <circle cx="140" cy="150" r="32" fill="url(#algoCore)" stroke="#38bdf8" strokeWidth="2" filter="url(#algoGlow)" />

    {/* Recursive Inner Symbol */}
    <path
      d="M 125 142 A 15 15 0 1 1 155 158 L 145 158"
      stroke="#ffffff"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      filter="url(#algoGlow)"
      className="animate-spin"
      style={{ transformOrigin: '140px 150px' }}
    />

    {/* Floating Binary Code Streams */}
    <text x="75" y="100" fill="#38bdf8" fontSize="10" fontFamily="monospace" opacity="0.7">0110</text>
    <text x="185" y="100" fill="#38bdf8" fontSize="10" fontFamily="monospace" opacity="0.7">1001</text>
    <text x="140" y="242" textAnchor="middle" fill={hasAdapted ? '#c084fc' : '#38bdf8'} fontSize="11" fontFamily="monospace" fontWeight="bold">
      O(2ⁿ) RECURSION
    </text>
  </svg>
);

/* THE MATHEMATICAL GUARDIAN (BOSS) SVG */
const MathematicalGuardianSVG: React.FC<{ isHurt: boolean; phase: number; hasAdapted: boolean }> = ({ isHurt, phase, hasAdapted }) => {
  const isFinalPhase = phase >= 3;
  const mainColor = isHurt ? '#ef4444' : isFinalPhase ? '#f43f5e' : hasAdapted ? '#a855f7' : '#06b6d4';

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-[0_25px_35px_rgba(0,0,0,0.95)]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bossSingularity" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor={mainColor} />
          <stop offset="80%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>
        <filter id="bossGlow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Floating Outer Sacred Geometry Rings */}
      <circle cx="150" cy="150" r="120" fill="none" stroke={mainColor} strokeWidth="1.5" strokeDasharray="6,8" className="animate-spin-slow opacity-60" />
      <polygon points="150,30 254,210 46,210" fill="none" stroke={mainColor} strokeWidth="1.5" opacity="0.5" />
      <polygon points="150,270 46,90 254,90" fill="none" stroke={mainColor} strokeWidth="1.5" opacity="0.5" />

      {/* Fractal Crown Wings */}
      <g stroke={mainColor} strokeWidth="2" fill="#090d16" opacity="0.9" filter="url(#bossGlow)">
        <polygon points="150,55 190,110 150,95 110,110" />
        <polygon points="60,110 105,145 75,155 45,130" />
        <polygon points="240,110 255,130 225,155 195,145" />
      </g>

      {/* Archon Core Body */}
      <polygon points="150,90 205,150 150,230 95,150" fill="#070b14" stroke={mainColor} strokeWidth="3" />

      {/* Central Pulsing Singularity Eye */}
      <circle cx="150" cy="150" r="38" fill="url(#bossSingularity)" filter="url(#bossGlow)" />
      <ellipse cx="150" cy="150" rx="12" ry="24" fill="#020617" />
      <circle cx="150" cy="150" r="5" fill="#ffffff" filter="url(#bossGlow)" />

      {/* Floating Runic Sigils */}
      <text x="150" y="255" textAnchor="middle" fill={mainColor} fontSize="12" fontFamily="serif" fontWeight="bold" letterSpacing="3">
        PHASE {phase} • ARCHON
      </text>
    </svg>
  );
};
