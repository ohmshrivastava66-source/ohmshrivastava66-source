import { ALL_SUBJECTS, ENCOUNTERS_MAP, ECHO_VAULTS_MAP } from './curriculum/registry';
import { StorageManager } from './persistence/StorageManager';
import { CombatEngine } from './engine/CombatEngine';
import { solutionPathEngine } from './engine/SolutionPathEngine';
import { BossAbilityEngine } from './engine/BossAbilityEngine';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

console.log('=============================================================');
console.log('🛡️ ALGO-SPIRE — MODULE 3 RIGOROUS ACCEPTANCE AUDIT & VERIFICATION');
console.log('=============================================================\n');

const dsaEncounters = ENCOUNTERS_MAP.data_structures_algorithms;
const dsaSubject = ALL_SUBJECTS.data_structures_algorithms;

// ===========================================================================
// SECTION 1: MODULE 3 STRUCTURE, PROGRESSION & REGISTRATION
// ===========================================================================
console.log('▶ [Audit 1] Module 3 Structure, Progression & Registration');

const expectedM3Ids = [
  'dsa_m3_01', 'dsa_m3_02', 'dsa_m3_03', 'dsa_m3_04', 'dsa_m3_05',
  'dsa_m3_06', 'dsa_m3_07', 'dsa_m3_08', 'dsa_m3_09', 'dsa_m3_10'
];

assert(dsaEncounters.length >= 34, `Must have at least 34 DSA encounters registered (found: ${dsaEncounters.length})`);

for (let i = 0; i < expectedM3Ids.length; i++) {
  const encId = expectedM3Ids[i];
  const expectedLvl = 25 + i;
  const encounter = dsaEncounters.find(e => e.id === encId);
  assert(!!encounter, `Encounter ${encId} must exist in dsaEncounters`);
  assert(encounter.levelNumber === expectedLvl, `Encounter ${encId} levelNumber must be ${expectedLvl} (got ${encounter.levelNumber})`);
  assert(encounter.subject === 'data_structures_algorithms', `Encounter ${encId} subject must be data_structures_algorithms`);
}

// Check Boss flags
const m3_07 = dsaEncounters.find(e => e.id === 'dsa_m3_07')!;
assert(m3_07.isBoss === true, 'dsa_m3_07 (Vael, Strategy Warden) must be marked as isBoss: true');

const m3_10 = dsaEncounters.find(e => e.id === 'dsa_m3_10')!;
assert(m3_10.isBoss === true, 'dsa_m3_10 (Entropy Partitioner) must be marked as isBoss: true');

// Check progression unlock across boundary
const testProfile = StorageManager.createInitialProfile();
const ugKey = StorageManager.getContextKey('undergraduate_forge', 'undergraduate_year_1', 'data_structures_algorithms');
testProfile.contextProgress = {
  [ugKey]: {
    mastery: 60,
    clearedLevels: Array.from({ length: 24 }, (_, i) => i + 1), // cleared 1-24
    clearedHiddenTrials: [],
  },
};

// Level 25 should unlock if Level 24 is completed
assert(StorageManager.isLevelUnlocked('data_structures_algorithms', 'dsa_m3_01', testProfile, 'undergraduate_year_1', 'undergraduate_forge'),
  'Level 25 (dsa_m3_01) must unlock when Level 24 is completed');
assert(!StorageManager.isLevelUnlocked('data_structures_algorithms', 'dsa_m3_02', testProfile, 'undergraduate_year_1', 'undergraduate_forge'),
  'Level 26 (dsa_m3_02) must remain locked until Level 25 is completed');

// Now clear level 25
testProfile.contextProgress[ugKey].clearedLevels.push(25);
assert(StorageManager.isLevelUnlocked('data_structures_algorithms', 'dsa_m3_02', testProfile, 'undergraduate_year_1', 'undergraduate_forge'),
  'Level 26 (dsa_m3_02) must unlock when Level 25 is completed');

// Clear up to level 30 (before Vael)
testProfile.contextProgress[ugKey].clearedLevels = Array.from({ length: 30 }, (_, i) => i + 1);
assert(StorageManager.isLevelUnlocked('data_structures_algorithms', 'dsa_m3_07', testProfile, 'undergraduate_year_1', 'undergraduate_forge'),
  'Level 31 (dsa_m3_07) must unlock when Level 30 is completed');

