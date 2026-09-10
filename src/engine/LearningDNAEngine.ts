import { PlayerProfile, ActionTelemetryItem } from '../types/telemetry';
import { LearningDNA, StrategySignature } from '../types/learningDna';

export const DEFAULT_LEARNING_DNA: LearningDNA = {
  speedProfile: 50,
  persistence: 50,
  accuracy: 50,
  riskTaking: 30,
  verificationHabit: 40,
  patternRecognition: 50,
  transferAbility: 50,
  recoveryAfterMistakes: 50,
  conceptualConsistency: 50,
  adaptability: 50,
  confidencePattern: 50,
  lastUpdated: Date.now(),
};

export class LearningDNAEngine {
  private emaAlpha = 0.25; // Weight for recent evidence vs historical baseline

  /**
   * Returns player's current LearningDNA or default baseline
   */
  public getLearningDNA(profile: PlayerProfile): LearningDNA {
    if (profile.learningDNA) {
      return { ...profile.learningDNA };
    }
    return { ...DEFAULT_LEARNING_DNA };
  }

  /**
   * Applies rolling update with recency decay: new = old * (1 - alpha) + evidence * alpha
   */
  private applyEma(current: number, evidence: number, weight: number = this.emaAlpha): number {
    const updated = current * (1 - weight) + evidence * weight;
    return Math.round(Math.max(0, Math.min(100, updated)));
  }

  /**
   * Updates Speed Profile based on response time and action pacing
   */
  public updateSpeedProfile(
    currentSpeed: number,
    responseTimeMs: number,
    isRapidAction: boolean
  ): number {
    let evidence = 50;
    if (responseTimeMs < 8000 || isRapidAction) {
      evidence = 90; // rapid
    } else if (responseTimeMs < 15000) {
      evidence = 65; // brisk
    } else if (responseTimeMs > 35000) {
      evidence = 20; // deliberate/slow
    } else {
      evidence = 45; // balanced
    }
    return this.applyEma(currentSpeed, evidence);
  }

  /**
   * Updates Persistence based on retrying, facing defeats, or continuing after setbacks
   */
  public updatePersistence(
    currentPersistence: number,
    continuedAfterDefeat: boolean,
    completedAllTurns: boolean
  ): number {
    const evidence = continuedAfterDefeat ? 90 : completedAllTurns ? 70 : 40;
    return this.applyEma(currentPersistence, evidence);
  }

  /**
   * Updates Accuracy based on correct vs incorrect action/encounter outcomes
   */
  public updateAccuracy(currentAccuracy: number, isCorrect: boolean): number {
    const evidence = isCorrect ? 100 : 15;
    return this.applyEma(currentAccuracy, evidence);
  }

  /**
   * Updates Risk Taking based on impulsiveness and playing unverified steps
   */
  public updateRiskTaking(
    currentRisk: number,
    isImpulsive: boolean,
    playedWithoutVerification: boolean
  ): number {
    const evidence = isImpulsive ? 90 : playedWithoutVerification ? 70 : 25;
    return this.applyEma(currentRisk, evidence);
  }

  /**
   * Updates Verification Habit based on checking steps, using verify cards, or reviewing options
   */
  public updateVerificationHabit(
    currentVerification: number,
    verifiedBeforeSubmit: boolean
  ): number {
    const evidence = verifiedBeforeSubmit ? 95 : 15;
    return this.applyEma(currentVerification, evidence);
  }

  /**
   * Updates Pattern Recognition based on quickly spotting structure in standard equations
   */
  public updatePatternRecognition(
    currentPattern: number,
    spottedPatternAccurately: boolean
  ): number {
    const evidence = spottedPatternAccurately ? 90 : 30;
    return this.applyEma(currentPattern, evidence);
  }

  /**
   * Updates Transfer Ability based on performance in cross-domain or multi-concept trials
   */
  public updateTransferAbility(
    currentTransfer: number,
    isCrossDomainSuccess: boolean
  ): number {
    const evidence = isCrossDomainSuccess ? 95 : 30;
    return this.applyEma(currentTransfer, evidence);
  }

