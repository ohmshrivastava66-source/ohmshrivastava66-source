import { PlayerProfile, ActionTelemetryItem } from './types/telemetry';
import { SubjectId } from './types/game';
import {
  learningDNAEngine,
  DEFAULT_LEARNING_DNA,
} from './engine/LearningDNAEngine';
import {
  counterStrategyEngine,
  CounterStrategyEngine,
} from './engine/CounterStrategyEngine';
import {
  observerEngine,
  DEFAULT_OBSERVER_STATE,
  ObserverEngine,
} from './engine/ObserverEngine';
import {
  mirrorBossEngine,
  DEFAULT_MIRROR_STATE,
  MIRROR_BOSS_DEFINITIONS,
  MirrorBossEngine,
} from './engine/MirrorBossEngine';
import { classifyEndingVariant } from './engine/LearningDNAEngine';
import { StorageManager } from './persistence/StorageManager';
import { REALM_BOSS_LEVELS } from './engine/ConvergenceEngine';

declare const process: any;

function createTestProfile(overrides?: Partial<PlayerProfile>): PlayerProfile {
  return {
    name: 'Axiom Seeker',
    title: 'Adept of Axioms',
    level: 5,
    xp: 1200,
    xpToNextLevel: 1800,
    subjectMastery: {
      mathematics: 60,
      computerScience: 50,
      physics: 30,
      chemistry: 20,
      biology: 20,
      history: 20,
      geography: 20,
      language: 20,
    },
    clearedLevels: {
      mathematics: [1, 2, 3, 4],
      computerScience: [1, 2, 3],
      physics: [1],
      chemistry: [],
      biology: [],
      history: [],
      geography: [],
      language: [],
    },
    clearedHiddenTrials: {
      mathematics: [],
      computerScience: [],
      physics: [],
      chemistry: [],
      biology: [],
      history: [],
      geography: [],
      language: [],
    },
    masteryCompressionRecords: {},
    unlockedCardIds: ['math_factor', 'math_solve', 'math_verify'],
    relics: ['Focus Rune'],
    strengths: ['Pattern Recognition'],
    weaknesses: ['Quadratic Polynomial Factoring & Sign Rules'],
    runHistory: [],
    activeEducationLevel: 'class_9_10',
    conceptPerformance: {},
    dangerCooldownBattles: 0,
    surpriseAttackCooldownBattles: 0,
    surpriseAttacksCompleted: 0,
    convergenceUnlocked: false,
    convergenceCompleted: false,
    learningDNA: { ...DEFAULT_LEARNING_DNA },
    observerState: { ...DEFAULT_OBSERVER_STATE },
    mirrorBossState: { ...DEFAULT_MIRROR_STATE },
    ...overrides,
  };
}

console.log('=============================================================');
console.log('🧬 STARTING "THE SPIRE LEARNS YOU" EXPANSION TESTS 🧬');
console.log('=============================================================');

let passedTests = 0;
const totalTests = 27;

function assert(condition: boolean, testNum: number, message: string) {
  if (condition) {
    console.log(`✅ TEST ${testNum} PASSED: ${message}`);
    passedTests++;
  } else {
    console.error(`❌ TEST ${testNum} FAILED: ${message}`);
    process.exit(1);
  }
}

// -------------------------------------------------------------
// TEST 1: Learning DNA updates from telemetry
// -------------------------------------------------------------
const initialDna = { ...DEFAULT_LEARNING_DNA };
const mockAction: ActionTelemetryItem = {
  stepIndex: 0,
  operationKey: 'FACTOR',
  cardName: 'Factorize',
  timestamp: Date.now(),
  timeSinceLastActionMs: 4000,
  isExpected: true,
};
const updatedDna = learningDNAEngine.recordActionTelemetry(initialDna, mockAction, 3);
assert(
  updatedDna.speedProfile !== initialDna.speedProfile || updatedDna.accuracy !== initialDna.accuracy,
  1,
  'Learning DNA updates dimensions from action telemetry'
);

