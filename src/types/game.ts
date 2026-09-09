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

export type CanonicalRealmId =
  | 'mathematics'
  | 'computerScience'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'history'
  | 'geography'
  | 'language';

export type SubjectId =
  | CanonicalRealmId
  | 'data_structures_algorithms';

export type KingdomId =
  | 'primary_academy'
  | 'middle_spire'
  | 'secondary_bastion'
  | 'higher_sanctuary'
  | 'undergraduate_forge'
  | 'archon_observatory';

export type ClassId =
  | 'class_1'
  | 'class_2'
  | 'class_3'
  | 'class_4'
  | 'class_5'
  | 'class_6'
  | 'class_7'
  | 'class_8'
  | 'class_9'
  | 'class_10'
  | 'class_11'
  | 'class_12'
  | 'undergraduate_year_1'
  | 'undergraduate_year_2'
  | 'undergraduate_year_3'
  | 'undergraduate_year_4'
  | 'archon_research_1'
  | 'archon_research_2'
  | 'legacy_tier';

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
  type:
    | 'hide_card'
    | 'increase_cost'
    | 'disable_optional'
    | 'extra_step'
    | 'lock_card'
    | 'fractured_state'
    | 'guardian_phase'
    | 'countersign'
    | 'distortion';
  targetCardId?: string;
  targetOperation?: string;
  costIncrease?: number;
  description: string;
  durationTurns?: number;
  fracturedVisualPrompt?: string;
  guardianBarrierHp?: number;
  isGuardianBarrierActive?: boolean;
  countersignEffect?: string;
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
  activeAbilities?: string[];
  isGuardianBarrierActive?: boolean;
  fracturedStateActive?: boolean;
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
