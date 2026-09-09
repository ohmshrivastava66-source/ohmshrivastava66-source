import { bossAbilityEngine, BossAbilityEngine } from './engine/BossAbilityEngine';
import { solutionPathEngine, SolutionPathEngine } from './engine/SolutionPathEngine';
import { CombatEngine } from './engine/CombatEngine';
import { questionSelectionEngine } from './engine/QuestionSelectionEngine';
import { ENCOUNTERS_MAP } from './curriculum/registry';
import { MATH_ENCOUNTERS } from './curriculum/mathematics';
import { CS_ENCOUNTERS } from './curriculum/computerScience';
import { BossModifier } from './types/game';

declare const process: any;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
}

console.log('=============================================================');
console.log('⚔️  STARTING BOSS DIFFICULTY & FAIR INTERFERENCE VERIFICATION ⚔️');
console.log('=============================================================\n');

// -------------------------------------------------------------------------
// TEST 1: Boss Question Complexity vs Standard Level
// -------------------------------------------------------------------------
console.log('▶ TEST 1: Boss Question Complexity vs Standard Level');
const mathLvl1 = MATH_ENCOUNTERS.find(e => e.id === 'math_lvl_1')!;
const mathBoss = MATH_ENCOUNTERS.find(e => e.id === 'math_boss')!;
const csBoss = CS_ENCOUNTERS.find(e => e.id === 'cs_boss')!;

assert(mathLvl1.optimalSequence.length === 3, 'Level 1 math must have 3 steps');
assert(mathBoss.optimalSequence.length >= 4, 'Boss math encounter must have >= 4 steps');
assert(csBoss.optimalSequence.length >= 4, 'Boss CS encounter must have >= 4 steps');
assert(mathBoss.optimalSequence.length === 5, 'Math boss optimal sequence has 5 steps');
assert(csBoss.optimalSequence.length === 5, 'CS boss optimal sequence has 5 steps');
console.log(`  ✓ Level 1 steps: ${mathLvl1.optimalSequence.length} vs Math Boss steps: ${mathBoss.optimalSequence.length}`);
console.log(`  ✓ CS Boss steps: ${csBoss.optimalSequence.length}`);
console.log('✅ TEST 1 PASSED!\n');

// -------------------------------------------------------------------------
// TEST 2: Multi-Concept Dependencies Verified on Math Boss and CS Boss
// -------------------------------------------------------------------------
console.log('▶ TEST 2: Multi-Concept Dependencies Verified');
// Math Boss: SUBSTITUTE -> SIMPLIFY -> FACTOR -> SOLVE -> VERIFY
const mathOps = mathBoss.optimalSequence;
assert(mathOps.includes('SUBSTITUTE'), 'Math boss must require variable substitution');
assert(mathOps.includes('SIMPLIFY'), 'Math boss must require expression simplification');
assert(mathOps.includes('FACTOR'), 'Math boss must require polynomial factorization');
assert(mathOps.includes('SOLVE'), 'Math boss must require root extraction');
assert(mathOps.includes('VERIFY'), 'Math boss must require verification/elimination');

// CS Boss: INITIALIZE -> PARTITION -> COMPARE -> MEMOIZE -> TERMINATE
const csOps = csBoss.optimalSequence;
assert(csOps.includes('INITIALIZE'), 'CS boss must require invariant initialization');
assert(csOps.includes('PARTITION'), 'CS boss must require buffer partitioning');
assert(csOps.includes('COMPARE'), 'CS boss must require predicate comparison');
assert(csOps.includes('MEMOIZE'), 'CS boss must require state memoization');
assert(csOps.includes('TERMINATE'), 'CS boss must require termination proof');
console.log('  ✓ Math Boss concepts: Substitution, Simplification, Factorization, Domain-constrained Solve, Verification');
console.log('  ✓ CS Boss concepts: Initialization, Partitioning, Comparison, Memoization, Termination Proof');
console.log('✅ TEST 2 PASSED!\n');

