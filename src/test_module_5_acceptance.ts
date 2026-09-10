import { ALL_SUBJECTS, ENCOUNTERS_MAP, ECHO_VAULTS_MAP } from './curriculum/registry';
import { StorageManager } from './persistence/StorageManager';
import { CombatEngine } from './engine/CombatEngine';
import { solutionPathEngine } from './engine/SolutionPathEngine';
import { BossAbilityEngine } from './engine/BossAbilityEngine';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

console.log('=============================================================');
console.log('🛡️ ALGO-SPIRE — MODULE 5 ACCEPTANCE AUDIT & REALM COMPLETION');
console.log('=============================================================\n');

const dsaEncounters = ENCOUNTERS_MAP.data_structures_algorithms;
const dsaSubject = ALL_SUBJECTS.data_structures_algorithms;
const bossEngine = BossAbilityEngine.getInstance();

const expectedM5Ids = [
  'dsa_m5_01',
  'dsa_m5_02',
  'dsa_m5_03',
  'dsa_m5_04',
  'dsa_m5_05',
  'dsa_m5_06',
  'dsa_m5_07',
  'dsa_m5_08',
  'dsa_m5_09',
  'dsa_m5_10',
];

// ===========================================================================
// SECTION 1: MODULE 5 STRUCTURE, PROGRESSION & REALM COMPLETION (54/54)
// ===========================================================================
console.log('▶ [Audit 1] Module 5 Structure, Progression & Realm Completion');

// 1. Verify exactly 10 Module 5 encounters
const m5Encounters = dsaEncounters.filter(e => expectedM5Ids.includes(e.id));
assert(m5Encounters.length === 10, `Expected exactly 10 Module 5 encounters, found ${m5Encounters.length}`);

// 2. Verify all previous modules remain intact
const m1Encounters = dsaEncounters.filter(e => e.id.startsWith('dsa_m1_'));
const m2Encounters = dsaEncounters.filter(e => e.id.startsWith('dsa_m2_'));
const m3Encounters = dsaEncounters.filter(e => e.id.startsWith('dsa_m3_'));
const m4Encounters = dsaEncounters.filter(e => e.id.startsWith('dsa_m4_'));
assert(m1Encounters.length === 10, `Module 1 must have 10 encounters, found ${m1Encounters.length}`);
assert(m2Encounters.length === 14, `Module 2 must have 14 encounters, found ${m2Encounters.length}`);
assert(m3Encounters.length === 10, `Module 3 must have 10 encounters, found ${m3Encounters.length}`);
assert(m4Encounters.length === 10, `Module 4 must have 10 encounters, found ${m4Encounters.length}`);

// 3. Verify total active progression = 54/54 encounters (100% COMPLETE!)
const mainPathTotal = m1Encounters.length + m2Encounters.length + m3Encounters.length + m4Encounters.length + m5Encounters.length;
const mainLevels = dsaSubject.levels.filter(l => l.pathType !== 'hidden_trial');
assert(mainLevels.length === 54, `DSA_SUBJECT_INFO.levels must have exactly 54 main levels (found: ${mainLevels.length})`);

// 4. Verify level numbering 45–54
for (let i = 0; i < expectedM5Ids.length; i++) {
  const encId = expectedM5Ids[i];
  const expectedLevel = 45 + i;
  const enc = dsaEncounters.find(e => e.id === encId);
  assert(!!enc, `Encounter ${encId} must exist in ENCOUNTERS_MAP.data_structures_algorithms`);
  assert(enc.levelNumber === expectedLevel, `Encounter ${encId} must have levelNumber ${expectedLevel} (got ${enc.levelNumber})`);
  assert(enc.subject === 'data_structures_algorithms', `Encounter ${encId} subject must be 'data_structures_algorithms'`);
  assert(enc.pathType === 'main', `Encounter ${encId} pathType must be 'main'`);
}

// 5. Verify DSA_SUBJECT_INFO sequential gating
for (let i = 0; i < mainLevels.length; i++) {
  const levelNode = mainLevels[i];
  assert(levelNode.levelNumber === i + 1, `Level node index ${i} must have levelNumber ${i + 1}`);
  if (i > 0) {
    assert(levelNode.requiredCompletedLevel === i, `Level ${levelNode.levelNumber} must require completed level ${i}`);
  }
}

