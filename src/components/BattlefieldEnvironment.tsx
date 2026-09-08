import React from 'react';
import { SubjectId } from '../types/game';

interface BattlefieldEnvironmentProps {
  subject?: SubjectId;
  children?: React.ReactNode;
}

/**
 * 6-Layer Cinematic Battlefield Environment
 * Creates deep 2.5D visual perspective tailored to each educational realm.
 */
export const BattlefieldEnvironment: React.FC<BattlefieldEnvironmentProps> = ({
  subject = 'mathematics',
  children,
}) => {
  // Realm-specific color palette and atmospheric themes
  const realmThemes: Record<
    string,
    {
      skyFrom: string;
      skyVia: string;
      skyTo: string;
      accentGlow: string;
      midgroundColor: string;
      floorColor: string;
      floorRuneColor: string;
    }
  > = {
    mathematics: {
      skyFrom: '#050b18',
      skyVia: '#081426',
      skyTo: '#03060c',
      accentGlow: 'rgba(6, 182, 212, 0.25)',
      midgroundColor: '#0a192f',
      floorColor: '#0c1626',
      floorRuneColor: '#22d3ee',
    },
    computerScience: {
      skyFrom: '#060a14',
      skyVia: '#0c1024',
      skyTo: '#020409',
      accentGlow: 'rgba(59, 130, 246, 0.25)',
      midgroundColor: '#0f172a',
      floorColor: '#0b1120',
      floorRuneColor: '#60a5fa',
    },
    physics: {
      skyFrom: '#0d071a',
      skyVia: '#140c28',
      skyTo: '#04020a',
      accentGlow: 'rgba(168, 85, 247, 0.25)',
      midgroundColor: '#1e1035',
      floorColor: '#120924',
      floorRuneColor: '#c084fc',
    },
    chemistry: {
      skyFrom: '#04150e',
      skyVia: '#072418',
      skyTo: '#020b07',
      accentGlow: 'rgba(16, 185, 129, 0.25)',
      midgroundColor: '#064e3b',
      floorColor: '#062d1b',
      floorRuneColor: '#34d399',
    },
    biology: {
      skyFrom: '#03140e',
      skyVia: '#06241b',
      skyTo: '#010a06',
      accentGlow: 'rgba(20, 184, 166, 0.25)',
      midgroundColor: '#042f2e',
      floorColor: '#06251b',
      floorRuneColor: '#2dd4bf',
    },
    history: {
      skyFrom: '#1c1005',
      skyVia: '#261708',
      skyTo: '#0a0601',
      accentGlow: 'rgba(245, 158, 11, 0.25)',
      midgroundColor: '#3b200b',
      floorColor: '#261405',
      floorRuneColor: '#fbbf24',
    },
    geography: {
      skyFrom: '#1a0d05',
      skyVia: '#24140a',
      skyTo: '#0a0502',
      accentGlow: 'rgba(234, 88, 12, 0.25)',
      midgroundColor: '#431407',
      floorColor: '#271008',
      floorRuneColor: '#f97316',
    },
    language: {
      skyFrom: '#150820',
      skyVia: '#1c0c2e',
      skyTo: '#08030f',
      accentGlow: 'rgba(192, 132, 252, 0.25)',
      midgroundColor: '#2e1065',
      floorColor: '#1e0838',
      floorRuneColor: '#e9d5ff',
    },
  };

  const theme = realmThemes[subject] || realmThemes.mathematics;

  return (
    <div
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0"
      style={{
        background: `radial-gradient(ellipse at 50% 30%, ${theme.skyVia} 0%, ${theme.skyFrom} 55%, ${theme.skyTo} 100%)`,
      }}
    >
      {/* LAYER 1: FAR BACKGROUND CELESTIAL SKY & HORIZON LIGHT */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background: `radial-gradient(circle at 50% 15%, ${theme.accentGlow} 0%, transparent 60%)`,
        }}
      />

      {/* Distant Constellation / Sky Grid */}
      <svg
        className="absolute top-0 inset-x-0 w-full h-64 opacity-25"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1200 300"
        preserveAspectRatio="none"
      >
        <line x1="0" y1="220" x2="1200" y2="220" stroke={theme.floorRuneColor} strokeWidth="0.8" strokeDasharray="6,8" />
        <line x1="150" y1="220" x2="600" y2="50" stroke={theme.floorRuneColor} strokeWidth="0.5" opacity="0.6" />
        <line x1="1050" y1="220" x2="600" y2="50" stroke={theme.floorRuneColor} strokeWidth="0.5" opacity="0.6" />
        <circle cx="600" cy="50" r="3.5" fill={theme.floorRuneColor} />
        <circle cx="350" cy="120" r="2" fill="#ffffff" />
        <circle cx="850" cy="110" r="2.5" fill="#ffffff" />
      </svg>

      {/* LAYER 2: MIDGROUND FLOATING REALM PEAKS & SPIRES */}
      <svg
        className="absolute bottom-16 inset-x-0 w-full h-72 opacity-40"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
      >
        {/* Left Spire Peaks */}
        <polygon points="40,400 120,120 180,400" fill={theme.midgroundColor} />
        <polygon points="150,400 230,160 310,400" fill={theme.midgroundColor} />
        {/* Right Jagged Formations */}
        <polygon points="880,400 970,140 1060,400" fill={theme.midgroundColor} />
        <polygon points="1020,400 1100,100 1180,400" fill={theme.midgroundColor} />
        {/* Distant Shattered Monolith Floating Arch */}
        <path d="M 450 400 Q 600 220 750 400" stroke={theme.midgroundColor} strokeWidth="18" fill="none" opacity="0.5" />
      </svg>

      {/* LAYER 3: VOLUMETRIC ATMOSPHERIC GROUND FOG */}
      <div
        className="absolute inset-x-0 bottom-0 h-80 pointer-events-none opacity-60"
        style={{
          background: `linear-gradient(to top, ${theme.skyTo} 0%, ${theme.skyFrom}80 35%, transparent 100%)`,
        }}
      />
      <div
        className="absolute inset-x-0 bottom-16 h-36 pointer-events-none opacity-30 animate-pulse"
        style={{
          background: `radial-gradient(ellipse at 50% 80%, ${theme.accentGlow} 0%, transparent 70%)`,
        }}
      />

      {/* LAYER 4: BATTLEFIELD CRACKED RUNIC PLATFORM FLOOR */}
      <svg
        className="absolute bottom-0 inset-x-0 w-full h-44 opacity-85"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1200 240"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="arenaFloorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.4" />
            <stop offset="40%" stopColor="#0f172a" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.98" />
          </linearGradient>
        </defs>

        {/* Perspective Trapeze Arena Base */}
        <polygon points="120,40 1080,40 1200,240 0,240" fill="url(#arenaFloorGrad)" stroke="#334155" strokeWidth="1" />

        {/* Center Ground Combat Meridian Arc */}
        <path
          d="M 220 120 Q 600 190 980 120"
          fill="none"
          stroke={theme.floorRuneColor}
          strokeWidth="2"
          strokeDasharray="12,8"
          opacity="0.65"
        />
        {/* Left (Player) Ground Summoning Pedestal Focus */}
        <ellipse cx="280" cy="130" rx="90" ry="25" fill="none" stroke={theme.floorRuneColor} strokeWidth="1.5" opacity="0.75" />
        {/* Right (Boss) Ground Impact Crater Focus */}
        <ellipse cx="880" cy="130" rx="140" ry="32" fill="none" stroke={theme.floorRuneColor} strokeWidth="1.8" strokeDasharray="8,6" opacity="0.8" />
      </svg>

      {/* Slot for any foreground environmental children */}
      {children}
    </div>
  );
};
