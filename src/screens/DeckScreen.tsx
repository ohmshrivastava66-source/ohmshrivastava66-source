import React, { useState } from 'react';
import { Card, SubjectId } from '../types/game';
import { MATH_STARTER_CARDS } from '../curriculum/mathematics';
import { CS_STARTER_CARDS } from '../curriculum/computerScience';
import { CardComponent } from '../components/CardComponent';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { Shield, Sparkles, Filter, ArrowLeft } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface DeckScreenProps {
  unlockedCardIds: string[];
  onBack: () => void;
}

export const DeckScreen: React.FC<DeckScreenProps> = ({ unlockedCardIds, onBack }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [inspectedCard, setInspectedCard] = useState<Card | null>(null);

  // Combine all cards in registry
  const allCards: Card[] = [
    ...MATH_STARTER_CARDS,
    {
      id: 'math_factor_mastery',
      name: 'Factor Mastery',
      cost: 1,
      subject: 'mathematics' as SubjectId,
      rarity: 'rare',
      operationKey: 'FACTOR',
      description: 'Instantly split complex quadratics with high precision.',
      effectText: 'Deals 45 DMG & gains 20 Shield.',
      damage: 45,
      shield: 20,
      iconName: 'Flame',
      flavorQuote: 'Roots cannot hide from a master.',
    },
    ...CS_STARTER_CARDS,
    {
      id: 'cs_binary_search',
      name: 'Binary Divide',
      cost: 1,
      subject: 'computerScience' as SubjectId,
      rarity: 'rare',
      operationKey: 'COMPARE',
      description: 'Halve the search space instantly.',
      effectText: 'Deals 40 DMG & reduces enemy defense.',
      damage: 40,
      shield: 15,
      iconName: 'Cpu',
      flavorQuote: 'O(log n) slices through exponential beasts.',
    },
  ];

  const filteredCards = allCards.filter(c => {
    if (selectedSubject === 'all') return true;
    return c.subject === selectedSubject;
  });

  return (
    <div className="relative min-h-[calc(100dvh-54px)] p-4 sm:p-8 flex flex-col items-center select-none overflow-y-auto">
      <ParticleCanvas color="#06b6d4" count={30} />

      {/* Screen Title */}
      <div className="z-10 text-center max-w-xl mb-4">
        <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-300 mx-auto mb-2 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          <Shield className="w-5 h-5" />
        </div>
        <h2 className="font-cinzel font-bold text-2xl sm:text-3xl text-slate-100 tracking-wide">
          Cognitive Card Codex
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Inspect and review the tools of reasoning unlocked during your expeditions.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="z-10 flex items-center gap-2 mb-6 flex-wrap justify-center">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-cinzel font-semibold mr-2">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          Filter:
        </div>
        {['all', 'mathematics', 'computerScience'].map(filterKey => (
          <button
            key={filterKey}
            onClick={() => { sounds.playClick(); setSelectedSubject(filterKey); }}
            className={`px-3 py-1 rounded-lg text-xs font-cinzel font-semibold transition-colors ${
              selectedSubject === filterKey
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-400'
                : 'glass-panel text-slate-400 hover:text-white'
            }`}
          >
            {filterKey === 'all' ? 'All Realms' : filterKey === 'mathematics' ? 'Mathematics' : 'Computer Science'}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="z-10 w-full max-w-5xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-8 place-items-center">
        {filteredCards.map(card => {
          const isUnlocked = unlockedCardIds.includes(card.id);
          return (
            <div key={card.id} className="relative">
              <CardComponent
                card={card}
                onClick={c => setInspectedCard(c)}
                disabled={!isUnlocked}
              />
              {!isUnlocked && (
                <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-mono-code text-slate-400 bg-slate-950/90 px-2 py-1 rounded border border-slate-700">
                    LOCKED
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Inspected Card Detail Modal */}
      {inspectedCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setInspectedCard(null)}
        >
          <div
            className="glass-panel max-w-sm w-full p-6 rounded-3xl border border-cyan-500/50 shadow-2xl flex flex-col items-center gap-4"
            onClick={e => e.stopPropagation()}
          >
            <CardComponent card={inspectedCard} onClick={() => {}} />
            <div className="text-center">
              <span className="text-xs font-mono-code text-cyan-300 uppercase tracking-widest font-bold">
                {inspectedCard.subject} • {inspectedCard.rarity}
              </span>
              <p className="text-xs text-slate-300 mt-2 italic leading-relaxed">
                "{inspectedCard.flavorQuote || inspectedCard.description}"
              </p>
            </div>
            <button
              onClick={() => setInspectedCard(null)}
              className="btn-fantasy-primary w-full py-2 rounded-xl text-xs font-cinzel font-bold text-white"
            >
              Close Inspection
            </button>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="z-10 mt-auto pb-4">
        <button
          onClick={() => { sounds.playClick(); onBack(); }}
          className="px-5 py-2 rounded-xl glass-panel text-xs font-cinzel font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Citadel
        </button>
      </div>
    </div>
  );
};
