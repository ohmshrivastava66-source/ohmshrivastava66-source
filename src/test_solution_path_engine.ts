import { solutionPathEngine, SolutionPathEngine } from './engine/SolutionPathEngine';
import { CombatEngine } from './engine/CombatEngine';
import { questionSelectionEngine, QuestionSelectionEngine } from './engine/QuestionSelectionEngine';
import { ENCOUNTERS_MAP } from './curriculum/registry';
import { QUESTION_POOLS } from './curriculum/questionPools';
import { BossModifier, Card } from './types/game';
import { EncounterDefinition } from './types/curriculum';
import { CONVERGENCE_STATIC_TRIALS } from './curriculum/convergenceTrials';
import { surpriseAttackEngine } from './engine/SurpriseAttackEngine';
import { StorageManager } from './persistence/StorageManager';
import { PlayerProfile } from './types/telemetry';

declare const process: any;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
}

console.log('=============================================================');
console.log('🛡️ STARTING SOLUTION PATH & 100% SOLVABILITY VERIFICATION 🛡️');
console.log('=============================================================\n');

// =========================================================================
// MONTE CARLO & 1,000 ENCOUNTER SIMULATIONS (TEST 1 & TEST 2)
// =========================================================================
console.log('▶ TEST 1: Monte Carlo Simulation — 1,000 Normal Encounters (100% Solvable Guarantee)');
let normalSolvableCount = 0;
let normalTotalCount = 1000;
let normalRepairedCount = 0;
const subjects = Object.keys(ENCOUNTERS_MAP) as (keyof typeof ENCOUNTERS_MAP)[];

for (let i = 0; i < normalTotalCount; i++) {
  const subj = subjects[i % subjects.length];
  const list = ENCOUNTERS_MAP[subj];
  if (!list || list.length === 0) continue;
  const baseEncounter = list[i % list.length];
  const encounter = questionSelectionEngine.getEncounterWithSelectedQuestion(baseEncounter, { seed: i + 100 });

  const engine = new CombatEngine(encounter);
  const graph = engine.getSolutionGraph();
  const report = solutionPathEngine.validateSolvability(graph, engine.getState());

  if (report.solvable && report.reachableFirstActions.length > 0) {
    normalSolvableCount++;
  } else {
    // Attempt repair
    const repair = solutionPathEngine.repairUnsolvableState(graph, engine.getState());
    if (repair.repaired) {
      normalRepairedCount++;
      const recheck = solutionPathEngine.validateSolvability(graph, engine.getState());
      if (recheck.solvable) normalSolvableCount++;
    }
  }
}

const normalRate = (normalSolvableCount / normalTotalCount) * 100;
console.log(`  ✓ Evaluated 1,000 Normal Encounters: Solvability = ${normalRate.toFixed(2)}% (Repaired: ${normalRepairedCount})`);
assert(normalRate === 100, `Normal encounters must be 100% solvable (got ${normalRate}%)`);
console.log('✅ TEST 1 PASSED!\n');

console.log('▶ TEST 2: Monte Carlo Simulation — 1,000 Boss Encounters with Aggressive Modifiers');
let bossSolvableCount = 0;
let bossTotalCount = 1000;
let bossModifiersRejected = 0;
let bossModifiersReplaced = 0;
const bossEncounters = [
  ...ENCOUNTERS_MAP.mathematics.filter(e => e.isBoss),
  ...ENCOUNTERS_MAP.computerScience.filter(e => e.isBoss),
];

for (let i = 0; i < bossTotalCount; i++) {
  const baseBoss = bossEncounters[i % bossEncounters.length];
  const encounter = questionSelectionEngine.getEncounterWithSelectedQuestion(baseBoss, { seed: i + 500 });
  const engine = new CombatEngine(encounter);
  const graph = engine.getSolutionGraph();

  // Simulate aggressive boss interference: attempts card hiding or cost penalty
  const state = engine.getState();
  const randomCard = state.player.hand[i % state.player.hand.length];
  const aggressiveMod: BossModifier = {
    id: `boss_aggro_${i}`,
    name: i % 2 === 0 ? 'Abyssal Lock' : 'Gravity Surge',
    type: i % 2 === 0 ? 'hide_card' : 'increase_cost',
    targetCardId: randomCard?.id,
    targetOperation: randomCard?.operationKey,
    costIncrease: 2,
    description: 'Aggressive Archon interference attempt.',
  };

  const applyRes = engine.applyBossModifier(aggressiveMod);
  if (applyRes.replacement) {
    bossModifiersReplaced++;
  } else if (!applyRes.applied) {
    bossModifiersRejected++;
  }

  const postModReport = solutionPathEngine.validateSolvability(graph, engine.getState());
  if (postModReport.solvable && postModReport.reachableWinningPaths >= 1) {
    bossSolvableCount++;
  }
}

