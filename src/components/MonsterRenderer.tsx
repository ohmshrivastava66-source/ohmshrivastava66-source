import React from 'react';

export interface MonsterRendererProps {
  visualType: string;
  isHurt?: boolean;
  isAttacking?: boolean;
  hasAdapted?: boolean;
  adaptedLabel?: string;
  size?: number;
  phase?: number;
  subject?: string;
}

/**
 * High-Fidelity Modular Boss & Monster Visual Library
 * Renders large-scale, atmospheric dark-fantasy bosses tailored to each academic realm.
 */
export const MonsterRenderer: React.FC<MonsterRendererProps> = ({
  visualType,
  isHurt = false,
  isAttacking = false,
  hasAdapted = false,
  adaptedLabel,
  size = 380,
  phase = 1,
  subject,
}) => {
  // Normalize key to pick the right boss illustration
  const vt = (visualType || '').toLowerCase();
  const subj = (subject || '').toLowerCase();

  const animationClass = isHurt
    ? 'animate-shake'
    : isAttacking
    ? '-translate-x-8 scale-105 transition-transform duration-200'
    : 'animate-float';

  return (
    <div
      className={`relative inline-block select-none transition-all duration-300 ${animationClass}`}
      style={{ width: size, height: size * 1.05 }}
      role="img"
      aria-label={`Encounter Boss: ${visualType}`}
    >
      {/* Adaptation Shield / Void Aura */}
      {hasAdapted && (
        <div className="absolute -inset-4 rounded-full border-2 border-purple-500/60 animate-ping opacity-35 pointer-events-none" />
      )}

      {/* Render Distinct Creature by Type or Subject */}
      {vt.includes('singularity') || vt === 'mathematical_guardian' ? (
        <SingularityArchonSVG isHurt={isHurt} phase={phase} hasAdapted={hasAdapted} />
      ) : vt.includes('algorithmic') || vt.includes('turing') || subj === 'computerscience' ? (
        <AlgorithmicHorrorSVG isHurt={isHurt} hasAdapted={hasAdapted} />
      ) : vt.includes('reaction') || vt.includes('alchem') || subj === 'chemistry' ? (
        <ReactionGolemSVG isHurt={isHurt} hasAdapted={hasAdapted} />
      ) : vt.includes('darwin') || vt.includes('mutat') || subj === 'biology' ? (
        <DarwinianBehemothSVG isHurt={isHurt} hasAdapted={hasAdapted} />
      ) : vt.includes('timeline') || vt.includes('chrono') || subj === 'history' ? (
        <TimelineGuardianSVG isHurt={isHurt} hasAdapted={hasAdapted} />
      ) : vt.includes('entropy') || vt.includes('momentum') || subj === 'physics' ? (
        <EntropyColossusSVG isHurt={isHurt} hasAdapted={hasAdapted} />
      ) : vt.includes('tectonic') || vt.includes('cartograph') || subj === 'geography' ? (
        <TectonicBehemothSVG isHurt={isHurt} hasAdapted={hasAdapted} />
      ) : vt.includes('lexicon') || vt.includes('sphinx') || subj === 'language' ? (
        <SemanticSphinxSVG isHurt={isHurt} hasAdapted={hasAdapted} />
      ) : (
        <QuadraticBeastSVG isHurt={isHurt} hasAdapted={hasAdapted} />
      )}

      {/* Adapted Badge Floating Over Monster */}
      {hasAdapted && adaptedLabel && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-purple-950/95 border-2 border-purple-400 text-purple-200 text-xs font-bold px-3.5 py-1 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.8)] flex items-center gap-1.5 animate-bounce z-20">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
          {adaptedLabel}
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   1. MATHEMATICS — QUADRATIC BEAST (Titan of Fractured Polynomials)
   ========================================================================= */
const QuadraticBeastSVG: React.FC<{ isHurt: boolean; hasAdapted: boolean }> = ({ isHurt, hasAdapted }) => (
  <svg viewBox="0 0 340 320" className="w-full h-full drop-shadow-[0_25px_40px_rgba(0,0,0,0.95)]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="qbCore" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={isHurt ? '#ef4444' : hasAdapted ? '#c084fc' : '#38bdf8'} />
        <stop offset="65%" stopColor={isHurt ? '#991b1b' : hasAdapted ? '#7e22ce' : '#0284c7'} />
        <stop offset="100%" stopColor="#050814" />
      </radialGradient>
      <linearGradient id="qbArmor" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="50%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#090d16" />
      </linearGradient>
      <linearGradient id="qbSpines" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={hasAdapted ? '#e9d5ff' : '#67e8f9'} />
        <stop offset="50%" stopColor={hasAdapted ? '#a855f7' : '#06b6d4'} />
        <stop offset="100%" stopColor="#1e1b4b" />
      </linearGradient>
      <filter id="qbGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Ground Shadow & Molten Cracks */}
    <ellipse cx="170" cy="295" rx="130" ry="20" fill="#000000" opacity="0.85" />
    <path d="M 90 295 Q 170 305 250 292" stroke={hasAdapted ? '#a855f7' : '#06b6d4'} strokeWidth="2" opacity="0.7" filter="url(#qbGlow)" />

    {/* Quadruped Hind Limbs */}
    <path d="M 60 210 L 40 280 L 75 285 L 95 220 Z" fill="url(#qbArmor)" stroke="#0f172a" strokeWidth="2" />
    <path d="M 230 200 L 255 280 L 285 285 L 265 210 Z" fill="url(#qbArmor)" stroke="#0f172a" strokeWidth="2" />

    {/* Massive Muscular Torso */}
    <path
      d="M 80 180 Q 50 230 110 250 Q 220 255 250 190 Q 210 130 140 140 Z"
      fill="url(#qbArmor)"
      stroke={hasAdapted ? '#a855f7' : '#38bdf8'}
      strokeWidth="2.5"
    />

    {/* Glowing Crystalline Polynomial Core */}
    <ellipse cx="160" cy="195" rx="42" ry="32" fill="url(#qbCore)" filter="url(#qbGlow)" />
    {/* Geometric Core Facets */}
    <polygon points="160,165 185,195 160,225 135,195" fill="none" stroke="#e0f2fe" strokeWidth="1.5" opacity="0.8" />
    <polygon points="160,175 175,195 160,215 145,195" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.9" />

    {/* Fore Limbs & Razor Talons */}
    <path d="M 100 220 L 90 295 L 125 300 L 140 230 Z" fill="url(#qbArmor)" stroke="#1e293b" strokeWidth="2" />
    <path d="M 190 220 L 205 295 L 240 300 L 225 225 Z" fill="url(#qbArmor)" stroke="#1e293b" strokeWidth="2" />
    {/* Claws */}
    <polygon points="85,295 90,305 100,295" fill="#38bdf8" />
    <polygon points="105,298 112,308 120,298" fill="#38bdf8" />
    <polygon points="205,295 212,305 220,295" fill="#38bdf8" />
    <polygon points="225,298 232,308 240,298" fill="#38bdf8" />

    {/* Serrated Crystalline Back Spines */}
    <polygon points="110,145 100,85 130,135" fill="url(#qbSpines)" stroke="#67e8f9" strokeWidth="1.5" filter="url(#qbGlow)" />
    <polygon points="140,135 145,70 165,130" fill="url(#qbSpines)" stroke="#67e8f9" strokeWidth="1.5" filter="url(#qbGlow)" />
    <polygon points="175,130 195,80 200,135" fill="url(#qbSpines)" stroke="#67e8f9" strokeWidth="1.5" filter="url(#qbGlow)" />
    <polygon points="210,140 235,95 225,148" fill="url(#qbSpines)" stroke="#67e8f9" strokeWidth="1.5" filter="url(#qbGlow)" />

    {/* Behemoth Head & Jaw */}
    <path
      d="M 85 160 L 40 175 L 25 195 L 65 210 L 95 195 Z"
      fill="url(#qbArmor)"
      stroke={hasAdapted ? '#c084fc' : '#38bdf8'}
      strokeWidth="2"
    />
    {/* Menacing Violet/Cyan Eyes */}
    <ellipse cx="55" cy="180" rx="6" ry="3" fill="#e0f2fe" filter="url(#qbGlow)" transform="rotate(-15 55 180)" />
    <circle cx="55" cy="180" r="2" fill="#38bdf8" />

    {/* Sweeping Algebraic Horns */}
    <path
      d="M 80 155 Q 35 110 15 70 Q 55 90 95 145 Z"
      fill="url(#qbSpines)"
      stroke={hasAdapted ? '#c084fc' : '#38bdf8'}
      strokeWidth="2"
      filter="url(#qbGlow)"
    />
    <path
      d="M 95 150 Q 80 85 100 45 Q 110 90 110 145 Z"
      fill="url(#qbSpines)"
      stroke={hasAdapted ? '#c084fc' : '#38bdf8'}
      strokeWidth="1.8"
      filter="url(#qbGlow)"
    />
  </svg>
);

/* =========================================================================
   2. MATHEMATICS APEX — SINGULARITY ARCHON (Axiomatic Sovereign)
   ========================================================================= */
const SingularityArchonSVG: React.FC<{ isHurt: boolean; phase: number; hasAdapted: boolean }> = ({ isHurt, phase, hasAdapted }) => (
  <svg viewBox="0 0 340 340" className="w-full h-full drop-shadow-[0_25px_45px_rgba(0,0,0,0.98)]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="archonVortex" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="35%" stopColor={isHurt ? '#ef4444' : '#38bdf8'} />
        <stop offset="70%" stopColor={hasAdapted ? '#a855f7' : '#1e1b4b'} />
        <stop offset="100%" stopColor="#030712" />
      </radialGradient>
      <linearGradient id="goldFiligree" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="40%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>
    </defs>

    {/* Concentric Rotating Geometric Halo Rings */}
    <ellipse cx="170" cy="170" rx="145" ry="145" fill="none" stroke="url(#goldFiligree)" strokeWidth="2" strokeDasharray="14,10" className="animate-spin-slow opacity-80" />
    <ellipse cx="170" cy="170" rx="125" ry="50" fill="none" stroke="#38bdf8" strokeWidth="2.5" transform="rotate(30 170 170)" opacity="0.75" />
    <ellipse cx="170" cy="170" rx="125" ry="50" fill="none" stroke="#c084fc" strokeWidth="2" transform="rotate(-30 170 170)" opacity="0.75" />

    {/* Outer Dimensional Rift Shards */}
    <polygon points="170,25 185,60 170,50 155,60" fill="url(#goldFiligree)" />
    <polygon points="170,315 185,280 170,290 155,280" fill="url(#goldFiligree)" />
    <polygon points="25,170 60,185 50,170 60,155" fill="url(#goldFiligree)" />
    <polygon points="315,170 280,185 290,170 280,155" fill="url(#goldFiligree)" />

    {/* Gravitational Singularity Core */}
    <circle cx="170" cy="170" r={45 + phase * 6} fill="url(#archonVortex)" filter="url(#qbGlow)" className="animate-pulse" />

    {/* Archon Robed Silhouette */}
    <path d="M 140 140 Q 170 115 200 140 L 225 250 Q 170 270 115 250 Z" fill="#090d16" stroke="url(#goldFiligree)" strokeWidth="2.5" />
    {/* Crown of Proof */}
    <polygon points="170,95 185,125 178,125 170,115 162,125 155,125" fill="url(#goldFiligree)" stroke="#fef08a" strokeWidth="1" />
    {/* Piercing Celestial Visor */}
    <ellipse cx="170" cy="135" rx="14" ry="4" fill="#38bdf8" filter="url(#qbGlow)" />
  </svg>
);

/* =========================================================================
   3. COMPUTER SCIENCE — ALGORITHMIC HORROR (Recursive Tesseract Spawn)
   ========================================================================= */
const AlgorithmicHorrorSVG: React.FC<{ isHurt: boolean; hasAdapted: boolean }> = ({ isHurt, hasAdapted }) => (
  <svg viewBox="0 0 340 320" className="w-full h-full drop-shadow-[0_25px_40px_rgba(0,0,0,0.95)]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cyberNeon" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="50%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>

    {/* Ground Data Streams */}
    <ellipse cx="170" cy="290" rx="120" ry="18" fill="#000000" opacity="0.85" />
    <line x1="80" y1="290" x2="260" y2="290" stroke="#06b6d4" strokeWidth="2" strokeDasharray="8,4" />

    {/* Recursive Circuit Matrix Arms / Data Tendrils */}
    <path d="M 60 140 L 90 200 L 70 280" stroke="#06b6d4" strokeWidth="4" fill="none" strokeDasharray="6,4" />
    <path d="M 280 140 L 250 200 L 270 280" stroke="#3b82f6" strokeWidth="4" fill="none" strokeDasharray="6,4" />
    <path d="M 110 110 L 70 60 L 40 90" stroke="#a855f7" strokeWidth="3.5" fill="none" />
    <path d="M 230 110 L 270 60 L 300 90" stroke="#a855f7" strokeWidth="3.5" fill="none" />

    {/* Cybernetic Carapace */}
    <polygon points="170,80 235,125 220,230 170,270 120,230 105,125" fill="#090d16" stroke="url(#cyberNeon)" strokeWidth="3" />

    {/* Rotating Inner Tesseract Core */}
    <polygon points="170,120 205,150 170,185 135,150" fill="none" stroke="#22d3ee" strokeWidth="2.5" className="animate-spin-slow" />
    <polygon points="170,135 190,150 170,170 150,150" fill="none" stroke="#f43f5e" strokeWidth="1.8" />
    <circle cx="170" cy="150" r="10" fill={isHurt ? '#ef4444' : '#22d3ee'} filter="url(#qbGlow)" />

    {/* Optical Sensor Array */}
    <circle cx="155" cy="105" r="4" fill="#06b6d4" />
    <circle cx="170" cy="100" r="5" fill="#f43f5e" />
    <circle cx="185" cy="105" r="4" fill="#06b6d4" />
  </svg>
);

/* =========================================================================
   4. CHEMISTRY — REACTION GOLEM (Alchemical Sovereign)
   ========================================================================= */
const ReactionGolemSVG: React.FC<{ isHurt: boolean; hasAdapted: boolean }> = ({ isHurt }) => (
  <svg viewBox="0 0 340 320" className="w-full h-full drop-shadow-[0_25px_40px_rgba(0,0,0,0.95)]" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="170" cy="295" rx="125" ry="18" fill="#000000" opacity="0.85" />
    {/* Heavy Brass Plating */}
    <path d="M 100 130 Q 170 100 240 130 L 255 250 Q 170 280 85 250 Z" fill="#1c1917" stroke="#b45309" strokeWidth="3.5" />
    {/* Glass Reservoir filled with Emerald Reactive Fluid */}
    <ellipse cx="170" cy="190" rx="55" ry="42" fill="#052e16" stroke="#10b981" strokeWidth="3" />
    <circle cx="170" cy="190" r="28" fill={isHurt ? '#ef4444' : '#10b981'} opacity="0.85" filter="url(#qbGlow)" />
    {/* Steam Exchangers & Pipes */}
    <rect x="75" y="100" width="22" height="45" rx="4" fill="#78350f" stroke="#f59e0b" strokeWidth="1.5" />
    <rect x="243" y="100" width="22" height="45" rx="4" fill="#78350f" stroke="#f59e0b" strokeWidth="1.5" />
    {/* Molten Eye Grate */}
    <rect x="145" y="130" width="50" height="12" rx="3" fill="#0c0a09" stroke="#10b981" strokeWidth="2" />
    <circle cx="160" cy="136" r="3.5" fill="#34d399" />
    <circle cx="180" cy="136" r="3.5" fill="#34d399" />
  </svg>
);

/* =========================================================================
   5. BIOLOGY — DARWINIAN BEHEMOTH (Mutating Cellular Titan)
   ========================================================================= */
const DarwinianBehemothSVG: React.FC<{ isHurt: boolean; hasAdapted?: boolean }> = ({ isHurt }) => (
  <svg viewBox="0 0 340 320" className="w-full h-full drop-shadow-[0_25px_40px_rgba(0,0,0,0.95)]" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="170" cy="295" rx="125" ry="18" fill="#000000" opacity="0.85" />
    {/* Organic Chitin & Spore Tendrils */}
    <path d="M 85 140 Q 40 220 70 280 Q 170 300 270 280 Q 300 220 255 140 Q 170 90 85 140 Z" fill="#064e3b" stroke="#10b981" strokeWidth="3" />
    {/* Bioluminescent Nucleus */}
    <circle cx="170" cy="185" r="38" fill={isHurt ? '#ef4444' : '#059669'} opacity="0.9" filter="url(#qbGlow)" />
    <circle cx="170" cy="185" r="22" fill="#6ee7b7" />
    {/* Spore Pods */}
    <circle cx="125" cy="135" r="10" fill="#a7f3d0" stroke="#047857" strokeWidth="1.5" />
    <circle cx="215" cy="135" r="10" fill="#a7f3d0" stroke="#047857" strokeWidth="1.5" />
  </svg>
);

/* =========================================================================
   6. HISTORY — TIMELINE GUARDIAN (Chrono Colossus)
   ========================================================================= */
const TimelineGuardianSVG: React.FC<{ isHurt: boolean; hasAdapted?: boolean }> = ({ isHurt }) => (
  <svg viewBox="0 0 340 320" className="w-full h-full drop-shadow-[0_25px_40px_rgba(0,0,0,0.95)]" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="170" cy="295" rx="125" ry="18" fill="#000000" opacity="0.85" />
    {/* Rotating Celestial Sundial Ring */}
    <ellipse cx="170" cy="165" rx="130" ry="130" fill="none" stroke="#d97706" strokeWidth="3" strokeDasharray="16,8" className="animate-spin-slow" />
    {/* Ancient Stone Torso */}
    <polygon points="170,100 240,150 215,260 125,260 100,150" fill="#1c1917" stroke="#f59e0b" strokeWidth="3" />
    {/* Glowing Hourglass Core */}
    <polygon points="150,150 190,150 150,195 190,195" fill={isHurt ? '#ef4444' : '#f59e0b'} opacity="0.85" filter="url(#qbGlow)" />
  </svg>
);

/* =========================================================================
   7. PHYSICS — ENTROPY COLOSSUS (Gravitational Singularity Titan)
   ========================================================================= */
const EntropyColossusSVG: React.FC<{ isHurt: boolean; hasAdapted?: boolean }> = ({ isHurt }) => (
  <svg viewBox="0 0 340 320" className="w-full h-full drop-shadow-[0_25px_40px_rgba(0,0,0,0.95)]" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="170" cy="295" rx="125" ry="18" fill="#000000" opacity="0.85" />
    {/* Warped Accretion Disks */}
    <ellipse cx="170" cy="175" rx="140" ry="40" fill="none" stroke="#6366f1" strokeWidth="3.5" transform="rotate(-18 170 175)" opacity="0.85" />
    <ellipse cx="170" cy="175" rx="140" ry="40" fill="none" stroke="#a855f7" strokeWidth="2.5" transform="rotate(18 170 175)" opacity="0.85" />
    {/* Event Horizon Black Hole Core */}
    <circle cx="170" cy="175" r="42" fill="#030712" stroke="#818cf8" strokeWidth="3" filter="url(#qbGlow)" />
    <circle cx="170" cy="175" r="26" fill={isHurt ? '#ef4444' : '#4f46e5'} opacity="0.9" />
  </svg>
);

/* =========================================================================
   8. GEOGRAPHY — TECTONIC BEHEMOTH (Continental Titan)
   ========================================================================= */
const TectonicBehemothSVG: React.FC<{ isHurt: boolean; hasAdapted?: boolean }> = ({ isHurt }) => (
  <svg viewBox="0 0 340 320" className="w-full h-full drop-shadow-[0_25px_40px_rgba(0,0,0,0.95)]" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="170" cy="295" rx="125" ry="18" fill="#000000" opacity="0.85" />
    <polygon points="170,80 260,160 230,280 110,280 80,160" fill="#1c1917" stroke="#ea580c" strokeWidth="3.5" />
    {/* Magma Fissure */}
    <path d="M 170 100 L 150 180 L 190 220 L 170 280" stroke={isHurt ? '#ef4444' : '#fb923c'} strokeWidth="4" fill="none" filter="url(#qbGlow)" />
  </svg>
);

/* =========================================================================
   9. LANGUAGE — SEMANTIC SPHINX (Linguistic Sovereign)
   ========================================================================= */
const SemanticSphinxSVG: React.FC<{ isHurt: boolean; hasAdapted?: boolean }> = ({ isHurt }) => (
  <svg viewBox="0 0 340 320" className="w-full h-full drop-shadow-[0_25px_40px_rgba(0,0,0,0.95)]" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="170" cy="295" rx="125" ry="18" fill="#000000" opacity="0.85" />
    {/* Wing Silhouettes */}
    <path d="M 60 100 Q 20 180 80 260" stroke="#c084fc" strokeWidth="3" fill="none" />
    <path d="M 280 100 Q 320 180 260 260" stroke="#c084fc" strokeWidth="3" fill="none" />
    {/* Sphinx Body & Runic Head */}
    <polygon points="170,90 230,160 210,270 130,270 110,160" fill="#090d16" stroke="#c084fc" strokeWidth="3" />
    <ellipse cx="170" cy="180" rx="35" ry="25" fill={isHurt ? '#ef4444' : '#581c87'} filter="url(#qbGlow)" />
  </svg>
);
