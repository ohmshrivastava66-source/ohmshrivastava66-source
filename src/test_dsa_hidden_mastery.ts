import { DSA_HIDDEN_TRIALS } from './curriculum/dsaMasteryCompression';
import { ENCOUNTERS_MAP } from './curriculum/registry';
import { MasteryCompressionEngine } from './engine/MasteryCompressionEngine';
import { solutionPathEngine } from './engine/SolutionPathEngine';
import { CombatEngine } from './engine/CombatEngine';
import { StorageManager } from './persistence/StorageManager';
import { DEFAULT_LEARNING_DNA } from './engine/LearningDNAEngine';
import { PlayerProfile } from './types/telemetry';

declare const process: any;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
}

console.log('=============================================================');
console.log('🛡️ STARTING DSA HIDDEN MASTERY COMPRESSION PATH SUITE 🛡️');
console.log('=============================================================\n');

// =========================================================================
// TEST 1: Content & Registry Integrity (12 Dense Trials HD1–HD12)
// =========================================================================
console.log('▶ TEST 1: Trial Suite & Registry Integrity (HD1–HD12, Levels 101–112)');

assert(DSA_HIDDEN_TRIALS.length === 12, `Must contain exactly 12 hidden trials, got ${DSA_HIDDEN_TRIALS.length}`);

// Verify all IDs and Level numbers
for (let i = 0; i < 12; i++) {
  const trial = DSA_HIDDEN_TRIALS[i];
  const expectedLevel = 101 + i;
  const expectedId = `dsa_hidden_hd${i + 1}`;
  assert(trial.id === expectedId, `Trial ${i + 1} ID must be ${expectedId}, got ${trial.id}`);
  assert(trial.levelNumber === expectedLevel, `Trial ${i + 1} levelNumber must be ${expectedLevel}, got ${trial.levelNumber}`);
  assert(trial.pathType === 'hidden_trial', `Trial ${i + 1} pathType must be 'hidden_trial'`);
  assert(trial.stepTransformations.length > 0, `Trial ${i + 1} must have stepTransformations`);
  assert(trial.optimalSequence.length > 0, `Trial ${i + 1} must have optimalSequence`);
}

// Verify Registry Integration
const dsaRegistered = ENCOUNTERS_MAP.data_structures_algorithms;
for (const trial of DSA_HIDDEN_TRIALS) {
  const found = dsaRegistered.find(e => e.id === trial.id);
  assert(!!found, `Trial ${trial.id} must be registered in ENCOUNTERS_MAP.data_structures_algorithms`);
}

const reqHidden = MasteryCompressionEngine.REQUIRED_HIDDEN_TRIALS.data_structures_algorithms;
assert(reqHidden && reqHidden.length === 12, 'MasteryCompressionEngine must register 12 required hidden trials for DSA');

const reqConcepts = MasteryCompressionEngine.REQUIRED_CONCEPTS.data_structures_algorithms;
assert(reqConcepts && reqConcepts.length === 24, 'MasteryCompressionEngine must register 24 required concepts for DSA');

console.log('  ✓ All 12 trials (HD1–HD12, Levels 101–112) registered with valid structure.');
console.log('✅ TEST 1 PASSED!\n');

// =========================================================================
// TEST 2: 100% Solvability Guarantee Across All 12 Hidden Trials
// =========================================================================
console.log('▶ TEST 2: Solvability Invariants Across All 12 Hidden Trials');

for (const trial of DSA_HIDDEN_TRIALS) {
  const engine = new CombatEngine(trial);
  const graph = engine.getSolutionGraph();
  const report = solutionPathEngine.validateSolvability(graph, engine.getState());

  assert(report.solvable, `Trial ${trial.id} must be mathematically solvable`);
  assert(report.reachableWinningPaths >= 1, `Trial ${trial.id} must have >= 1 reachable winning paths, got ${report.reachableWinningPaths}`);
  assert(report.reachableFirstActions.length >= 1, `Trial ${trial.id} must have >= 1 reachable first actions, got ${report.reachableFirstActions.length}`);
}

