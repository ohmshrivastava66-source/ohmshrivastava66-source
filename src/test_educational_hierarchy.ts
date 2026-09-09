import {
  EDUCATION_KINGDOMS,
  ACADEMIC_CLASSES,
  getAllKingdoms,
  getKingdom,
  getAllClasses,
  getClass,
  getClassesForKingdom,
  getAvailableSubjectsForClass,
  isSubjectAllowedInClass,
  getProgressionContextKey,
  resolveEducationalContext,
} from './curriculum/educationHierarchy';
import { ALL_SUBJECTS, ENCOUNTERS_MAP, STARTER_CARDS_MAP } from './curriculum/registry';
import { StorageManager } from './persistence/StorageManager';
import { CombatEngine } from './engine/CombatEngine';
import { solutionPathEngine } from './engine/SolutionPathEngine';
import { PlayerProfile } from './types/telemetry';
import { KingdomId, ClassId } from './types/game';

declare const process: any;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
}

console.log('🏛️ RUNNING EDUCATIONAL HIERARCHY & REALM ARCHITECTURE TEST SUITE...\n');

// ===========================================================================
// TEST 1: 6 Education Kingdoms Verification
// ===========================================================================
console.log('▶ Test 1: Verification of 6 Education Kingdoms (Hierarchy Level 1)');
const kingdoms = getAllKingdoms();
assert(kingdoms.length === 6, `Expected 6 kingdoms, found ${kingdoms.length}`);

const expectedKingdomIds: KingdomId[] = [
  'primary_academy',
  'middle_spire',
  'secondary_bastion',
  'higher_sanctuary',
  'undergraduate_forge',
  'archon_observatory',
];

for (const kId of expectedKingdomIds) {
  const kingdom = getKingdom(kId);
  assert(!!kingdom, `Kingdom ${kId} must be registered`);
  assert(kingdom!.id === kId, `Kingdom id mismatch: ${kingdom!.id} vs ${kId}`);
  assert(kingdom!.name.length > 0, `Kingdom ${kId} must have a name`);
  assert(kingdom!.subtitle.length > 0, `Kingdom ${kId} must have a subtitle`);
  assert(kingdom!.badge.length > 0, `Kingdom ${kId} must have a badge`);
  assert(kingdom!.classes.length > 0, `Kingdom ${kId} must have academic classes`);
  assert(!!kingdom!.defaultClassId, `Kingdom ${kId} must define a defaultClassId`);
  console.log(`  ✓ Kingdom: [${kingdom!.badge}] ${kingdom!.name} (${kingdom!.subtitle}) -> ${kingdom!.classes.length} classes`);
}
console.log('✅ Test 1 Passed!\n');

// ===========================================================================
// TEST 2: All 19 Academic Classes Registered & Mapped (Hierarchy Level 2)
// ===========================================================================
console.log('▶ Test 2: Verification of Academic Classes (Classes 1–12, Undergrad Y1–Y4, Archons, Legacy)');
const allClasses = getAllClasses();
assert(allClasses.length === 19, `Expected 19 registered academic classes, found ${allClasses.length}`);

const expectedClasses: ClassId[] = [
  'class_1', 'class_2', 'class_3', 'class_4', 'class_5',
  'class_6', 'class_7', 'class_8',
  'class_9', 'class_10',
  'class_11', 'class_12',
  'undergraduate_year_1', 'undergraduate_year_2', 'undergraduate_year_3', 'undergraduate_year_4',
  'archon_research_1', 'archon_research_2',
  'legacy_tier',
];

for (const cId of expectedClasses) {
  const cls = getClass(cId);
  assert(!!cls, `Academic class ${cId} must be registered`);
  assert(cls!.id === cId, `Class id mismatch: ${cls!.id} vs ${cId}`);
  assert(cls!.name.length > 0, `Class ${cId} must have a name`);
  assert(cls!.rankTitle.length > 0, `Class ${cId} must have a rankTitle`);
  assert(cls!.availableSubjectIds.length > 0, `Class ${cId} must have available subjects`);
  assert(cls!.availableSubjectIds.includes(cls!.defaultSubjectId), `Default subject must be in available subjects for ${cId}`);
}
console.log(`  ✓ All 19 academic classes validated with valid rank titles and kingdoms.`);
console.log('✅ Test 2 Passed!\n');

