import React from 'react';
import { Card } from '../types/game';
import * as LucideIcons from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface CardComponentProps {
  card: Card;
  onClick: (card: Card) => void;
  disabled?: boolean;
  costModifier?: number;
  highlight?: boolean;
  compact?: boolean;
  isHidden?: boolean;
}

export const CardComponent: React.FC<CardComponentProps> = ({
  card,
  onClick,
  disabled = false,
  costModifier = 0,
  highlight = false,
  compact = false,
  isHidden = false,
}) => {
  const effectiveCost = Math.max(0, card.cost + costModifier);

  // Dynamic Lucide icon lookup with fallback
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
    card.iconName
  ] || LucideIcons.Sparkles;

  // Border & Glow styling per rarity
  const rarityConfig = {
    common: {
      border: 'border-slate-600/80 hover:border-slate-400',
      bg: 'from-slate-900/90 via-[#0c111d]/90 to-slate-950/95',
      glow: 'hover:shadow-[0_0_20px_rgba(148,163,184,0.3)]',
      gem: 'bg-slate-400',
      text: 'text-slate-300',
    },
    rare: {
      border: 'border-cyan-500/70 hover:border-cyan-300',
      bg: 'from-[#0b1b2b]/95 via-[#081524]/90 to-[#050e18]/95',
      glow: 'hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]',
      gem: 'bg-cyan-400',
      text: 'text-cyan-300',
    },
    epic: {
      border: 'border-purple-500/70 hover:border-purple-300',
      bg: 'from-[#1c0d2e]/95 via-[#130821]/90 to-[#0b0314]/95',
      glow: 'hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]',
      gem: 'bg-purple-400',
      text: 'text-purple-300',
    },
    legendary: {
      border: 'border-amber-400/80 hover:border-amber-200',
      bg: 'from-[#2b1805]/95 via-[#1a0e02]/90 to-[#0d0701]/95',
      glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.6)]',
      gem: 'bg-amber-300 animate-pulse',
      text: 'text-amber-300',
    },
  }[card.rarity];

  const handleMouseEnter = () => {
    if (!disabled) sounds.playCardHover();
  };

  const handleClick = () => {
    if (!disabled && !isHidden) onClick(card);
  };

  if (isHidden) {
    return (
      <div
        className={`relative select-none cursor-not-allowed rounded-xl border-2 border-purple-900/60 bg-gradient-to-b from-[#0e0717]/95 via-[#08030f]/95 to-[#05010a]/95 flex flex-col items-center justify-center p-3 text-center opacity-75 shadow-[0_0_20px_rgba(88,28,135,0.4)] ${
          compact ? 'w-32 h-44' : 'w-44 sm:w-48 h-64 sm:h-68'
        }`}
        title="Shrouded in dark mist by boss interference"
      >
        <div className="w-12 h-12 rounded-full bg-purple-950/80 border border-purple-700/50 flex items-center justify-center text-purple-400 mb-2 animate-pulse">
          <LucideIcons.Lock className="w-6 h-6 text-purple-300" />
        </div>
        <h4 className="font-cinzel font-bold text-slate-300 text-sm tracking-wide">
          Shrouded Ward
        </h4>
        <span className="text-[10px] font-mono-code text-purple-400/80 uppercase tracking-widest mt-1">
          [SHROUDED]
        </span>
        <p className="text-[10px] text-slate-500 mt-2 italic px-1">
          Veiled by the Archon's ancient wards.
        </p>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleClick()}
      className={`relative group card-hologram select-none cursor-pointer rounded-xl border-2 transition-all duration-200 flex flex-col justify-between ${
        rarityConfig.border
      } ${rarityConfig.glow} bg-gradient-to-b ${rarityConfig.bg} ${
        disabled
          ? 'opacity-45 grayscale pointer-events-none cursor-not-allowed transform-none'
          : 'hover:-translate-y-3 hover:scale-105 active:scale-95'
      } ${highlight ? 'ring-2 ring-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.7)]' : ''} ${
        compact ? 'w-32 h-44 p-2 text-xs' : 'w-44 sm:w-48 h-64 sm:h-68 p-3 text-sm'
      }`}
    >
      {/* Top Bar: Energy Orb & Gem */}
      <div className="flex items-center justify-between z-10">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-300 border border-cyan-100 flex items-center justify-center font-bold text-slate-950 text-sm shadow-[0_0_12px_rgba(56,189,248,0.8)] font-mono-code">
          {effectiveCost}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${rarityConfig.gem} shadow-sm`} />
          <span className="text-[10px] tracking-widest font-cinzel uppercase font-semibold text-slate-400">
            {card.rarity}
          </span>
        </div>
      </div>

      {/* Center Art / Icon Emblem */}
      <div className="my-auto flex flex-col items-center justify-center z-10">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-950/80 border border-slate-700/60 flex items-center justify-center text-cyan-300 shadow-inner group-hover:scale-110 group-hover:text-cyan-200 transition-transform">
          <IconComponent className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <h4 className="mt-2 font-cinzel font-bold text-slate-100 text-center tracking-wide group-hover:text-cyan-300 transition-colors">
          {card.name}
        </h4>
        <span className="text-[10px] font-mono-code text-cyan-400/80 uppercase tracking-wider">
          [{card.operationKey}]
        </span>
      </div>

      {/* Description & Effect */}
      <div className="z-10 bg-slate-950/60 rounded-lg p-2 border border-slate-800/80 flex flex-col gap-1">
        <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight">
          {card.description}
        </p>
        <div className="flex items-center justify-between text-[11px] font-semibold pt-1 border-t border-slate-800/60">
          {card.damage > 0 && (
            <span className="text-red-400 flex items-center gap-0.5">
              ⚔️ {card.damage}
            </span>
          )}
          {card.shield > 0 && (
            <span className="text-cyan-400 flex items-center gap-0.5">
              🛡️ {card.shield}
            </span>
          )}
          {card.drawCards && (
            <span className="text-purple-400 flex items-center gap-0.5">
              🃏 +{card.drawCards}
            </span>
          )}
        </div>
      </div>

      {/* Flavor Quote on hover */}
      {card.flavorQuote && (
        <div className="absolute inset-x-2 bottom-2 bg-slate-950/95 border border-cyan-500/40 rounded-lg p-2 text-[10px] text-cyan-200/90 italic text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
          "{card.flavorQuote}"
        </div>
      )}
    </div>
  );
};