console.log('  ✓ All 12 trials pass solvability validation with >= 1 reachable winning paths and first actions.');
console.log('✅ TEST 2 PASSED!\n');

// =========================================================================
function simulateCombat(
  engine: CombatEngine,
  strategy: 'AWARE' | 'SLOT_0',
  maxTurns: number = 20
): 'VICTORY' | 'DEFEAT' {
  let turns = 0;
  while (engine.getState().combatStatus === 'PLAYER_TURN' && turns < maxTurns) {
    const state = engine.getState();
    const hand = state.player.hand;
    let cardPlayed = false;

    if (strategy === 'AWARE') {
      const graph = engine.getSolutionGraph();
      for (const card of hand) {
        if (state.player.currentEnergy >= card.cost) {
          const trans = solutionPathEngine.evaluateCardTransition(
            graph,
            state.currentEquationState,
            state.currentStepIndex,
            card.operationKey
          );
          if (trans && trans.isValid) {
            const prevEnergy = engine.getState().player.currentEnergy;
            engine.playCard(card.id);
            if (engine.getState().player.currentEnergy < prevEnergy) {
              cardPlayed = true;
              break;
            }
          }
        }
      }
    } else if (strategy === 'SLOT_0') {
      const card = hand[0];
      if (card && state.player.currentEnergy >= card.cost) {
        const prevEnergy = engine.getState().player.currentEnergy;
        engine.playCard(card.id);
        if (engine.getState().player.currentEnergy < prevEnergy) {
          cardPlayed = true;
        }
      }
    }

    if (engine.getState().combatStatus !== 'PLAYER_TURN') break;

    if (!cardPlayed) {
      engine.endTurn();
      turns++;
    }
  }

  return engine.getState().combatStatus as 'VICTORY' | 'DEFEAT';
}

// =========================================================================
// TEST 3: Anti-Sequence Resistance Across Hidden Path
// =========================================================================
console.log('▶ TEST 3: Anti-Sequence Resistance on Hidden Trials');

for (const trial of DSA_HIDDEN_TRIALS) {
  // Cohort: Blind Slot-0 Spam (100 attempts per trial)
  let exploitWins = 0;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (simulateCombat(new CombatEngine(trial), 'SLOT_0', 15) === 'VICTORY') {
      exploitWins++;
    }
  }

  const exploitRate = (exploitWins / 100) * 100;
  assert(exploitRate < 15.0, `Trial ${trial.id} exploit win rate must be < 15%, got ${exploitRate}%`);

  // Cohort: Question-Aware Reasoning
  const awareResult = simulateCombat(new CombatEngine(trial), 'AWARE', 20);
  assert(awareResult === 'VICTORY', `Question-aware learner must conquer ${trial.id}`);
}

console.log('  ✓ Verified: Slot-0 exploit fails (<15%) on all 12 hidden trials while reasoning achieves victory.');
console.log('✅ TEST 3 PASSED!\n');

// =========================================================================
// TEST 4: HD12 The Algorithmic Ascension Final Hidden Boss
// =========================================================================
console.log('▶ TEST 4: HD12 Sovereign Boss (The Algorithmic Ascension)');

const hd12 = DSA_HIDDEN_TRIALS.find(t => t.id === 'dsa_hidden_hd12');
assert(!!hd12, 'HD12 must exist');
assert(hd12!.isBoss === true, 'HD12 must be marked as isBoss');
assert(hd12!.enemy.name === 'The Algorithmic Ascension', 'Boss name must be The Algorithmic Ascension');
assert(hd12!.enemy.hp >= 450, 'Boss must have substantial endgame HP');

// Verify question-aware victory against HD12
const bossResult = simulateCombat(new CombatEngine(hd12!), 'AWARE', 25);
assert(bossResult === 'VICTORY', 'The Algorithmic Ascension must be solvable by reasoning');
console.log('  ✓ Verified: HD12 The Algorithmic Ascension is a robust, legitimately conquerable sovereign boss.');
console.log('✅ TEST 4 PASSED!\n');

