import { SubjectId } from './game';

export interface EliteSynthesisOption {
  id: string;
  label: string;
  isCorrect: boolean;
  rationale: string;
  distractorMisconception?: string;
}

export interface EliteSynthesisQuestion {
  id: string;
  scenario: string;
  objective: string;
  combinedConcepts: string[];
  options: EliteSynthesisOption[];
  correctExplanation: string;
  recoveryEchoVaultId: string;
}

export interface SurpriseAttackDefinition {
  id: string;
  title: string;
  flavorText: string;
  subject: SubjectId;
  difficultyTier: 'elite' | 'nightmare';
  eliteQuestions: EliteSynthesisQuestion[];
  cooldownBattles: number;
  minThreatLevel: number;
  prestigeReward: {
    xp: number;
    title: string;
    relic: string;
    masteryBonus: number;
  };
}

export interface ThreatBreakdown {
  fastProgressionScore: number;
  consecutiveSuccessScore: number;
  masteryScore: number;
  bossProximityScore: number;
  recentFailureScore: number;
  threatLevel: number;
  opportunityProbability: number;
}
