// Comprehensive Automated Verification Suite for the Mastery Compression Hidden Path System

import { MasteryCompressionEngine } from './engine/MasteryCompressionEngine.ts';
import { StorageManager } from './persistence/StorageManager.ts';
import { ENCOUNTERS_MAP, ALL_SUBJECTS, ECHO_VAULTS_MAP } from './curriculum/registry.ts';
import { PlayerProfile } from './types/telemetry.ts';

// Mock localStorage in Node environment
const mockStorage: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (k: string) => mockStorage[k] || null,
  setItem: (k: string, v: string) => { mockStorage[k] = v; },
  removeItem: (k: string) => { delete mockStorage[k]; },
  clear: () => { for (const k in mockStorage) delete mockStorage[k]; },
  length: 0,
  key: () => null,
} as unknown as Storage;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ ${message}`);
}

function createBaseProfile(): PlayerProfile {
  return {
    name: 'Mastery Scholar',
    title: 'Novice of the Fractured Spire',
    level: 1,
    xp: 0,
    xpToNextLevel: 250,
    subjectMastery: {
      mathematics: 0,
      computerScience: 0,
      physics: 0,
      chemistry: 0,
      biology: 0,
      history: 0,
      geography: 0,
      language: 0,
    },
    clearedLevels: {
      mathematics: [1], // Started with Stage 1 cleared
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
    unlockedCardIds: ['math_factor', 'math_solve', 'math_verify'],
    relics: ['Focus Rune'],
    strengths: [],
    weaknesses: [],
    runHistory: [],
    activeEducationLevel: 'class_9_10',
    conceptPerformance: {},
    dangerCooldownBattles: 0,
  };
}

console.log('\n======================================================');
console.log('⚡ STARTING MASTERY COMPRESSION HIDDEN PATH TESTS ⚡');
console.log('======================================================\n');

// -------------------------------------------------------------
// TEST 1: Fewer Progression Stages on Hidden Path (Mastery Compression)
// -------------------------------------------------------------
console.log('--- TEST 1: Fewer Progression Stages than Normal Route (2 Trials vs 4 Stages) ---');

const mathLevels = ALL_SUBJECTS.mathematics.levels;
const mathMainBeforeBoss = mathLevels.filter(l => l.pathType !== 'hidden_trial' && !l.isBoss);
const mathHiddenTrials = mathLevels.filter(l => l.pathType === 'hidden_trial');

console.log(`Mathematics Main Stages before Boss: ${mathMainBeforeBoss.length} | Hidden Trials: ${mathHiddenTrials.length}`);
assert(mathHiddenTrials.length === 2, 'Hidden Path contains exactly 2 compression trials for Mathematics');
assert(mathMainBeforeBoss.length === 4, 'Main Path contains 4 progressive stages before Boss for Mathematics');
assert(mathHiddenTrials.length < mathMainBeforeBoss.length, 'Hidden Path contains strictly fewer stages than Main Path (2 < 4)');

const csLevels = ALL_SUBJECTS.computerScience.levels;
const csMainBeforeBoss = csLevels.filter(l => l.pathType !== 'hidden_trial' && !l.isBoss);
const csHiddenTrials = csLevels.filter(l => l.pathType === 'hidden_trial');

console.log(`Computer Science Main Stages before Boss: ${csMainBeforeBoss.length} | Hidden Trials: ${csHiddenTrials.length}`);
assert(csHiddenTrials.length === 2, 'Hidden Path contains exactly 2 compression trials for Computer Science');
assert(csMainBeforeBoss.length === 4, 'Main Path contains 4 progressive stages before Boss for Computer Science');
assert(csHiddenTrials.length < csMainBeforeBoss.length, 'Hidden Path contains strictly fewer stages than Main Path for CS (2 < 4)');

// -------------------------------------------------------------
// TEST 2: Multi-Concept Mapping (Every trial combines >= 2 concepts)
// -------------------------------------------------------------
console.log('\n--- TEST 2: Multi-Concept Mapping (Dense Concept Coverage >= 2) ---');

const allHiddenEncounters = [
  ...ENCOUNTERS_MAP.mathematics.filter(e => e.pathType === 'hidden_trial'),
  ...ENCOUNTERS_MAP.computerScience.filter(e => e.pathType === 'hidden_trial'),
];

for (const trial of allHiddenEncounters) {
  assert(
    !!trial.compressedConcepts && trial.compressedConcepts.length >= 2,
    `Trial ${trial.id} maps to multiple concepts: [${trial.compressedConcepts?.join(', ')}] (count: ${trial.compressedConcepts?.length})`
  );

  // Verify all concepts exist in required curriculum list
  const required = MasteryCompressionEngine.getRequiredSubjectConcepts(trial.subject);
  for (const c of trial.compressedConcepts || []) {
    assert(required.includes(c), `Concept ${c} in ${trial.id} is a valid curriculum concept`);
  }
}

// -------------------------------------------------------------
// TEST 3: Boss Access via Mastery Compression
// -------------------------------------------------------------
console.log('\n--- TEST 3: Boss Access via Mastery Compression vs Main Path ---');

const profile = createBaseProfile();
StorageManager.saveProfile(profile);
// Initially, with only Main Stage 1 cleared:
const initialAccess = MasteryCompressionEngine.canAccessFinalBoss('mathematics', profile);
assert(initialAccess.allowed === false, 'Boss is LOCKED with only Stage 1 cleared');

// Unlock & Complete Trial 1 (Concepts A + B)
assert(StorageManager.isLevelUnlocked('mathematics', 'math_hidden_trial_1', profile) === true, 'Trial 1 is UNLOCKED after Stage 1');
const mathTrial1 = ENCOUNTERS_MAP.mathematics.find(e => e.id === 'math_hidden_trial_1')!;
const afterTrial1Profile = MasteryCompressionEngine.recordHiddenTrialCompletion('mathematics', mathTrial1, profile);
StorageManager.saveProfile(afterTrial1Profile);

// With ONLY Trial 1 completed, Boss must STILL be locked!
const accessAfterTrial1 = MasteryCompressionEngine.canAccessFinalBoss('mathematics', afterTrial1Profile);
assert(accessAfterTrial1.allowed === false, 'Boss is STILL LOCKED after Trial 1 alone (Anti-Exploit: Trial 1 alone never unlocks boss)');

// Trial 2 is now unlocked
assert(
  afterTrial1Profile.clearedHiddenTrials?.mathematics?.includes('math_hidden_trial_1') === true,
  'Trial 1 is recorded in clearedHiddenTrials'
);

// Complete Trial 2 (Concepts C + D)
const mathTrial2 = ENCOUNTERS_MAP.mathematics.find(e => e.id === 'math_hidden_trial_2')!;
const afterTrial2Profile = MasteryCompressionEngine.recordHiddenTrialCompletion('mathematics', mathTrial2, afterTrial1Profile);

// With both Trial 1 & Trial 2 completed, Boss MUST be UNLOCKED via Compression Route!
const accessAfterTrial2 = MasteryCompressionEngine.canAccessFinalBoss('mathematics', afterTrial2Profile);
console.log(`Boss access after Trial 2: allowed=${accessAfterTrial2.allowed}, route=${accessAfterTrial2.route}`);
assert(accessAfterTrial2.allowed === true, 'Boss is UNLOCKED via compression route after both trials');
assert(accessAfterTrial2.route === 'compressed', 'Route is correctly classified as "compressed"');
assert(
  !afterTrial2Profile.clearedLevels.mathematics.includes(2) &&
  !afterTrial2Profile.clearedLevels.mathematics.includes(3) &&
  !afterTrial2Profile.clearedLevels.mathematics.includes(4),
  'Main Stages 2, 3, and 4 remain uncleared, proving accelerated progression was earned through compression'
);

// -------------------------------------------------------------
// TEST 4: Anti-Exploit / Full Concept Coverage Verification
// -------------------------------------------------------------
console.log('\n--- TEST 4: Anti-Exploit (No Skipping Without Demonstrated Concept Proof) ---');

const exploitProfile = createBaseProfile();
// Attempt to artificially set level 99 without clearing trials or stage 4
exploitProfile.level = 99;
const exploitCheck = MasteryCompressionEngine.canAccessFinalBoss('mathematics', exploitProfile);
assert(exploitCheck.allowed === false, 'Arbitrary high player level does NOT unlock the Archon Boss');

const partialCoverage = MasteryCompressionEngine.verifyMasteryCoverage('mathematics', exploitProfile);
assert(partialCoverage.isComplete === false, 'Concept coverage is incomplete without actual demonstrations');
assert(partialCoverage.missingConcepts.length === 3, `3 concepts missing: [${partialCoverage.missingConcepts.join(', ')}]`);

const completeCoverage = MasteryCompressionEngine.verifyMasteryCoverage('mathematics', afterTrial2Profile);
assert(completeCoverage.isComplete === true, 'All 4 required concepts demonstrated via Trial 1 + Trial 2');
assert(completeCoverage.missingConcepts.length === 0, 'Zero missing concepts');

// -------------------------------------------------------------
// TEST 5: Diagnostic Failure Routing to Main Path
// -------------------------------------------------------------
console.log('\n--- TEST 5: Failure Routing Identifies Concept and Recommends Main Stage ---');

// Case 1: Failure during SUBSTITUTE in Math Trial 1
const failSub = MasteryCompressionEngine.analyzeHiddenPathFailure(mathTrial1, 0, 'FACTOR');
console.log(`Math Trial 1 Step 0 failure: Concept=${failSub.failedConcept} -> Recommended Stage=${failSub.recommendedMainPathLevel}`);
assert(failSub.failedConcept === 'math_linear_systems', 'Diagnosed failed concept as linear systems');
assert(failSub.recommendedMainPathLevel === 2, 'Recommended Main Path Stage 2 (The Simultaneous Ward)');

// Case 2: Failure during FACTOR in Math Trial 1
const failFactor = MasteryCompressionEngine.analyzeHiddenPathFailure(mathTrial1, 1, 'EXPAND');
console.log(`Math Trial 1 Step 1 failure: Concept=${failFactor.failedConcept} -> Recommended Stage=${failFactor.recommendedMainPathLevel}`);
assert(failFactor.failedConcept === 'math_factorization', 'Diagnosed failed concept as factorization');
assert(failFactor.recommendedMainPathLevel === 1, 'Recommended Main Path Stage 1 (The Fractured Equation)');

// Case 3: Verify existing Main Path progress is completely intact
const testRoutingProfile = createBaseProfile();
testRoutingProfile.clearedLevels.mathematics = [1, 2];
testRoutingProfile.xp = 400;
StorageManager.saveProfile(testRoutingProfile);
// Simulating defeat does not wipe cleared levels:
const afterDefeatProfile = StorageManager.recordDefeatOrRevision(
  'mathematics',
  101,
  'Trial 1: The Dual Crucible',
  failSub.failedConcept,
  false
);
assert(afterDefeatProfile.clearedLevels.mathematics.includes(1), 'Main Stage 1 still cleared after hidden trial defeat');
assert(afterDefeatProfile.clearedLevels.mathematics.includes(2), 'Main Stage 2 still cleared after hidden trial defeat');
assert(afterDefeatProfile.xp === 400, 'Player XP preserved after defeat');

// -------------------------------------------------------------
// TEST 6: Progress Preservation on Victory
// -------------------------------------------------------------
console.log('\n--- TEST 6: Progress Preservation on Hidden Trial Victory ---');

const preserveProfile = createBaseProfile();
preserveProfile.clearedLevels.mathematics = [1, 2];
preserveProfile.xp = 500;

const victoryProfile = MasteryCompressionEngine.recordHiddenTrialCompletion('mathematics', mathTrial2, preserveProfile);

assert(victoryProfile.clearedLevels.mathematics.includes(1), 'Stage 1 remains cleared');
assert(victoryProfile.clearedLevels.mathematics.includes(2), 'Stage 2 remains cleared');
assert(victoryProfile.level > preserveProfile.level, `Hunter level increased due to XP reward (${preserveProfile.level} -> ${victoryProfile.level})`);
assert(victoryProfile.title === 'Axiom Compressor', 'Awarded prestige title "Axiom Compressor"');
assert(victoryProfile.relics.includes('Singularity Prism'), 'Awarded rare relic "Singularity Prism"');

// -------------------------------------------------------------
// TEST 7: Storage Persistence Roundtrip
// -------------------------------------------------------------
console.log('\n--- TEST 7: Storage Persistence Roundtrip for Hidden Trials ---');

// Mock localStorage
const testStorage: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (k: string) => testStorage[k] || null,
  setItem: (k: string, v: string) => { testStorage[k] = v; },
  removeItem: (k: string) => { delete testStorage[k]; },
  clear: () => { for (const k in testStorage) delete testStorage[k]; },
  length: 0,
  key: () => null,
} as unknown as Storage;

// Save profile with cleared trials
StorageManager.saveProfile(afterTrial2Profile);

// Load and verify
const reloaded = StorageManager.loadProfile();
assert(
  reloaded.clearedHiddenTrials?.mathematics?.includes('math_hidden_trial_1') === true,
  'Reloaded profile contains math_hidden_trial_1'
);
assert(
  reloaded.clearedHiddenTrials?.mathematics?.includes('math_hidden_trial_2') === true,
  'Reloaded profile contains math_hidden_trial_2'
);
assert(
  reloaded.masteryCompressionRecords?.['math_hidden_trial_2'] !== undefined,
  'Mastery compression records persisted'
);
assert(
  MasteryCompressionEngine.canAccessFinalBoss('mathematics', reloaded).allowed === true,
  'Boss remains unlocked after reload'
);

// -------------------------------------------------------------
// TEST 8: Echo Dungeon Independence & Separation
// -------------------------------------------------------------
console.log('\n--- TEST 8: Echo Dungeon Remains Independent Remediation System ---');

assert(!!ECHO_VAULTS_MAP.vault_factorization, 'Echo Vault exists independently');
assert(!!ECHO_VAULTS_MAP.vault_cs_invariants, 'CS Echo Vault exists independently');
assert(
  ECHO_VAULTS_MAP.vault_factorization.steps.length === 2,
  'Echo Vault contains targeted MCQ remediation steps'
);
// Verify repairing an Echo Vault does NOT mark Hidden Trials as cleared
const echoProfile = createBaseProfile();
StorageManager.saveProfile(echoProfile);
const repairedProfile = StorageManager.repairWeakness('Factoring', 'mathematics', 20);
assert(
  repairedProfile.clearedHiddenTrials?.mathematics?.length === 0,
  'Echo Vault repair does NOT bypass or auto-clear Hidden Trials'
);

console.log('\n=============================================================');
console.log('🎉 ALL MASTERY COMPRESSION TESTS PASSED (100%) 🎉');
console.log('=============================================================\n');
