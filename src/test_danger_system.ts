// Comprehensive Automated Verification Suite for the Weighted Adaptive Danger System

import { DangerEngine, Mulberry32PRNG } from './engine/DangerEngine.ts';
import { PlayerProfile } from './types/telemetry.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ ${message}`);
}

function createBaseProfile(): PlayerProfile {
  return {
    name: 'Test Hunter',
    title: 'Adept',
    level: 2,
    xp: 150,
    xpToNextLevel: 300,
    subjectMastery: {
      mathematics: 50,
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
      computerScience: [],
      physics: [],
      chemistry: [],
      biology: [],
      history: [],
      geography: [],
      language: [],
    },
    unlockedCardIds: ['math_factor', 'math_solve'],
    relics: [],
    strengths: [],
    weaknesses: [],
    runHistory: [],
    activeEducationLevel: 'class_9_10',
    conceptPerformance: {},
    dangerCooldownBattles: 0,
  };
}

console.log('\n======================================================');
console.log('⚡ STARTING WEIGHTED ADAPTIVE DANGER SYSTEM TESTS ⚡');
console.log('======================================================\n');

const engine = new DangerEngine(12345);

// -------------------------------------------------------------
// TEST 1: SCENARIO A — Strong Student Frequency (3% - 5%)
// -------------------------------------------------------------
console.log('--- TEST 1: Scenario A — Strong Student (Low Frequency 3%–5%) ---');
const strongProfile = createBaseProfile();
// Populate strong performance
engine.recordPerformance(strongProfile, 'math_quadratic_factoring', 'mathematics', 'Quadratics', 'success');
engine.recordPerformance(strongProfile, 'math_quadratic_factoring', 'mathematics', 'Quadratics', 'success');
engine.recordPerformance(strongProfile, 'math_linear_systems', 'mathematics', 'Systems', 'success');

const strongRecord = strongProfile.conceptPerformance!['math_quadratic_factoring'];
const strongNeed = engine.calculateNeedScore(strongRecord);
assert(strongNeed <= 15, `Strong student Need Score is low (${strongNeed} <= 15)`);

// Simulate 1000 encounter opportunities
const strongRNG = new Mulberry32PRNG(42);
let strongDangerTriggers = 0;
const SIM_COUNT = 1000;

for (let i = 0; i < SIM_COUNT; i++) {
  // Clear battle cooldown to measure raw per-opportunity probability
  strongProfile.dangerCooldownBattles = 0;
  if (engine.shouldTriggerDanger('mathematics', false, strongProfile, strongRNG)) {
    strongDangerTriggers++;
  }
}

const strongRate = (strongDangerTriggers / SIM_COUNT) * 100;
console.log(`Strong student Danger frequency: ${strongRate.toFixed(2)}% (${strongDangerTriggers}/${SIM_COUNT})`);
assert(strongRate >= 2.5 && strongRate <= 5.5, 'Strong student danger rate matches calibrated 3%–5% range');

// -------------------------------------------------------------
// TEST 2: SCENARIO B — Repeated Misconception Escalation & Cooldown
// -------------------------------------------------------------
console.log('\n--- TEST 2: Scenario B — Repeated Misconception Escalation & Cooldown ---');
const strugglingProfile = createBaseProfile();
// Student repeatedly struggles with factorization
engine.recordPerformance(strugglingProfile, 'math_quadratic_factoring', 'mathematics', 'Quadratics', 'mistake');
engine.recordPerformance(strugglingProfile, 'math_quadratic_factoring', 'mathematics', 'Quadratics', 'repeated_mistake');
engine.recordPerformance(strugglingProfile, 'math_quadratic_factoring', 'mathematics', 'Quadratics', 'repeated_mistake');
engine.recordPerformance(strugglingProfile, 'math_quadratic_factoring', 'mathematics', 'Quadratics', 'prerequisite_gap');

const strugglingRecord = strugglingProfile.conceptPerformance!['math_quadratic_factoring'];
const strugglingNeed = engine.calculateNeedScore(strugglingRecord);
console.log(`Struggling concept Need Score: ${strugglingNeed}`);
assert(strugglingNeed >= 60, `Need score escalated significantly (${strugglingNeed} >= 60)`);