// =========================================================================
// TEST 5: Progress Isolation Between Main Path (1–54) & Hidden Path (101–112)
// =========================================================================
console.log('▶ TEST 5: Progress State Isolation');

const freshProfile: PlayerProfile = {
  name: 'Hidden Tester',
  title: 'Novice',
  level: 1,
  xp: 0,
  xpToNextLevel: 250,
  subjectMastery: { data_structures_algorithms: 0 } as any,
  clearedLevels: { data_structures_algorithms: [1, 2, 3] } as any,
  clearedHiddenTrials: { data_structures_algorithms: [] } as any,
  dsaHiddenPathDiscovered: true,
  dsaHiddenPathClearedLevels: [],
  dsaHiddenPathBossDefeated: false,
  masteryCompressionRecords: {},
  unlockedCardIds: [],
  relics: [],
  equippedRelics: [],
  discoveredRelics: [],
  prestigeTitles: [],
  strengths: [],
  weaknesses: [],
  runHistory: [],
  activeEducationLevel: 'college_foundation',
  conceptPerformance: {},
  dangerCooldownBattles: 0,
  surpriseAttackCooldownBattles: 0,
  surpriseAttacksCompleted: 0,
  convergenceUnlocked: false,
  convergenceCompleted: false,
  convergenceBestScore: 0,
  convergenceAttempts: 0,
  learningDNA: { ...DEFAULT_LEARNING_DNA },
};

StorageManager.saveProfile(freshProfile);

// Record victory on HD1 (level 101)
StorageManager.recordDSAHiddenTrialVictory(101, 'dsa_hidden_hd1', false);
let loaded = StorageManager.loadProfile();

// Verify that HD1 cleared is tracked in dsaHiddenPathClearedLevels
assert(Boolean(loaded.dsaHiddenPathClearedLevels?.includes(101)), 'HD1 must be recorded in dsaHiddenPathClearedLevels');
// Verify that main path clearedLevels is untouched!
assert(!loaded.clearedLevels['data_structures_algorithms']?.includes(101), 'Main path clearedLevels must NOT contain level 101');
assert((loaded.clearedLevels['data_structures_algorithms']?.length || 0) === 3, 'Main path cleared levels count must remain 3');
assert(!loaded.dsaHiddenPathBossDefeated, 'Boss defeated must be false before HD12');

// Record victory on HD12 (level 112)
StorageManager.recordDSAHiddenTrialVictory(112, 'dsa_hidden_hd12', true);
loaded = StorageManager.loadProfile();
assert(Boolean(loaded.dsaHiddenPathClearedLevels?.includes(112)), 'HD12 must be recorded in dsaHiddenPathClearedLevels');
assert(loaded.dsaHiddenPathBossDefeated === true, 'HD12 victory must set dsaHiddenPathBossDefeated to true');
assert(Boolean(loaded.prestigeTitles?.includes('Ascendant of Algorithms')), 'HD12 victory must grant Ascendant of Algorithms prestige title');
console.log('  ✓ Verified: Main path and Hidden path progression arrays remain 100% isolated.');
console.log('✅ TEST 5 PASSED!\n');

// =========================================================================
// TEST 6: Discovery Firewalls & Anti-Exploit Unlock Gating
// =========================================================================
console.log('▶ TEST 6: Discovery Firewalls & Anti-Exploit Unlock Gating');

// Case A: Novice player who has not cleared Module 1 (Level 10)
const noviceProfile: PlayerProfile = {
  ...freshProfile,
  dsaHiddenPathDiscovered: false,
  clearedLevels: { data_structures_algorithms: [1, 2, 3] } as any,
};
const noviceUnlock = StorageManager.unlockDSAHiddenPath(noviceProfile);
assert(!noviceUnlock.unlocked, 'Novice without Module 1 clearance must NOT unlock hidden path');