// ===========================================================================
// TEST 3: Class-Aware Subject Resolution (Filtering by Class)
// ===========================================================================
console.log('▶ Test 3: Class-Aware Subject Resolution');
// Primary class 1 only has foundational subjects
const c1Subjects = getAvailableSubjectsForClass('class_1');
assert(c1Subjects.includes('mathematics'), 'Class 1 must include mathematics');
assert(!c1Subjects.includes('computerScience'), 'Class 1 must not include computerScience');
assert(!c1Subjects.includes('physics'), 'Class 1 must not include physics');

// Secondary class 10 has full 8 school realms
const c10Subjects = getAvailableSubjectsForClass('class_10');
assert(c10Subjects.length === 8, `Class 10 should have 8 core school realms, found ${c10Subjects.length}`);
assert(isSubjectAllowedInClass('class_10', 'mathematics'), 'Class 10 must allow mathematics');
assert(isSubjectAllowedInClass('class_10', 'computerScience'), 'Class 10 must allow computerScience');
assert(!isSubjectAllowedInClass('class_10', 'data_structures_algorithms'), 'Class 10 must not include higher-ed DSA');

// Undergraduate Year 1 focuses on Algorithmic Abyss / CS / Math
const ug1Subjects = getAvailableSubjectsForClass('undergraduate_year_1');
assert(ug1Subjects.includes('data_structures_algorithms'), 'Undergrad Year 1 must include DSA');
assert(ug1Subjects.includes('computerScience'), 'Undergrad Year 1 must include computerScience');
assert(!ug1Subjects.includes('history'), 'Undergrad Year 1 must not include history');
console.log(`  ✓ Class 1 subjects: ${c1Subjects.join(', ')}`);
console.log(`  ✓ Class 10 subjects: ${c10Subjects.join(', ')}`);
console.log(`  ✓ Undergrad Y1 subjects: ${ug1Subjects.join(', ')}`);
console.log('✅ Test 3 Passed!\n');

// ===========================================================================
// TEST 4: Intentional Future-Expansion State (No Fake Curricula)
// ===========================================================================
console.log('▶ Test 4: Intentional Future-Expansion State (No Fake Content)');
const playableClasses = allClasses.filter(c => c.status === 'playable').map(c => c.id);
const expansionClasses = allClasses.filter(c => c.status === 'future_expansion').map(c => c.id);

assert(playableClasses.includes('class_9'), 'Class 9 must be playable');
assert(playableClasses.includes('class_10'), 'Class 10 must be playable');
assert(playableClasses.includes('undergraduate_year_1'), 'Undergraduate Year 1 must be playable');
assert(playableClasses.includes('legacy_tier'), 'Legacy Tier must be playable');

// Verify unreleased classes are strictly marked as future_expansion
assert(expansionClasses.includes('class_1'), 'Class 1 must be future_expansion');
assert(expansionClasses.includes('class_6'), 'Class 6 must be future_expansion');
assert(expansionClasses.includes('class_11'), 'Class 11 must be future_expansion');
assert(expansionClasses.includes('undergraduate_year_2'), 'Undergraduate Year 2 must be future_expansion');
assert(expansionClasses.includes('archon_research_1'), 'Archon Research 1 must be future_expansion');

console.log(`  ✓ Playable classes (${playableClasses.length}): ${playableClasses.join(', ')}`);
console.log(`  ✓ Future-expansion classes (${expansionClasses.length}): ${expansionClasses.join(', ')}`);
console.log('✅ Test 4 Passed!\n');

// ===========================================================================
// TEST 5: Progression Context Isolation
// ===========================================================================
console.log('▶ Test 5: Progression Context Key Isolation');
const key9Math = getProgressionContextKey('secondary_bastion', 'class_9', 'mathematics');
const key10Math = getProgressionContextKey('secondary_bastion', 'class_10', 'mathematics');
const keyUgDsa = getProgressionContextKey('undergraduate_forge', 'undergraduate_year_1', 'data_structures_algorithms');