// Test trigger probability for struggling student (should be 12% - 18%, <= 20% max)
let struggleTriggers = 0;
const struggleRNG = new Mulberry32PRNG(99);
for (let i = 0; i < SIM_COUNT; i++) {
  strugglingProfile.dangerCooldownBattles = 0;
  if (engine.shouldTriggerDanger('mathematics', false, strugglingProfile, struggleRNG)) {
    struggleTriggers++;
  }
}
const struggleRate = (struggleTriggers / SIM_COUNT) * 100;
console.log(`Struggling student Danger frequency: ${struggleRate.toFixed(2)}% (${struggleTriggers}/${SIM_COUNT})`);
assert(struggleRate >= 11.0 && struggleRate <= 19.5, 'Struggling student danger rate matches 12%–18% range (<= 20% cap)');

// Test selection and cooldown
const dangerEvent = engine.selectWeightedDanger('mathematics', strugglingProfile, struggleRNG);
assert(dangerEvent !== null, 'Danger event selected for struggling student');
assert(dangerEvent?.conceptId === 'math_quadratic_factoring', 'High-need concept selected');
assert(strugglingRecord.cooldownEncounters === 2, 'Concept placed on 2-encounter cooldown');
assert(strugglingProfile.dangerCooldownBattles === 1, 'Global battle cooldown active');

// Anti-repetition: Immediately next encounter must NOT re-select the exact same concept if another exists
const nextEligible = engine.getEligibleWeaknesses('mathematics', strugglingProfile);
assert(!nextEligible.some(c => c.conceptId === 'math_quadratic_factoring' && c.cooldownEncounters > 0), 'Cooldown strictly enforced');

// -------------------------------------------------------------
// TEST 3: SCENARIO C — Student Recovery & Weakness Retirement
// -------------------------------------------------------------
console.log('\n--- TEST 3: Scenario C — Student Recovery & Weakness Retirement ---');
const recoveryProfile = createBaseProfile();
// Setup high initial mistakes
engine.recordPerformance(recoveryProfile, 'math_quadratic_factoring', 'mathematics', 'Quadratics', 'mistake');
engine.recordPerformance(recoveryProfile, 'math_quadratic_factoring', 'mathematics', 'Quadratics', 'repeated_mistake');
const preNeed = engine.calculateNeedScore(recoveryProfile.conceptPerformance!['math_quadratic_factoring']);

// Student achieves successful recoveries in Echo Vault / Battles
engine.recordPerformance(recoveryProfile, 'math_quadratic_factoring', 'mathematics', 'Quadratics', 'recovery');
engine.recordPerformance(recoveryProfile, 'math_quadratic_factoring', 'mathematics', 'Quadratics', 'recovery');
engine.recordPerformance(recoveryProfile, 'math_quadratic_factoring', 'mathematics', 'Quadratics', 'success');

const postNeed = engine.calculateNeedScore(recoveryProfile.conceptPerformance!['math_quadratic_factoring']);
console.log(`Need Score before recovery: ${preNeed} -> after recovery: ${postNeed}`);
assert(postNeed < preNeed, 'Need Score decreased substantially after recovery');
assert(postNeed <= 25, 'Weakness progressively retired towards baseline');

// -------------------------------------------------------------
// TEST 4: SCENARIO D — Multiple Weaknesses Weighted Probability
// -------------------------------------------------------------
console.log('\n--- TEST 4: Scenario D — Multiple Weaknesses Weighted Random Selection ---');
const multiProfile = createBaseProfile();
// Concept A: Severe weakness
engine.recordPerformance(multiProfile, 'math_quadratic_factoring', 'mathematics', 'Factoring', 'mistake');
engine.recordPerformance(multiProfile, 'math_quadratic_factoring', 'mathematics', 'Factoring', 'repeated_mistake');
engine.recordPerformance(multiProfile, 'math_quadratic_factoring', 'mathematics', 'Factoring', 'repeated_mistake');

// Concept B: Mild weakness
engine.recordPerformance(multiProfile, 'math_linear_systems', 'mathematics', 'Systems', 'mistake');

const scoreA = engine.calculateNeedScore(multiProfile.conceptPerformance!['math_quadratic_factoring']);
const scoreB = engine.calculateNeedScore(multiProfile.conceptPerformance!['math_linear_systems']);
console.log(`Concept A (Factoring) Need Score: ${scoreA} | Concept B (Systems) Need Score: ${scoreB}`);
assert(scoreA > scoreB, 'Severe weakness has higher Need Score than mild weakness');

// Run 500 selection rolls without cooldown to test probability distribution
const selectRNG = new Mulberry32PRNG(777);
let countA = 0;
let countB = 0;
const ROLLS = 500;