// 6. Verify legacy dsa_boss alias
const dsaBossAlias = dsaEncounters.find(e => e.id === 'dsa_boss');
assert(!!dsaBossAlias, 'Legacy compatibility alias dsa_boss must exist in dsaEncounters');
assert(dsaBossAlias.levelNumber === 54, 'dsa_boss alias must map to Level 54');

console.log('  ✓ Exactly 10 Module 5 encounters confirmed (Levels 45–54).');
console.log('  ✓ Modules 1–4 completely intact (10 + 14 + 10 + 10 = 44 levels).');
console.log('  ✓ DSA Realm is 100% complete with 54/54 main-path encounters.');
console.log('  ✓ Sequential prerequisite gating verified across all 54 levels.');
console.log('  ✓ Legacy dsa_boss alias safely points to Level 54.');
console.log('✅ [Audit 1 Passed]\n');

// ===========================================================================
// SECTION 2: STORAGEMANAGER GATING & CONTEXT ISOLATION
// ===========================================================================
console.log('▶ [Audit 2] StorageManager Gating & Context Isolation');

const profile = StorageManager.createInitialProfile();

// Fresh profile should have Level 1 unlocked, Level 45 locked
assert(StorageManager.isLevelUnlocked('data_structures_algorithms', 'dsa_m1_01', profile) === true, 'Level 1 must be unlocked by default');
assert(StorageManager.isLevelUnlocked('data_structures_algorithms', 'dsa_m5_01', profile) === false, 'dsa_m5_01 must be locked on fresh profile');

// Simulate clearing Levels 1..44
profile.clearedLevels['data_structures_algorithms'] = Array.from({ length: 44 }, (_, i) => i + 1);

// Level 45 should now unlock
assert(StorageManager.isLevelUnlocked('data_structures_algorithms', 'dsa_m5_01', profile) === true, 'dsa_m5_01 must unlock when Level 44 is cleared');
assert(StorageManager.isLevelUnlocked('data_structures_algorithms', 'dsa_m5_02', profile) === false, 'dsa_m5_02 must remain locked until Level 45 is cleared');

// Step through Module 5 unlocks sequentially
for (let lvl = 45; lvl <= 53; lvl++) {
  const nextId = `dsa_m5_${String(lvl - 44 + 1).padStart(2, '0')}`;
  assert(StorageManager.isLevelUnlocked('data_structures_algorithms', nextId, profile) === false, `${nextId} must be locked before clearing level ${lvl}`);
  profile.clearedLevels['data_structures_algorithms'].push(lvl);
  assert(StorageManager.isLevelUnlocked('data_structures_algorithms', nextId, profile) === true, `${nextId} must unlock after clearing level ${lvl}`);
}

// Check final boss unlock
assert(StorageManager.isLevelUnlocked('data_structures_algorithms', 'dsa_m5_10', profile) === true, 'dsa_m5_10 must be unlocked after clearing Level 53');
assert(StorageManager.isLevelUnlocked('data_structures_algorithms', 'dsa_boss', profile) === true, 'dsa_boss alias must also be unlocked after clearing Level 53');

console.log('  ✓ StorageManager sequential modular gating verified across Levels 45–54.');
console.log('  ✓ Both dsa_m5_10 and dsa_boss unlock cleanly when Level 53 is cleared.');
console.log('✅ [Audit 2 Passed]\n');

// ===========================================================================
// SECTION 3: SOLUTIONPATHENGINE & 100% SOLVABILITY GUARANTEE
// ===========================================================================
console.log('▶ [Audit 3] SolutionPathEngine & 100% Solvability Guarantee');

for (const encId of expectedM5Ids) {
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
}

console.log('  ✓ All 10 Module 5 encounters are 100% solvable with valid opening cards and winning paths.');
console.log('  ✓ All 10 encounters simulated through CombatEngine to VICTORY with 0 failures.');
console.log('✅ [Audit 3 Passed]\n');