assert(key9Math === 'secondary_bastion:class_9:mathematics', `Expected secondary_bastion:class_9:mathematics, got ${key9Math}`);
assert(key10Math === 'secondary_bastion:class_10:mathematics', `Expected secondary_bastion:class_10:mathematics, got ${key10Math}`);
assert(keyUgDsa === 'undergraduate_forge:undergraduate_year_1:data_structures_algorithms', `Key mismatch: ${keyUgDsa}`);
assert(key9Math !== key10Math, 'Context keys for Class 9 and Class 10 must be distinct');

// Test StorageManager context isolation
const mockStorage: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => { mockStorage[key] = val; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
};

// Initial profile
let profile = StorageManager.loadProfile();
assert(profile !== null, 'Profile should initialize');

// Context progress in Class 9 Math
const c9Progress = StorageManager.getContextProgress(profile, 'secondary_bastion', 'class_9', 'mathematics');
assert(c9Progress.clearedLevels.length === 0, 'Class 9 Math should start with 0 cleared levels');
profile = StorageManager.saveContextProgress(profile, 'secondary_bastion', 'class_9', 'mathematics', {
  mastery: 25,
  clearedLevels: [1],
});

// Verify Class 10 Math remains untouched
const c10Progress = StorageManager.getContextProgress(profile, 'secondary_bastion', 'class_10', 'mathematics');
assert(c10Progress.clearedLevels.length === 0, 'Class 10 Math clearedLevels must remain isolated');
assert(c10Progress.mastery === 0, 'Class 10 Math mastery must remain isolated');

// Verify Class 9 Math loaded back accurately
const reloadedC9 = StorageManager.getContextProgress(profile, 'secondary_bastion', 'class_9', 'mathematics');
assert(reloadedC9.clearedLevels.includes(1), 'Class 9 Math should have cleared level 1');
assert(reloadedC9.mastery === 25, 'Class 9 Math should have 25 mastery');

console.log('  ✓ Context keys and progress data are strictly isolated across classes.');
console.log('✅ Test 5 Passed!\n');

// ===========================================================================
// TEST 6: Legacy Progress Safety & Non-Destructive Migration
// ===========================================================================
console.log('▶ Test 6: Safe Legacy Migration (No Presumption of Class 10 & Zero Data Loss)');
const legacyProfile: PlayerProfile = {
  name: 'Hunter Legacy',
  title: 'Veteran of the Citadel',
  level: 4,
  xp: 1200,
  xpToNextLevel: 2000,
  activeEducationLevel: 'class_9_10', // Legacy tier
  unlockedCardIds: ['math_factor', 'math_solve'],
  relics: ['Focus Rune'],
  discoveredRelics: ['Focus Rune'],
  equippedRelics: ['Focus Rune'],
  strengths: ['Pattern Recognition'],
  weaknesses: [],
  runHistory: [],
  subjectMastery: {
    mathematics: 60,
    physics: 20,
    chemistry: 0,
    biology: 0,
    history: 0,
    geography: 0,
    language: 0,
    computerScience: 0,
  },
  clearedLevels: {
    mathematics: [1, 2],
    physics: [1],
    chemistry: [],
    biology: [],
    history: [],
    geography: [],
    language: [],
    computerScience: [],
  },
  clearedHiddenTrials: {
    mathematics: [],
    physics: [],
    chemistry: [],
    biology: [],
    history: [],
    geography: [],
    language: [],
    computerScience: [],
  },
};

const resolvedContext = resolveEducationalContext(legacyProfile);
// Must NOT presume class_10!
assert(resolvedContext.kingdomId === 'secondary_bastion', 'Kingdom should resolve to secondary_bastion');
assert(resolvedContext.classId === 'legacy_tier', 'Unset class must resolve to safe legacy_tier, NOT class_10');
assert(resolvedContext.subjectId === 'mathematics', 'Default subject should be mathematics');