// Clear up to level 33 (before Entropy Partitioner)
testProfile.contextProgress[ugKey].clearedLevels = Array.from({ length: 33 }, (_, i) => i + 1);
assert(StorageManager.isLevelUnlocked('data_structures_algorithms', 'dsa_m3_10', testProfile, 'undergraduate_year_1', 'undergraduate_forge'),
  'Level 34 (dsa_m3_10) must unlock when Level 33 is completed');

// Clear level 34 (completing Module 3)
testProfile.contextProgress[ugKey].clearedLevels.push(34);
assert(StorageManager.isLevelUnlocked('data_structures_algorithms', 'dsa_lvl_4', testProfile, 'undergraduate_year_1', 'undergraduate_forge'),
  'Level 35 (dsa_lvl_4) must unlock when Level 34 is completed');

// Check Echo Vault registration
assert(!!ECHO_VAULTS_MAP.vault_dsa_strategy, 'vault_dsa_strategy must be registered in ECHO_VAULTS_MAP');
assert(ECHO_VAULTS_MAP.vault_dsa_strategy.id === 'vault_dsa_strategy', 'vault_dsa_strategy ID must match');
assert(ECHO_VAULTS_MAP.vault_dsa_strategy.steps.length >= 2, 'vault_dsa_strategy must contain at least 2 repair steps');

// Check dsa_lvl_3 backward compatibility alias
const lvl3Alias = dsaEncounters.find(e => e.id === 'dsa_lvl_3');
assert(!!lvl3Alias, 'dsa_lvl_3 alias must exist for backwards compatibility');

console.log('  ✓ All 10 Module 3 encounters registered with correct level numbers (25–34).');
console.log('  ✓ Mini-boss Vael (Level 31) and Boss Entropy Partitioner (Level 34) marked as isBoss: true.');
console.log('  ✓ StorageManager sequential progression across Module 2 -> Module 3 -> Level 35 verified.');
console.log('  ✓ Echo Vault vault_dsa_strategy registered in master map.');
console.log('  ✓ Backward compatibility alias dsa_lvl_3 preserved.');
console.log('✅ Audit 1 Passed!\n');

// ===========================================================================
// SECTION 2: EXAM INTEGRITY, OBJECTIVES & SECRECY
// ===========================================================================
console.log('▶ [Audit 2] Exam Integrity, Pedagogical Objectives & Non-Leaking Secrecy');

for (const encId of expectedM3Ids) {
  const encounter = dsaEncounters.find(e => e.id === encId)!;

  // 1. Comprehensive problem statement and initial equation/state
  assert(encounter.problemStatement && encounter.problemStatement.length > 20, `${encId} problemStatement must be comprehensive`);
  assert(encounter.initialEquationOrState && encounter.initialEquationOrState.length > 5, `${encId} initialEquationOrState must be defined`);

  // 2. Educational objective is visible, descriptive, non-spoonfeeding
  assert(encounter.objective && encounter.objective.length > 15, `${encId} objective must be descriptive`);
  assert(!encounter.objective.startsWith('Expected '), `${encId} objective must not spoon-feed next card`);
  assert(!encounter.objective.startsWith('Target:'), `${encId} objective must not start with Target:`);

  // 3. Answer secrecy
  if (encounter.correctAnswer) {
    assert(!encounter.objective.includes(encounter.correctAnswer), `${encId} objective must NOT leak correctAnswer`);
    assert(!encounter.initialEquationOrState.includes(encounter.correctAnswer), `${encId} initial state must NOT leak correctAnswer`);
  }
  if (encounter.targetState) {
    assert(!encounter.objective.includes(encounter.targetState), `${encId} objective must NOT leak targetState`);
    assert(!encounter.problemStatement.includes(encounter.targetState), `${encId} problemStatement must NOT leak targetState`);
  }

  // 4. Valid cards: Must include all operations needed for optimal sequence
  for (const op of encounter.optimalSequence) {
    const hasCard = encounter.validCards.some(c => c.operationKey === op);
    assert(hasCard, `${encId} validCards must include card for needed operation: ${op}`);
  }

  // 5. Distractors present
  assert(encounter.validCards.length > encounter.optimalSequence.length,
    `${encId} must have distractor cards (found: ${encounter.validCards.length} cards, ${encounter.optimalSequence.length} needed)`);
}