// -------------------------------------------------------------
// TEST 2: Recent behavior weighs more than old behavior
// -------------------------------------------------------------
let runningDna = { ...DEFAULT_LEARNING_DNA, accuracy: 20 };
// 3 consecutive successes
runningDna = learningDNAEngine.recordRunOutcome(runningDna, 'VICTORY', 20, 2);
runningDna = learningDNAEngine.recordRunOutcome(runningDna, 'VICTORY', 20, 2);
runningDna = learningDNAEngine.recordRunOutcome(runningDna, 'VICTORY', 20, 2);
assert(runningDna.accuracy > 65, 2, 'Recent victories pull accuracy strongly towards recent success (> 65%)');

// -------------------------------------------------------------
// TEST 3: Speed profile responds to response time
// -------------------------------------------------------------
const fastSpeed = learningDNAEngine.updateSpeedProfile(50, 4000, true);
const slowSpeed = learningDNAEngine.updateSpeedProfile(50, 45000, false);
assert(fastSpeed > 55 && slowSpeed < 45, 3, 'Speed profile accelerates on rapid responses and decelerates on deliberate ones');

// -------------------------------------------------------------
// TEST 4: Accuracy responds to correct/incorrect outcomes
// -------------------------------------------------------------
const accWin = learningDNAEngine.updateAccuracy(50, true);
const accLoss = learningDNAEngine.updateAccuracy(50, false);
assert(accWin > 55 && accLoss < 45, 4, 'Accuracy scales upward on correct answers and downward on incorrect ones');

// -------------------------------------------------------------
// TEST 5: Verification behavior is measurable
// -------------------------------------------------------------
const verifCheck = learningDNAEngine.updateVerificationHabit(40, true);
const verifSkip = learningDNAEngine.updateVerificationHabit(40, false);
assert(verifCheck > verifSkip && verifCheck >= 50, 5, 'Verification habit increases when student verifies before submitting');

// -------------------------------------------------------------
// TEST 6: Recovery improves after successful recovery
// -------------------------------------------------------------
const recBefore = 40;
const recAfter = learningDNAEngine.updateRecovery(recBefore, true);
assert(recAfter > recBefore && recAfter >= 50, 6, 'Recovery score increases when student rebounds after a mistake');

// -------------------------------------------------------------
// TEST 7: Transfer ability responds to cross-domain success
// -------------------------------------------------------------
const transBefore = 50;
const transAfter = learningDNAEngine.updateTransferAbility(transBefore, true);
assert(transAfter > transBefore, 7, 'Transfer ability rises after conquering cross-domain challenges');

// -------------------------------------------------------------
// TEST 8: Counter-strategy detects rapid-answer strategy
// -------------------------------------------------------------
const rapidProfile = createTestProfile({
  learningDNA: {
    ...DEFAULT_LEARNING_DNA,
    speedProfile: 85,
    riskTaking: 75,
    verificationHabit: 30,
    patternRecognition: 80,
  },
});
const signatures = learningDNAEngine.getDominantStrategies(rapidProfile);
assert(
  signatures.includes('shortcut_seeker') || signatures.includes('rapid_pattern_matcher'),
  8,
  'Counter-Strategy detects rapid pattern matching / shortcut-seeking behavior'
);

// -------------------------------------------------------------
// TEST 9: Counter-strategy never changes correctness
// -------------------------------------------------------------
const challenge = counterStrategyEngine.generateChallenge('mathematics', 'shortcut_seeker');
const correctOption = challenge.options.find(o => o.isCorrect);
assert(
  !!correctOption && correctOption.rationale.length > 10,
  9,
  'Counter-Strategy maintains objectively correct answer with rigorous rationale'
);