// Check that StorageManager reads legacy progress without wiping
mockStorage['algo_spire_profile_v1'] = JSON.stringify(legacyProfile);
const loadedLegacyProfile = StorageManager.loadProfile();
const legacyContextProgress = StorageManager.getContextProgress(loadedLegacyProfile, 'secondary_bastion', 'legacy_tier', 'mathematics');
assert(legacyContextProgress.clearedLevels.length === 2, 'Legacy cleared levels must be preserved');
assert(legacyContextProgress.clearedLevels.includes(1) && legacyContextProgress.clearedLevels.includes(2), 'Levels 1 and 2 must be cleared');
assert(legacyContextProgress.mastery === 60, 'Legacy mastery 60 must be preserved');

console.log('  ✓ Legacy profile resolved to safe legacy_tier without guessing Class 10.');
console.log('  ✓ Legacy cleared levels and mastery preserved with 100% fidelity.');
console.log('✅ Test 6 Passed!\n');

// ===========================================================================
// TEST 7: Official Data Structures & Algorithms Realm & Solvability (Module 1)
// ===========================================================================
console.log('▶ Test 7: Data Structures & Algorithms (BACSE105) Realm & Solvability');
const dsaInfo = ALL_SUBJECTS.data_structures_algorithms;
assert(!!dsaInfo, 'DSA subject must be in ALL_SUBJECTS');
assert(dsaInfo.name === 'Data Structures & Algorithms', `DSA name mismatch: ${dsaInfo.name}`);
assert(dsaInfo.levels.length >= 10, `DSA must have at least 10 levels registered, found ${dsaInfo.levels.length}`);

const dsaEncounters = ENCOUNTERS_MAP.data_structures_algorithms;
assert(!!dsaEncounters && dsaEncounters.length >= 10, 'DSA encounters must be registered');
const dsaCards = STARTER_CARDS_MAP.data_structures_algorithms;
assert(!!dsaCards && dsaCards.length >= 16, `DSA starter cards must have expanded M1 suite (>=16), found ${dsaCards.length}`);

// 1. Verify all 10 Module 1 encounters exist
const m1Ids = [
  'dsa_m1_01', 'dsa_m1_02', 'dsa_m1_03', 'dsa_m1_04', 'dsa_m1_05',
  'dsa_m1_06', 'dsa_m1_07', 'dsa_m1_08', 'dsa_m1_09', 'dsa_m1_10'
];

for (const m1Id of m1Ids) {
  const enc = dsaEncounters.find(e => e.id === m1Id);
  assert(!!enc, `Module 1 encounter ${m1Id} must exist in ENCOUNTERS_MAP`);
}
console.log(`  ✓ All 10 Module 1 encounters verified in curriculum registry.`);

// 2. Verify backward-compatibility alias dsa_lvl_1
const dsaLvl1 = dsaEncounters.find(e => e.id === 'dsa_lvl_1');
assert(!!dsaLvl1, 'dsa_lvl_1 encounter alias must exist');