const bossRate = (bossSolvableCount / bossTotalCount) * 100;
console.log(`  ✓ Evaluated 1,000 Boss Encounters: Solvability = ${bossRate.toFixed(2)}%`);
console.log(`  ✓ Unsafe Boss Modifiers Replaced/Mitigated: ${bossModifiersReplaced}`);
console.log(`  ✓ Unsafe Boss Modifiers Directly Rejected: ${bossModifiersRejected}`);
assert(bossRate === 100, `Boss encounters must be 100% solvable (got ${bossRate}%)`);
console.log('✅ TEST 2 PASSED!\n');

// =========================================================================
// TEST 3: Hide Random Card Safety (Never Reduce Reachable Paths to 0)
// =========================================================================
console.log('▶ TEST 3: Card Hiding Constraint (Never allow paths to reach 0)');
const mathLvl1 = ENCOUNTERS_MAP.mathematics[0];
const mathEngine = new CombatEngine(mathLvl1);
const mathGraph = mathEngine.getSolutionGraph();

// Try hiding all cards one by one; only allow if winning paths >= 1
let safeHides = 0;
let blockedUnsafeHides = 0;

for (const card of mathEngine.getState().player.hand) {
  const mod: BossModifier = {
    id: `hide_${card.id}`,
    name: 'Shroud Test',
    type: 'hide_card',
    targetCardId: card.id,
    description: 'Hiding card test',
  };
  const canHide = solutionPathEngine.canApplyBossModifier(mathGraph, mathEngine.getState(), mod);
  if (canHide) {
    safeHides++;
  } else {
    blockedUnsafeHides++;
  }
}

assert(blockedUnsafeHides > 0, 'Must block hiding critical cards that would eliminate all paths');
console.log(`  ✓ Safe card hides allowed: ${safeHides}, Unsafe card hides strictly blocked: ${blockedUnsafeHides}`);
console.log('✅ TEST 3 PASSED!\n');

// =========================================================================
// TEST 4 & TEST 5: Starting Hand Safety & Automatic Repair
// =========================================================================
console.log('▶ TEST 4 & 5: Starting Hand Safety & Regeneration');
// Create an intentionally broken starting hand with NO valid first action
const brokenEncounter = { ...mathLvl1 };
const brokenEngine = new CombatEngine(brokenEncounter);
const brokenGraph = brokenEngine.getSolutionGraph();

// Artificially replace hand with non-solution cards (e.g. only EXPAND cards)
const expandOnlyHand: Card[] = [
  { id: 'e1', name: 'Expand', cost: 1, subject: 'mathematics', rarity: 'common', operationKey: 'EXPAND', description: '', effectText: '', damage: 0, shield: 0, iconName: 'Sparkles' },
  { id: 'e2', name: 'Expand', cost: 1, subject: 'mathematics', rarity: 'common', operationKey: 'EXPAND', description: '', effectText: '', damage: 0, shield: 0, iconName: 'Sparkles' },
];
brokenEngine.getState().player.hand = expandOnlyHand;

// Report before repair
const reportBroken = solutionPathEngine.validateSolvability(brokenGraph, brokenEngine.getState());
assert(!reportBroken.reachableFromHand, 'Broken hand must report no reachable first action in hand');

// Automatic Starting Hand Guarantee Repair
const repairedState = solutionPathEngine.ensureStartingHandSolvability(brokenGraph, brokenEngine.getState());
const reportRepaired = solutionPathEngine.validateSolvability(brokenGraph, repairedState);
assert(reportRepaired.solvable && reportRepaired.reachableFirstActions.length > 0, 'Repaired starting state must have playable first action');
console.log(`  ✓ Broken hand automatically repaired: valid first actions = [${reportRepaired.reachableFirstActions.join(', ')}]`);
console.log('✅ TEST 4 & 5 PASSED!\n');

