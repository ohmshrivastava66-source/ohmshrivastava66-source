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

  public recordAction(
    stepIndex: number,
    operationKey: string,
    cardName: string,
    isExpected: boolean,
    expectedOperation?: string,
    deviatedCategory?: string
  ): ActionTelemetryItem {
    const now = Date.now();
    const timeSinceLast = now - this.lastActionTimestamp;
    this.lastActionTimestamp = now;

    const item: ActionTelemetryItem = {
      stepIndex,
      operationKey,
      cardName,
      timestamp: now,
      timeSinceLastActionMs: timeSinceLast,
      isExpected,
      expectedOperation,
      deviatedCategory,
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
      };
    }

    const total = this.actions.length;
    const correct = this.actions.filter(a => a.isExpected).length;
    const efficiency = Math.round((correct / total) * 100);

    const totalResponseTime = this.actions.reduce((acc, a) => acc + a.timeSinceLastActionMs, 0);
    const avgTime = Math.round(totalResponseTime / total);

    // Check for impulsive clicking (actions < 1200ms)
    const impulsive = this.actions.some(a => a.timeSinceLastActionMs < 1200 && !a.isExpected);

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

    return {
      sequencingEfficiency: Math.max(10, efficiency),
      dependencyTrackingScore: Math.max(20, Math.round(100 - (mistakes.length * 25))),
      orderValidity: validity,
      repeatedPatternCount: hasRepeated ? 2 : mistakes.length > 0 ? 1 : 0,
      averageResponseTimeMs: avgTime,
      impulsiveActionDetected: impulsive,
    };
  }

  public getElapsedTimeSeconds(): number {
    return Math.round((Date.now() - this.encounterStartTime) / 1000);
  }
}

export const telemetry = new TelemetryTracker();