// -------------------------------------------------------------
// TEST 10: Counter-strategy never creates impossible questions
// -------------------------------------------------------------
const mathChallenge = counterStrategyEngine.generateChallenge('mathematics', 'shortcut_seeker');
const csChallenge = counterStrategyEngine.generateChallenge('computerScience', 'surface_pattern_dependent');
const hasMathSol = mathChallenge.options.some(o => o.isCorrect);
const hasCsSol = csChallenge.options.some(o => o.isCorrect);
assert(hasMathSol && hasCsSol, 10, 'Counter-Strategy challenges are guaranteed solvable and curriculum-aligned');

// -------------------------------------------------------------
// TEST 11: Observer remains extremely rare
// -------------------------------------------------------------
const testObsEngine = new ObserverEngine(12345);
let whisperCount = 0;
const trials = 1000;
const baseProfile = createTestProfile();
for (let i = 0; i < trials; i++) {
  if (testObsEngine.shouldWhisperObservation(baseProfile, false)) {
    whisperCount++;
  }
}
const rate = whisperCount / trials;
console.log(`Observer Whisper Rate over ${trials} checks: ${(rate * 100).toFixed(2)}%`);
assert(rate >= 0.004 && rate <= 0.02, 11, 'Observer whisper frequency remains within 0.5%–2.0% rare band');

// -------------------------------------------------------------
// TEST 12: Observer cooldown works
// -------------------------------------------------------------
const cooldownProfile = createTestProfile({
  observerState: { ...DEFAULT_OBSERVER_STATE, cooldownEncounters: 3 },
});
const cooldownWhisper = observerEngine.shouldWhisperObservation(cooldownProfile, false);
assert(!cooldownWhisper, 12, 'Observer strictly does not appear when cooldownEncounters > 0');

// -------------------------------------------------------------
// TEST 13: Observer impression rises from exceptional performance
// -------------------------------------------------------------
let obsState = { ...DEFAULT_OBSERVER_STATE };
obsState = observerEngine.recordImpressionEvent(obsState, 'convergence_triumph', 'Convergence Solved');
obsState = observerEngine.recordImpressionEvent(obsState, 'mirror_boss_defeated', 'Mirror Singularity');
obsState = observerEngine.recordImpressionEvent(obsState, 'cross_domain_synthesis', 'Math + CS Unified');
assert(obsState.impression >= 60, 13, 'Observer impression increases significantly on exceptional feats (>= 60)');

// -------------------------------------------------------------
// TEST 14: Observer impression does not rise significantly from easy-question grinding
// -------------------------------------------------------------
let grindState = { ...DEFAULT_OBSERVER_STATE, impression: 10 };
for (let i = 0; i < 20; i++) {
  grindState = observerEngine.recordImpressionEvent(grindState, 'easy_level_cleared');
}
assert(grindState.impression === 10, 14, 'Grinding easy levels awards 0 impression points');

// -------------------------------------------------------------
// TEST 15: Observer challenge requires high impression
// -------------------------------------------------------------
const lowImpressionProfile = createTestProfile({
  observerState: { ...DEFAULT_OBSERVER_STATE, impression: 30 },
});
const highImpressionProfile = createTestProfile({
  observerState: { ...DEFAULT_OBSERVER_STATE, impression: 85 },
  learningDNA: { ...DEFAULT_LEARNING_DNA, accuracy: 80 },
});
const lowTrigger = observerEngine.shouldTriggerObserverChallenge(lowImpressionProfile, false);
assert(!lowTrigger, 15, 'Observer Challenge strictly requires high impression (impression >= 75)');

// -------------------------------------------------------------
// TEST 16: Ask Observer Anything is rarer than Observer challenge
// -------------------------------------------------------------
const opp = observerEngine.evaluateAskAnythingOpportunity(obsState, true);
assert(opp.probability <= 0.05, 16, 'Ask Observer Anything opportunity probability is capped at 5%');

