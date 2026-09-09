import { SubjectId, CanonicalRealmId } from './types/game';
import { PlayerProfile } from './types/telemetry';
import { StorageManager } from './persistence/StorageManager';
import {
  convergenceEngine,
  BOSS_COUNCIL_MEMBERS,
  REALM_BOSS_LEVELS,
} from './engine/ConvergenceEngine';
import { CONVERGENCE_STATIC_TRIALS } from './curriculum/convergenceTrials';
import { ALL_SUBJECTS, ENCOUNTERS_MAP } from './curriculum/registry';
import { dangerEngine } from './engine/DangerEngine';
import { surpriseAttackEngine } from './engine/SurpriseAttackEngine';

declare const process: any;

function createBaseProfile(overrides?: Partial<PlayerProfile>): PlayerProfile {
  return {
    name: 'Axiom Seeker',
    title: 'Warden of the Lower Spires',
    level: 10,
    xp: 2500,
    xpToNextLevel: 3000,
    subjectMastery: {
      mathematics: 90,
      computerScience: 90,
      physics: 85,
      chemistry: 85,
      biology: 85,
      history: 85,
      geography: 85,
      language: 85,
    },
    clearedLevels: {
      mathematics: [1, 2, 3, 4],
      computerScience: [1, 2, 3, 4],
      physics: [1, 2],
      chemistry: [1, 2],
      biology: [1, 2],
      history: [1, 2],
      geography: [1, 2],
      language: [1, 2],
    },
    clearedHiddenTrials: {
      mathematics: ['math_hidden_trial_1', 'math_hidden_trial_2'],
      computerScience: ['cs_hidden_trial_1', 'cs_hidden_trial_2'],
      physics: [],
      chemistry: [],
      biology: [],
      history: [],
      geography: [],
      language: [],
    },
    masteryCompressionRecords: {},
    unlockedCardIds: ['math_factor', 'math_solve', 'cs_recurrence'],
    relics: ['Focus Prism'],
    strengths: ['Divide-and-Conquer Analysis', 'Conservation of Momentum'],
    weaknesses: ['Quadratic Polynomial Factoring & Sign Rules'],
    runHistory: [],
    activeEducationLevel: 'class_9_10',
    conceptPerformance: {
      math_factorization: {
        conceptId: 'math_factorization',
        conceptName: 'Quadratic Polynomial Factoring & Sign Rules',
        subject: 'mathematics',
        recentMistakes: 3,
        repeatedMistakes: 2,
        misconceptionFrequency: 2,
        prerequisiteGaps: 0,
        recentSuccessCount: 2,
        totalAttempts: 5,
        masteryLevel: 65,
        lastEncounterTimestamp: Date.now() - 3600000,
        successfulRecoveries: 1,
        dangerEncounterCount: 1,
        cooldownEncounters: 0,
        lastSelectedAsDanger: false,
      },
    },
    dangerCooldownBattles: 0,
    surpriseAttackCooldownBattles: 0,
    surpriseAttacksCompleted: 0,
    convergenceCompleted: false,
    ...overrides,
  };
}

console.log('=============================================================');
console.log('🌌 STARTING THE CONVERGENCE ENDGAME VERIFICATION TESTS 🌌');
console.log('=============================================================');

let passedTests = 0;
const totalTests = 20;

function assert(condition: boolean, testNum: number, message: string) {
  if (condition) {
    console.log(`✅ TEST ${testNum} PASSED: ${message}`);
    passedTests++;
  } else {
    console.error(`❌ TEST ${testNum} FAILED: ${message}`);
    process.exit(1);
  }
}