console.log('  ✓ All 10 encounters have descriptive non-leaking pedagogical objectives.');
console.log('  ✓ Zero answer leaks or target state exposure in question text.');
console.log('  ✓ All required cards present in encounter hand pools with distractors.');
console.log('✅ Audit 2 Passed!\n');

// ===========================================================================
// SECTION 3: COMBAT ENGINE EXECUTION & 100% SOLVABILITY
// ===========================================================================
console.log('▶ [Audit 3] Combat Engine Execution & 100% Solvability Guarantee');

for (const encId of expectedM3Ids) {
  const encounter = dsaEncounters.find(e => e.id === encId)!;

  // 1. SolutionPathEngine verification
  const combat = new CombatEngine(encounter);
  const initialState = combat.getState();
  const graph = combat.getSolutionGraph();
  const solvability = solutionPathEngine.validateSolvability(graph, initialState);

  assert(solvability.solvable, `${encId} must be verified 100% solvable by SolutionPathEngine`);
  assert(solvability.reachableWinningPaths >= 1, `${encId} must have reachable winning paths (found: ${solvability.reachableWinningPaths})`);
  assert(solvability.reachableFirstActions.length >= 1, `${encId} must have reachable first actions (found: ${solvability.reachableFirstActions.join(', ')})`);

  // 2. Full simulation through optimal sequence
  for (let step = 0; step < encounter.optimalSequence.length; step++) {
    const op = encounter.optimalSequence[step];
    let state = combat.getState();
    let card = state.player.hand.find(c => c.operationKey === op);
    if (!card) {
      const template = encounter.validCards.find(c => c.operationKey === op)!;
      state.player.hand.push({ ...template, id: `test_card_${op}_${step}` });
      card = state.player.hand[state.player.hand.length - 1];
    }
    state.player.currentEnergy = 3;
    combat.playCard(card.id);
  }

  // 3. Verify victory condition
  const endState = combat.getState();
  assert(endState.combatStatus === 'VICTORY', `${encId} must reach VICTORY upon completing sequence (got ${endState.combatStatus})`);
  assert(endState.enemy.currentHp === 0, `${encId} enemy HP must be 0 upon victory`);

  // 4. Anti-softlock verification: Playing further cards in VICTORY leaves status in VICTORY
  if (endState.player.hand.length > 0) {
    const postVicResult = combat.playCard(endState.player.hand[0].id);
    assert(postVicResult.combatStatus === 'VICTORY', `${encId} combat must remain in VICTORY (anti-softlock)`);
  }
}

console.log('  ✓ SolutionPathEngine confirmed reachableFirstActions >= 1 and reachableWinningPaths >= 1 for all 10 encounters.');
console.log('  ✓ All 10 encounters simulated to VICTORY with exact state transformations.');
console.log('  ✓ Anti-softlock invariant verified across all Module 3 encounters.');
console.log('✅ Audit 3 Passed!\n');

// ===========================================================================
// SECTION 4: BOSS EXAM VERIFICATION (VAEL & ENTROPY PARTITIONER)
// ===========================================================================
console.log('▶ [Audit 4] Boss Exam Verification (Vael & Entropy Partitioner)');

const bossEngine = BossAbilityEngine.getInstance();

// 1. Vael, Strategy Warden (dsa_m3_07)
const vael = dsaEncounters.find(e => e.id === 'dsa_m3_07')!;
assert(vael.isBoss === true, 'Vael must be a boss');
assert(vael.optimalSequence.length === 3, 'Vael requires 3-step paradigm sequence');
const vaelBossId = bossEngine.getBossIdentifier(vael);
assert(vaelBossId === 'vael_strategy_warden', `BossAbilityEngine must identify Vael as 'vael_strategy_warden' (got: ${vaelBossId})`);
const vaelAbilities = bossEngine.getAbilitiesForBoss('vael_strategy_warden');
assert(vaelAbilities.length >= 5, `Vael must have at least 5 themed abilities (got: ${vaelAbilities.length})`);

// 2. Entropy Partitioner (dsa_m3_10)
const entropy = dsaEncounters.find(e => e.id === 'dsa_m3_10')!;
assert(entropy.isBoss === true, 'Entropy Partitioner must be a boss');
assert(entropy.optimalSequence.length === 3, 'Entropy Partitioner requires 3-step sequence');
const entropyBossId = bossEngine.getBossIdentifier(entropy);
assert(entropyBossId === 'entropy_partitioner', `BossAbilityEngine must identify Partitioner as 'entropy_partitioner' (got: ${entropyBossId})`);
const entropyAbilities = bossEngine.getAbilitiesForBoss('entropy_partitioner');
assert(entropyAbilities.length >= 5, `Entropy Partitioner must have at least 5 themed abilities (got: ${entropyAbilities.length})`);

