// End-to-End Automated Engine Verification Test for Algo-Spire

import { MATH_ENCOUNTERS, MATH_ECHO_VAULT } from './curriculum/mathematics.ts';
import { CS_ENCOUNTERS, CS_ECHO_VAULT } from './curriculum/computerScience.ts';
import { CombatEngine } from './engine/CombatEngine.ts';
import { DiagnosticEngine } from './ai/DiagnosticEngine.ts';
import { StorageManager } from './persistence/StorageManager.ts';
import { telemetry } from './engine/Telemetry.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ ${message}`);
}

console.log('\n=============================================');
console.log('⚡ STARTING ALGO-SPIRE ENGINE VERIFICATION ⚡');
console.log('=============================================\n');

// 1. TEST MATHEMATICS: QUADRATIC BEAST ENCOUNTER
console.log('--- TEST 1: Mathematics Quadratic Beast Combat & Telemetry ---');
const mathLvl1 = MATH_ENCOUNTERS[0];
const mathEngine = new CombatEngine(mathLvl1);

let state = mathEngine.getState();
assert(state.player.currentHp === 100, 'Player starts with 100 HP');
assert(state.player.currentEnergy === 3, 'Player starts with 3 Energy');
assert(state.enemy.name === 'Quadratic Beast', 'Enemy is Quadratic Beast');
assert(state.enemy.currentHp === 100, 'Quadratic Beast has 100 HP');
assert(state.currentEquationState === 'x² + 5x + 6 = 0', 'Initial equation is x² + 5x + 6 = 0');

// 2. TEST INTENTIONAL MISCONCEPTION: PLAY 'EXPAND' AT STEP 1
console.log('\n--- TEST 2: Cognitive Misconception Detection (EXPAND at Step 1) ---');
const expandCard = state.player.hand.find(c => c.operationKey === 'EXPAND')!;
assert(!!expandCard, 'EXPAND card exists in player hand');

state = mathEngine.playCard(expandCard.id);
assert(state.activeDiagnosis !== null, 'Diagnosis generated on misconception');
assert(state.activeDiagnosis?.diagnosisType === 'procedural_error', 'Diagnosis classified as procedural_error');
assert(state.activeDiagnosis?.mistakeStep === 1, 'Mistake accurately pinpointed at Step 1');
assert(state.activeDiagnosis?.adaptation.name === 'Factor Trap', 'Enemy deployed Factor Trap');
assert(state.echoVaultAvailable === true, 'Secret Echo Dungeon portal opened');
assert(state.echoVaultId === 'vault_factorization', 'Portal targets The Factor Vault');
assert(state.enemy.shield > 0, 'Enemy gained adaptive defensive shield');

// Verify Telemetry
const metrics = telemetry.getLiveMetrics();
assert(metrics.orderValidity === 'DEVIATED', 'Telemetry recorded deviation in order validity');

// 3. TEST ECHO DUNGEON VAULT DEFINITION
console.log('\n--- TEST 3: Echo Dungeon ("The Factor Vault") ---');
assert(MATH_ECHO_VAULT.id === 'vault_factorization', 'Vault ID matches');
assert(MATH_ECHO_VAULT.steps.length === 2, 'Vault contains 2 targeted repair steps');
assert(MATH_ECHO_VAULT.steps[0].options.find(o => o.isCorrect)?.operationKey === 'FACTOR', 'Step 1 teaches factoring');
assert(MATH_ECHO_VAULT.steps[1].options.find(o => o.isCorrect)?.operationKey === 'SOLVE', 'Step 2 teaches Zero Product Property');

// 4. TEST RETURN & CORRECT SEQUENCE: FACTOR -> SOLVE -> VERIFY
console.log('\n--- TEST 4: Winning Sequence Execution (FACTOR -> SOLVE -> VERIFY) ---');
// Replenish energy for testing next turn
state = mathEngine.endTurn();
assert(state.turnNumber === 2, 'Advanced to Turn 2');
assert(state.player.currentEnergy === 3, 'Energy restored to 3');

// Step 1: FACTOR
const factorCard = state.player.hand.find(c => c.operationKey === 'FACTOR')!;
assert(!!factorCard, 'FACTOR card in hand');
state = mathEngine.playCard(factorCard.id);
assert(state.currentEquationState === '(x + 2)(x + 3) = 0', 'Equation factored to (x + 2)(x + 3) = 0');
assert(state.enemy.currentHp < 100, 'Enemy damaged by factoring');