// Case B: Rapid pattern exploiter who cleared levels by exploit
const exploiterProfile: PlayerProfile = {
  ...freshProfile,
  dsaHiddenPathDiscovered: false,
  clearedLevels: { data_structures_algorithms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } as any,
  behaviorClassification: 'RAPID_PATTERN_EXPLOIT',
  exploitStreakCount: 3,
};
const exploiterUnlock = StorageManager.unlockDSAHiddenPath(exploiterProfile);
assert(!exploiterUnlock.unlocked, 'Rapid pattern exploiter must NOT unlock hidden path');

// Case C: Legitimate student who cleared Module 1
const legitProfile: PlayerProfile = {
  ...freshProfile,
  dsaHiddenPathDiscovered: false,
  clearedLevels: { data_structures_algorithms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } as any,
  behaviorClassification: 'GENUINE_MASTERY',
  exploitStreakCount: 0,
};
const legitUnlock = StorageManager.unlockDSAHiddenPath(legitProfile);
assert(legitUnlock.unlocked, 'Legitimate student with Module 1 clearance must unlock hidden path');
assert(legitUnlock.profile.dsaHiddenPathDiscovered === true, 'Profile must have dsaHiddenPathDiscovered set to true');
console.log('  ✓ Verified: Hidden path gating blocks novices and exploiters while admitting genuine mastery.');
console.log('✅ TEST 6 PASSED!\n');

// =========================================================================
// TEST 7: Failure Diagnosis & Exact Main-Path Level Remediation
// =========================================================================
console.log('▶ TEST 7: Failure Diagnosis & Main-Path Remediation Mapping');

const remediationChecks = [
  { trial: DSA_HIDDEN_TRIALS[0], expectedLevels: [1, 2, 3, 4] },
  { trial: DSA_HIDDEN_TRIALS[1], expectedLevels: [5, 6, 7, 8, 9, 10] },
  { trial: DSA_HIDDEN_TRIALS[2], expectedLevels: [11, 12, 13, 14, 15] },
  { trial: DSA_HIDDEN_TRIALS[3], expectedLevels: [16, 17, 18, 19, 20, 24] },
  { trial: DSA_HIDDEN_TRIALS[4], expectedLevels: [21, 22, 23] },
  { trial: DSA_HIDDEN_TRIALS[5], expectedLevels: [25, 26, 27, 28] },
  { trial: DSA_HIDDEN_TRIALS[6], expectedLevels: [29, 30, 31, 32] },
  { trial: DSA_HIDDEN_TRIALS[7], expectedLevels: [33, 34] },
  { trial: DSA_HIDDEN_TRIALS[8], expectedLevels: [35, 36, 37, 38, 39] },
  { trial: DSA_HIDDEN_TRIALS[9], expectedLevels: [45, 46, 47, 48, 49, 50] },
  { trial: DSA_HIDDEN_TRIALS[10], expectedLevels: [51, 52, 53] },
  { trial: DSA_HIDDEN_TRIALS[11], expectedLevels: [10, 24, 34, 43, 50, 54] },
];

for (const check of remediationChecks) {
  const diagnosis = MasteryCompressionEngine.analyzeHiddenPathFailure(check.trial, 0, 'MISTAKE_STEP');
  assert(Boolean(diagnosis.recommendRemediation), `Diagnosis for ${check.trial.id} must recommend remediation`);
  assert(
    JSON.stringify(diagnosis.remediationLevels) === JSON.stringify(check.expectedLevels),
    `Remediation levels for ${check.trial.id} must match expected, got ${JSON.stringify(diagnosis.remediationLevels)}`
  );
}

console.log('  ✓ Verified: All 12 hidden trials map to exact prerequisite main-path levels for remediation.');
console.log('✅ TEST 7 PASSED!\n');

console.log('=============================================================');
console.log('🎉 ALL DSA HIDDEN MASTERY TESTS PASSED (100%)! 🎉');
console.log('=============================================================');