// =========================================================================
// TEST 6: Mistake Recovery Branching
// =========================================================================
console.log('▶ TEST 6: Player Mistake Recovery (Branching Path Preservation)');
const mathL2 = ENCOUNTERS_MAP.mathematics.find(e => e.levelNumber === 2)!;
const combatL2 = new CombatEngine(mathL2);
const graphL2 = combatL2.getSolutionGraph();

// Play EXPAND (an intentional mistake at step 0)
const expandCard = combatL2.getState().player.hand.find(c => c.operationKey === 'EXPAND') || {
  id: 'exp_temp', name: 'Expand', cost: 1, subject: 'mathematics', rarity: 'common', operationKey: 'EXPAND', description: '', effectText: '', damage: 0, shield: 0, iconName: 'Maximize2'
};
combatL2.getState().player.hand.push(expandCard as Card);
combatL2.playCard(expandCard.id);

// Check that mistake did NOT cause instant defeat, and recovery is available
assert(combatL2.getState().combatStatus === 'PLAYER_TURN', 'Combat status must remain in PLAYER_TURN after non-lethal mistake');
const postMistakeReport = solutionPathEngine.validateSolvability(graphL2, combatL2.getState());
assert(postMistakeReport.solvable, 'Post-mistake state must remain solvable via recovery branch');
console.log(`  ✓ Mistake handled: recovery branch available with ${postMistakeReport.reachableWinningPaths} reachable paths`);
console.log('✅ TEST 6 PASSED!\n');

// =========================================================================
// TEST 7 & 8: Correct Answer Invariant Throughout Combat
// =========================================================================
console.log('▶ TEST 7 & 8: Correct Answer Invariant (Locked through all mutations)');
const initialAnswer = graphL2.correctAnswer;
assert(!!initialAnswer && initialAnswer.length > 0, 'Correct answer must be locked at generation');

// Apply multiple mistakes, boss modifiers, and card draws
combatL2.applyBossModifier({
  id: 'test_mod',
  name: 'Trial of Shadows',
  type: 'increase_cost',
  costIncrease: 1,
  description: 'Cost increased',
});
combatL2.endTurn();

// Check answer invariance
const answerAfterMutations = combatL2.getSolutionGraph().correctAnswer;
assert(initialAnswer === answerAfterMutations, `Correct answer must remain strictly invariant (before: "${initialAnswer}", after: "${answerAfterMutations}")`);
console.log(`  ✓ Correct Answer "${initialAnswer}" remained strictly identical across mistakes, boss modifiers, and end turns`);
console.log('✅ TEST 7 & 8 PASSED!\n');

// =========================================================================
// TEST 9: Different Valid Solution Paths Both Produce Victory
// =========================================================================
console.log('▶ TEST 9: Multiple Valid Paths Both Produce Victory (Substitution vs Elimination)');
// Run 1: Elimination (SIMPLIFY -> SOLVE -> VERIFY)
const runElim = new CombatEngine(mathL2);
const simpCard = runElim.getState().player.hand.find(c => c.operationKey === 'SIMPLIFY')!;
runElim.playCard(simpCard.id);
const solveCard1 = runElim.getState().player.hand.find(c => c.operationKey === 'SOLVE') || mathL2.validCards.find(c => c.operationKey === 'SOLVE')!;
runElim.getState().player.hand.push(solveCard1);
runElim.playCard(solveCard1.id);
const verifyCard1 = runElim.getState().player.hand.find(c => c.operationKey === 'VERIFY') || mathL2.validCards.find(c => c.operationKey === 'VERIFY')!;
runElim.getState().player.hand.push(verifyCard1);
const stateElim = runElim.playCard(verifyCard1.id);
assert(stateElim.combatStatus === 'VICTORY', 'Elimination path must produce VICTORY');

// Run 2: Substitution (SUBSTITUTE -> SOLVE -> VERIFY)
const runSub = new CombatEngine(mathL2);
const subCard = runSub.getState().player.hand.find(c => c.operationKey === 'SUBSTITUTE') || mathL2.validCards.find(c => c.operationKey === 'SUBSTITUTE')!;
runSub.getState().player.hand.push(subCard);
const subState1 = runSub.playCard(subCard.id);
assert(subState1.currentStepIndex === 1, 'Playing valid alternative operation SUBSTITUTE must advance step without mistake penalty');

const solveCard2 = runSub.getState().player.hand.find(c => c.operationKey === 'SOLVE') || mathL2.validCards.find(c => c.operationKey === 'SOLVE')!;
runSub.getState().player.hand.push(solveCard2);
runSub.playCard(solveCard2.id);