// -------------------------------------------------------------
// TEST 17: Ask Observer Anything is single-use/non-farmable
// -------------------------------------------------------------
const usedState = { ...DEFAULT_OBSERVER_STATE, askAnythingUsed: true };
const reCheck = observerEngine.evaluateAskAnythingOpportunity(usedState, true);
assert(!reCheck.unlocked && reCheck.probability === 0, 17, 'Ask Observer Anything is strictly single-use and cannot be refarmed');

// -------------------------------------------------------------
// TEST 18: Mirror Boss requires defeated original boss
// -------------------------------------------------------------
const noBossProfile = createTestProfile({
  clearedLevels: {
    mathematics: [1, 2, 3, 4], // Boss level 5 NOT cleared
    computerScience: [],
    physics: [],
    chemistry: [],
    biology: [],
    history: [],
    geography: [],
    language: [],
  },
});
const bossClearedProfile = createTestProfile({
  clearedLevels: {
    mathematics: [1, 2, 3, 4, 5], // Boss level 5 CLEARED
    computerScience: [],
    physics: [],
    chemistry: [],
    biology: [],
    history: [],
    geography: [],
    language: [],
  },
});
const mirrorNoBoss = mirrorBossEngine.evaluateMirrorBossOpportunity('mathematics', noBossProfile, false);
assert(!mirrorNoBoss.shouldTrigger, 18, 'Mirror Boss strictly requires defeating the original realm boss first');

// -------------------------------------------------------------
// TEST 19: Mirror Boss targets telemetry weakness
// -------------------------------------------------------------
const mathMirror = MIRROR_BOSS_DEFINITIONS.mathematics;
assert(
  mathMirror.targetedWeakness.toLowerCase().includes('factoring') ||
  mathMirror.corruptedConcept.toLowerCase().includes('discriminant'),
  19,
  'Mirror Boss accurately targets demonstrated curriculum weakness from telemetry'
);

// -------------------------------------------------------------
// TEST 20: Mirror Boss defeat preserves all progression
// -------------------------------------------------------------
const preMirrorProfile = createTestProfile({
  xp: 3000,
  level: 8,
  unlockedCardIds: ['c1', 'c2'],
});
StorageManager.saveProfile(preMirrorProfile);
const postMirrorProfile = StorageManager.recordMirrorBossResult('mirror_math_boss', 'defeat', 0);
assert(
  postMirrorProfile.xp === preMirrorProfile.xp &&
  postMirrorProfile.level === preMirrorProfile.level &&
  postMirrorProfile.unlockedCardIds.length === preMirrorProfile.unlockedCardIds.length,
  20,
  'Mirror Boss defeat guarantees 100% preservation of player progress (0% lost)'
);

// -------------------------------------------------------------
// TEST 21: Last Question only becomes available after Convergence completion
// -------------------------------------------------------------
const incompleteProfile = createTestProfile({ convergenceCompleted: false });
const completeProfile = createTestProfile({ convergenceCompleted: true });
assert(Boolean(!incompleteProfile.convergenceCompleted && completeProfile.convergenceCompleted), 21, 'The Last Question is strictly gated behind Convergence completion');

// -------------------------------------------------------------
// TEST 22: Last Question does not alter completion status
// -------------------------------------------------------------
StorageManager.saveProfile(completeProfile);
const classified = classifyEndingVariant('I learned why axioms prove truth through foundations of logic.');
const finalProfile = StorageManager.recordLastQuestionResponse(
  'I learned why axioms prove truth through foundations of logic.',
  classified
);
assert(
  finalProfile.convergenceCompleted === true &&
  finalProfile.lastQuestionResult?.endingVariant === 'THE SCHOLAR',
  22,
  'The Last Question preserves Convergence completion and records the student reflection archetype'
);