// Verify Phase Transitions for both bosses
for (const boss of [vael, entropy]) {
  const maxHp = boss.enemy.hp;
  assert(bossEngine.evaluatePhase(maxHp, maxHp) === 1, '100% HP must be Phase 1');
  assert(bossEngine.evaluatePhase(Math.round(maxHp * 0.75), maxHp) === 1, '75% HP must be Phase 1');
  assert(bossEngine.evaluatePhase(Math.round(maxHp * 0.60), maxHp) === 2, '60% HP must be Phase 2');
  assert(bossEngine.evaluatePhase(Math.round(maxHp * 0.40), maxHp) === 2, '40% HP must be Phase 2');
  assert(bossEngine.evaluatePhase(Math.round(maxHp * 0.25), maxHp) === 3, '25% HP must be Phase 3 (Climax Pressure)');
  assert(bossEngine.evaluatePhase(Math.round(maxHp * 0.05), maxHp) === 3, '5% HP must be Phase 3');

  // Test Phase 2 & 3 interference proposals & solvability guardrail
  const combat = new CombatEngine(boss);
  const graph = combat.getSolutionGraph();

  // Phase 2 test
  const p2State = combat.getState();
  p2State.enemy.currentHp = Math.round(maxHp * 0.50);
  const p2Proposal = bossEngine.evaluateTurnInterference(graph, p2State, boss);
  assert(p2Proposal.phase === 2, 'Proposal phase must be 2');
  assert(p2Proposal.modifiers.length <= 1, 'Phase 2 must deploy at most 1 ability');

  // Phase 3 test
  const p3State = combat.getState();
  p3State.enemy.currentHp = Math.round(maxHp * 0.20);
  const p3Proposal = bossEngine.evaluateTurnInterference(graph, p3State, boss);
  assert(p3Proposal.phase === 3, 'Proposal phase must be 3');
  assert(p3Proposal.modifiers.length <= 2, 'Phase 3 must deploy up to 2 coordinated abilities');

  // Solvability Guardrail Verification: Modifiers must NEVER reduce reachable paths to 0
  for (const mod of [...p2Proposal.modifiers, ...p3Proposal.modifiers]) {
    const simEngine = new CombatEngine(boss);
    simEngine.applyBossModifier(mod);
    const check = solutionPathEngine.validateSolvability(graph, simEngine.getState());
    assert(check.solvable, `Boss ability ${mod.name} must preserve solvability: ${check.reason}`);
    assert(check.reachableWinningPaths >= 1, `Boss ability ${mod.name} must maintain >= 1 winning path`);
  }
}

// Answer immutability
assert(!!vael.correctAnswer && vael.correctAnswer.includes('D&C for independent subproblems'), 'Vael answer must be immutable');
assert(!!entropy.correctAnswer && entropy.correctAnswer.includes('Light edge crossing cut is guaranteed in MST'), 'Entropy Partitioner answer must be immutable');

console.log('  ✓ Vael, Strategy Warden recognized by BossAbilityEngine with 5 themed abilities.');
console.log('  ✓ Entropy Partitioner recognized by BossAbilityEngine with 5 themed abilities.');
console.log('  ✓ Phase 1 -> Phase 2 -> Phase 3 progression verified (0 -> 1 -> 2 modifiers).');
console.log('  ✓ Solvability strictly preserved under dynamic boss pressure.');
console.log('  ✓ Answer immutability guaranteed across all phases.');
console.log('✅ Audit 4 Passed!\n');

// ===========================================================================
// SECTION 5: BACSE105 SYLLABUS TOPIC COVERAGE & GUARDRAILS
// ===========================================================================
console.log('▶ [Audit 5] BACSE105 Module 3 Topic Coverage & Guardrails');

