import React from 'react';
import { CharacterRenderer, CharacterActionState } from './renderers/CharacterRenderer';
import { MonsterRenderer } from './MonsterRenderer';
import { SubjectId } from '../types/game';

interface CharacterStageProps {
  playerPose: CharacterActionState;
  playerShield: number;
  monsterVisualType: string;
  monsterName: string;
  monsterFlavorQuote?: string;
  monsterHurt: boolean;
  monsterAttacking?: boolean;
  monsterAdapted?: boolean;
  monsterAdaptedLabel?: string;
  monsterPhase?: number;
  subject?: SubjectId;
  isGuardianBarrierActive?: boolean;
  children?: React.ReactNode; // Optional center question panel slot
}

/**
 * Cinematic 2.5D Character Stage Component
 * Positions the Knowledge Hunter on the left and the massive Boss on the right,
 * creating an epic sense of scale, physical presence, and grounded depth.
 */
export const CharacterStage: React.FC<CharacterStageProps> = ({
  playerPose,
  playerShield,
  monsterVisualType,
  monsterName,
  monsterFlavorQuote,
  monsterHurt,
  monsterAttacking = false,
  monsterAdapted = false,
  monsterAdaptedLabel,
  monsterPhase = 1,
  subject = 'mathematics',
  isGuardianBarrierActive = false,
  children,
}) => {
  return (
    <div className="relative w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 my-auto py-2 z-10 px-2 sm:px-4">
      {/* LEFT ARENA: KNOWLEDGE HUNTER / SCHOLAR */}
      <div className="flex flex-col items-center justify-end order-2 md:order-1 flex-1 max-w-[320px]">
        <div className="relative flex items-center justify-center">
          <CharacterRenderer
            state={playerPose}
            size={window.innerWidth < 640 ? 210 : 270}
          />
        </div>

        {/* Shield Status Aura under Player */}
        {playerShield > 0 && (
          <div className="mt-1 px-3 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-[11px] font-mono-code text-cyan-300 flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.4)] animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Shield: {playerShield}
          </div>
        )}
      </div>

      {/* CENTER ARENA: OPTIONAL QUESTION PANEL OR OBJECTIVE SLOT */}
      {children && (
        <div className="flex flex-col items-center justify-center order-1 md:order-2 w-full max-w-md mx-auto z-20">
          {children}
        </div>
      )}

      {/* RIGHT ARENA: MASSIVE RAID BOSS */}
      <div className="flex flex-col items-center justify-end order-3 flex-1 max-w-[420px]">
        <div className="relative flex items-center justify-center">
          {/* Guardian Barrier Crystalline Aegis */}
          {isGuardianBarrierActive && (
            <div className="absolute -inset-4 rounded-full border-4 border-amber-400/80 shadow-[0_0_40px_rgba(251,191,36,0.9)] animate-pulse pointer-events-none z-20 flex items-center justify-center">
              <span className="absolute -top-3.5 px-3 py-0.5 rounded-full bg-amber-950/95 border border-amber-400 text-amber-200 text-[9px] font-mono-code font-extrabold uppercase tracking-wider shadow-lg">
                GUARDIAN BARRIER ACTIVE
              </span>
            </div>
          )}

          <MonsterRenderer
            visualType={monsterVisualType}
            isHurt={monsterHurt}
            isAttacking={monsterAttacking}
            hasAdapted={monsterAdapted}
            adaptedLabel={monsterAdaptedLabel}
            size={window.innerWidth < 640 ? 270 : 380}
            phase={monsterPhase}
            subject={subject}
          />
        </div>

        {/* Boss Lore / Flavor Quote */}
        {monsterFlavorQuote && (
          <p className="text-[11px] sm:text-xs text-slate-400/90 font-cinzel italic mt-2 text-center max-w-xs leading-tight line-clamp-2">
            "{monsterFlavorQuote}"
          </p>
        )}
      </div>
    </div>
  );
};