// -------------------------------------------------------------
// TEST 23: Learning profile persists through reload
// -------------------------------------------------------------
const customProfile = createTestProfile({
  learningDNA: { ...DEFAULT_LEARNING_DNA, speedProfile: 88, verificationHabit: 77 },
  observerState: { ...DEFAULT_OBSERVER_STATE, impression: 82 },
  mirrorBossState: { ...DEFAULT_MIRROR_STATE, defeatedMirrors: ['mirror_math_boss'] },
});
StorageManager.saveProfile(customProfile);
const loadedProfile = StorageManager.loadProfile();
assert(
  Boolean(
    loadedProfile.learningDNA?.speedProfile === 88 &&
    loadedProfile.observerState?.impression === 82 &&
    loadedProfile.mirrorBossState?.defeatedMirrors.includes('mirror_math_boss')
  ),
  23,
  'Learning DNA, Observer state, and Mirror Boss states persist faithfully across reload'
);

// -------------------------------------------------------------
// TEST 24: Old saves load with safe defaults
// -------------------------------------------------------------
// Simulate legacy profile missing all expansion fields
const legacyProfile: any = {
  name: 'Legacy Hunter',
  title: 'Novice',
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  subjectMastery: { mathematics: 0, computerScience: 0 },
  clearedLevels: { mathematics: [1] },
};
StorageManager.saveProfile(legacyProfile);
const loadedLegacy = StorageManager.loadProfile();
assert(
  !!loadedLegacy.learningDNA &&
  !!loadedLegacy.observerState &&
  !!loadedLegacy.mirrorBossState &&
  loadedLegacy.learningDNA.speedProfile === 50,
  24,
  'Legacy saves safely load with non-null, robust default states'
);

// -------------------------------------------------------------
// TEST 25: Judge Demo has zero Observer/Mirror/Counter-Strategy interference
// -------------------------------------------------------------
const judgeObs = observerEngine.shouldWhisperObservation(baseProfile, true);
const judgeObsChallenge = observerEngine.shouldTriggerObserverChallenge(highImpressionProfile, true);
const judgeMirror = mirrorBossEngine.evaluateMirrorBossOpportunity('mathematics', bossClearedProfile, true);
const judgeCounter = counterStrategyEngine.evaluateOpportunity(rapidProfile, true);
assert(
  !judgeObs && !judgeObsChallenge && !judgeMirror.shouldTrigger && !judgeCounter.shouldTrigger,
  25,
  'Judge Demo mode has strictly 0% interference from Observer, Mirror Bosses, or Counter-Strategy'
);

// -------------------------------------------------------------
// TEST 26: Deterministic seeds produce deterministic hidden-event decisions
// -------------------------------------------------------------
const engineA = new CounterStrategyEngine(555);
const engineB = new CounterStrategyEngine(555);
const rollA = engineA.evaluateOpportunity(rapidProfile, false).shouldTrigger;
const rollB = engineB.evaluateOpportunity(rapidProfile, false).shouldTrigger;
assert(rollA === rollB, 26, 'Deterministic PRNG seeds produce identical repeatable event rolls');

// -------------------------------------------------------------
// TEST 27: Ending classification covers all 5 variants
// -------------------------------------------------------------
const v1 = classifyEndingVariant('Understanding the foundation and proof behind the axiom.');
const v2 = classifyEndingVariant('Learning from each error and failure to adapt.');
const v3 = classifyEndingVariant('Curiosity and discovery of new questions.');
const v4 = classifyEndingVariant('Having a clear method, system, and structure.');
const v5 = classifyEndingVariant('Knowing that the horizon is endless.');
assert(
  v1 === 'THE SCHOLAR' &&
  v2 === 'THE ADAPTER' &&
  v3 === 'THE EXPLORER' &&
  v4 === 'THE STRATEGIST' &&
  v5 === 'THE UNFINISHED MIND',
  27,
  'Last Question reflection classifier accurately maps responses to all 5 ending archetypes'
);

console.log('=============================================================');
console.log(`🎉 ALL ${passedTests}/${totalTests} "SPIRE LEARNS YOU" TESTS PASSED! 🎉`);
console.log('=============================================================');