for (let i = 0; i < ROLLS; i++) {
  // Reset cooldowns to test raw roulette distribution
  multiProfile.conceptPerformance!['math_quadratic_factoring'].cooldownEncounters = 0;
  multiProfile.conceptPerformance!['math_quadratic_factoring'].lastSelectedAsDanger = false;
  multiProfile.conceptPerformance!['math_linear_systems'].cooldownEncounters = 0;
  multiProfile.conceptPerformance!['math_linear_systems'].lastSelectedAsDanger = false;

  const event = engine.selectWeightedDanger('mathematics', multiProfile, selectRNG);
  if (event?.conceptId === 'math_quadratic_factoring') countA++;
  if (event?.conceptId === 'math_linear_systems') countB++;
}

const percentA = (countA / ROLLS) * 100;
const percentB = (countB / ROLLS) * 100;
console.log(`Roulette Distribution over ${ROLLS} rolls: Factoring = ${percentA.toFixed(1)}%, Systems = ${percentB.toFixed(1)}%`);
assert(countA > countB, 'Higher-need concept was selected significantly more often');
assert(countB > 0, 'Lower-need concept still appeared occasionally (not 0%)');

// -------------------------------------------------------------
// TEST 5: SCENARIO E — Recency Decay over Encounters
// -------------------------------------------------------------
console.log('\n--- TEST 5: Scenario E — Recency Decay over Time/Sessions ---');
const decayProfile = createBaseProfile();
engine.recordPerformance(decayProfile, 'cs_sorting_invariants', 'computerScience', 'Sorting', 'mistake');
engine.recordPerformance(decayProfile, 'cs_sorting_invariants', 'computerScience', 'Sorting', 'mistake');
const initialDecayMistakes = decayProfile.conceptPerformance!['cs_sorting_invariants'].recentMistakes;
assert(initialDecayMistakes === 2, 'Initial mistakes count = 2');

// Simulate 5 encounters without repeating the mistake
for (let b = 0; b < 5; b++) {
  engine.applyRecencyDecay(decayProfile);
}

const decayedMistakes = decayProfile.conceptPerformance
  ? decayProfile.conceptPerformance['cs_sorting_invariants'].recentMistakes
  : 0;
console.log(`Mistakes after 5 encounters with gamma=0.85: ${initialDecayMistakes} -> ${decayedMistakes}`);
assert(decayedMistakes < 1.0, 'Historical mistakes decayed substantially without active recurrence (decayed < 1.0)');

// -------------------------------------------------------------
// TEST 6: SCENARIO F — Judge Demo Complete Immunity (0%)
// -------------------------------------------------------------
console.log('\n--- TEST 6: Scenario F — Judge Demo Immunity (Strictly 0% Danger) ---');
const demoProfile = createBaseProfile();
// Give student maximum conceivable need
demoProfile.conceptPerformance!['math_quadratic_factoring'] = {
  conceptId: 'math_quadratic_factoring',
  subject: 'mathematics',
  conceptName: 'Quadratics',
  recentMistakes: 10,
  repeatedMistakes: 10,
  misconceptionFrequency: 10,
  prerequisiteGaps: 5,
  recentSuccessCount: 0,
  totalAttempts: 25,
  masteryLevel: 0,
  lastEncounterTimestamp: Date.now(),
  successfulRecoveries: 0,
  dangerEncounterCount: 0,
  cooldownEncounters: 0,
  lastSelectedAsDanger: false,
};

let demoTriggerCount = 0;
const demoRNG = new Mulberry32PRNG(1);
for (let d = 0; d < 200; d++) {
  if (engine.shouldTriggerDanger('mathematics', true, demoProfile, demoRNG)) {
    demoTriggerCount++;
  }
}
assert(demoTriggerCount === 0, 'Judge Demo triggers Danger EXACTLY 0% of the time (0/200)');

// -------------------------------------------------------------
// TEST 7: SCENARIO G — Reproducible Seedability
// -------------------------------------------------------------
console.log('\n--- TEST 7: Scenario G — PRNG Reproducibility for Debugging ---');
const prng1 = new Mulberry32PRNG(8888);
const prng2 = new Mulberry32PRNG(8888);
const rolls1 = Array.from({ length: 10 }, () => prng1.next());
const rolls2 = Array.from({ length: 10 }, () => prng2.next());
assert(JSON.stringify(rolls1) === JSON.stringify(rolls2), 'Identical seeds produce exact same random sequence');

console.log('\n=============================================================');
console.log('🎉 ALL WEIGHTED ADAPTIVE DANGER TESTS PASSED (100%) 🎉');
console.log('=============================================================\n');