// Step 2: SOLVE
const solveCard = state.player.hand.find(c => c.operationKey === 'SOLVE')!;
assert(!!solveCard, 'SOLVE card in hand');
state = mathEngine.playCard(solveCard.id);
assert(state.currentEquationState === 'x = -2, x = -3', 'Roots extracted: x = -2, x = -3');

// Step 3: VERIFY
const verifyCard = state.player.hand.find(c => c.operationKey === 'VERIFY') || mathLvl1.validCards.find(c => c.operationKey === 'VERIFY')!;
state.player.hand.push(verifyCard);
state = mathEngine.playCard(verifyCard.id);
assert(state.combatStatus === 'VICTORY', 'Combat transitioned to VICTORY');
assert(state.enemy.currentHp === 0, 'Enemy HP zeroed out on victory');

// 5. TEST ANTI-SOFTLOCK: CARD PLAY BLOCKED AFTER VICTORY
console.log('\n--- TEST 5: Anti-Softlock (Combat Frozen After Terminal State) ---');
const postVictoryState = mathEngine.playCard(factorCard.id);
assert(postVictoryState.combatStatus === 'VICTORY', 'Combat remains locked in VICTORY');

// 6. TEST PROGRESSION & LEVEL UNLOCK
console.log('\n--- TEST 6: Persistence & Progressive Level Unlock ---');
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

// Save level 1 victory
const updatedProfile = StorageManager.recordLevelVictory(
  'mathematics',
  1,
  'The Fractured Equation',
  120,
  25,
  'math_factor_mastery'
);
assert(updatedProfile.xp === 120, 'Profile recorded +120 XP');
assert(updatedProfile.subjectMastery.mathematics === 25, 'Mathematics mastery increased to 25%');
assert(updatedProfile.unlockedCardIds.includes('math_factor_mastery'), 'New card math_factor_mastery unlocked');
assert(StorageManager.isLevelUnlocked('mathematics', 2) === true, 'Level 2 is now unlocked for Mathematics');
assert(StorageManager.isLevelUnlocked('mathematics', 3) === false, 'Level 3 remains locked until Level 2 cleared');
assert(StorageManager.isLevelUnlocked('computerScience', 1) === true, 'Computer Science Level 1 is independent and unlocked');

// 7. TEST COMPUTER SCIENCE ENCOUNTER: ALGORITHMIC HORROR
console.log('\n--- TEST 7: Computer Science World (Algorithmic Horror Combat) ---');
const csLvl1 = CS_ENCOUNTERS[0];
const csEngine = new CombatEngine(csLvl1);
let csState = csEngine.getState();
assert(csState.enemy.name === 'Algorithmic Horror', 'Enemy is Algorithmic Horror');
assert(csState.currentEquationState === 'Array: [5, 2, 8, 1] | Inversions Detected: 3', 'Initial state has 3 inversions');

// Test CS Misconception: SWAP at Step 0
const swapCard = csState.player.hand.find(c => c.operationKey === 'SWAP')!;
csState = csEngine.playCard(swapCard.id);
assert(csState.activeDiagnosis?.diagnosisType === 'prerequisite_gap', 'CS Misconception diagnosed as prerequisite_gap');
assert(csState.activeDiagnosis?.adaptation.name === 'Index Out of Bounds Shield', 'Enemy deployed Index Out of Bounds Shield');
assert(csState.echoVaultId === 'vault_cs_invariants', 'Opened CS Recursion Vault');

// Test CS Correct Sequence: INITIALIZE -> COMPARE -> SWAP -> TERMINATE
const csReset = csEngine.resetEncounter();
const initCard = csReset.player.hand.find(c => c.operationKey === 'INITIALIZE')!;
csEngine.playCard(initCard.id);

const compCard = csEngine.getState().player.hand.find(c => c.operationKey === 'COMPARE')!;
csEngine.playCard(compCard.id);

csEngine.getState().player.currentEnergy = 3;
const correctSwap = csEngine.getState().player.hand.find(c => c.operationKey === 'SWAP') || csLvl1.validCards.find(c => c.operationKey === 'SWAP')!;
csEngine.getState().player.hand.push(correctSwap);
csEngine.playCard(correctSwap.id);

const termCard = csLvl1.validCards.find(c => c.operationKey === 'TERMINATE')!;
csEngine.getState().player.hand.push(termCard);
csState = csEngine.playCard(termCard.id);

assert(csState.combatStatus === 'VICTORY', 'CS Encounter successfully cleared with VICTORY');

console.log('\n=================================================');
console.log('🎉 ALL ENGINE VERIFICATION TESTS PASSED (100%) 🎉');
console.log('=================================================\n');