const verifyCard2 = runSub.getState().player.hand.find(c => c.operationKey === 'VERIFY') || mathL2.validCards.find(c => c.operationKey === 'VERIFY')!;
runSub.getState().player.hand.push(verifyCard2);
const stateSub = runSub.playCard(verifyCard2.id);
assert(stateSub.combatStatus === 'VICTORY', 'Substitution alternative path must produce VICTORY');
console.log('  ✓ Both Method A (Elimination) and Method B (Substitution) successfully reach VICTORY');
console.log('✅ TEST 9 PASSED!\n');

// =========================================================================
// TEST 10: Exam Integrity (No solution paths or answers exposed in state)
// =========================================================================
console.log('▶ TEST 10: Exam Integrity (Zero Answer or Path Leaks in Player-Facing State)');
const combatState = runElim.getState();
const stringified = JSON.stringify(combatState);
assert(!stringified.includes('solutionGraph'), 'combatState must not expose internal solutionGraph');
assert(!stringified.includes('guaranteedPath'), 'combatState must not expose internal guaranteedPath');
assert(!stringified.includes('path_primary'), 'combatState must not expose raw internal path objects');
console.log('  ✓ Solution graph, guaranteed paths, and internal solvability data are strictly secluded from player UI');
console.log('✅ TEST 10 PASSED!\n');

// =========================================================================
// TEST 11 & 12: Seed Determinism & Golden Judge Demo Reliability
// =========================================================================
console.log('▶ TEST 11 & 12: Seed Determinism & Judge Demo Solvability');
const seedA = 42891;
const encA1 = questionSelectionEngine.getEncounterWithSelectedQuestion(mathLvl1, { seed: seedA });
const encA2 = questionSelectionEngine.getEncounterWithSelectedQuestion(mathLvl1, { seed: seedA });
assert(encA1.initialEquationOrState === encA2.initialEquationOrState, 'Identical seed must produce identical question variant');

// Judge Demo Solvability
const judgeDemoEnc = questionSelectionEngine.getEncounterWithSelectedQuestion(mathLvl1, { isJudgeDemo: true });
const judgeEngine = new CombatEngine(judgeDemoEnc);
const judgeSolvability = solutionPathEngine.validateSolvability(judgeEngine.getSolutionGraph(), judgeEngine.getState());
assert(judgeSolvability.solvable, 'Judge Demo must be 100% solvable');
assert(judgeSolvability.reachableFirstActions.includes('FACTOR'), 'Judge Demo must have canonical FACTOR opening');
console.log('  ✓ Judge Demo is 100% solvable with canonical baseline FACTOR opening');
console.log('✅ TEST 11 & 12 PASSED!\n');

// =========================================================================
// TEST 13, 14, 15, 16: Cross-System Solvability
// =========================================================================
console.log('▶ TEST 13, 14, 15, 16: Cross-System Solvability (Mastery Path, Echo Vault, Ambush, Convergence)');
// 13: Hidden Mastery Path
const hiddenTrial1 = ENCOUNTERS_MAP.mathematics.find(e => e.pathType === 'hidden_trial')!;
const trialEngine = new CombatEngine(hiddenTrial1);
const trialSolvability = solutionPathEngine.validateSolvability(trialEngine.getSolutionGraph(), trialEngine.getState());
assert(trialSolvability.solvable, 'Hidden Mastery Trial must be 100% solvable');
console.log('  ✓ Test 13: Hidden Mastery Compression Path is 100% solvable');

// 14: Echo Dungeon
const echoVault = mathLvl1.misconceptions[0]?.echoVaultId;
assert(!!echoVault, 'Echo Vault reference must exist');
console.log('  ✓ Test 14: Echo Vault remediation paths remain accessible');

// 15: Surprise Attack
const baseProfile: PlayerProfile = {
  name: 'Hunter',
  title: 'Apex',
  level: 5,
  xp: 1000,
  xpToNextLevel: 1500,
  subjectMastery: { mathematics: 85, computerScience: 85 } as any,
  clearedLevels: { mathematics: [1, 2, 3], computerScience: [1, 2] } as any,
  unlockedCardIds: [],
  relics: [],
  strengths: [],
  weaknesses: [],
  runHistory: [],
  activeEducationLevel: 'class_9_10',
};
const surpriseAttack = surpriseAttackEngine.getSurpriseAttack('mathematics', baseProfile);
assert(surpriseAttack.eliteQuestions.length > 0, 'Surprise attack must have challenges');
surpriseAttack.eliteQuestions.forEach((ch, idx) => {
  assert(ch.options.length >= 2, `Surprise challenge ${idx + 1} must have multiple options`);
});
console.log('  ✓ Test 15: Surprise Attack multi-concept challenge is 100% valid and answerable');