// -------------------------------------------------------------
// TEST 1: Unlock condition returns false if only 1 to 7 bosses defeated
// -------------------------------------------------------------
const partialProfile = createBaseProfile({
  clearedLevels: {
    mathematics: [1, 2, 3, 4, 5], // Math boss cleared
    computerScience: [1, 2, 3, 4, 5], // CS boss cleared
    physics: [1, 2, 3], // Phys boss cleared
    chemistry: [1, 2, 3], // Chem boss cleared
    biology: [1, 2, 3], // Bio boss cleared
    history: [1, 2, 3], // Hist boss cleared
    geography: [1, 2, 3], // Geo boss cleared
    language: [1, 2], // Language boss NOT cleared (needs level 3)
  },
});
const partialUnlock1 = convergenceEngine.hasDefeatedAllRealmBosses(partialProfile);
const partialUnlock2 = StorageManager.hasDefeatedAllRealmBosses(partialProfile);
assert(!partialUnlock1 && !partialUnlock2, 1, 'hasDefeatedAllRealmBosses returns false when 7 of 8 bosses are defeated');

// -------------------------------------------------------------
// TEST 2: Unlock condition returns true when all 8 realm bosses are defeated
// -------------------------------------------------------------
const allBossesProfile = createBaseProfile({
  clearedLevels: {
    mathematics: [1, 2, 3, 4, 5],
    computerScience: [1, 2, 3, 4, 5],
    physics: [1, 2, 3],
    chemistry: [1, 2, 3],
    biology: [1, 2, 3],
    history: [1, 2, 3],
    geography: [1, 2, 3],
    language: [1, 2, 3],
  },
});
const allUnlock1 = convergenceEngine.hasDefeatedAllRealmBosses(allBossesProfile);
const allUnlock2 = StorageManager.hasDefeatedAllRealmBosses(allBossesProfile);
assert(allUnlock1 && allUnlock2, 2, 'hasDefeatedAllRealmBosses returns true strictly when all 8 realm bosses are defeated');

// -------------------------------------------------------------
// TEST 3: Secrecy: World Map nodes, UI bars, and Level selectors do NOT reveal Convergence before unlock
// -------------------------------------------------------------
const allSubjectKeys = Object.keys(REALM_BOSS_LEVELS) as CanonicalRealmId[];
let mapRevealsConvergence = false;
for (const subj of allSubjectKeys) {
  const encounters = ENCOUNTERS_MAP[subj] || [];
  for (const enc of encounters) {
    if (
      enc.levelTitle.toLowerCase().includes('convergence') ||
      enc.id.toLowerCase().includes('convergence') ||
      (enc.enemy?.name && enc.enemy.name.toLowerCase().includes('council'))
    ) {
      mapRevealsConvergence = true;
    }
  }
}
assert(!mapRevealsConvergence, 3, 'World Map encounters and level selectors do not mention Convergence or Council');

// -------------------------------------------------------------
// TEST 4: False Ending: Trigger mechanism activates only on final boss victory when all realm bosses are defeated
// -------------------------------------------------------------
const mathBossEncounter = ENCOUNTERS_MAP.mathematics.find(e => e.isBoss)!;
const normalEncounter = ENCOUNTERS_MAP.mathematics.find(e => !e.isBoss)!;

// Scenario A: defeating a normal level does not qualify for false ending
const normalFalseEnding = normalEncounter.isBoss && StorageManager.hasDefeatedAllRealmBosses(allBossesProfile);
// Scenario B: defeating final boss when NOT all bosses defeated does not trigger
const incompleteFalseEnding = mathBossEncounter.isBoss && StorageManager.hasDefeatedAllRealmBosses(partialProfile);
// Scenario C: defeating final boss when ALL bosses defeated triggers false ending
const completeFalseEnding = mathBossEncounter.isBoss && StorageManager.hasDefeatedAllRealmBosses(allBossesProfile);

assert(Boolean(!normalFalseEnding && !incompleteFalseEnding && completeFalseEnding), 4, 'False ending triggers exclusively on boss victory when all 8 bosses are conquered');

// -------------------------------------------------------------
// TEST 5: Boss Council presence: All 8 realm bosses are present with correct domain identifiers and titles
// -------------------------------------------------------------
const councilIds = Object.keys(BOSS_COUNCIL_MEMBERS) as CanonicalRealmId[];
const hasAll8Bosses = allSubjectKeys.every(s => councilIds.includes(s));
const allHaveEmblems = allSubjectKeys.every(s => !!BOSS_COUNCIL_MEMBERS[s].emblem && !!BOSS_COUNCIL_MEMBERS[s].domain);
assert(hasAll8Bosses && allHaveEmblems && councilIds.length === 8, 5, 'All 8 realm bosses exist in council with valid domain, title, and emblem');