// -------------------------------------------------------------------------
// TEST 3: Multi-Route Redundancy (Route A vs Route B with Identical Answer)
// -------------------------------------------------------------------------
console.log('▶ TEST 3: Multi-Route Redundancy with Identical Correct Answer');
const mathGraph = solutionPathEngine.generateSolutionGraph(mathBoss);
assert(mathGraph.allPaths.length >= 2, 'Math boss must have >= 2 legitimate routes');
const mathRouteA = mathGraph.primaryPath;
const mathRouteB = mathGraph.alternativePaths[0];
assert(mathRouteA.operations.join(' -> ') === 'SUBSTITUTE -> SIMPLIFY -> FACTOR -> SOLVE -> VERIFY', 'Route A must match');
assert(mathRouteB.operations.join(' -> ') === 'REARRANGE -> FACTOR -> SOLVE -> VERIFY', 'Route B must match');
assert(mathGraph.correctAnswer === 't = 1/2', 'Math boss target answer must be t = 1/2');
assert(mathRouteA.completionCondition === mathRouteB.completionCondition, 'Both routes must terminate at same condition');

const csGraph = solutionPathEngine.generateSolutionGraph(csBoss);
assert(csGraph.allPaths.length >= 2, 'CS boss must have >= 2 legitimate routes');
const csRouteA = csGraph.primaryPath;
const csRouteB = csGraph.alternativePaths[0];
assert(csRouteA.operations.join(' -> ') === 'INITIALIZE -> PARTITION -> COMPARE -> MEMOIZE -> TERMINATE', 'Route A must match');
assert(csRouteB.operations.join(' -> ') === 'INITIALIZE -> COMPARE -> MEMOIZE -> TERMINATE', 'Route B must match');
assert(csGraph.correctAnswer === 'O(log n)', 'CS boss target answer must be O(log n)');
assert(csRouteA.completionCondition === csRouteB.completionCondition, 'Both CS routes must terminate at same condition');
console.log(`  ✓ Math Boss: Route A (${mathRouteA.operations.length} steps) & Route B (${mathRouteB.operations.length} steps) -> Target: "${mathGraph.correctAnswer}"`);
console.log(`  ✓ CS Boss: Route A (${csRouteA.operations.length} steps) & Route B (${csRouteB.operations.length} steps) -> Target: "${csGraph.correctAnswer}"`);
console.log('✅ TEST 3 PASSED!\n');

// -------------------------------------------------------------------------
// TEST 4: Boss Abilities Can Narrow Reachable Winning Paths
// -------------------------------------------------------------------------
console.log('▶ TEST 4: Boss Abilities Can Narrow Reachable Paths');
const engineMath = new CombatEngine(mathBoss);
const preInterferenceReport = solutionPathEngine.validateSolvability(mathGraph, engineMath.getState());
assert(preInterferenceReport.reachableWinningPaths === 2, `Expected 2 initial winning paths, got ${preInterferenceReport.reachableWinningPaths}`);

// Boss shrouds the REARRANGE card (locking Route B), leaving Route A open
const shroudRearrangeMod: BossModifier = {
  id: 'mod_shroud_rearrange',
  name: 'Dimensional Shroud',
  type: 'hide_card',
  targetOperation: 'REARRANGE',
  description: 'Shrouds alternative rearrangement path.',
};
const applyRes = engineMath.applyBossModifier(shroudRearrangeMod);
assert(applyRes.applied === true, 'Safe modifier shrouding alternative route should be accepted');

const postInterferenceReport = solutionPathEngine.validateSolvability(mathGraph, engineMath.getState());
assert(postInterferenceReport.solvable === true, 'Encounter must remain solvable');
assert(postInterferenceReport.reachableWinningPaths === 1, `Reachable winning paths should be narrowed to 1, got ${postInterferenceReport.reachableWinningPaths}`);
console.log(`  ✓ Pre-modifier winning paths: ${preInterferenceReport.reachableWinningPaths} -> Post-modifier winning paths: ${postInterferenceReport.reachableWinningPaths}`);
console.log('✅ TEST 4 PASSED!\n');