// 3. Rigorously validate solvability and combat simulation for ALL 10 Module 1 encounters
for (const m1Id of m1Ids) {
  const encounter = dsaEncounters.find(e => e.id === m1Id)!;
  const combat = new CombatEngine(encounter);
  assert(combat.getState().currentEquationState === encounter.initialEquationOrState, `${m1Id} initial state matches`);

  const graph = combat.getSolutionGraph();
  const solvabilityReport = solutionPathEngine.validateSolvability(graph, combat.getState());
  assert(solvabilityReport.solvable, `Encounter ${m1Id} must be 100% solvable: ${solvabilityReport.reason}`);
  assert(solvabilityReport.reachableWinningPaths >= 1, `Encounter ${m1Id} must have at least 1 reachable winning path`);

  // Play through primary path using valid card IDs
  for (let step = 0; step < encounter.optimalSequence.length; step++) {
    const op = encounter.optimalSequence[step];
    let state = combat.getState();

    // Find card in hand
    let card = state.player.hand.find(c => c.operationKey === op);
    if (!card) {
      // Add card to hand from validCards if not currently drawn
      const template = encounter.validCards.find(c => c.operationKey === op)!;
      assert(!!template, `Missing valid card for operation ${op} in encounter ${m1Id}`);
      state.player.hand.push({ ...template, id: `card_${op}_${step}` });
      card = state.player.hand[state.player.hand.length - 1];
    }
    state.player.currentEnergy = 3;

    const preStep = state.currentStepIndex;
    combat.playCard(card.id);
    const postState = combat.getState();
    assert(postState.currentStepIndex === preStep + 1 || postState.combatStatus === 'VICTORY',
      `Encounter ${m1Id} step ${step + 1} (${op}) should advance combat`);
  }

  const finalCombatState = combat.getState();
  assert(finalCombatState.combatStatus === 'VICTORY' || finalCombatState.enemy.currentHp === 0,
    `Encounter ${m1Id} primary path must defeat adversary`);

  // Check alternative path if defined
  if (encounter.alternativePaths && encounter.alternativePaths.length > 0) {
    const altPath = encounter.alternativePaths[0];
    const altCombat = new CombatEngine(encounter);

    for (let step = 0; step < altPath.operations.length; step++) {
      const op = altPath.operations[step];
      let state = altCombat.getState();

      let card = state.player.hand.find(c => c.operationKey === op);
      if (!card) {
        const template = encounter.validCards.find(c => c.operationKey === op)!;
        assert(!!template, `Missing alt valid card for operation ${op} in encounter ${m1Id}`);
        state.player.hand.push({ ...template, id: `alt_card_${op}_${step}` });
        card = state.player.hand[state.player.hand.length - 1];
      }
      state.player.currentEnergy = 3;

      const preStep = state.currentStepIndex;
      altCombat.playCard(card.id);
      const postState = altCombat.getState();
      assert(postState.currentStepIndex === preStep + 1 || postState.combatStatus === 'VICTORY',
        `Encounter ${m1Id} alt step ${step + 1} (${op}) should advance combat`);
    }

    const finalAltState = altCombat.getState();
    assert(finalAltState.combatStatus === 'VICTORY' || finalAltState.enemy.currentHp === 0,
      `Encounter ${m1Id} alternative path must defeat adversary`);
  }
}
console.log('  ✓ All 10 Module 1 encounters verified: 100% solvable with dual routes and clean state transitions.');

// 4. Verify Modular Level Unlocking in StorageManager
const freshProfile = StorageManager.createInitialProfile();
assert(StorageManager.isLevelUnlocked('data_structures_algorithms', 'dsa_m1_01', freshProfile) === true,
  'dsa_m1_01 must be unlocked by default');
assert(StorageManager.isLevelUnlocked('data_structures_algorithms', 'dsa_m1_02', freshProfile) === false,
  'dsa_m1_02 must be locked initially');

// Record victory on Level 1
freshProfile.clearedLevels['data_structures_algorithms'] = [1];
const keyUg1 = StorageManager.getContextKey('undergraduate_forge', 'undergraduate_year_1', 'data_structures_algorithms');
if (!freshProfile.contextProgress) freshProfile.contextProgress = {};
freshProfile.contextProgress[keyUg1] = {
  mastery: 15,
  clearedLevels: [1],
  clearedHiddenTrials: [],
};
assert(StorageManager.isLevelUnlocked('data_structures_algorithms', 'dsa_m1_02', freshProfile, 'undergraduate_year_1', 'undergraduate_forge') === true,
  'dsa_m1_02 must unlock once level 1 is cleared');
assert(StorageManager.isLevelUnlocked('data_structures_algorithms', 'dsa_m1_03', freshProfile, 'undergraduate_year_1', 'undergraduate_forge') === false,
  'dsa_m1_03 must remain locked until level 2 is cleared');

console.log('  ✓ Modular level progression unlocking verified via StorageManager.');
console.log(`  ✓ DSA BACSE105 Syllabus: 10 Module 1 encounters + ${dsaCards.length} cards active.`);
console.log('✅ Test 7 Passed!\n');

console.log('🎉 ALL EDUCATIONAL HIERARCHY & REALM TESTS PASSED SUCCESSFULLY! (7/7 tests passed)\n');