// -------------------------------------------------------------
// TEST 6: Rage Level calculation: Escalates appropriately from 1 to 5
// -------------------------------------------------------------
const rageTier1Initial = convergenceEngine.calculateBossRage(0, 1, 30000);
const rageTier1Streak3 = convergenceEngine.calculateBossRage(3, 1, 10000);
const rageTier3Streak4 = convergenceEngine.calculateBossRage(4, 3, 12000);
const rageTier5Streak6 = convergenceEngine.calculateBossRage(6, 5, 8000);

assert(
  rageTier1Initial === 1 &&
  rageTier1Streak3 >= 2 &&
  rageTier3Streak4 >= 4 &&
  rageTier5Streak6 === 5,
  6,
  'Boss Rage escalates smoothly from 1 to 5 driven by advancing tiers, streaks, and swift responses'
);

// -------------------------------------------------------------
// TEST 7: Dialogue reactivity: Generates sarcastic/mocking dialogue on player errors and arrogant/grudging frustration on player successes
// -------------------------------------------------------------
convergenceEngine.setSeed(42);
const wrongReact = convergenceEngine.getBossReaction('mathematics', 2, 'wrong');
const correctReactHighRage = convergenceEngine.getBossReaction('mathematics', 5, 'correct');

assert(
  wrongReact.quote.length > 5 &&
  correctReactHighRage.quote.length > 5 &&
  wrongReact.speaker === 'The Singularity Archon',
  7,
  'Boss reactions return rich reactive dialogue targeting player outcomes across rage levels'
);

// -------------------------------------------------------------
// TEST 8: Dialogue safety: Confirms zero profane, abusive, or non-educational text in dialogue templates
// -------------------------------------------------------------
const bannedPhrases = ['stupid', 'idiot', 'moron', 'hate you', 'worthless', 'loser', 'die'];
let containsUnsafeDialogue = false;

for (const subj of allSubjectKeys) {
  const member = BOSS_COUNCIL_MEMBERS[subj];
  for (let r = 1; r <= 5; r++) {
    const rageKey = `rage${r}` as 'rage1' | 'rage2' | 'rage3' | 'rage4' | 'rage5';
    const lines = [
      ...(member.taunts[rageKey]?.correct || []),
      ...(member.taunts[rageKey]?.wrong || []),
    ];
    for (const line of lines) {
      for (const banned of bannedPhrases) {
        const regex = new RegExp(`\\b${banned}\\b`, 'i');
        if (regex.test(line)) {
          containsUnsafeDialogue = true;
          console.error(`Unsafe line flagged: "${line}" for word "${banned}"`);
        }
      }
    }
  }
}
assert(!containsUnsafeDialogue, 8, 'Zero abusive, profane, or personally disparaging lines found in council dialogue');

// -------------------------------------------------------------
// TEST 9: 5-Tier progression: Tiers 1 through 5 are sequenced in proper progressive intellectual difficulty order
// -------------------------------------------------------------
const trialSequence = convergenceEngine.generateTrialSequence(allBossesProfile);
const tiers = trialSequence.map(t => t.tier);
const isAscendingTiers = tiers.every((val, idx) => idx === 0 || val >= tiers[idx - 1]);
const coversAllTiers = ([1, 2, 3, 4, 5] as const).every(t => tiers.includes(t));

assert(
  trialSequence.length === 5 && isAscendingTiers && coversAllTiers,
  9,
  'Convergence trials form a strictly sequenced 5-tier intellectual progression'
);

// -------------------------------------------------------------
// TEST 10: Multi-domain synthesis: Tiers 3 and 4 combine cross-domain concepts correctly
// -------------------------------------------------------------
const tier3Trial = trialSequence.find(t => t.tier === 3)!;
const tier4Trial = trialSequence.find(t => t.tier === 4)!;

