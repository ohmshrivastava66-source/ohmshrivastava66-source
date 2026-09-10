import { ActionTelemetryItem, LiveTelemetryMetrics } from '../types/telemetry';

export class TelemetryTracker {
  private actions: ActionTelemetryItem[] = [];
  private lastActionTimestamp: number = Date.now();
  private encounterStartTime: number = Date.now();

  public reset(startTime: number = Date.now()) {
    this.actions = [];
    this.lastActionTimestamp = startTime;
    this.encounterStartTime = startTime;
  }

  public resetSession(startTime: number = Date.now()) {
    this.reset(startTime);
  }

  public recordAction(
    stepIndexOrCardId: number | string,
    opKeyOrCardName: string,
    cardNameOrIsExpected: string | boolean,
    isExpectedOrExpectedOp?: boolean | string,
    expectedOpOrEqState?: string,
    deviatedOrSlotIndex?: string | number,
    slotIndexOrIsVerification?: number | boolean,
    isVerificationCard?: boolean
  ): ActionTelemetryItem {
    const now = Date.now();
    const timeSinceLast = now - this.lastActionTimestamp;
    this.lastActionTimestamp = now;

    let stepIndex: number;
    let operationKey: string;
    let cardName: string;
    let isExpected: boolean;
    let expectedOperation: string | undefined;
    let deviatedCategory: string | undefined;
    let cardSlotIndex: number | undefined;
    let isVerification: boolean | undefined;

    if (typeof stepIndexOrCardId === 'number') {
      stepIndex = stepIndexOrCardId;
      operationKey = opKeyOrCardName;
      cardName = typeof cardNameOrIsExpected === 'string' ? cardNameOrIsExpected : 'Card';
      isExpected = Boolean(isExpectedOrExpectedOp);
      expectedOperation = typeof expectedOpOrEqState === 'string' ? expectedOpOrEqState : undefined;
      deviatedCategory = typeof deviatedOrSlotIndex === 'string' ? deviatedOrSlotIndex : undefined;
      cardSlotIndex = typeof slotIndexOrIsVerification === 'number' ? slotIndexOrIsVerification : undefined;
      isVerification = isVerificationCard;
    } else {
      stepIndex = 0;
      cardName = opKeyOrCardName;
      isExpected = Boolean(cardNameOrIsExpected);
      expectedOperation = typeof isExpectedOrExpectedOp === 'string' ? isExpectedOrExpectedOp : undefined;
      operationKey = expectedOperation || 'OP';
      deviatedCategory = typeof expectedOpOrEqState === 'string' ? expectedOpOrEqState : undefined;
      cardSlotIndex = typeof deviatedOrSlotIndex === 'number' ? deviatedOrSlotIndex : undefined;
      isVerification = Boolean(slotIndexOrIsVerification);
    }

    const item: ActionTelemetryItem = {
      stepIndex,
      operationKey,
      cardName,
      timestamp: now,
      timeSinceLastActionMs: timeSinceLast,
      isExpected,
      expectedOperation,
      deviatedCategory,
      cardSlotIndex,
      isVerificationCard: isVerification,
    };

    this.actions.push(item);
    return item;
  }

  public getActions(): ActionTelemetryItem[] {
    return [...this.actions];
  }

  public getLiveMetrics(): LiveTelemetryMetrics {
    if (this.actions.length === 0) {
      return {
        sequencingEfficiency: 100,
        dependencyTrackingScore: 100,
        orderValidity: 'OPTIMAL',
        repeatedPatternCount: 0,
        averageResponseTimeMs: 0,
        impulsiveActionDetected: false,
        cardSlotIndices: [],
        slotEntropy: 1.0,
        isRapidExploit: false,
        behaviorClassification: 'GENUINE_MASTERY',
      };
    }

    const total = this.actions.length;
    const correct = this.actions.filter(a => a.isExpected).length;
    const efficiency = Math.round((correct / total) * 100);

    const totalResponseTime = this.actions.reduce((acc, a) => acc + (a.timeSinceLastActionMs ?? 0), 0);
    const avgTime = Math.round(totalResponseTime / total);

    // Impulsive pacing: action executed in < 1000ms
    const impulsive = this.actions.some(a => (a.timeSinceLastActionMs ?? 0) < 1000);

    // Card slot tracking and entropy calculation
    const slotIndices = this.actions
      .map(a => a.cardSlotIndex)
      .filter((s): s is number => s !== undefined);

    let slotEntropy = 1.0;
    if (slotIndices.length > 1) {
      const freqMap: Record<number, number> = {};
      slotIndices.forEach(s => {
        freqMap[s] = (freqMap[s] || 0) + 1;
      });
      const probs = Object.values(freqMap).map(count => count / slotIndices.length);
      // Normalized Shannon Entropy (0 = identical slot every time, 1 = maximum variety)
      const rawEntropy = -probs.reduce((sum, p) => sum + (p > 0 ? p * Math.log2(p) : 0), 0);
      const maxPossibleEntropy = Math.log2(Math.min(5, slotIndices.length)) || 1;
      slotEntropy = Number((rawEntropy / maxPossibleEntropy).toFixed(3));
    }

    // Repeated slot spam exploit: >=3 actions, avg latency < 1400ms, and slotEntropy <= 0.2
    const isRapidExploit =
      slotIndices.length >= 3 &&
      avgTime < 1400 &&
      slotEntropy <= 0.25;

    // Check for repeated mistakes with same operation
    const mistakes = this.actions.filter(a => !a.isExpected);
    const mistakeKeys = mistakes.map(m => m.operationKey);
    const hasRepeated = new Set(mistakeKeys).size < mistakeKeys.length;

    let validity: 'OPTIMAL' | 'DEVIATED' | 'CRITICAL_MISCONCEPTION' = 'OPTIMAL';
    if (mistakes.length > 1) {
      validity = 'CRITICAL_MISCONCEPTION';
    } else if (mistakes.length === 1) {
      validity = 'DEVIATED';
    }

    // Behavioral classification
    let behaviorClassification: LiveTelemetryMetrics['behaviorClassification'] = 'GENUINE_MASTERY';
    if (isRapidExploit) {
      behaviorClassification = 'RAPID_PATTERN_EXPLOIT';
    } else if (slotEntropy >= 0.70 && !isRapidExploit) {
      behaviorClassification = 'DELIBERATE_METHODICAL';
    } else if (efficiency >= 80 && avgTime < 3000 && slotEntropy >= 0.5) {
      behaviorClassification = 'FAST_RELIABLE_REASONING';
    } else if (efficiency >= 85 && avgTime >= 1500) {
      behaviorClassification = 'GENUINE_MASTERY';
    } else {
      behaviorClassification = 'UNCERTAIN_MASTERY';
    }

    return {
      sequencingEfficiency: Math.max(10, efficiency),
      dependencyTrackingScore: Math.max(20, Math.round(100 - (mistakes.length * 25))),
      orderValidity: validity,
      repeatedPatternCount: hasRepeated ? 2 : mistakes.length > 0 ? 1 : 0,
      averageResponseTimeMs: avgTime,
      impulsiveActionDetected: impulsive,
      cardSlotIndices: slotIndices,
      slotEntropy,
      isRapidExploit,
      behaviorClassification,
    };
  }

  public getElapsedTimeSeconds(): number {
    return Math.max(1, Math.round((Date.now() - this.encounterStartTime) / 1000));
  }
}

export const telemetry = new TelemetryTracker();
