export interface RelicMetadata {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'mythic';
  icon: string;
  description: string;
  flavorQuote: string;
}

export const RELIC_CATALOG: Record<string, RelicMetadata> = {
  'Focus Rune': {
    id: 'focus_rune',
    name: 'Focus Rune',
    rarity: 'common',
    icon: 'Zap',
    description: 'Stabilizes starting concentration. Grants 10 starting Shield each encounter.',
    flavorQuote: 'Order begins with undivided intent.',
  },
  'Time Shard': {
    id: 'time_shard',
    name: 'Time Shard',
    rarity: 'common',
    icon: 'Hourglass',
    description: 'Bends calculation intervals. Draws 1 additional card on Turn 1.',
    flavorQuote: 'A single moment holds infinite transformations.',
  },
  'Singularity Prism': {
    id: 'singularity_prism',
    name: 'Singularity Prism',
    rarity: 'rare',
    icon: 'Sparkles',
    description: 'Forged in the Crucible of Dual Axioms. Accelerates realm mastery gains by 15%.',
    flavorQuote: 'Fractures the veil between discrete axioms.',
  },
  'Quantum Cache': {
    id: 'quantum_cache',
    name: 'Quantum Cache',
    rarity: 'rare',
    icon: 'Database',
    description: 'Caches subproblem invariants. Enhances algorithmic sequencing damage by 10.',
    flavorQuote: 'Never recalculate what memory can hold once.',
  },
  'Aegis of the Hunted': {
    id: 'aegis_hunted',
    name: 'Aegis of the Hunted',
    rarity: 'rare',
    icon: 'Shield',
    description: 'Awarded for surviving a Dimensional Ambush. Absorbs the first misconception penalty each battle.',
    flavorQuote: 'The hunter learns quickest when cornered.',
  },
  'Prism of the Council': {
    id: 'prism_council',
    name: 'Prism of the Council',
    rarity: 'mythic',
    icon: 'Crown',
    description: 'Ultimate supreme relic awarded upon overcoming The Convergence. Unifies all 8 Spire domains.',
    flavorQuote: 'The eight sovereigns speak as one, and you hold their harmony.',
  },
  'Mark of the Parity Mirror': {
    id: 'mark_parity_mirror',
    name: 'Mark of the Parity Mirror',
    rarity: 'rare',
    icon: 'RefreshCw',
    description: 'Claimed by defeating a Mirror Boss. Neutralizes enemy counter-shields on alternating turns.',
    flavorQuote: 'You saw your own reflection, and refused to break.',
  },
};

export function getRelicMetadata(relicName: string): RelicMetadata {
  if (RELIC_CATALOG[relicName]) {
    return RELIC_CATALOG[relicName];
  }

  // Fallback for dynamic / custom relics
  const isMirror = relicName.toLowerCase().includes('mirror') || relicName.toLowerCase().includes('mark');
  const isPrism = relicName.toLowerCase().includes('prism') || relicName.toLowerCase().includes('apex');

  return {
    id: relicName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    name: relicName,
    rarity: isPrism ? 'mythic' : (isMirror ? 'rare' : 'common'),
    icon: isPrism ? 'Crown' : (isMirror ? 'RefreshCw' : 'Shield'),
    description: 'Mystical artifact discovered during your ascent through the Spire.',
    flavorQuote: 'Carries the resonance of proven truth.',
  };
}