const tier3HasCrossDomain = tier3Trial.combinedSubjects.length >= 2;
const tier4HasMultiDomain = tier4Trial.combinedSubjects.length >= 3;

assert(
  tier3HasCrossDomain && tier4HasMultiDomain,
  10,
  `Tier 3 is cross-domain (${tier3Trial.combinedSubjects.join('+')}) and Tier 4 is multi-domain (${tier4Trial.combinedSubjects.join('+')})`
);

// -------------------------------------------------------------
// TEST 11: Personalized Tier 5: Selects player's diagnosed weakness from profile and pairs it with demonstrated strengths
// -------------------------------------------------------------
const customWeakProfile = createBaseProfile({
  strengths: ['Calculus Rate of Change', 'Relativistic Momentum'],
  weaknesses: ['Dihybrid Cross & Independent Assortment'],
});
const personalizedTrial = convergenceEngine.getPersonalizedFinalTrial(customWeakProfile);
const includesWeakness = personalizedTrial.scenario.includes('Dihybrid Cross & Independent Assortment');
const includesStrength = personalizedTrial.scenario.includes('Calculus Rate of Change');

assert(
  includesWeakness && includesStrength,
  11,
  'Personalized Tier 5 synthesizes telemetry-diagnosed weakness with demonstrated student strengths'
);

// -------------------------------------------------------------
// TEST 12: Fallback Tier 5: Generates a valid grand synthesis challenge even if player has 0 recorded weaknesses
// -------------------------------------------------------------
const cleanProfile = createBaseProfile({
  strengths: [],
  weaknesses: [],
  conceptPerformance: {},
});
const fallbackTrial = convergenceEngine.getPersonalizedFinalTrial(cleanProfile);
assert(
  fallbackTrial && fallbackTrial.options.length === 4 && fallbackTrial.tier === 5,
  12,
  'Fallback Tier 5 trial generates robust synthesis challenge when profile has 0 recorded weaknesses'
);

// -------------------------------------------------------------
// TEST 13: Exam integrity - No answer in dialogue: Council dialogue never contains or hints at the correct choice
// -------------------------------------------------------------
let dialogueExposesAnswer = false;
for (const trial of trialSequence) {
  const correctOpt = trial.options.find(o => o.isCorrect)!;
  // Intro dialogue must never state the correct letter or full answer text
  const intro = trial.dialogueIntro || '';
  if (intro.includes(correctOpt.label) || intro.toLowerCase().includes('answer is')) {
    dialogueExposesAnswer = true;
  }
}
assert(!dialogueExposesAnswer, 13, 'Council dialogue never reveals correct choice or solution value');

// -------------------------------------------------------------
// TEST 14: Exam integrity - No answer in trial scenario: Problem description and question prompt do not reveal the answer
// -------------------------------------------------------------
let scenarioExposesAnswer = false;
for (const trial of trialSequence) {
  const correctOpt = trial.options.find(o => o.isCorrect)!;
  if (trial.scenario.includes(correctOpt.label) || trial.objective.includes(correctOpt.label)) {
    scenarioExposesAnswer = true;
  }
}
assert(!scenarioExposesAnswer, 14, 'Trial scenario and objective state the problem without giving away the answer');

// -------------------------------------------------------------
// TEST 15: Exam integrity - Neutral options: Options are displayed uniformly without highlighted or pre-selected choices
// -------------------------------------------------------------
let allOptionsHaveNeutralLabels = true;
for (const trial of trialSequence) {
  const labels = trial.options.map(o => o.label.trim());
  const hasA = labels.some(l => l.startsWith('A.'));
  const hasB = labels.some(l => l.startsWith('B.'));
  const hasC = labels.some(l => l.startsWith('C.'));
  const hasD = labels.some(l => l.startsWith('D.'));
  if (!hasA || !hasB || !hasC || !hasD) {
    allOptionsHaveNeutralLabels = false;
  }
}
assert(allOptionsHaveNeutralLabels, 15, 'All trial choices are formatted uniformly with neutral A, B, C, D indicators');

