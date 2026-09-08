import { SubjectId } from './game';

export interface ConvergenceTrialOption {
  id: string;
  label: string;
  isCorrect: boolean;
  rationale: string;
  distractorMisconception?: string;
}

export interface ConvergenceTrial {
  id: string;
  trialNumber: number;
  tier: 1 | 2 | 3 | 4 | 5;
  tierLabel: string;
  primaryBoss: SubjectId;
  collaboratingBosses: SubjectId[];
  scenario: string;
  objective: string;
  combinedSubjects: SubjectId[];
  combinedConcepts: string[];
  options: ConvergenceTrialOption[];
  correctExplanation: string;
  recoveryEchoVaultId?: string;
  dialogueIntro?: string;
  dialogueCorrect?: string;
  dialogueWrong?: string;
}

export interface BossCouncilMember {
  id: SubjectId;
  name: string;
  title: string;
  domain: string;
  color: string;
  accentColor: string;
  emblem: string;
  taunts: {
    rage1: { correct: string[]; wrong: string[] };
    rage2: { correct: string[]; wrong: string[] };
    rage3: { correct: string[]; wrong: string[] };
    rage4: { correct: string[]; wrong: string[] };
    rage5: { correct: string[]; wrong: string[] };
  };
}

export interface BossRageState {
  rageLevel: number; // 1 to 5
  consecutiveCorrect: number;
  totalCorrect: number;
  totalMistakes: number;
  lastRageTrigger?: string;
}

export interface ConvergenceTelemetryRecord {
  timestamp: number;
  trialNumber: number;
  tier: number;
  combinedSubjects: SubjectId[];
  isCorrect: boolean;
  timeTakenMs: number;
  bossRageLevel: number;
  diagnosedMisconception?: string;
}