  /**
   * Updates Recovery After Mistakes based on rebounding after an error or misconception
   */
  public updateRecovery(
    currentRecovery: number,
    recoveredAfterMistake: boolean
  ): number {
    const evidence = recoveredAfterMistake ? 95 : 20;
    return this.applyEma(currentRecovery, evidence);
  }

  /**
   * Updates Conceptual Consistency based on maintaining principles across varied formats
   */
  public updateConsistency(
    currentConsistency: number,
    consistentAcrossFormats: boolean
  ): number {
    const evidence = consistentAcrossFormats ? 90 : 35;
    return this.applyEma(currentConsistency, evidence);
  }

  /**
   * Updates Adaptability based on success when familiar rules/contexts are changed
   */
  public updateAdaptability(
    currentAdaptability: number,
    adaptedSuccessfully: boolean
  ): number {
    const evidence = adaptedSuccessfully ? 95 : 25;
    return this.applyEma(currentAdaptability, evidence);
  }

  /**
   * Ingests turn-level action telemetry to update LearningDNA
   */
  public recordActionTelemetry(
    dna: LearningDNA,
    action: ActionTelemetryItem,
    totalSteps: number
  ): LearningDNA {
    const updated = { ...dna };
    const latency = action.actionLatencyMs ?? action.timeSinceLastActionMs ?? 3000;
    const isCorrect = action.isCorrect !== undefined ? action.isCorrect : (action.isExpected ?? true);

    // Speed profile
    updated.speedProfile = this.updateSpeedProfile(
      updated.speedProfile,
      latency,
      latency < 6000
    );

    // Accuracy
    updated.accuracy = this.updateAccuracy(updated.accuracy, isCorrect);

    // Risk taking / Impulsive
    const isImpulsive = latency < 4000 && !isCorrect;
    updated.riskTaking = this.updateRiskTaking(
      updated.riskTaking,
      isImpulsive,
      latency < 8000
    );

    // Verification habit
    const isVerification =
      action.isVerificationCard === true ||
      action.operationKey === 'VERIFY' ||
      action.operationKey === 'CHECK' ||
      (typeof action.operationKey === 'string' &&
        (action.operationKey.startsWith('VERIFY_') || action.operationKey.startsWith('CHECK_')));

    if (isVerification) {
      updated.verificationHabit = this.updateVerificationHabit(
        updated.verificationHabit,
        true
      );
    } else if (
      action.isVerificationCard === false ||
      !isCorrect ||
      (action.stepIndex !== undefined && action.stepIndex === totalSteps - 1 && !isCorrect)
    ) {
      updated.verificationHabit = this.updateVerificationHabit(
        updated.verificationHabit,
        false
      );
    }

    // Pattern recognition
    if (action.stepIndex === 0 && isCorrect && latency < 12000) {
      updated.patternRecognition = this.updatePatternRecognition(
        updated.patternRecognition,
        true
      );
    }

    updated.lastUpdated = Date.now();
    return updated;
  }

  /**
   * Ingests run-level telemetry outcome to update broader dimensions
   */
  public recordRunOutcome(
    dna: LearningDNA,
    result: 'VICTORY' | 'DEFEAT' | 'REVISED',
    timeTakenSeconds: number,
    turnsUsed: number,
    isCrossDomain: boolean = false,
    hadMistakeRecovery: boolean = false
  ): LearningDNA {
    const updated = { ...dna };

    // Persistence
    updated.persistence = this.updatePersistence(
      updated.persistence,
      result === 'REVISED' || turnsUsed >= 4,
      true
    );

    // Accuracy
    updated.accuracy = this.updateAccuracy(updated.accuracy, result === 'VICTORY');

    // Transfer
    if (isCrossDomain) {
      updated.transferAbility = this.updateTransferAbility(
        updated.transferAbility,
        result === 'VICTORY'
      );
    }

    // Recovery
    if (hadMistakeRecovery || result === 'REVISED') {
      updated.recoveryAfterMistakes = this.updateRecovery(
        updated.recoveryAfterMistakes,
        true
      );
    }

    updated.lastUpdated = Date.now();
    return updated;
  }