// ===========================================================================
// SECTION 4: BOSS ABILITY ENGINE & MULTI-PHASE COMBAT
// ===========================================================================
console.log('▶ [Audit 4] Boss Ability Engine & Multi-Phase Combat');

const miniBoss = dsaEncounters.find(e => e.id === 'dsa_m5_06')!;
const finalBoss = dsaEncounters.find(e => e.id === 'dsa_m5_10')!;

// 1. Mini-Boss Check
assert(miniBoss.isBoss === true, 'dsa_m5_06 must have isBoss: true');
const miniBossId = bossEngine.getBossIdentifier(miniBoss);
assert(miniBossId === 'intractability_sovereign', `dsa_m5_06 must resolve to intractability_sovereign (got: ${miniBossId})`);
const miniAbilities = bossEngine.getAbilitiesForBoss('intractability_sovereign');
assert(miniAbilities.length >= 5, `intractability_sovereign must have >= 5 abilities (got: ${miniAbilities.length})`);

// 2. Final Boss Check
assert(finalBoss.isBoss === true, 'dsa_m5_10 must have isBoss: true');
const finalBossId = bossEngine.getBossIdentifier(finalBoss);
assert(finalBossId === 'dsa_turing_archon', `dsa_m5_10 must resolve to dsa_turing_archon (got: ${finalBossId})`);
const finalAbilities = bossEngine.getAbilitiesForBoss('dsa_turing_archon');
assert(finalAbilities.length >= 5, `dsa_turing_archon must have >= 5 abilities (got: ${finalAbilities.length})`);

// 3. Verify phase evaluation and modifier safety
for (const boss of [miniBoss, finalBoss]) {
  const maxHp = boss.enemy.hp;
  assert(bossEngine.evaluatePhase(maxHp, maxHp) === 1, '100% HP must be Phase 1');
  assert(bossEngine.evaluatePhase(Math.round(maxHp * 0.75), maxHp) === 1, '75% HP must be Phase 1');
  assert(bossEngine.evaluatePhase(Math.round(maxHp * 0.60), maxHp) === 2, '60% HP must be Phase 2');
  assert(bossEngine.evaluatePhase(Math.round(maxHp * 0.40), maxHp) === 2, '40% HP must be Phase 2');
  assert(bossEngine.evaluatePhase(Math.round(maxHp * 0.25), maxHp) === 3, '25% HP must be Phase 3');

  const combat = new CombatEngine(boss);
  const graph = combat.getSolutionGraph();

  // Phase 2 proposal
  const p2State = combat.getState();
  p2State.enemy.currentHp = Math.round(maxHp * 0.50);
  const p2Proposal = bossEngine.evaluateTurnInterference(graph, p2State, boss);
  assert(p2Proposal.phase === 2, 'Proposal phase must be 2');
  assert(p2Proposal.modifiers.length <= 1, 'Phase 2 must deploy at most 1 ability');

  // Phase 3 proposal
  const p3State = combat.getState();
  p3State.enemy.currentHp = Math.round(maxHp * 0.20);
  const p3Proposal = bossEngine.evaluateTurnInterference(graph, p3State, boss);
  assert(p3Proposal.phase === 3, 'Proposal phase must be 3');
  assert(p3Proposal.modifiers.length <= 2, 'Phase 3 must deploy up to 2 abilities');

  // Solvability Guardrail
  for (const mod of [...p2Proposal.modifiers, ...p3Proposal.modifiers]) {
    const simEngine = new CombatEngine(boss);
    simEngine.applyBossModifier(mod);
    const check = solutionPathEngine.validateSolvability(graph, simEngine.getState());
    assert(check.solvable, `Boss ability ${mod.name} must preserve solvability: ${check.reason}`);
    assert(check.reachableWinningPaths >= 1, `Boss ability ${mod.name} must maintain >= 1 winning path`);
  }
}

console.log('  ✓ Mini-Boss (Level 50: The Intractability Sovereign) registered with 5 themed abilities.');
console.log('  ✓ Final Boss (Level 54: The Turing Archon) registered with 5 themed abilities.');
console.log('  ✓ Multi-phase transitions and boss abilities validated without violating solvability.');
console.log('✅ [Audit 4 Passed]\n');