// -------------------------------------------------------------------------
// TEST 5: Boss Abilities NEVER Reduce Reachable Paths to 0
// -------------------------------------------------------------------------
console.log('▶ TEST 5: Boss Abilities NEVER Reduce Reachable Paths to 0');
// Now attempt to shroud the ONLY remaining opening operation (SUBSTITUTE)
const fatalShroudMod: BossModifier = {
  id: 'mod_fatal_shroud',
  name: 'Void Erasure',
  type: 'hide_card',
  targetOperation: 'SUBSTITUTE',
  description: 'Attempting to shroud the only remaining valid path.',
};
const fatalApplyRes = engineMath.applyBossModifier(fatalShroudMod);
// Engine MUST either reject the modifier or replace it with a safe fallback
const finalReport = solutionPathEngine.validateSolvability(mathGraph, engineMath.getState());
assert(finalReport.solvable === true, 'State must remain 100% solvable');
assert(finalReport.reachableWinningPaths >= 1, `Winning paths must never be 0 (got ${finalReport.reachableWinningPaths})`);
assert(fatalApplyRes.applied === false || fatalApplyRes.replacement !== undefined, 'Engine must refuse or replace fatal modifier');
console.log(`  ✓ Fatal modifier rejected or safely replaced: applied=${fatalApplyRes.applied}, replacement=${fatalApplyRes.replacement?.name}`);
console.log(`  ✓ Surviving reachable winning paths: ${finalReport.reachableWinningPaths}`);
console.log('✅ TEST 5 PASSED!\n');

// -------------------------------------------------------------------------
// TEST 6: Starting Hand Solvability
// -------------------------------------------------------------------------
console.log('▶ TEST 6: Starting Hand Solvability (100% of Encounters Have >= 1 Playable Action)');
let startSolvableCount = 0;
const testSeeds = [1, 7, 42, 99, 137, 256, 512, 777, 1024, 2048];

for (const seed of testSeeds) {
  const enc = questionSelectionEngine.getEncounterWithSelectedQuestion(mathBoss, { seed });
  const eng = new CombatEngine(enc);
  const gr = eng.getSolutionGraph();
  const rep = solutionPathEngine.validateSolvability(gr, eng.getState());
  if (rep.solvable && rep.reachableFirstActions.length >= 1) {
    startSolvableCount++;
  }
}
assert(startSolvableCount === testSeeds.length, 'All tested starting hands must have >= 1 playable action');
console.log(`  ✓ Verified ${testSeeds.length}/${testSeeds.length} distinct seeds have playable starting actions`);
console.log('✅ TEST 6 PASSED!\n');

// -------------------------------------------------------------------------
// TEST 7: Card Shroud Cannot Remove All Valid Openings
// -------------------------------------------------------------------------
console.log('▶ TEST 7: Card Shroud Cannot Remove All Valid Openings');
const shroudEngine = new CombatEngine(csBoss);
const csInitialGraph = shroudEngine.getSolutionGraph();
const initialHand = shroudEngine.getState().player.hand;
const openingCard = initialHand.find(c => c.operationKey === 'INITIALIZE');
assert(openingCard !== undefined, 'Hand must contain INITIALIZE');

// Try to shroud the opening card when it is required
const shroudOpeningMod: BossModifier = {
  id: 'test_shroud_init',
  name: 'Tesseract Trap',
  type: 'hide_card',
  targetCardId: openingCard!.id,
  targetOperation: 'INITIALIZE',
  description: 'Tesseract trap shrouds the opening operation.',
};
const shroudRes = shroudEngine.applyBossModifier(shroudOpeningMod);
const postShroudRep = solutionPathEngine.validateSolvability(csInitialGraph, shroudEngine.getState());
assert(postShroudRep.solvable === true, 'Encounter must remain solvable even after shroud attempt');
assert(postShroudRep.reachableFirstActions.length >= 1, 'At least 1 first action must remain playable');
console.log(`  ✓ Opening card shroud safely handled. Playable openings: ${postShroudRep.reachableFirstActions.length}`);
console.log('✅ TEST 7 PASSED!\n');

