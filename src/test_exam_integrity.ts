import { MATH_ENCOUNTERS, MATH_STARTER_CARDS, MATH_ECHO_VAULT } from './curriculum/mathematics';
import { CS_ENCOUNTERS, CS_STARTER_CARDS, CS_ECHO_VAULT } from './curriculum/computerScience';
import { CombatEngine } from './engine/CombatEngine';
import { DiagnosticEngine } from './ai/DiagnosticEngine';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ ${message}`);
}

console.log('\n=============================================================');
console.log('⚡ STARTING EXAM INTEGRITY & ANTI-PREMATURE REVEAL TESTS ⚡');
console.log('=============================================================\n');

// -------------------------------------------------------------
// TEST 1: Starter Cards Do Not Contain Concrete Problem Solutions
// -------------------------------------------------------------
console.log('--- TEST 1: Starter Card Effect Texts Are Generic Not Solution-Leaking ---');

const forbiddenSolutionTokens = ['(x + 2)(x + 3)', 'x = -2', 'x = -3', 'Fib(6) = 8', 'Key 11 found'];

for (const card of [...MATH_STARTER_CARDS, ...CS_STARTER_CARDS]) {
  for (const token of forbiddenSolutionTokens) {
    assert(
      !card.effectText.includes(token),
      `Card "${card.name}" effectText does NOT contain concrete solution token "${token}"`
    );
    assert(
      !card.description.includes(token),
      `Card "${card.name}" description does NOT contain concrete solution token "${token}"`
    );
  }
}

// -------------------------------------------------------------
// TEST 2: Every Encounter Has Educational Objective Without Solution Leaks
// -------------------------------------------------------------
console.log('\n--- TEST 2: Encounters Have Clean Objectives Without Premature Answers ---');

const allEncounters = [...MATH_ENCOUNTERS, ...CS_ENCOUNTERS];

for (const enc of allEncounters) {
  assert(!!enc.objective, `Encounter "${enc.id}" defines player-facing objective`);
  assert(enc.objective!.length > 10, `Encounter "${enc.id}" objective is descriptive: "${enc.objective}"`);
  
  // Objective must NOT be equal to or contain targetState
  assert(
    !enc.objective!.includes(enc.targetState),
    `Encounter "${enc.id}" objective does NOT contain targetState`
  );
  // Objective must NOT begin with "Target:" or "Answer:"
  assert(
    !enc.objective!.toLowerCase().startsWith('target:') && !enc.objective!.toLowerCase().startsWith('answer:'),
    `Encounter "${enc.id}" objective starts with educational statement, not "Target:" or "Answer:"`
  );
}

// -------------------------------------------------------------
// TEST 3: Fresh Battle Initial State Has Zero Revealed Answers
// -------------------------------------------------------------
console.log('\n--- TEST 3: Combat Engine Initial State Does Not Expose Target State in Equation ---');

const mathLvl1 = MATH_ENCOUNTERS[0];
const engine = new CombatEngine(mathLvl1);
const initialState = engine.getState();

// At start, current equation must be the unsolved problem, not the target state
assert(
  initialState.currentEquationState === mathLvl1.initialEquationOrState,
  `Initial equation is unsolved state: "${initialState.currentEquationState}"`
);
assert(
  initialState.currentEquationState !== mathLvl1.targetState,
  'Initial equation state is strictly NOT the target state'
);
assert(
  initialState.combatStatus === 'PLAYER_TURN',
  'Combat begins in PLAYER_TURN awaiting genuine reasoning'
);
assert(
  initialState.currentStepIndex === 0,
  'Current step begins unattempted at 0'
);

// -------------------------------------------------------------
// TEST 4: Diagnostic Engine Feedback Teaches Principles, Not Raw Next-Card Names
// -------------------------------------------------------------
console.log('\n--- TEST 4: Diagnostic Engine Provides Conceptual Guidance Without Giving Away Next Card ---');

// Simulate mistake: playing EXPAND at step 0
const diag = DiagnosticEngine.diagnoseAction(
  mathLvl1,
  0,
  'EXPAND',
  {
    stepIndex: 0,
    operationKey: 'EXPAND',
    cardName: 'Expand',
    timestamp: 1000,
    timeSinceLastActionMs: 2500,
    isExpected: false,
  }
);

assert(
  !diag.expectedPattern.includes('Expected FACTOR'),
  'Diagnosis expectedPattern does NOT bluntly spoon-feed "Expected FACTOR"'
);
assert(
  diag.expectedPattern.length > 0,
  `Diagnosis expectedPattern provides conceptual guidance: "${diag.expectedPattern}"`
);
assert(
  !diag.explanation.includes('FACTOR is needed'),
  'Diagnosis explanation does NOT reveal next operation key'
);

// -------------------------------------------------------------
// TEST 5: Echo Dungeon MCQ Integrity (Varied Positions & Neutral Options)
// -------------------------------------------------------------
console.log('\n--- TEST 5: Echo Dungeon MCQs Have Varied Correct Positions & Neutral Options ---');

// Math Echo Vault
assert(
  MATH_ECHO_VAULT.steps.length >= 2,
  'Math Echo Vault has multiple steps'
);
// In math step 1, correct option is at index 1 (not index 0)
const mathStep1CorrectIdx = MATH_ECHO_VAULT.steps[0].options.findIndex(o => o.isCorrect);
assert(
  mathStep1CorrectIdx !== 0,
  `Math Vault Step 1 correct option is NOT predictably index 0 (actual: index ${mathStep1CorrectIdx})`
);

// In CS step 1, correct option is at index 1 (not index 0)
const csStep1CorrectIdx = CS_ECHO_VAULT.steps[0].options.findIndex(o => o.isCorrect);
assert(
  csStep1CorrectIdx !== 0,
  `CS Vault Step 1 correct option is NOT predictably index 0 (actual: index ${csStep1CorrectIdx})`
);

// Ensure breakdownExplanation does not give away the exact option answers (+2, +3)
assert(
  !MATH_ECHO_VAULT.breakdownExplanation.includes('Those numbers are +2 and +3'),
  'Math Echo Vault explanation does not leak specific answer numbers'
);

console.log('\n=============================================================');
console.log('🎉 ALL EXAM INTEGRITY TESTS PASSED (100%) 🎉');
console.log('=============================================================\n');
