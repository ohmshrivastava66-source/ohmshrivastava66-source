import React from 'react';

export type CharacterActionState =
  | 'idle'
  | 'cast'
  | 'attack'
  | 'strike' // Backward-compatible alias for attack
  | 'hurt'
  | 'adapted'
  | 'victory';

export interface CharacterRendererProps {
  state?: CharacterActionState;
  className?: string;
  size?: number;
  mode?: '2.5d' | '3d'; // Extensible for future 3D glTF models
}

/**
 * 2.5D Vector Character Renderer: The Knowledge Hunter / The Scholar
 * Renders an imposing, detailed dark-fantasy scholar adventurer with layered robes,
 * glowing runic trim, celestial knowledge staff, floating mana orb, and dynamic action poses.
 */
export const CharacterRenderer: React.FC<CharacterRendererProps> = ({
  state = 'idle',
  className = '',
  size = 280,
  mode = '2.5d',
}) => {
  const isHurt = state === 'hurt';
  const isCasting = state === 'cast';
  const isStriking = state === 'strike' || state === 'attack';
  const isAdapted = state === 'adapted';
  const isVictory = state === 'victory';

  // Dynamic animation class based on action pose
  const animationClass = isHurt
    ? 'animate-shake'
    : isStriking
    ? 'animate-strike'
    : isCasting
    ? 'scale-105 -translate-y-2'
    : isVictory
    ? 'scale-105 animate-pulse-glow'
    : 'animate-float';

  return (
    <div
      className={`relative inline-block select-none transition-all duration-300 ${animationClass} ${className}`}
      style={{ width: size, height: size * 1.18 }}
      role="img"
      aria-label="The Knowledge Hunter"
    >
      <svg
        viewBox="0 0 280 330"
        className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Celestial Staff Mana Sphere */}
          <radialGradient id="manaCore" cx="45%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="30%" stopColor="#38bdf8" />
            <stop offset="70%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </radialGradient>

          {/* Victory Celestial Aura */}
          <radialGradient id="victoryGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#050814" stopOpacity="0" />
          </radialGradient>

          {/* Staff Gold Arc */}
          <linearGradient id="staffGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          {/* High-Fidelity Robe Gradients */}
          <linearGradient id="mantleObsidian" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="45%" stopColor="#0f172a" />
            <stop offset="85%" stopColor="#020617" />
            <stop offset="100%" stopColor="#050814" />
          </linearGradient>

          <linearGradient id="innerTunic" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="60%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          <linearGradient id="runeGlowTrim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.9" />
          </linearGradient>

          {/* Pedestal Runic Glow */}
          <radialGradient id="pedestalRuneGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.65" />
            <stop offset="60%" stopColor="#0369a1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Glow Filters */}
          <filter id="hunterGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Victory / Casting Aura Flare */}
        {(isVictory || isCasting) && (
          <ellipse
            cx="140"
            cy="165"
            rx={isVictory ? '125' : '110'}
            ry={isVictory ? '125' : '110'}
            fill={isVictory ? 'url(#victoryGlow)' : 'url(#pedestalRuneGlow)'}
            className="animate-pulse"
          />
        )}

        {/* 1. GROUND FRACTURED RUNIC PEDESTAL */}
        <g id="pedestal">
          {/* Ground Base Shadow */}
          <ellipse cx="135" cy="305" rx="85" ry="18" fill="#000000" opacity="0.8" />
          {/* Runic Energy Well */}
          <ellipse cx="135" cy="303" rx="72" ry="14" fill="url(#pedestalRuneGlow)" />
          {/* Outer Runic Circle */}
          <ellipse
            cx="135"
            cy="303"
            rx="66"
            ry="12"
            fill="none"
            stroke={isHurt ? '#ef4444' : isAdapted ? '#c084fc' : isVictory ? '#fbbf24' : '#38bdf8'}
            strokeWidth="1.8"
            strokeDasharray="6,4"
            className="animate-spin-slow opacity-80"
          />
          {/* Inner Geometric Star Hex */}
          <polygon
            points="135,294 148,301 144,310 126,310 122,301"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="1"
            opacity="0.6"
          />
        </g>

        {/* 2. LAYERED OBSIDIAN ROBES & HOOD */}
        <g id="body-robes">
          {/* Flowing Back Cloak Wings */}
          <path
            d={
              isStriking
                ? 'M 100 130 Q 55 220 85 295 Q 135 305 175 295 Q 190 220 165 130 Z'
                : 'M 105 120 Q 65 205 78 290 Q 135 305 192 290 Q 205 205 170 120 Z'
            }
            fill="url(#mantleObsidian)"
            stroke="#1e1b4b"
            strokeWidth="2"
          />

          {/* Runic Edge Lining along cloak edges */}
          <path
            d="M 82 288 Q 135 304 188 288"
            fill="none"
            stroke="url(#runeGlowTrim)"
            strokeWidth="2.5"
            filter="url(#hunterGlow)"
          />

          {/* Inner Tunic / Combat Vest */}
          <path
            d="M 116 140 L 108 275 L 162 275 L 154 140 Z"
            fill="url(#innerTunic)"
            stroke="#334155"
            strokeWidth="1.2"
          />

          {/* Golden Filigree Breastplate & Collar */}
          <polygon
            points="135,145 150,165 135,190 120,165"
            fill="url(#staffGoldGrad)"
            stroke="#fef08a"
            strokeWidth="1"
          />
          {/* Center Arcane Mana Core Jewel */}
          <circle cx="135" cy="165" r="4.5" fill="#38bdf8" filter="url(#hunterGlow)" />

          {/* Gilded Rune Sash / Belt */}
          <rect x="110" y="210" width="50" height="7" rx="2" fill="#78350f" stroke="#f59e0b" strokeWidth="1" />
          <circle cx="135" cy="213.5" r="3" fill="#fef08a" />
        </g>

        {/* 3. HEAD & DEEP HOOD */}
        <g id="head-hood">
          {/* Deep Shadowed Hood */}
          <path
            d="M 112 140 C 105 105, 120 85, 135 85 C 150 85, 165 105, 158 140 C 152 148, 118 148, 112 140 Z"
            fill="#090d16"
            stroke="#1e293b"
            strokeWidth="1.5"
          />
          {/* Glowing Eyes / Mystic Scholar Visor */}
          <ellipse cx="130" cy="120" rx="3.5" ry="2" fill="#38bdf8" filter="url(#hunterGlow)" />
          <ellipse cx="140" cy="120" rx="3.5" ry="2" fill="#38bdf8" filter="url(#hunterGlow)" />
        </g>

        {/* 4. CELESTIAL KNOWLEDGE STAFF */}
        <g id="celestial-staff">
          {/* Staff Shaft */}
          <line
            x1={isStriking ? '185' : isCasting ? '170' : '180'}
            y1={isStriking ? '290' : isCasting ? '290' : '290'}
            x2={isStriking ? '230' : isCasting ? '210' : '205'}
            y2={isStriking ? '80' : isCasting ? '75' : '90'}
            stroke="url(#staffGoldGrad)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Gilded Orbital Branches */}
          <path
            d={
              isCasting
                ? 'M 195 95 C 185 70, 225 60, 215 90'
                : 'M 190 105 C 180 80, 220 70, 210 100'
            }
            fill="none"
            stroke="url(#staffGoldGrad)"
            strokeWidth="2.5"
          />

          {/* Floating Mana Sphere */}
          <circle
            cx={isStriking ? '232' : isCasting ? '212' : '206'}
            cy={isStriking ? '74' : isCasting ? '68' : '82'}
            r={isCasting ? '14' : '11'}
            fill="url(#manaCore)"
            filter="url(#hunterGlow)"
            className="animate-pulse"
          />

          {/* Orbiting Celestial Mana Rings */}
          <ellipse
            cx={isStriking ? '232' : isCasting ? '212' : '206'}
            cy={isStriking ? '74' : isCasting ? '68' : '82'}
            rx={isCasting ? '20' : '17'}
            ry="6"
            fill="none"
            stroke="#7dd3fc"
            strokeWidth="1.5"
            strokeDasharray="4,3"
            transform={
              isStriking
                ? 'rotate(-25 232 74)'
                : isCasting
                ? 'rotate(-20 212 68)'
                : 'rotate(-20 206 82)'
            }
            className="animate-spin-slow"
          />
        </g>

        {/* 5. CASTING ENERGY BURST / SPARKS */}
        {isCasting && (
          <g id="casting-energy" filter="url(#hunterGlow)">
            <line x1="212" y1="68" x2="265" y2="40" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="212" y1="68" x2="260" y2="70" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
            <line x1="212" y1="68" x2="255" y2="95" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" />
            <circle cx="265" cy="40" r="3" fill="#e0f2fe" />
            <circle cx="260" cy="70" r="2.5" fill="#e0f2fe" />
          </g>
        )}

        {/* 6. ADAPTED VOID CHAINS AROUND HUNTER */}
        {isAdapted && (
          <g id="adapted-chains" stroke="#c084fc" strokeWidth="2" fill="none" opacity="0.85">
            <ellipse cx="135" cy="180" rx="45" ry="18" strokeDasharray="5,4" transform="rotate(-15 135 180)" />
            <ellipse cx="135" cy="230" rx="40" ry="15" strokeDasharray="5,4" transform="rotate(15 135 230)" />
          </g>
        )}
      </svg>
    </div>
  );
};