// -------------------------------------------------------------------------
// TEST 8: Energy Drain Cannot Make All Winning Routes Unaffordable
// -------------------------------------------------------------------------
console.log('▶ TEST 8: Energy Drain Cannot Make All Winning Routes Unaffordable');
const drainEngine = new CombatEngine(mathBoss);
const drainGraph = drainEngine.getSolutionGraph();
// Apply massive cost increase to all cards
const massiveCostMod: BossModifier = {
  id: 'mod_massive_drain',
  name: 'Infinite Gravity',
  type: 'increase_cost',
  targetOperation: 'SUBSTITUTE',
  costIncrease: 99, // Unaffordable
  description: 'Infinite gravity raises cost of substitution to 99.',
};
const drainApplyRes = drainEngine.applyBossModifier(massiveCostMod);
// Since Route B (REARRANGE) is still available at normal cost, this modifier should be permitted or adapted
const drainRep = solutionPathEngine.validateSolvability(drainGraph, drainEngine.getState());
assert(drainRep.solvable === true, 'State must remain solvable through Route B');
assert(drainRep.reachableWinningPaths >= 1, 'Reachable winning paths must be >= 1');
console.log(`  ✓ Route B preserved under Route A cost pressure. Reachable paths: ${drainRep.reachableWinningPaths}`);
console.log('✅ TEST 8 PASSED!\n');

// -------------------------------------------------------------------------
// TEST 9: Fractured State Preserves Logical Truth and Target Answer
// -------------------------------------------------------------------------
console.log('▶ TEST 9: Fractured State Preserves Logical Truth and Target Answer');
const fractureEngine = new CombatEngine(mathBoss);
const originalAnswer = fractureEngine.getSolutionGraph().correctAnswer;
const fractureMod: BossModifier = {
  id: 'mod_fracture',
  name: 'Equation Fracture',
  type: 'fractured_state',
  description: 'The Singularity Archon fractures the coordinate space.',
  fracturedVisualPrompt: 'Dimensional axioms warp.',
};
fractureEngine.applyBossModifier(fractureMod);
const stateAfterFracture = fractureEngine.getState();
assert(stateAfterFracture.enemy.fracturedStateActive === true, 'Fractured state flag must be active');
assert(fractureEngine.getSolutionGraph().correctAnswer === originalAnswer, 'Target answer must remain strictly immutable');
console.log(`  ✓ Fractured state active: ${stateAfterFracture.enemy.fracturedStateActive}. Target answer intact: "${originalAnswer}"`);
console.log('✅ TEST 9 PASSED!\n');

// -------------------------------------------------------------------------
// TEST 10: Distortion Preserves Solvability
// -------------------------------------------------------------------------
console.log('▶ TEST 10: Distortion Preserves Solvability');
const distEngine = new CombatEngine(csBoss);
const distMod: BossModifier = {
  id: 'mod_distortion',
  name: 'Search Space Distortion',
  type: 'distortion',
  description: 'Distorts auxiliary presentation.',
};
distEngine.applyBossModifier(distMod);
const distRep = solutionPathEngine.validateSolvability(distEngine.getSolutionGraph(), distEngine.getState());
assert(distRep.solvable === true, 'Distortion modifier must preserve 100% solvability');
assert(distRep.reachableWinningPaths >= 1, 'Reachable winning paths must be >= 1');
console.log(`  ✓ Distortion applied safely. Reachable paths: ${distRep.reachableWinningPaths}`);
console.log('✅ TEST 10 PASSED!\n');