  /**
   * Computes hidden StrategySignatures based on active LearningDNA
   */
  public getDominantStrategies(profile: PlayerProfile): StrategySignature[] {
    const dna = this.getLearningDNA(profile);
    const signatures: StrategySignature[] = [];

    // Rapid Pattern Matcher
    if (dna.speedProfile >= 65 && dna.patternRecognition >= 60) {
      signatures.push('rapid_pattern_matcher');
    }

    // Shortcut Seeker
    if (dna.speedProfile >= 70 && dna.riskTaking >= 60 && dna.verificationHabit <= 45) {
      signatures.push('shortcut_seeker');
    }

    // Careful Verifier
    if (dna.verificationHabit >= 65 && dna.speedProfile <= 55) {
      signatures.push('careful_verifier');
    }

    // Persistent Rebuilder
    if (dna.persistence >= 70 && dna.recoveryAfterMistakes >= 60) {
      signatures.push('persistent_rebuilder');
    }

    // Surface Pattern Dependent
    if (dna.patternRecognition >= 65 && dna.adaptability <= 45) {
      signatures.push('surface_pattern_dependent');
    }

    // Strong Transfer
    if (dna.transferAbility >= 65) {
      signatures.push('strong_transfer');
    }

    // Slow High Accuracy
    if (dna.speedProfile <= 40 && dna.accuracy >= 70) {
      signatures.push('slow_high_accuracy');
    }

    // High Risk Guesser
    if (dna.riskTaking >= 70 && dna.accuracy <= 50) {
      signatures.push('high_risk_guesser');
    }

    return signatures;
  }

  /**
   * Non-clinical, gameplay-focused educational feedback phrases for the Observer or Boss dialogue
   */
  public getObserverObservation(profile: PlayerProfile): string | null {
    const dna = this.getLearningDNA(profile);
    const strategies = this.getDominantStrategies(profile);

    if (strategies.includes('shortcut_seeker')) {
      return 'You trust the first path that looks familiar.';
    }
    if (strategies.includes('rapid_pattern_matcher')) {
      return 'You recognize patterns quickly.';
    }
    if (strategies.includes('careful_verifier')) {
      return 'You check your axioms twice before stepping.';
    }
    if (strategies.includes('persistent_rebuilder')) {
      return 'You rebuild after every fracture.';
    }
    if (strategies.includes('strong_transfer')) {
      return 'You bridge separate realms naturally.';
    }
    if (dna.adaptability >= 70) {
      return 'You are becoming difficult to predict.';
    }
    if (dna.speedProfile >= 75) {
      return 'You chose quickly.';
    }
    return 'Interesting.';
  }
}

export function classifyEndingVariant(response: string): import('../types/learningDna').EndingVariant {
  const text = response.toLowerCase();

  if (
    text.includes('proof') ||
    text.includes('axiom') ||
    text.includes('why') ||
    text.includes('foundation') ||
    text.includes('understand') ||
    text.includes('logic') ||
    text.includes('principle')
  ) {
    return 'THE SCHOLAR';
  }

  if (
    text.includes('mistake') ||
    text.includes('error') ||
    text.includes('fail') ||
    text.includes('adapt') ||
    text.includes('grow') ||
    text.includes('repair') ||
    text.includes('change')
  ) {
    return 'THE ADAPTER';
  }

  if (
    text.includes('curious') ||
    text.includes('discover') ||
    text.includes('explore') ||
    text.includes('wonder') ||
    text.includes('question') ||
    text.includes('journey')
  ) {
    return 'THE EXPLORER';
  }

  if (
    text.includes('method') ||
    text.includes('system') ||
    text.includes('plan') ||
    text.includes('structure') ||
    text.includes('strategy') ||
    text.includes('pattern')
  ) {
    return 'THE STRATEGIST';
  }

  return 'THE UNFINISHED MIND';
}

export const learningDNAEngine = new LearningDNAEngine();