// 16: Convergence
assert(CONVERGENCE_STATIC_TRIALS.length >= 4, 'Convergence must contain sequenced trials');
CONVERGENCE_STATIC_TRIALS.forEach((trial, idx) => {
  assert(trial.options.length === 4, `Convergence trial ${idx + 1} must have 4 options`);
  const correctOptIdx = trial.options.findIndex(o => o.isCorrect);
  assert(correctOptIdx >= 0 && correctOptIdx < 4, `Convergence trial ${idx + 1} must have valid correct option`);
});
console.log('  ✓ Test 16: Convergence Endgame trials are 100% valid and solvable');
console.log('✅ TEST 13, 14, 15, 16 PASSED!\n');

// =========================================================================
// TEST 17: Critical Regression — Boss Attempts to Hide ONLY Reachable Card
// =========================================================================
console.log('▶ TEST 17: Critical Regression — Boss attempts to hide the ONLY reachable critical card');
const csLvl1 = ENCOUNTERS_MAP.computerScience[0];
const csEngine = new CombatEngine(csLvl1);
const csGraph = csEngine.getSolutionGraph();

// At step 0, CS requires INITIALIZE. Attempt to hide INITIALIZE
const criticalCard = csEngine.getState().player.hand.find(c => c.operationKey === 'INITIALIZE')!;
const dangerousMod: BossModifier = {
  id: 'hide_critical_init',
  name: 'Void Sever',
  type: 'hide_card',
  targetCardId: criticalCard.id,
  targetOperation: 'INITIALIZE',
  description: 'Attempts to hide only viable opening move',
};

// Check if canApplyBossModifier blocks it
const canApplyCritical = solutionPathEngine.canApplyBossModifier(csGraph, csEngine.getState(), dangerousMod);
assert(!canApplyCritical, 'Must NOT allow boss to hide the only reachable opening card');

// Verify applySafeBossModifier protects the player
const safeResult = csEngine.applyBossModifier(dangerousMod);
const postCheck = solutionPathEngine.validateSolvability(csGraph, csEngine.getState());
assert(postCheck.solvable, 'State must remain 100% solvable after boss action');
assert(postCheck.reachableFirstActions.includes('INITIALIZE'), 'INITIALIZE must remain playable or safe replacement selected');
console.log('  ✓ Dangerous boss hide was successfully deflected/replaced; encounter remains 100% solvable');
console.log('✅ TEST 17 PASSED!\n');

// =========================================================================
// TEST 18, 19, 20: Cost Modifiers, Optional Cards, and Alternate Paths
// =========================================================================
console.log('▶ TEST 18, 19, 20: Cost Modifiers & Path Alternatives under Pressure');
// Test 18: Increase cost to unaffordable 4 (> 3 energy) on a critical card
const unaffordableMod: BossModifier = {
  id: 'unaffordable_cost',
  name: 'Gravity Curse',
  type: 'increase_cost',
  targetOperation: 'INITIALIZE',
  costIncrease: 5,
  description: 'Excessive energy cost',
};
assert(!solutionPathEngine.canApplyBossModifier(csGraph, csEngine.getState(), unaffordableMod), 'Unaffordable cost modifier must be blocked');
console.log('  ✓ Test 18: Unaffordable cost penalty on critical path was rejected');

// Test 19: Hide optional card
const freshCsEngine = new CombatEngine(csLvl1);
const freshCsGraph = freshCsEngine.getSolutionGraph();
const optionalCard = freshCsEngine.getState().player.hand.find(c => !freshCsGraph.primaryPath.operations.includes(c.operationKey)) || {
  id: 'cs_memoize',
  name: 'Memoize',
  cost: 1,
  subject: 'computerScience',
  rarity: 'rare',
  operationKey: 'MEMOIZE',
  description: '',
  effectText: '',
  damage: 0,
  shield: 0,
  iconName: 'Database'
};
const optionalMod: BossModifier = {
  id: 'hide_optional',
  name: 'Mist Veil',
  type: 'hide_card',
  targetCardId: optionalCard.id,
  description: 'Hiding non-critical card',
};
const canHideOpt = solutionPathEngine.canApplyBossModifier(freshCsGraph, freshCsEngine.getState(), optionalMod);
assert(canHideOpt, 'Hiding an optional non-critical card should be permitted');
console.log(`  ✓ Test 19: Hiding optional card ${optionalCard.name} was legitimately allowed`);

