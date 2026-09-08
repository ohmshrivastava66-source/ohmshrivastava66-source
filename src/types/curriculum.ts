import { SubjectId, Card } from './game';

export interface StepTransformation {
  stepIndex: number;
  operationKey: string;
  resultingState: string;
  explanation: string;
  damageValue: number;
}

export interface MisconceptionRule {
  triggerOperation: string; // e.g., 'EXPAND' played when 'FACTOR' was expected
  atStepIndex: number;
  diagnosisType:
    | 'conceptual_misconception'
    | 'procedural_error'
    | 'algorithmic_inefficiency'
    | 'prerequisite_gap'
    | 'impulsive_guessing'
    | 'multi_step_breakdown'
    | 'calculation_error';
  title: string;
  diagnosisExplanation: string;
  enemyAdaptationName: string;
  enemyAdaptationEffect: string;
  repairConcept: string;
  echoVaultId: string;
}

export interface EncounterDefinition {
  id: string;
  levelNumber: number;
  levelTitle: string;
  subject: SubjectId;
  topic: string;
  conceptName: string;
  isBoss?: boolean;
  objective?: string; // Player-facing educational goal describing WHAT to solve without revealing answers
  problemStatement: string;
  initialEquationOrState: string;
  targetState: string;
  optimalSequence: string[]; // sequence of operationKeys e.g. ['FACTOR', 'SOLVE', 'VERIFY']
  stepTransformations: StepTransformation[];
  validCards: Card[];
  misconceptions: MisconceptionRule[];
  enemy: {
    name: string;
    title: string;
    hp: number;
    attack: number;
    visualType: string;
    flavorQuote: string;
  };
  rewardXp: number;
  rewardMastery: number;
  unlockedCard?: Card;
  pathType?: 'main' | 'hidden_trial';
  compressedConcepts?: string[];
  unlocksBossDirectly?: boolean;
  fallbackMainPathLevelMap?: Record<string, number>;
  prestigeRewards?: {
    title?: string;
    relic?: string;
    bonusXp?: number;
    cardId?: string;
  };
  trialOrder?: number;
  correctAnswer?: string;
  alternativePaths?: SolutionPathDefinition[];
  recoveryPaths?: RecoveryPathDefinition[];
}

export interface SolutionPathDefinition {
  id: string;
  name: string;
  operations: string[];
  educationalMethod: string;
  difficulty?: number;
  completionCondition?: string;
  transformations: StepTransformation[];
}

export interface RecoveryPathDefinition {
  failedStepIndex: number;
  triggerOperation: string;
  recoveryOperation: string;
  resultingState: string;
  remainingSequence: string[];
  explanation: string;
}

export interface EchoDungeonStep {
  stepNumber: number;
  instruction: string;
  options: {
    label: string;
    operationKey: string;
    isCorrect: boolean;
    feedback: string;
  }[];
}

export interface EchoDungeonDefinition {
  id: string;
  subject: SubjectId;
  title: string;
  weaknessLabel: string;
  misconceptionType: string;
  problemContext: string;
  breakdownExplanation: string;
  coreRule: string;
  steps: EchoDungeonStep[];
  rewardMastery: number;
}

export interface LevelMapNode {
  id: string;
  levelNumber: number;
  title: string;
  topic: string;
  isBoss: boolean;
  isElite?: boolean;
  requiredCompletedLevel?: number;
  pathType?: 'main' | 'hidden_trial';
  compressedConcepts?: string[];
  trialOrder?: number;
}

export interface SubjectInfo {
  id: SubjectId;
  name: string;
  realmName: string;
  realmDescription: string;
  themeColor: string; // Tailwind hex e.g. '#06b6d4'
  accentColor: string;
  secondaryColor: string;
  iconName: string;
  storyIntro: {
    title: string;
    narration: string[];
    conceptCardIntro: {
      cardName: string;
      quote: string;
      role: string;
    }[];
  };
  levels: LevelMapNode[];
}