// ===========================================================================
// SECTION 5: BACSE105 SYLLABUS TOPIC COVERAGE & GUARDRAILS
// ===========================================================================
console.log('▶ [Audit 5] BACSE105 Syllabus Topic Coverage & Guardrails');

const expectedTopics = [
  { id: 'dsa_m5_01', keyword: 'verification' },
  { id: 'dsa_m5_02', keyword: 'reduction' },
  { id: 'dsa_m5_03', keyword: 'sat' },
  { id: 'dsa_m5_04', keyword: 'independent set' },
  { id: 'dsa_m5_05', keyword: 'clique' },
  { id: 'dsa_m5_06', keyword: 'np-completeness' },
  { id: 'dsa_m5_07', keyword: 'approximation' },
  { id: 'dsa_m5_08', keyword: 'vertex cover' },
  { id: 'dsa_m5_09', keyword: 'tsp' },
  { id: 'dsa_m5_10', keyword: 'synthesis' },
];

for (const exp of expectedTopics) {
  const enc = dsaEncounters.find(e => e.id === exp.id);
  assert(!!enc, `Encounter ${exp.id} must exist`);
  const combinedText = `${enc.topic} ${enc.conceptName} ${enc.objective} ${enc.problemStatement}`.toLowerCase();
  assert(combinedText.includes(exp.keyword), `Encounter ${exp.id} must cover topic containing '${exp.keyword}'`);
}

// Verify Module 5 Firewall (no unauthorized topics)
const forbiddenTerms = ['pcp theorem', 'pspace', 'quantum complexity', 'randomized rounding', 'derandomization'];
for (const enc of m5Encounters) {
  const combined = JSON.stringify(enc).toLowerCase();
  for (const term of forbiddenTerms) {
    assert(!combined.includes(term), `Encounter ${enc.id} contains forbidden out-of-syllabus term: ${term}`);
  }
}

console.log('  ✓ All 10 Module 5 encounters cover required BACSE105 syllabus topics.');
console.log('  ✓ Module 5 Firewall strictly verified: zero out-of-scope topics detected.');
console.log('✅ [Audit 5 Passed]\n');

// ===========================================================================
// SECTION 6: ECHO VAULT REGISTRATION & REMEDIATION
// ===========================================================================
console.log('▶ [Audit 6] Module 5 Echo Vault (The Intractability Chamber)');

const m5Vault = ECHO_VAULTS_MAP['vault_dsa_complexity'];
assert(!!m5Vault, 'vault_dsa_complexity must be registered in ECHO_VAULTS_MAP');
assert(m5Vault.id === 'vault_dsa_complexity', 'Echo vault ID must be vault_dsa_complexity');
assert(m5Vault.subject === 'data_structures_algorithms', 'Echo vault subject must be data_structures_algorithms');
assert(m5Vault.steps.length === 3, 'Echo vault must have exactly 3 remediation steps');

for (let s = 0; s < m5Vault.steps.length; s++) {
  const step = m5Vault.steps[s];
  assert(step.stepNumber === s + 1, `Step ${s} number must be ${s + 1}`);
  assert(step.instruction.length > 10, `Step ${s} must have clear instruction`);
  assert(step.options.length >= 2, `Step ${s} must have >= 2 options`);
  const correctOptions = step.options.filter(o => o.isCorrect);
  assert(correctOptions.length === 1, `Step ${s} must have exactly 1 correct option`);
  assert(correctOptions[0].feedback.length > 10, `Step ${s} correct option must have feedback`);
}

console.log('  ✓ vault_dsa_complexity properly registered in ECHO_VAULTS_MAP.');
console.log('  ✓ 3-step remediation structure verified with explanations and feedback.');
console.log('✅ [Audit 6 Passed]\n');

console.log('🎉 ALL 6 AUDITS PASSED! DSA MODULE 5 & 54-STAGE REALM VERIFIED! (100% COMPLETE)\n');