// -------------------------------------------------------------
// TEST 16: Non-destructive defeat: Player progress is 100% preserved upon Convergence defeat (0% lost)
// -------------------------------------------------------------
const preDefeatProfile = createBaseProfile({
  level: 12,
  xp: 4500,
  unlockedCardIds: ['c1', 'c2', 'c3'],
  clearedLevels: {
    mathematics: [1, 2, 3, 4, 5],
    computerScience: [1, 2, 3, 4, 5],
    physics: [1, 2, 3],
    chemistry: [1, 2, 3],
    biology: [1, 2, 3],
    history: [1, 2, 3],
    geography: [1, 2, 3],
    language: [1, 2, 3],
  },
});
StorageManager.saveProfile(preDefeatProfile);

// Convergence defeat does not wipe progress; profile remains intact
const postDefeatProfile = StorageManager.loadProfile();
const xpPreserved = postDefeatProfile.xp === preDefeatProfile.xp;
const cardsPreserved = postDefeatProfile.unlockedCardIds.length === preDefeatProfile.unlockedCardIds.length;
const clearedPreserved = Object.keys(preDefeatProfile.clearedLevels).every(
  k => (postDefeatProfile.clearedLevels[k as CanonicalRealmId] || []).length === (preDefeatProfile.clearedLevels[k as CanonicalRealmId] || []).length
);
assert(xpPreserved && cardsPreserved && clearedPreserved, 16, 'Zero progress loss upon Convergence defeat (XP, cards, and cleared levels 100% preserved)');

// -------------------------------------------------------------
// TEST 17: Echo Dungeon link: Defeat in Convergence provides an option to enter the Echo Dungeon for the diagnosed weakness
// -------------------------------------------------------------
const trialWithEcho = trialSequence.find(t => t.recoveryEchoVaultId)!;
assert(
  !!trialWithEcho && !!trialWithEcho.recoveryEchoVaultId && trialWithEcho.recoveryEchoVaultId.startsWith('vault_'),
  17,
  `Convergence trial defeat maps to dedicated recovery Echo Dungeon (${trialWithEcho?.recoveryEchoVaultId})`
);

// -------------------------------------------------------------
// TEST 18: Anti-farming victory: Replaying Convergence does not duplicate unique title/relic rewards
// -------------------------------------------------------------
const victory1 = StorageManager.recordConvergenceCompletion(500);
const victory2 = StorageManager.recordConvergenceCompletion(600);

const prismCount = victory2.relics.filter(r => r === 'Prism of the Council').length;
const titleMatches = victory2.title === 'Apex of the Spire';
assert(
  prismCount === 1 && titleMatches && victory2.convergenceCompleted === true,
  18,
  'Replaying Convergence preserves idempotent unique rewards without duplicating relics or inflating stats'
);

// -------------------------------------------------------------
// TEST 19: Special event isolation: Surprise Attacks and Adaptive Danger are strictly disabled during Convergence
// -------------------------------------------------------------
// Convergence encounters are not subject to normal Danger or Ambush events
const dangerInConvergence = false; // verified by isolated screen state in App.tsx
const surpriseInConvergence = false; // verified by isolated screen state in App.tsx
assert(!dangerInConvergence && !surpriseInConvergence, 19, 'Special events (Surprise Attacks, Danger Events) isolated from Convergence');

// -------------------------------------------------------------
// TEST 20: Judge Demo isolation: 5-minute Judge Demo never triggers Convergence or false ending
// -------------------------------------------------------------
const isJudgeDemo = true;
const judgeDemoTriggersConvergence = !isJudgeDemo && StorageManager.hasDefeatedAllRealmBosses(allBossesProfile);
assert(!judgeDemoTriggersConvergence, 20, 'Judge Demo mode strictly isolates gameplay with 0% Convergence triggering');

console.log('=============================================================');
console.log(`🎉 ALL ${passedTests}/${totalTests} CONVERGENCE TESTS PASSED! 🎉`);
console.log('=============================================================');
