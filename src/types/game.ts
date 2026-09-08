// Game & Engine Type Definitions for Algo-Spire

export type AppScreen =
  | 'HOME'
  | 'SUBJECT_SELECT'
  | 'EDUCATION_SELECT'
  | 'WORLD_MAP'
  | 'STORY_INTRO'
  | 'BATTLE'
  | 'ECHO_DUNGEON'
  | 'VICTORY'
  | 'DEFEAT'
  | 'DECK'
  | 'KNOWLEDGE_MAP'
  | 'PROFILE'
  | 'SETTINGS'
  | 'SURPRISE_ATTACK_WARNING'
  | 'SURPRISE_ATTACK_BATTLE'
  | 'CONVERGENCE_REVEAL'
  | 'CONVERGENCE_BATTLE'
  | 'CONVERGENCE_VICTORY'
  | 'OBSERVER_CHALLENGE'
  | 'OBSERVER_DIALOGUE'
  | 'MIRROR_BOSS_BATTLE'
  | 'LAST_QUESTION'
  | 'TRUE_ENDING';

export type SubjectId =
  | 'mathematics'
  | 'computerScience'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'history'
  | 'geography'
  | 'language';

export type EducationLevelId =
  | 'class_1_5'
  | 'class_6_8'
  | 'class_9_10'
  | 'class_11_12'
  | 'college_foundation'
  | 'college_advanced';

export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Card {
  id: string;
  name: string;
  cost: number;
  subject: SubjectId;
  rarity: CardRarity;
  operationKey: string; // matches encounter step key e.g. 'FACTOR', 'SOLVE', 'TRAVERSE'
  description: string;
  effectText: string;
  damage: number;
  shield: number;
  drawCards?: number;
  iconName: string;
  prerequisiteKey?: string;
  flavorQuote?: string;
}

export interface StatusEffect {
  id: string;
  name: string;
  type: 'buff' | 'debuff';
  stacks: number;
  description: string;
  icon: string;
}

export interface PlayerState {
  name: string;
  maxHp: number;
  currentHp: number;
  maxEnergy: number;
  currentEnergy: number;
  shield: number;
  hand: Card[];
  drawPile: Card[];
  discardPile: Card[];
  statusEffects: StatusEffect[];
  relics: string[];
  hiddenCards?: string[];
  costModifiers?: Record<string, number>;
}

export interface BossModifier {
  id: string;
  name: string;
  type: 'hide_card' | 'increase_cost' | 'disable_optional' | 'extra_step' | 'lock_card';
  targetCardId?: string;
  targetOperation?: string;
  costIncrease?: number;
  description: string;
  durationTurns?: number;
}

export interface EnemyIntent {
  type: 'attack' | 'shield' | 'buff' | 'adapt' | 'trap';
  value: number;
  description: string;
}

export interface EnemyState {
  id: string;
  name: string;
  title: string;
  maxHp: number;
  currentHp: number;
  shield: number;
  attackPower: number;
  subject: SubjectId;
  visualType: string;
  intent: EnemyIntent;
  statusEffects: StatusEffect[];
  adaptedModifier?: {
    name: string;
    description: string;
    penaltyCost?: number;
    lockPrerequisite?: boolean;
    trappedOperation?: string;
  };
  phase: number;
  maxPhases: number;
}

export interface BattleActionLog {
  id: string;
  turn: number;
  sender: 'player' | 'enemy' | 'system';
  message: string;
  type: 'card' | 'damage' | 'shield' | 'error' | 'adapt' | 'heal';
  value?: number;
  timestamp: number;
}

export interface Relic {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'legendary';
}