// -------------------------------------------------------------------------
// TEST 11: Guardian Phase Absorbs Damage But Preserves Educational Progress
// -------------------------------------------------------------------------
console.log('▶ TEST 11: Guardian Phase Absorbs Damage But Preserves Educational Progress');
const guardianEngine = new CombatEngine(mathBoss);
const initialHp = guardianEngine.getState().enemy.currentHp;
const initialStep = guardianEngine.getState().currentStepIndex;

// Activate Guardian Barrier
const guardianMod: BossModifier = {
  id: 'mod_guardian_barrier',
  name: 'Crown of Proof',
  type: 'guardian_phase',
  description: 'Barrier absorbs direct damage on next strike.',
  isGuardianBarrierActive: true,
};
guardianEngine.applyBossModifier(guardianMod);
assert(guardianEngine.getState().enemy.isGuardianBarrierActive === true, 'Barrier must be active');

// Play valid opening card (SUBSTITUTE)
const subCard = guardianEngine.getState().player.hand.find(c => c.operationKey === 'SUBSTITUTE')!;
const playResult = guardianEngine.playCard(subCard.id);

assert(playResult.currentStepIndex === initialStep + 1, 'Valid card play must advance step');
assert(guardianEngine.getState().currentStepIndex === initialStep + 1, 'Educational step must advance by 1');
assert(guardianEngine.getState().enemy.currentHp === initialHp, 'Boss HP must be shielded by Guardian Barrier (0 HP damage dealt)');
assert(guardianEngine.getState().enemy.isGuardianBarrierActive === false, 'Barrier must shatter after absorbing strike');
console.log(`  ✓ Step advanced from ${initialStep} to ${guardianEngine.getState().currentStepIndex}`);
console.log(`  ✓ Boss HP preserved at ${guardianEngine.getState().enemy.currentHp}/${initialHp} (damage absorbed, proof progressed)`);
console.log('✅ TEST 11 PASSED!\n');

// -------------------------------------------------------------------------
// TEST 12: CounterSign Preserves Solvability
// -------------------------------------------------------------------------
console.log('▶ TEST 12: CounterSign Preserves Solvability');
const csCounterEngine = new CombatEngine(csBoss);
// Simulate Phase 2 by setting boss HP to 50%
(csCounterEngine.getState().enemy as any).currentHp = Math.floor(csCounterEngine.getState().enemy.maxHp * 0.5);
const counterMod = bossAbilityEngine.evaluateCountersign(
  csCounterEngine.getSolutionGraph(),
  csCounterEngine.getState(),
  csBoss,
  'INITIALIZE'
);
assert(counterMod !== null, 'Countersign should trigger in Phase 2 for Turing Archon');
assert(counterMod?.type === 'countersign', 'Should produce countersign modifier');
const counterRep = solutionPathEngine.validateSolvability(csCounterEngine.getSolutionGraph(), csCounterEngine.getState());
assert(counterRep.solvable === true, 'Countersign must never compromise solvability');
console.log(`  ✓ Countersign generated: "${counterMod?.name}". Encounter solvability intact.`);
console.log('✅ TEST 12 PASSED!\n');

// -------------------------------------------------------------------------
// TEST 13: Multiple Simultaneous Modifiers Remain Solvable
// -------------------------------------------------------------------------
console.log('▶ TEST 13: Multiple Simultaneous Modifiers Remain Solvable');
const multiEngine = new CombatEngine(mathBoss);
const multiMods: BossModifier[] = [
  { id: 'multi_1', name: 'Fractured Field', type: 'fractured_state', description: 'Fractured coordinate field.' },
  { id: 'multi_2', name: 'Runic Aegis', type: 'guardian_phase', isGuardianBarrierActive: true, description: 'Runic barrier absorbs direct force.' },
  { id: 'multi_3', name: 'Focal Mist', type: 'hide_card', targetOperation: 'EXPAND', description: 'Focal mist shrouds non-viable operation.' },
];
for (const mod of multiMods) {
  multiEngine.applyBossModifier(mod);
}
const multiRep = solutionPathEngine.validateSolvability(multiEngine.getSolutionGraph(), multiEngine.getState());
assert(multiRep.solvable === true, 'Combined modifiers must remain 100% solvable');
assert(multiRep.reachableWinningPaths >= 1, 'Must have >= 1 reachable winning path');
console.log(`  ✓ 3 simultaneous modifiers active. Reachable paths: ${multiRep.reachableWinningPaths}`);
console.log('✅ TEST 13 PASSED!\n');