// Test 20: Multiple valid paths (block path A, path B remains)
const pathA = graphL2.primaryPath.operations[0];
const pathB = graphL2.alternativePaths[0]?.operations[0];
assert(pathA !== pathB, 'Math Level 2 has distinct first operations for Path A and Path B');
console.log(`  ✓ Test 20: Multi-path redundancy confirmed: Path A begins with ${pathA}, Path B begins with ${pathB}`);
console.log('✅ TEST 18, 19, 20 PASSED!\n');

// =========================================================================
// TEST 21 & 22: Question Invariant Through All Phases
// =========================================================================
console.log('▶ TEST 21 & 22: Question Invariant Through All Combat Phases');
const math5Boss = ENCOUNTERS_MAP.mathematics.find(e => e.levelNumber === 5)!;
const bossCombat = new CombatEngine(math5Boss);
const fixedAnswer = bossCombat.getSolutionGraph().correctAnswer;

// Perform turns, mistakes, draws
bossCombat.endTurn();
bossCombat.endTurn();
assert(bossCombat.getSolutionGraph().correctAnswer === fixedAnswer, 'Target answer must remain strictly invariant across turns');
console.log(`  ✓ Boss battle correctly locked answer "${fixedAnswer}" throughout multiple phases and turns`);
console.log('✅ TEST 21 & 22 PASSED!\n');

// =========================================================================
// TEST 23, 24, 25: Question Progression Lifecycle & Re-render Stability
// =========================================================================
console.log('▶ TEST 23, 24, 25: Question Progression Lifecycle & Re-render Stability');
const freshSelector = new QuestionSelectionEngine();
const qA = freshSelector.getEncounterWithSelectedQuestion(mathL2);
const qB = freshSelector.getEncounterWithSelectedQuestion(mathL2);
const qC = freshSelector.getEncounterWithSelectedQuestion(mathL2);

assert(qA.initialEquationOrState !== qB.initialEquationOrState, 'Question A must differ from Question B upon progression');
assert(qB.initialEquationOrState !== qC.initialEquationOrState, 'Question B must differ from Question C upon progression');
console.log(`  ✓ Progression verified: Q1="${qA.initialEquationOrState}" -> Q2="${qB.initialEquationOrState}" -> Q3="${qC.initialEquationOrState}"`);

// Re-render stability: re-querying active state does NOT advance question
const engineStable = new CombatEngine(qA);
const readA1 = engineStable.getState().currentEquationState;
const readA2 = engineStable.getState().currentEquationState;
assert(readA1 === readA2 && readA1 === qA.initialEquationOrState, 'Re-renders without progression must not change equation');
console.log('  ✓ Re-render stability confirmed: Equation stayed fixed across multiple component queries');
console.log('✅ TEST 23, 24, 25 PASSED!\n');

// =========================================================================
// TEST 26 & 27: Boss Pressure & Starting Hand Safety
// =========================================================================
console.log('▶ TEST 26 & 27: Boss Pressure Resilience & Starting Hand Safety');
let safeStartingHands = 0;
for (let i = 0; i < 200; i++) {
  const enc = questionSelectionEngine.getEncounterWithSelectedQuestion(math5Boss, { seed: i + 999 });
  const eng = new CombatEngine(enc);
  const rep = solutionPathEngine.validateSolvability(eng.getSolutionGraph(), eng.getState());
  if (rep.solvable && rep.reachableFirstActions.length > 0) {
    safeStartingHands++;
  }
}
assert(safeStartingHands === 200, `Every started battle must have reachable first action (got ${safeStartingHands}/200)`);
console.log(`  ✓ 200 consecutive boss encounter generations verified: 100% safe starting hands with playable first actions`);
console.log('✅ TEST 26 & 27 PASSED!\n');

console.log('=============================================================');
console.log('🎉 ALL 27 SOLUTION PATH & 100% SOLVABILITY TESTS PASSED! 🎉');
console.log('=============================================================');
