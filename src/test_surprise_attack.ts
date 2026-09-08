import { SubjectId } from './types/game';
import { PlayerProfile, RunRecord } from './types/telemetry';
import { surpriseAttackEngine, SurpriseAttackEngine } from './engine/SurpriseAttackEngine';
import { Mulberry32PRNG } from './engine/DangerEngine';
import { StorageManager } from './persistence/StorageManager';
import { ALL_SUBJECTS, ENCOUNTERS_MAP } from './curriculum/registry';
import { SURPRISE_ATTACKS_MAP } from './curriculum/surpriseAttacks';

declare const process: any;

function createMockProfile(overrides?: Partial<PlayerProfile>): PlayerProfile {
  return {
    name: 'Hunter Vaelen',
    title: 'Novice of the Fractured Spire',
    level: 1,
    xp: 100,
    xpToNextLevel: 250,
    subjectMastery: {
      mathematics: 20,
      computerScience: 20,
      physics: 0,
      chemistry: 0,
      biology: 0,
      history: 0,
      geography: 0,
      language: 0,
    },
    clearedLevels: {
      mathematics: [1],
      computerScience: [1],
      physics: [],
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
    unlockedCardIds: ['math_factor', 'math_solve'],
    relics: ['Focus Rune'],
    strengths: ['Pattern Recognition'],
    weaknesses: [],
    runHistory: [],
    activeEducationLevel: 'class_9_10',
    conceptPerformance: {},
    dangerCooldownBattles: 0,
    surpriseAttackCooldownBattles: 0,
    surpriseAttacksCompleted: 0,
    ...overrides,
  };
}

console.log('=============================================================');
console.log('⚡ STARTING SURPRISE ATTACK / AMBUSH SYSTEM TESTS ⚡');
console.log('=============================================================');

// TEST 1: Normal Slow/Average Progression
console.log('\n--- TEST 1: Normal Progression Low Opportunity ---');
const slowProfile = createMockProfile({
  runHistory: [
    {
      id: 'run_1',
      subject: 'mathematics',
      levelNumber: 1,
      levelTitle: 'Stage 1',
      result: 'VICTORY',
      score: 100,
      timeTakenSeconds: 58, // average/slow time
      date: '2026-09-08',
      turnsUsed: 5,
    },
  ],
});
const threatSlow = surpriseAttackEngine.calculateThreatLevel('mathematics', slowProfile);
console.log(`Slow Progression Threat: ${threatSlow.threatLevel}, Opportunity Prob: ${(threatSlow.opportunityProbability * 100).toFixed(2)}%`);
if (threatSlow.opportunityProbability <= 0.02) {
  console.log('✅ PASS: Slow progression produces opportunity probability <= 2%');
} else {
  console.error('❌ FAIL: Slow progression exceeded 2%');
  process.exit(1);
}

// TEST 2: Rapid High Success Increases Threat
console.log('\n--- TEST 2: Rapid High Success Increases Threat ---');
const fastRuns: RunRecord[] = [
  { id: 'f1', subject: 'mathematics', levelNumber: 1, levelTitle: 'S1', result: 'VICTORY', score: 200, timeTakenSeconds: 18, date: '2026-09-08', turnsUsed: 2 },
  { id: 'f2', subject: 'mathematics', levelNumber: 2, levelTitle: 'S2', result: 'VICTORY', score: 200, timeTakenSeconds: 20, date: '2026-09-08', turnsUsed: 2 },
  { id: 'f3', subject: 'mathematics', levelNumber: 3, levelTitle: 'S3', result: 'VICTORY', score: 200, timeTakenSeconds: 22, date: '2026-09-08', turnsUsed: 3 },
];
const fastProfile = createMockProfile({
  runHistory: fastRuns,
  subjectMastery: { ...slowProfile.subjectMastery, mathematics: 75 },
  clearedLevels: { ...slowProfile.clearedLevels, mathematics: [1, 2, 3] },
});
const threatFast = surpriseAttackEngine.calculateThreatLevel('mathematics', fastProfile);
console.log(`Fast Progression Threat: ${threatFast.threatLevel}, Opportunity Prob: ${(threatFast.opportunityProbability * 100).toFixed(2)}%`);
if (threatFast.threatLevel > threatSlow.threatLevel && threatFast.threatLevel >= 60) {
  console.log('✅ PASS: Rapid high-success progression materially increases Threat Level (>= 60)');
} else {
  console.error(`❌ FAIL: Expected threat >= 60, got ${threatFast.threatLevel}`);
  process.exit(1);
}

// TEST 3: Boss Proximity with Fast Progression vs Alone
console.log('\n--- TEST 3: Boss Proximity Behavior ---');
// Case A: Near Boss with slow progression
const nearBossSlowProfile = createMockProfile({
  runHistory: [
    { id: 's1', subject: 'mathematics', levelNumber: 4, levelTitle: 'S4', result: 'VICTORY', score: 100, timeTakenSeconds: 65, date: '2026-09-08', turnsUsed: 6 },
  ],
  clearedLevels: { ...slowProfile.clearedLevels, mathematics: [1, 2, 3, 4] },
});
const threatNearBossSlow = surpriseAttackEngine.calculateThreatLevel('mathematics', nearBossSlowProfile);
console.log(`Near Boss Slow Threat: ${threatNearBossSlow.threatLevel}, Prob: ${(threatNearBossSlow.opportunityProbability * 100).toFixed(2)}%`);

// Case B: Near Boss with rapid progression
const nearBossFastProfile = createMockProfile({
  runHistory: fastRuns,
  subjectMastery: { ...slowProfile.subjectMastery, mathematics: 85 },
  clearedLevels: { ...slowProfile.clearedLevels, mathematics: [1, 2, 3, 4] },
});
const threatNearBossFast = surpriseAttackEngine.calculateThreatLevel('mathematics', nearBossFastProfile);
console.log(`Near Boss Fast Threat: ${threatNearBossFast.threatLevel}, Prob: ${(threatNearBossFast.opportunityProbability * 100).toFixed(2)}%`);

if (threatNearBossSlow.opportunityProbability <= 0.02 && threatNearBossFast.threatLevel >= 80 && threatNearBossFast.opportunityProbability >= 0.08) {
  console.log('✅ PASS: Boss proximity alone does NOT create threat; combination of speed + proximity raises threat to high/extreme band');
} else {
  console.error('❌ FAIL: Boss proximity test failed expectation');
  process.exit(1);
}

// TEST 4: Recent Failures Reduce Threat
console.log('\n--- TEST 4: Recent Failures Reduce Threat ---');
const defeatProfile = createMockProfile({
  runHistory: [
    { id: 'd1', subject: 'mathematics', levelNumber: 3, levelTitle: 'S3', result: 'DEFEAT', score: 20, timeTakenSeconds: 40, date: '2026-09-08', turnsUsed: 4 },
    ...fastRuns,
  ],
  conceptPerformance: {
    concept_factoring: {
      conceptId: 'concept_factoring',
      subject: 'mathematics',
      conceptName: 'Quadratic Factoring',
      recentMistakes: 3,
      repeatedMistakes: 2,
      misconceptionFrequency: 2,
      prerequisiteGaps: 1,
      recentSuccessCount: 0,
      totalAttempts: 5,
      masteryLevel: 30,
      lastEncounterTimestamp: Date.now(),
      successfulRecoveries: 0,
      dangerEncounterCount: 1,
      cooldownEncounters: 0,
      lastSelectedAsDanger: false,
    },
  },
});
const threatDefeat = surpriseAttackEngine.calculateThreatLevel('mathematics', defeatProfile);
console.log(`After Recent Defeat & Mistakes: Threat = ${threatDefeat.threatLevel} (Deduction = -${threatDefeat.recentFailureScore})`);
if (threatDefeat.threatLevel < threatFast.threatLevel && threatDefeat.recentFailureScore >= 20) {
  console.log('✅ PASS: Recent failures and mistakes heavily suppress threat');
} else {
  console.error('❌ FAIL: Threat was not appropriately reduced by recent failure');
  process.exit(1);
}

// TEST 5: Old Performance Decay
console.log('\n--- TEST 5: Old Performance Recency Decay ---');
const oldWinsProfile = createMockProfile({
  runHistory: [
    // 5 recent normal runs pushed old wins into antiquity
    { id: 'n1', subject: 'mathematics', levelNumber: 2, levelTitle: 'S2', result: 'VICTORY', score: 100, timeTakenSeconds: 50, date: '2026-09-08', turnsUsed: 4 },
    { id: 'n2', subject: 'mathematics', levelNumber: 2, levelTitle: 'S2', result: 'VICTORY', score: 100, timeTakenSeconds: 52, date: '2026-09-08', turnsUsed: 4 },
    { id: 'n3', subject: 'mathematics', levelNumber: 2, levelTitle: 'S2', result: 'VICTORY', score: 100, timeTakenSeconds: 48, date: '2026-09-08', turnsUsed: 4 },
    { id: 'n4', subject: 'mathematics', levelNumber: 2, levelTitle: 'S2', result: 'VICTORY', score: 100, timeTakenSeconds: 55, date: '2026-09-08', turnsUsed: 5 },
    { id: 'n5', subject: 'mathematics', levelNumber: 2, levelTitle: 'S2', result: 'VICTORY', score: 100, timeTakenSeconds: 50, date: '2026-09-08', turnsUsed: 4 },
    ...fastRuns, // old fast runs at indices 5+
  ],
});
const threatOld = surpriseAttackEngine.calculateThreatLevel('mathematics', oldWinsProfile);
console.log(`Older Performance Threat: ${threatOld.threatLevel} vs Fresh Fast Threat: ${threatFast.threatLevel}`);
if (threatOld.threatLevel < threatFast.threatLevel) {
  console.log('✅ PASS: Old performance decays; current average performance dominates');
} else {
  console.error('❌ FAIL: Old performance did not decay');
  process.exit(1);
}

// TEST 6: Cooldown Suppresses Attacks (0% Opportunity)
console.log('\n--- TEST 6: Cooldown Suppresses Attacks ---');
const cooldownProfile = createMockProfile({
  ...nearBossFastProfile,
  surpriseAttackCooldownBattles: 2,
});
const shouldTriggerCooldown = surpriseAttackEngine.shouldTriggerAttack('mathematics', false, cooldownProfile);
console.log(`Should Trigger With Cooldown=2: ${shouldTriggerCooldown}`);
if (!shouldTriggerCooldown) {
  console.log('✅ PASS: Active cooldown strictly yields 0% opportunity (false)');
} else {
  console.error('❌ FAIL: Ambush triggered despite active cooldown');
  process.exit(1);
}

// TEST 7: World Map Separation (No Surprise Attack Nodes)
console.log('\n--- TEST 7: World Map Separation ---');
let worldMapNodeFound = false;
for (const subjKey in ALL_SUBJECTS) {
  const subj = ALL_SUBJECTS[subjKey as SubjectId];
  for (const lvl of subj.levels) {
    if (lvl.id.includes('ambush') || lvl.id.includes('surprise') || lvl.title.toLowerCase().includes('surprise attack')) {
      worldMapNodeFound = true;
    }
  }
}
let encounterPathLeak = false;
for (const subjKey in ENCOUNTERS_MAP) {
  const encs = ENCOUNTERS_MAP[subjKey as SubjectId] || [];
  for (const enc of encs) {
    if (enc.id.includes('surprise_ambush')) {
      encounterPathLeak = true;
    }
  }
}
if (!worldMapNodeFound && !encounterPathLeak) {
  console.log('✅ PASS: No Surprise Attack nodes exist on World Map or standard encounter lists');
} else {
  console.error('❌ FAIL: Surprise Attack found in World Map or Encounter lists');
  process.exit(1);
}

// TEST 8: Answer Secrecy in Surprise Attack Questions
console.log('\n--- TEST 8: Answer Secrecy In Questions ---');
for (const key in SURPRISE_ATTACKS_MAP) {
  const attack = SURPRISE_ATTACKS_MAP[key as SubjectId];
  for (const q of attack.eliteQuestions) {
    // Scenario and objective must NOT reveal isCorrect or correct explanation
    if (q.scenario.includes(q.correctExplanation) || q.objective.includes(q.correctExplanation)) {
      console.error(`❌ FAIL: Scenario or objective reveals correct explanation in ${q.id}`);
      process.exit(1);
    }
    // Options must have unique A., B., C., D. labels without pre-marked correctness
    const prefixes = q.options.map(o => o.label.slice(0, 2));
    const expectedPrefixes = ['A.', 'B.', 'C.', 'D.'];
    const matchesPrefixes = expectedPrefixes.every((p, idx) => prefixes[idx] === p);
    if (!matchesPrefixes) {
      console.error(`❌ FAIL: Question ${q.id} options do not have neutral A., B., C., D. formatting`);
      process.exit(1);
    }
  }
}
console.log('✅ PASS: All surprise attack questions maintain strict exam-style answer secrecy');

// TEST 9: Failure Preservation (Defeat Never Loses Cleared Levels, XP, Cards, Mastery)
console.log('\n--- TEST 9: Failure Preservation ---');
const beforeProfile = createMockProfile({
  level: 3,
  xp: 150,
  subjectMastery: { ...slowProfile.subjectMastery, mathematics: 60 },
  clearedLevels: { ...slowProfile.clearedLevels, mathematics: [1, 2, 3] },
  unlockedCardIds: ['math_factor', 'math_solve', 'math_verify'],
  relics: ['Focus Rune', 'Time Shard'],
});
StorageManager.saveProfile(beforeProfile);

// Record defeat in surprise attack
const afterProfile = StorageManager.recordSurpriseAttackResult(
  'mathematics',
  'math_surprise_ambush',
  'defeat',
  0,
  0
);

if (
  afterProfile.clearedLevels.mathematics.length === beforeProfile.clearedLevels.mathematics.length &&
  afterProfile.xp === beforeProfile.xp &&
  afterProfile.unlockedCardIds.length === beforeProfile.unlockedCardIds.length &&
  afterProfile.subjectMastery.mathematics === beforeProfile.subjectMastery.mathematics &&
  afterProfile.surpriseAttackCooldownBattles === 2
) {
  console.log('✅ PASS: Defeat preserves 100% of cleared levels, XP, cards, and mastery, and sets 2-battle cooldown');
} else {
  console.error('❌ FAIL: Defeat erased or modified progression metrics');
  process.exit(1);
}

// TEST 10: Judge Demo Immunity (100 Simulations = 0 Attacks)
console.log('\n--- TEST 10: Judge Demo Immunity (100 Simulations) ---');
let judgeDemoTriggers = 0;
for (let i = 0; i < 100; i++) {
  const seed = 1000 + i;
  const rng = new Mulberry32PRNG(seed);
  if (surpriseAttackEngine.shouldTriggerAttack('mathematics', true, nearBossFastProfile, rng)) {
    judgeDemoTriggers += 1;
  }
}
console.log(`Judge Demo Triggers over 100 simulations: ${judgeDemoTriggers}`);
if (judgeDemoTriggers === 0) {
  console.log('✅ PASS: Exactly 0 surprise attacks in 100 Judge Demo simulations');
} else {
  console.error(`❌ FAIL: Judge Demo triggered ${judgeDemoTriggers} surprise attacks`);
  process.exit(1);
}

// TEST 11: Determinism (Same inputs = Exact same roll)
console.log('\n--- TEST 11: Deterministic Behavior ---');
const engineA = new SurpriseAttackEngine(424242);
const engineB = new SurpriseAttackEngine(424242);

const rollA1 = engineA.shouldTriggerAttack('mathematics', false, nearBossFastProfile);
const rollB1 = engineB.shouldTriggerAttack('mathematics', false, nearBossFastProfile);

const rollA2 = engineA.shouldTriggerAttack('mathematics', false, nearBossFastProfile);
const rollB2 = engineB.shouldTriggerAttack('mathematics', false, nearBossFastProfile);

if (rollA1 === rollB1 && rollA2 === rollB2) {
  console.log(`✅ PASS: Deterministic reproducibility confirmed (roll 1: ${rollA1}, roll 2: ${rollA2})`);
} else {
  console.error('❌ FAIL: Engines with identical seeds produced divergent outcomes');
  process.exit(1);
}

// TEST 12: Opportunity Probability Hard Ceiling (Never Exceeds 15%)
console.log('\n--- TEST 12: Opportunity Probability Hard Ceiling ---');
const maxProb = surpriseAttackEngine.getOpportunityProbability(100);
const beyondMaxProb = surpriseAttackEngine.getOpportunityProbability(150);
console.log(`Max Threat Probability (Threat 100): ${(maxProb * 100).toFixed(2)}%, (Threat 150): ${(beyondMaxProb * 100).toFixed(2)}%`);
if (maxProb <= 0.15 && beyondMaxProb <= 0.15) {
  console.log('✅ PASS: Opportunity probability strictly obeys 15% hard ceiling');
} else {
  console.error('❌ FAIL: Opportunity probability exceeded 15% ceiling');
  process.exit(1);
}

console.log('\n=============================================================');
console.log('🎉 ALL 12 SURPRISE ATTACK TESTS PASSED PERFECTLY! 🎉');
console.log('=============================================================');
