import { SubjectId } from './game';

export interface LearningDNA {
  speedProfile: number; // 0 (very deliberate/slow) to 100 (rapid/rushing)
  persistence: number; // 0 to 100 (retries, resilience after defeats)
  accuracy: number; // 0 to 100 (overall success rate)
  riskTaking: number; // 0 to 100 (playing unverified / impulsive actions)
  verificationHabit: number; // 0 to 100 (checking before submitting, verification actions)
  patternRecognition: number; // 0 to 100 (rapidly identifying recurring structures)
  transferAbility: number; // 0 to 100 (cross-domain synthesis success)
  recoveryAfterMistakes: number; // 0 to 100 (success rate after a misconception/failure)
  conceptualConsistency: number; // 0 to 100 (maintaining logic across different problem formats)
  adaptability: number; // 0 to 100 (succeeding when rules/contexts change)
  confidencePattern?: number; // 0 to 100
  lastUpdated: number;
}

export type StrategySignature =
  | 'rapid_pattern_matcher'
  | 'careful_verifier'
  | 'shortcut_seeker'
  | 'persistent_rebuilder'
  | 'surface_pattern_dependent'
  | 'strong_transfer'
  | 'slow_high_accuracy'
  | 'high_risk_guesser';

export interface ObserverState {
  impression: number; // 0 to 100
  encounterCount: number;
  lastEncounterTimestamp?: number;
  cooldownEncounters: number;
  challengeCompleted: boolean;
  askAnythingUnlocked: boolean;
  askAnythingUsed: boolean;
  permanentImpressions: string[];
  lastObserverQuote?: string;
}

export interface MirrorBossState {
  defeatedMirrors: string[];
  encounteredMirrors: string[];
  cooldownEncounters: number;
  lastMirrorBossId?: string;
}

export type EndingVariant =
  | 'THE SCHOLAR'
  | 'THE ADAPTER'
  | 'THE EXPLORER'
  | 'THE STRATEGIST'
  | 'THE UNFINISHED MIND';

export interface LastQuestionResult {
  completedAt: number;
  endingVariant: EndingVariant;
  studentResponse: string;
}

export interface CounterStrategyChallenge {
  id: string;
  targetSignature: StrategySignature;
  subject: SubjectId;
  adaptationType:
    | 'plausible_distractor'
    | 'variable_context'
    | 'verification_requirement'
    | 'multi_step_depth'
    | 'cross_domain_transfer';
  originalConceptId: string;
  scenario: string;
  objective: string;
  options: {
    id: string;
    label: string;
    isCorrect: boolean;
    rationale: string;
    distractorMisconception?: string;
    isPlausibleShortcut?: boolean;
  }[];
  correctExplanation: string;
}

export interface MirrorBossDefinition {
  id: string;
  subject: SubjectId;
  baseBossId: string;
  mirrorName: string;
  mirrorTitle: string;
  corruptedConcept: string;
  dialogueIntro: string;
  dialogueVictory: string;
  dialogueDefeat: string;
  targetedWeakness: string;
  scenario: string;
  objective: string;
  options: {
    id: string;
    label: string;
    isCorrect: boolean;
    rationale: string;
    distractorMisconception?: string;
  }[];
  correctExplanation: string;
  echoVaultId: string;
  rewardXp: number;
  mirrorMark: string;
}
