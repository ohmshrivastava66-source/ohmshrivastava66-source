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

/**
 * Premium RPG Tarot Card Component
 * Collectible dark-fantasy styling with beveled filigree, crystal cost orbs,
 * holographic foil sheen, and dynamic interaction feedback.
 */
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
  const IconComponent =
    (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
      card.iconName
    ] || LucideIcons.Sparkles;

  // Border & Glow styling per rarity
  const rarityConfig = {
    common: {
      border: 'border-slate-600/90 hover:border-slate-300',
      bg: 'from-[#0b101c]/95 via-[#0e1726]/95 to-[#060912]/98',
      glow: 'hover:shadow-[0_0_25px_rgba(148,163,184,0.4)]',
      gem: 'bg-slate-300 shadow-[0_0_8px_rgba(203,213,225,0.8)]',
      filigree: 'text-slate-500',
      titleColor: 'text-slate-100',
    },
    rare: {
      border: 'border-cyan-500/80 hover:border-cyan-200',
      bg: 'from-[#081b2e]/95 via-[#0c2842]/95 to-[#05111f]/98',
      glow: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]',
      gem: 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]',
      filigree: 'text-cyan-500/70',
      titleColor: 'text-cyan-100',
    },
    epic: {
      border: 'border-purple-500/80 hover:border-purple-200',
      bg: 'from-[#1e0d30]/95 via-[#2d1247]/95 to-[#11051c]/98',
      glow: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]',
      gem: 'bg-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.9)]',
      filigree: 'text-purple-500/70',
      titleColor: 'text-purple-100',
    },
    legendary: {
      border: 'border-amber-400/90 hover:border-amber-100',
      bg: 'from-[#2b1805]/95 via-[#3b2007]/95 to-[#170901]/98',
      glow: 'hover:shadow-[0_0_35px_rgba(245,158,11,0.7)]',
      gem: 'bg-amber-300 animate-pulse shadow-[0_0_15px_rgba(251,191,36,1)]',
      filigree: 'text-amber-500/80',
      titleColor: 'text-amber-100',
    },
  }[card.rarity] || {
    border: 'border-slate-600',
    bg: 'from-slate-900 to-slate-950',
    glow: '',
    gem: 'bg-slate-400',
    filigree: 'text-slate-600',
    titleColor: 'text-slate-200',
  };

  const handleMouseEnter = () => {
    if (!disabled) sounds.playCardHover();
  };

  const handleClick = () => {
    if (!disabled && !isHidden) {
      sounds.playCardDraw();
      onClick(card);
    }
  };

  if (isHidden) {
    return (
      <div
        className={`relative select-none cursor-not-allowed rounded-2xl border-2 border-purple-900/80 bg-gradient-to-b from-[#11061c]/95 via-[#090212]/95 to-[#040108]/98 flex flex-col items-center justify-center p-3 text-center opacity-80 shadow-[0_0_25px_rgba(88,28,135,0.5)] ${
          compact ? 'w-28 h-40' : 'w-40 sm:w-48 h-60 sm:h-72'
        }`}
        title="Shrouded in dark mist by boss interference"
      >
        <div className="w-12 h-12 rounded-2xl bg-purple-950/90 border border-purple-600/60 flex items-center justify-center text-purple-300 mb-2 shadow-inner animate-pulse">
          <LucideIcons.Lock className="w-6 h-6 text-purple-300" />
        </div>
        <h4 className="font-cinzel font-bold text-slate-300 text-xs sm:text-sm tracking-wide">
          Shrouded Ward
        </h4>
        <span className="text-[9px] font-mono-code text-purple-400 uppercase tracking-widest mt-1">
          [VOID VEIL]
        </span>
        <p className="text-[10px] text-slate-500 mt-2 italic px-1">
          Interfered by the Archon's ancient wards.
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
      className={`relative group card-hologram select-none cursor-pointer rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between shadow-xl min-h-[44px] min-w-[44px] ${
        rarityConfig.border
      } ${rarityConfig.glow} bg-gradient-to-b ${rarityConfig.bg} ${
        disabled
          ? 'opacity-40 grayscale pointer-events-none cursor-not-allowed transform-none'
          : 'hover:-translate-y-3.5 hover:scale-[1.04] active:scale-95'
      } ${highlight ? 'ring-2 ring-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.8)]' : ''} ${
        compact ? 'w-28 h-40 p-2 text-xs' : 'w-40 sm:w-48 h-60 sm:h-72 p-3 text-sm'
      }`}
    >
      {/* Ornate Corner Filigree Accents */}
      <div className={`absolute top-1.5 left-1.5 text-[9px] font-cinzel ${rarityConfig.filigree} opacity-60 pointer-events-none`}>
        ✦
      </div>
      <div className={`absolute top-1.5 right-1.5 text-[9px] font-cinzel ${rarityConfig.filigree} opacity-60 pointer-events-none`}>
        ✦
      </div>

      {/* TOP HEADER: Crystal Energy Orb & Rarity Gem */}
      <div className="flex items-center justify-between z-10 w-full">
        {/* Crystal Energy Orb */}
        <div
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 via-cyan-400 to-sky-200 border-2 border-cyan-100 flex items-center justify-center font-extrabold text-slate-950 text-xs sm:text-sm shadow-[0_0_14px_rgba(56,189,248,0.9)] font-mono-code"
          title={`Energy Cost: ${effectiveCost}`}
        >
          {effectiveCost}
        </div>

        {/* Rarity Gem & Title */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950/70 border border-slate-800">
          <span className={`w-2 h-2 rounded-full ${rarityConfig.gem}`} />
          <span className="text-[9px] tracking-widest font-cinzel uppercase font-bold text-slate-300">
            {card.rarity}
          </span>
        </div>
      </div>

      {/* CENTER ART: Ornate Glass Emblem Frame */}
      <div className="my-auto flex flex-col items-center justify-center z-10 w-full py-1">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-slate-950/90 to-slate-900/90 border border-slate-700/70 flex items-center justify-center text-cyan-300 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] group-hover:scale-110 group-hover:text-cyan-100 group-hover:border-cyan-400/60 transition-all duration-200">
          <IconComponent className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>

        {/* Operation Name */}
        <h4 className={`mt-2 font-cinzel font-bold text-center tracking-wide text-xs sm:text-sm ${rarityConfig.titleColor} group-hover:text-white transition-colors`}>
          {card.name}
        </h4>

        {/* Operation Key Badge */}
        <span className="text-[9px] font-mono-code text-cyan-400/90 uppercase tracking-widest font-semibold mt-0.5">
          [{card.operationKey}]
        </span>
      </div>

      {/* BOTTOM EFFECT & STAT BADGES */}
      <div className="z-10 bg-slate-950/80 rounded-xl p-2 border border-slate-800/80 flex flex-col gap-1 shadow-inner">
        <p className="text-[10px] sm:text-[11px] text-slate-300 line-clamp-2 leading-tight text-center">
          {card.description}
        </p>

        {/* Action Indicators */}
        <div className="flex items-center justify-around text-[10px] font-bold pt-1 border-t border-slate-800/80">
          {card.damage > 0 && (
            <span className="text-red-400 flex items-center gap-0.5">
              ⚔️ {card.damage}
            </span>
          )}
          {card.shield > 0 && (
            <span className="text-cyan-300 flex items-center gap-0.5">
              🛡️ {card.shield}
            </span>
          )}
          {card.drawCards && (
            <span className="text-purple-300 flex items-center gap-0.5">
              🃏 +{card.drawCards}
            </span>
          )}
        </div>
      </div>

      {/* Flavor Quote Reveal on hover */}
      {card.flavorQuote && (
        <div className="absolute inset-x-2 bottom-2 bg-slate-950/95 border border-cyan-500/50 rounded-xl p-2 text-[10px] text-cyan-200/95 italic text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-2xl">
          "{card.flavorQuote}"
        </div>
      )}
    </div>
  );
};
