import { SubjectId, Card } from '../types/game';
import { EncounterDefinition } from '../types/curriculum';
import { QUESTION_POOLS, QuestionVariant } from '../curriculum/questionPools';

export interface QuestionSelectOptions {
  seed?: number;
  excludeId?: string;
  isJudgeDemo?: boolean;
}

export class QuestionSelectionEngine {
  private static instance: QuestionSelectionEngine;

  // History buffer of seen question IDs: "subject_levelNumber" -> string[]
  private seenHistory: Map<string, string[]> = new Map();
  private lastSelectedId: Map<string, string> = new Map();

  public static getInstance(): QuestionSelectionEngine {
    if (!QuestionSelectionEngine.instance) {
      QuestionSelectionEngine.instance = new QuestionSelectionEngine();
    }
    return QuestionSelectionEngine.instance;
  }

  private getPoolKey(subject: SubjectId, levelNumber: number): string {
    return `${subject}_${levelNumber}`;
  }

  /**
   * Selects a question variant from the pool, strictly avoiding immediate repetition.
   */
  public selectQuestion(
    subject: SubjectId,
    levelNumber: number,
    options: QuestionSelectOptions = {}
  ): QuestionVariant | null {
    const poolKey = this.getPoolKey(subject, levelNumber);
    const pool = QUESTION_POOLS[poolKey] || [];

    if (pool.length === 0) {
      return null;
    }

    // For Judge Demo: strictly return the canonical initial question
    if (options.isJudgeDemo && subject === 'mathematics' && levelNumber === 1) {
      return pool[0];
    }

    // Pure Seeded Determinism: identical seed always yields the exact same question variant
    if (options.seed !== undefined) {
      const idx = Math.abs(options.seed) % pool.length;
      return pool[idx];
    }

    const seen = this.seenHistory.get(poolKey) || [];
    const lastId = this.lastSelectedId.get(poolKey) || options.excludeId;

    // Filter candidates that have not been seen in the current cycle
    let candidates = pool.filter(q => !seen.includes(q.id));

    // If all questions in the pool were seen, recycle the pool
    if (candidates.length === 0) {
      // Recycle pool, but if pool.length > 1, do NOT immediately repeat the last selected question
      candidates = pool.length > 1 && lastId ? pool.filter(q => q.id !== lastId) : [...pool];
      this.seenHistory.set(poolKey, lastId ? [lastId] : []);
    }

    // Choose the first available candidate in current cycle to guarantee predictable cycling
    const selected = candidates[0];

    // Record seen
    this.recordQuestionSeen(subject, levelNumber, selected.id);

    return selected;
  }

  public recordQuestionSeen(subject: SubjectId, levelNumber: number, questionId: string) {
    const poolKey = this.getPoolKey(subject, levelNumber);
    const current = this.seenHistory.get(poolKey) || [];
    if (!current.includes(questionId)) {
      current.push(questionId);
      this.seenHistory.set(poolKey, current);
    }
    this.lastSelectedId.set(poolKey, questionId);
  }

  public getQuestionHistory(subject: SubjectId, levelNumber: number): string[] {
    const poolKey = this.getPoolKey(subject, levelNumber);
    return [...(this.seenHistory.get(poolKey) || [])];
  }

  public resetHistory() {
    this.seenHistory.clear();
    this.lastSelectedId.clear();
  }

  /**
   * Merges a selected question variant into an EncounterDefinition, preserving exam integrity.
   * Also ensures validCards has the starter card required for step 0 at the front of the hand.
   */
  public getEncounterWithSelectedQuestion(
    baseEncounter: EncounterDefinition,
    options: QuestionSelectOptions = {}
  ): EncounterDefinition {
    const selected = this.selectQuestion(baseEncounter.subject, baseEncounter.levelNumber, options);

    if (!selected) {
      return baseEncounter;
    }

    // Clone valid cards and re-order so the first expected card is in the opening hand of 5
    const reorderedCards: Card[] = [...baseEncounter.validCards];
    const firstExpectedOp = selected.optimalSequence[0];
    const firstCardIdx = reorderedCards.findIndex(c => c.operationKey === firstExpectedOp);
    if (firstCardIdx > 4) {
      // Card is beyond opening 5 cards, swap it into the opening hand
      const [neededCard] = reorderedCards.splice(firstCardIdx, 1);
      reorderedCards.unshift(neededCard);
    }

    const merged: EncounterDefinition = {
      ...baseEncounter,
      objective: selected.objective,
      problemStatement: selected.problemStatement,
      initialEquationOrState: selected.initialEquationOrState,
      targetState: selected.targetState,
      correctAnswer: selected.correctAnswer,
      optimalSequence: [...selected.optimalSequence],
      stepTransformations: selected.stepTransformations.map(st => ({ ...st })),
      misconceptions: [...selected.misconceptions],
      alternativePaths: selected.alternativePaths ? selected.alternativePaths.map(p => ({ ...p })) : undefined,
      recoveryPaths: selected.recoveryPaths ? selected.recoveryPaths.map(r => ({ ...r })) : undefined,
      validCards: reorderedCards,
    };

    return merged;
  }
}

export const questionSelectionEngine = QuestionSelectionEngine.getInstance();
