import { QuestionSelectionEngine } from './engine/QuestionSelectionEngine';
import { QUESTION_POOLS } from './curriculum/questionPools';
import { ENCOUNTERS_MAP } from './curriculum/registry';
import { CombatEngine } from './engine/CombatEngine';

declare const process: any;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
}

console.log('🧪 RUNNING QUESTION PROGRESSION REGRESSION TEST SUITE (Tests A - G)...\n');

const engineManager = new QuestionSelectionEngine();

// ==========================================
// TEST A: Start a battle -> Question A appears
// ==========================================
console.log('▶ Test A: Start a battle -> question A appears');
const baseMathLvl2 = ENCOUNTERS_MAP.mathematics.find(e => e.levelNumber === 2)!;
assert(!!baseMathLvl2, 'Base Math Level 2 must exist');

const encounterA = engineManager.getEncounterWithSelectedQuestion(baseMathLvl2);
assert(!!encounterA.initialEquationOrState, 'Encounter must have an initial equation or state');
assert(encounterA.initialEquationOrState.length > 0, 'Initial equation cannot be empty');

const combatA = new CombatEngine(encounterA);
const stateA = combatA.getState();
assert(stateA.currentEquationState === encounterA.initialEquationOrState, 'Combat state must present question A');
assert(stateA.turnNumber === 1, 'Combat should start on turn 1');
console.log(`  ✓ Battle started with Question: "${stateA.currentEquationState}"`);
console.log('✅ Test A Passed!\n');

// ==========================================
// TEST B: Answer/progress to next challenge -> Question B appears
// ==========================================
console.log('▶ Test B: Answer/progress to next challenge -> question B appears');
const encounterB = engineManager.getEncounterWithSelectedQuestion(baseMathLvl2);
assert(!!encounterB.initialEquationOrState, 'Next encounter must have an initial equation');

const combatB = new CombatEngine(encounterB);
const stateB = combatB.getState();
assert(!!stateB.currentEquationState, 'New combat engine must present question B');
console.log(`  ✓ Next challenge selected: "${stateB.currentEquationState}"`);
console.log('✅ Test B Passed!\n');

// ==========================================
// TEST C: Question B is different from Question A when multiple valid questions exist
// ==========================================
console.log('▶ Test C: Question B is different from Question A (Anti-Repetition)');
const poolLvl2 = QUESTION_POOLS['mathematics_2'];
assert(poolLvl2 && poolLvl2.length > 1, 'Math Level 2 pool must have multiple questions');

assert(
  encounterA.initialEquationOrState !== encounterB.initialEquationOrState,
  `Question B ("${encounterB.initialEquationOrState}") must differ from Question A ("${encounterA.initialEquationOrState}")`
);
assert(
  encounterA.objective !== encounterB.objective || encounterA.problemStatement !== encounterB.problemStatement,
  'Encounter objectives or problem statements must reflect the new variant'
);
console.log(`  ✓ Question A was: "${encounterA.initialEquationOrState}"`);
console.log(`  ✓ Question B is:  "${encounterB.initialEquationOrState}"`);
console.log('✅ Test C Passed!\n');

// ==========================================
// TEST D: Re-render / query without gameplay progression -> Question remains A
// ==========================================
console.log('▶ Test D: Re-render / query without gameplay progression -> question remains A');
const engineForD = new CombatEngine(encounterA);
const read1 = engineForD.getState().currentEquationState;
const read2 = engineForD.getState().currentEquationState;
const read3 = engineForD.getState().currentEquationState;

assert(read1 === read2 && read2 === read3, 'Question must not change across multiple reads/re-renders');
assert(read1 === encounterA.initialEquationOrState, 'Equation state must remain stable without progression');
console.log(`  ✓ Re-render stability confirmed: "${read1}" stayed fixed across 3 render cycles`);
console.log('✅ Test D Passed!\n');

// ==========================================
// TEST E: Repeated progression cycles through available questions rather than permanently returning the first question
// ==========================================
console.log('▶ Test E: Repeated progression cycles through available questions & recycles gracefully');
const freshManager = new QuestionSelectionEngine();
const seenVariants: string[] = [];

for (let i = 0; i < poolLvl2.length; i++) {
  const enc = freshManager.getEncounterWithSelectedQuestion(baseMathLvl2);
  assert(!seenVariants.includes(enc.initialEquationOrState), `Question ${i + 1} must be unique in first cycle`);
  seenVariants.push(enc.initialEquationOrState);
}

assert(seenVariants.length === poolLvl2.length, `All ${poolLvl2.length} pool variants must be visited`);
console.log(`  ✓ Cycled through ${seenVariants.length} distinct questions:`);
seenVariants.forEach((v, idx) => console.log(`     ${idx + 1}. ${v}`));