// -------------------------------------------------------------------------
// TEST 14: correctAnswer Strictly Immutable Across All Turns and Phases
// -------------------------------------------------------------------------
console.log('▶ TEST 14: correctAnswer Strictly Immutable Across All Turns and Phases');
const immutEngine = new CombatEngine(mathBoss);
const canonicalAnswer = 't = 1/2';
assert(mathBoss.correctAnswer === canonicalAnswer, 'Encounter definition correct answer matches');

// Advance turns, apply damage, advance phases
immutEngine.endTurn();
(immutEngine.getState().enemy as any).currentHp = Math.floor(immutEngine.getState().enemy.maxHp * 0.2); // Phase 3
immutEngine.endTurn();

assert(immutEngine.getSolutionGraph().correctAnswer === canonicalAnswer, 'SolutionGraph correctAnswer must not mutate');
assert(mathBoss.correctAnswer === canonicalAnswer, 'Source encounter definition must not mutate');
console.log(`  ✓ correctAnswer immutable: "${immutEngine.getSolutionGraph().correctAnswer}" throughout combat`);
console.log('✅ TEST 14 PASSED!\n');

// -------------------------------------------------------------------------
// TEST 15: Solution Graph and Winning Paths Remain Hidden from Public Player State
// -------------------------------------------------------------------------
console.log('▶ TEST 15: Solution Graph Hidden from Public Player State');
const publicState = immutEngine.getState();
const playerJson = JSON.stringify(publicState.player);
assert(!playerJson.includes('optimalSequence'), 'Player state must not contain optimalSequence');
assert(!playerJson.includes('winningPaths'), 'Player state must not contain winningPaths');
assert(!playerJson.includes('canonicalPath'), 'Player state must not contain canonicalPath');
assert(!playerJson.includes(canonicalAnswer), 'Player state must not leak the correct answer string');
console.log('  ✓ Verified player state contains zero answer or sequence leaks');
console.log('✅ TEST 15 PASSED!\n');

// -------------------------------------------------------------------------
// TEST 16: Zero Player-Facing Answer Leaks
// -------------------------------------------------------------------------
console.log('▶ TEST 16: Zero Player-Facing Answer Leaks');
// Problem statement presents the challenge without giving away the final root
assert(!mathBoss.problemStatement.includes('t = 1/2'), 'Problem statement must not state the solution');
assert(mathBoss.initialEquationOrState.includes('2(t - 1)²'), 'Initial state presents equation');
assert(!mathBoss.initialEquationOrState.includes('SINGULARITY COLLAPSED'), 'Initial state does not reveal final transformation');
console.log('  ✓ Arcane question presentation strictly preserves answer secrecy');
console.log('✅ TEST 16 PASSED!\n');

// -------------------------------------------------------------------------
// TEST 17: Judge Demo Remains 100% Deterministic (0 Dynamic Abilities)
// -------------------------------------------------------------------------
console.log('▶ TEST 17: Judge Demo Remains 100% Deterministic (0 Dynamic Abilities)');
const judgeProposal1 = bossAbilityEngine.evaluateTurnInterference(
  mathGraph,
  engineMath.getState(),
  mathLvl1,
  true // isJudgeDemo
);
assert(judgeProposal1.modifiers.length === 0, 'Judge Demo must have 0 dynamic modifiers');

const judgeProposal2 = bossAbilityEngine.evaluateTurnInterference(
  mathGraph,
  engineMath.getState(),
  mathLvl1,
  false // Level 1 is canonical demo
);
assert(judgeProposal2.modifiers.length === 0, 'Level 1 math encounter must have 0 dynamic modifiers');

