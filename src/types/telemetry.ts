import { SubjectId, CanonicalRealmId } from './game';

export interface ActionTelemetryItem {
  stepIndex: number;
  operationKey: string;
  cardName: string;
  timestamp: number;
  timeSinceLastActionMs: number;
  isExpected: boolean;
  expectedOperation?: string;
  deviatedCategory?: string;
}

export interface LiveTelemetryMetrics {
  sequencingEfficiency: number; // 0-100%
  dependencyTrackingScore: number; // 0-100%
  orderValidity: 'OPTIMAL' | 'DEVIATED' | 'CRITICAL_MISCONCEPTION';
  repeatedPatternCount: number;
  averageResponseTimeMs: number;
  impulsiveActionDetected: boolean;
}

export interface DiagnosisResult {
  diagnosisType:
    | 'conceptual_misconception'
    | 'procedural_error'
    | 'algorithmic_inefficiency'
    | 'prerequisite_gap'
    | 'impulsive_guessing'
    | 'multi_step_breakdown'
    | 'calculation_error';
  mistakeStep: number;
  concept: string;
  observedPattern: string;
  expectedPattern: string;
  confidence: number;
  explanation: string;
  recommendedRepair: string;
  echoVaultId?: string;
  adaptation: {
    name: string;
    description: string;
    penaltyCost?: number;
    lockPrerequisite?: boolean;
    trappedOperation?: string;
  };
}

export interface RunRecord {
  id: string;
  subject: SubjectId;
  levelNumber: number;
  levelTitle: string;
  result: 'VICTORY' | 'DEFEAT' | 'REVISED';
  score: number;
  timeTakenSeconds: number;
  weaknessIdentified?: string;
  date: string;
  turnsUsed: number;
}

export interface ConceptPerformanceRecord {
  conceptId: string;
  subject: SubjectId;
  conceptName: string;
  recentMistakes: number; // exponentially decayed over encounters
  repeatedMistakes: number;
  misconceptionFrequency: number;
  prerequisiteGaps: number;
  recentSuccessCount: number;
  totalAttempts: number;
  masteryLevel: number; // 0 to 100
  lastEncounterTimestamp: number;
  successfulRecoveries: number;
  dangerEncounterCount: number;
  cooldownEncounters: number;
  lastSelectedAsDanger: boolean;
}

export interface DangerEventDefinition {
  id: string;
  hazardName: string;
  flavorWarning: string;
  conceptId: string;
  conceptName: string;
  difficultyTier: 'reinforcement' | 'standard' | 'advanced';
  modifierEffect: {
    type: 'shield' | 'cost_penalty' | 'bonus_mastery';
    value: number;
    description: string;
  };
}

import { LearningDNA, ObserverState, MirrorBossState, LastQuestionResult } from './learningDna';

export interface PlayerProfile {
  name: string;
  title: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  subjectMastery: Record<CanonicalRealmId, number> & Partial<Record<SubjectId, number>>; // 0 to 100
  clearedLevels: Record<CanonicalRealmId, number[]> & Partial<Record<SubjectId, number[]>>; // array of cleared level numbers
  clearedHiddenTrials?: Record<CanonicalRealmId, string[]> & Partial<Record<SubjectId, string[]>>;
  unlockedCardIds: string[];
  relics: string[];
  strengths: string[];
  weaknesses: string[];
  runHistory: RunRecord[];
  activeEducationLevel: string;
  activeKingdom?: string;
  activeClass?: string;
  contextProgress?: Record<
    string,
    {
      mastery: number;
      clearedLevels: number[];
      clearedHiddenTrials?: string[];
    }
  >;
  conceptPerformance?: Record<string, ConceptPerformanceRecord>;
  dangerCooldownBattles?: number;
  masteryCompressionRecords?: Record<
    string,
    {
      conceptSet: string[];
      clearedAt: number;
    }
  >;
  surpriseAttackCooldownBattles?: number;
  lastSurpriseAttackTimestamp?: number;
  surpriseAttacksCompleted?: number;
  convergenceUnlocked?: boolean;
  convergenceCompleted?: boolean;
  convergenceBestScore?: number;
  convergenceCompletedAt?: number;
  convergenceAttempts?: number;
  learningDNA?: LearningDNA;
  observerState?: ObserverState;
  mirrorBossState?: MirrorBossState;
  lastQuestionResult?: LastQuestionResult;
  discoveredRelics?: string[];
  equippedRelics?: string[];
  prestigeTitles?: string[];
}

export interface SurpriseAttackTelemetryRecord {
  timestamp: number;
  subject: SubjectId;
  attackId: string;
  threatLevel: number;
  triggerReason: string;
  speedScore: number;
  outcome: 'victory' | 'defeat' | 'escaped';
  timeTakenMs?: number;
  testedConcepts: string[];
}