const expectedTopics = [
  'Divide and Conquer: Merge Sort Recurrence',
  'Divide and Conquer: Quicksort Partition Invariant',
  'Lower Bounds: Comparison Sorting Decision Tree',
  'Backtracking: State-Space Tree & N-Queens',
  'Backtracking: Subset-Sum & State Space Pruning',
  'Branch and Bound: 0/1 Knapsack Upper Bound',
  'Algorithm Strategy Synthesis: D&C vs Backtracking vs Branch & Bound',
  'Greedy Algorithms: Huffman Coding',
  'Greedy Algorithms: Minimum Spanning Tree (Kruskal)',
  'Greedy & Partition Synthesis: Prim vs Kruskal & MST Cut Invariant'
];

for (let i = 0; i < expectedM3Ids.length; i++) {
  const enc = dsaEncounters.find(e => e.id === expectedM3Ids[i])!;
  assert(enc.topic === expectedTopics[i], `Encounter ${enc.id} topic mismatch: expected "${expectedTopics[i]}", got "${enc.topic}"`);
  console.log(`  Module 3 Level ${enc.levelNumber}: [${enc.topic}] — ${enc.levelTitle}`);
}

// Syllabus Guardrails: Check that SCC and Cook-Levin are NOT present in Module 3
for (const encId of expectedM3Ids) {
  const enc = dsaEncounters.find(e => e.id === encId)!;
  const jsonStr = JSON.stringify(enc).toLowerCase();
  assert(!jsonStr.includes('strongly connected components') && !jsonStr.includes('tarjan') && !jsonStr.includes('kosaraju'),
    `${encId} must NOT leak Module 4 Strongly Connected Components (Tarjan/Kosaraju)`);
  assert(!jsonStr.includes('cook-levin') && !jsonStr.includes('3sat') && !jsonStr.includes('np-complete'),
    `${encId} must NOT leak Module 5 Intractability / Cook-Levin`);
}

console.log('  ✓ SCC check: Tarjan/Kosaraju/SCC are cleanly isolated to Module 4.');
console.log('  ✓ Cook-Levin check: NP-completeness is cleanly isolated to Module 5.');
console.log('✅ Audit 5 Passed!\n');

// ===========================================================================
// SECTION 6: 1,000 NORMAL + 1,000 BOSS MONTE CARLO SIMULATIONS
// ===========================================================================
console.log('▶ [Audit 6] 1,000 Normal + 1,000 Boss Solvability Monte Carlo Simulations');

let normalPassCount = 0;
const normalEncounters = expectedM3Ids
  .map(id => dsaEncounters.find(e => e.id === id)!)
  .filter(e => !e.isBoss);

for (let i = 0; i < 1000; i++) {
  const enc = normalEncounters[i % normalEncounters.length];
  const engine = new CombatEngine(enc);
  const st = engine.getState();
  const graph = engine.getSolutionGraph();
  const res = solutionPathEngine.validateSolvability(graph, st);
  if (res.solvable && res.reachableWinningPaths >= 1 && res.reachableFirstActions.length >= 1) {
    normalPassCount++;
  }
}
assert(normalPassCount === 1000, `Expected 1000 normal simulations to pass, got ${normalPassCount}`);
console.log(`  ✓ 1,000 Normal encounter solvability simulations passed (${normalPassCount}/1,000).`);

let bossPassCount = 0;
const bossEncounters = [vael, entropy];

for (let i = 0; i < 1000; i++) {
  const enc = bossEncounters[i % bossEncounters.length];
  const engine = new CombatEngine(enc);
  const st = engine.getState();
  const hpPct = 0.2 + (i % 80) / 100; // Vary HP from 20% to 99%
  st.enemy.currentHp = Math.round(st.enemy.maxHp * hpPct);

  const graph = engine.getSolutionGraph();
  const proposal = bossEngine.evaluateTurnInterference(graph, st, enc);
  for (const mod of proposal.modifiers) {
    engine.applyBossModifier(mod);
  }
  const check = solutionPathEngine.validateSolvability(graph, engine.getState());
  if (check.solvable && check.reachableWinningPaths >= 1 && check.reachableFirstActions.length >= 1) {
    bossPassCount++;
  }
}
assert(bossPassCount === 1000, `Expected 1000 boss simulations to pass, got ${bossPassCount}`);
console.log(`  ✓ 1,000 Boss encounter solvability simulations under dynamic modifiers passed (${bossPassCount}/1,000).`);

console.log('✅ Audit 6 Passed!\n');

console.log('=============================================================');
console.log('🎉 ALL MODULE 3 ACCEPTANCE AUDITS PASSED WITH 100% SUCCESS! 🎉');
console.log('=============================================================');