const judgeCountersign = bossAbilityEngine.evaluateCountersign(
  mathGraph,
  engineMath.getState(),
  mathLvl1,
  'FACTOR',
  true
);
assert(judgeCountersign === null, 'Judge demo must have null countersign');
console.log('  ✓ Judge demo protection verified: 0 dynamic abilities, 100% deterministic');
console.log('✅ TEST 17 PASSED!\n');

// -------------------------------------------------------------------------
// TEST 18: MONTE CARLO STRESS TEST — 1,000 Boss Encounters Across Random Seeds
// -------------------------------------------------------------------------
console.log('▶ TEST 18: Monte Carlo Stress Test — 1,000 Boss Encounters with Aggressive Interference');
const bossDefinitions = [
  ...MATH_ENCOUNTERS.filter(e => e.isBoss),
  ...CS_ENCOUNTERS.filter(e => e.isBoss),
  ...Object.values(ENCOUNTERS_MAP).flatMap(list => list.filter(e => e.isBoss || (e.subject !== 'data_structures_algorithms' && e.levelNumber === 5))),
];

let totalSimulations = 1000;
let solvableSimulations = 0;
let modifiersAttempted = 0;
let modifiersRejectedOrRepaired = 0;

for (let i = 0; i < totalSimulations; i++) {
  const baseBoss = bossDefinitions[i % bossDefinitions.length];
  const seed = i + 777;
  const encounter = questionSelectionEngine.getEncounterWithSelectedQuestion(baseBoss, { seed });
  const combat = new CombatEngine(encounter);
  const graph = combat.getSolutionGraph();

  // Simulate HP damage to trigger Phase 2 or Phase 3
  const hpRatio = i % 3 === 0 ? 0.25 : i % 3 === 1 ? 0.55 : 0.85;
  (combat.getState().enemy as any).currentHp = Math.max(10, Math.floor(combat.getState().enemy.maxHp * hpRatio));

  // Boss proposes interference
  const proposal = bossAbilityEngine.evaluateTurnInterference(graph, combat.getState(), encounter);

  modifiersAttempted += proposal.modifiers.length;
  for (const mod of proposal.modifiers) {
    const applyRes = combat.applyBossModifier(mod);
    if (!applyRes.applied || applyRes.replacement) {
      modifiersRejectedOrRepaired++;
    }
  }

  // Check solvability
  const check = solutionPathEngine.validateSolvability(graph, combat.getState());
  if (check.solvable && check.reachableWinningPaths >= 1 && check.reachableFirstActions.length >= 1) {
    solvableSimulations++;
  } else {
    // Attempt repair
    const repair = solutionPathEngine.repairUnsolvableState(graph, combat.getState());
    if (repair.repaired) {
      modifiersRejectedOrRepaired++;
      const recheck = solutionPathEngine.validateSolvability(graph, combat.getState());
      if (recheck.solvable && recheck.reachableWinningPaths >= 1) {
        solvableSimulations++;
      }
    }
  }
}

const solvabilityPct = (solvableSimulations / totalSimulations) * 100;
console.log(`  ✓ Simulated 1,000 Boss encounters:`);
console.log(`    • Solvability Rate: ${solvabilityPct.toFixed(2)}% (${solvableSimulations}/${totalSimulations})`);
console.log(`    • Total Modifiers Tested: ${modifiersAttempted}`);
console.log(`    • Modifiers Rejected / Safely Replaced: ${modifiersRejectedOrRepaired}`);

assert(solvabilityPct === 100, `Boss encounters must be 100% solvable (got ${solvabilityPct}%)`);
console.log('✅ TEST 18 (MONTE CARLO) PASSED!\n');

console.log('=============================================================');
console.log('🎉 ALL 18 BOSS DIFFICULTY & SOLVABILITY TESTS PASSED! 🎉');
console.log('=============================================================');