// Test recycling on exhaustion
const recycledEnc = freshManager.getEncounterWithSelectedQuestion(baseMathLvl2);
assert(!!recycledEnc.initialEquationOrState, 'Recycled question must be valid');
assert(
  recycledEnc.initialEquationOrState !== seenVariants[seenVariants.length - 1],
  'Recycled question must NOT immediately repeat the previous question'
);
console.log(`  ✓ Graceful recycle after pool exhaustion: selected "${recycledEnc.initialEquationOrState}" without repeating immediate predecessor`);
console.log('✅ Test E Passed!\n');

// ==========================================
// TEST F: Question selection still respects subject / concept / difficulty
// ==========================================
console.log('▶ Test F: Question selection respects subject, concept, and difficulty');
const csLvl1 = ENCOUNTERS_MAP.computerScience.find(e => e.levelNumber === 1)!;
assert(!!csLvl1, 'CS Level 1 must exist');

const csEnc = freshManager.getEncounterWithSelectedQuestion(csLvl1);
assert(csEnc.subject === 'computerScience', 'Encounter subject must be computerScience');
assert(csEnc.initialEquationOrState.includes('[') || csEnc.initialEquationOrState.includes('arr'), 'CS Level 1 must deal with array/search concepts');

const mathLvl1 = ENCOUNTERS_MAP.mathematics.find(e => e.levelNumber === 1)!;
const mathEnc1 = freshManager.getEncounterWithSelectedQuestion(mathLvl1);
assert(mathEnc1.subject === 'mathematics', 'Encounter subject must be mathematics');
assert(mathEnc1.initialEquationOrState.includes('x') || mathEnc1.initialEquationOrState.includes('²'), 'Math Level 1 must deal with quadratic/algebra concepts');

// Check that math level 2 questions are systems of equations
assert(encounterA.initialEquationOrState.includes('{') || encounterA.initialEquationOrState.includes('y'), 'Math Level 2 must deal with systems of linear equations');
console.log('  ✓ Curricular alignment confirmed across Math L1, Math L2, and CS L1');
console.log('✅ Test F Passed!\n');

// ==========================================
// TEST G: Answer secrecy remains intact (no premature answers leaked)
// ==========================================
console.log('▶ Test G: Answer secrecy remains intact (Zero premature reveals)');
const forbiddenPhrases = [
  'target:',
  'answer:',
  'expected:',
  'correct answer',
  'solution:',
  'x = 3, y = 1',
  'x = 2, y = 3',
  'x = 1, y = 4',
  'x = 4, y = 2',
  'x = -2, x = -3',
  'x = -3, x = -4',
  'x = -1, x = -6',
  'x = -2, x = -5'
];

const testEncounters = [
  encounterA,
  encounterB,
  csEnc,
  mathEnc1
];

for (const enc of testEncounters) {
  const statement = (enc.problemStatement || '').toLowerCase();
  const objective = (enc.objective || '').toLowerCase();
  const equation = (enc.initialEquationOrState || '').toLowerCase();

  for (const forbidden of forbiddenPhrases) {
    assert(!statement.includes(forbidden), `Problem statement "${enc.problemStatement}" must not contain forbidden phrase "${forbidden}"`);
    assert(!objective.includes(forbidden), `Objective "${enc.objective}" must not contain forbidden phrase "${forbidden}"`);
    assert(!equation.includes(forbidden), `Equation "${enc.initialEquationOrState}" must not contain forbidden phrase "${forbidden}"`);
  }
}
console.log('  ✓ Exam-style integrity verified: Zero forbidden target/answer phrases present in UI text');
console.log('✅ Test G Passed!\n');

// ==========================================
// BONUS: Opening Hand Starter Card Guarantees
// ==========================================
console.log('▶ BONUS: Opening Hand Starter Card Guarantee');
// Math Level 2 step 0 requires SIMPLIFY. Confirm SIMPLIFY is in the opening hand of 5!
const encMath2Fresh = freshManager.getEncounterWithSelectedQuestion(baseMathLvl2);
const combatEngineMath2 = new CombatEngine(encMath2Fresh);
const openingHandOps = combatEngineMath2.getState().player.hand.map(c => c.operationKey);
const neededOp = encMath2Fresh.optimalSequence[0];
assert(
  openingHandOps.includes(neededOp),
  `First required operation (${neededOp}) MUST be in opening hand! Hand operations: ${openingHandOps.join(', ')}`
);
console.log(`  ✓ Opening hand [${openingHandOps.join(', ')}] contains required op "${neededOp}"`);
console.log('✅ Opening hand guarantee verified!\n');

console.log('🎉 ALL REGRESSION TESTS A THROUGH G PASSED WITH 100% SUCCESS!');
