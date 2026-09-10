import { EncounterDefinition } from '../types/curriculum';
import { ActionTelemetryItem, DiagnosisResult } from '../types/telemetry';

export class DiagnosticEngine {
  public static diagnoseAction(
    encounter: EncounterDefinition,
    currentStepIndex: number,
    playedOperation: string,
    actionItem: ActionTelemetryItem
  ): DiagnosisResult {
    // 1. Check if encounter has an explicit misconception rule for this exact trigger
    const matchedRule = encounter.misconceptions.find(
      m => m.atStepIndex === currentStepIndex && m.triggerOperation === playedOperation
    );

    if (matchedRule) {
      return {
        diagnosisType: matchedRule.diagnosisType,
        mistakeStep: currentStepIndex + 1,
        concept: encounter.conceptName,
        observedPattern: `Used ${playedOperation} at Step ${currentStepIndex + 1}`,
        expectedPattern: 'Structural decomposition before solution isolation',
        confidence: 0.94,
        explanation: matchedRule.diagnosisExplanation,
        recommendedRepair: matchedRule.repairConcept,
        echoVaultId: matchedRule.echoVaultId,
        adaptation: {
          name: matchedRule.enemyAdaptationName,
          description: matchedRule.enemyAdaptationEffect,
          penaltyCost: 1,
          trappedOperation: playedOperation,
        },
      };
    }

    // 2. Dynamic heuristic classification
    const expectedOp = encounter.optimalSequence[currentStepIndex] || 'COMPLETE';
    const laterInSequence = encounter.optimalSequence.slice(currentStepIndex + 1).includes(playedOperation);

    if ((actionItem.timeSinceLastActionMs ?? 0) < 1200) {
      return {
        diagnosisType: 'impulsive_guessing',
        mistakeStep: currentStepIndex + 1,
        concept: encounter.conceptName,
        observedPattern: `Rapid execution (${actionItem.timeSinceLastActionMs}ms) without prerequisite structural check`,
        expectedPattern: 'Deliberate analysis of problem state before action',
        confidence: 0.88,
        explanation: 'The action was triggered almost instantly without inspecting problem invariants.',
        recommendedRepair: 'Deliberate Sequence Analysis',
        adaptation: {
          name: 'Deliberation Ward',
          description: 'The enemy disrupts rapid guessing. Next card costs +1 Energy unless deliberated.',
          penaltyCost: 1,
        },
      };
    }

    if (laterInSequence) {
      return {
        diagnosisType: 'procedural_error',
        mistakeStep: currentStepIndex + 1,
        concept: encounter.conceptName,
        observedPattern: `Played ${playedOperation} prematurely`,
        expectedPattern: 'Prerequisite structural transformation required',
        confidence: 0.92,
        explanation: `While ${playedOperation} is a valid tool for this subject, it cannot succeed until prerequisite transformations have simplified the state.`,
        recommendedRepair: `Prerequisite Ordering for ${encounter.conceptName}`,
        adaptation: {
          name: 'Prerequisite Lock',
          description: `The enemy locks ${playedOperation} behind a foundation shield until prerequisite steps are resolved.`,
          lockPrerequisite: true,
        },
      };
    }

    return {
      diagnosisType: 'conceptual_misconception',
      mistakeStep: currentStepIndex + 1,
      concept: encounter.conceptName,
      observedPattern: `Incompatible operation ${playedOperation} applied to state: "${encounter.initialEquationOrState}"`,
      expectedPattern: 'Canonical state transformation needed',
      confidence: 0.91,
      explanation: 'The applied operation does not advance the state toward canonical resolution. Review the required algebraic transformation.',
      recommendedRepair: `Fundamental Rules of ${encounter.conceptName}`,
      adaptation: {
        name: 'Axiom Counter-Shield',
        description: 'The enemy gains 20 Shield from the misapplied operation.',
      },
    };
  }
}
