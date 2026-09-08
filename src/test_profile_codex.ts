import React from 'react';
import { renderToString } from 'react-dom/server';
import { createJiti } from 'jiti';
const jiti = createJiti(process.cwd(), { jsx: true });
const { ProfileScreen } = jiti('./src/screens/ProfileScreen.tsx') as { ProfileScreen: React.FC<any> };
import { LearningProfileTranslator } from './engine/LearningProfileTranslator';
import { StorageManager } from './persistence/StorageManager';
import { PlayerProfile } from './types/telemetry';
import { DEFAULT_LEARNING_DNA } from './engine/LearningDNAEngine';
import { DEFAULT_OBSERVER_STATE } from './engine/ObserverEngine';
import { DEFAULT_MIRROR_STATE } from './engine/MirrorBossEngine';
import { REALM_BOSS_LEVELS, BOSS_COUNCIL_MEMBERS } from './engine/ConvergenceEngine';
import { ALL_SUBJECTS } from './curriculum/registry';

declare const process: any;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
}

console.log('==============================================================');
console.log('🛡️ STARTING HUNTER\'S CODEX & PROFILE SCREEN VERIFICATION 🛡️');
console.log('==============================================================\n');

// Baseline fresh profile
const freshProfile: PlayerProfile = {
  name: 'Hunter Vaelen',
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
    mathematics: [],
    computerScience: [],
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
  unlockedCardIds: ['math_factor', 'math_solve'],
  relics: ['Focus Rune', 'Time Shard'],
  equippedRelics: ['Focus Rune', 'Time Shard'],
  discoveredRelics: ['Focus Rune', 'Time Shard'],
  prestigeTitles: [],
  strengths: ['Pattern Recognition', 'Structural Decomposition'],
  weaknesses: [],
  runHistory: [],
  activeEducationLevel: 'class_9_10',
  conceptPerformance: {},
  dangerCooldownBattles: 0,
  surpriseAttackCooldownBattles: 0,
  surpriseAttacksCompleted: 0,
  convergenceUnlocked: false,
  convergenceCompleted: false,
  convergenceBestScore: 0,
  convergenceAttempts: 0,
  learningDNA: { ...DEFAULT_LEARNING_DNA },
  observerState: { ...DEFAULT_OBSERVER_STATE },
  mirrorBossState: { ...DEFAULT_MIRROR_STATE },
};

// =========================================================================
// TEST 1: New player does not see unrevealed secret systems
// =========================================================================
console.log('▶ TEST 1: Secret System Secrecy for New Player (Zero Leaks in Rendered Output)');
const htmlFresh = renderToString(
  React.createElement(ProfileScreen, {
    profile: freshProfile,
    onBack: () => {},
    onRefreshProfile: () => {},
  })
);

assert(!htmlFresh.includes('The Observer'), 'Fresh profile must NOT display The Observer');
assert(!htmlFresh.includes('Audience Granted'), 'Fresh profile must NOT display Observer Audience Granted');
assert(!htmlFresh.includes('Mirror Encounters'), 'Fresh profile must NOT display Mirror Encounters');
assert(!htmlFresh.includes('Reflective Sovereign'), 'Fresh profile must NOT display Reflective Sovereign');
assert(!htmlFresh.includes('Surprise Attacks Survived'), 'Fresh profile must NOT display Surprise Attacks Survived');
assert(!htmlFresh.includes('The Convergence'), 'Fresh profile must NOT display The Convergence');
assert(!htmlFresh.includes('Final Reflection'), 'Fresh profile must NOT display Final Reflection');
assert(!htmlFresh.includes('Prism of the Council'), 'Fresh profile must NOT display locked endgame relics');
console.log('  ✓ Verified: 0 secret systems or placeholders exposed to fresh player.');
console.log('✅ TEST 1 PASSED!\n');

// =========================================================================
// TEST 2: Observer appears ONLY after encounterCount > 0
// =========================================================================
console.log('▶ TEST 2: Observer Discovery Gate (encounterCount > 0)');
assert(!LearningProfileTranslator.isObserverDiscovered(freshProfile), 'Fresh player must not have Observer discovered');

const observerProfile: PlayerProfile = {
  ...freshProfile,
  observerState: {
    ...DEFAULT_OBSERVER_STATE,
    encounterCount: 1,
    challengeCompleted: true,
  },
};
assert(LearningProfileTranslator.isObserverDiscovered(observerProfile), 'Profile with encounterCount=1 must discover Observer');

const htmlObserver = renderToString(
  React.createElement(ProfileScreen, {
    profile: observerProfile,
    onBack: () => {},
    onRefreshProfile: () => {},
  })
);
assert(htmlObserver.includes('The Observer'), 'Profile must render The Observer section after discovery');
assert(htmlObserver.includes('Audience Granted'), 'Profile must render Audience Granted after discovery');
assert(!htmlObserver.includes('Impression Score'), 'Observer section must NEVER expose raw impression numbers');
console.log('  ✓ Verified: Observer appears gracefully and without numerical impression leaks.');
console.log('✅ TEST 2 PASSED!\n');

// =========================================================================
// TEST 3: Mirror Boss appears ONLY after discovery
// =========================================================================
console.log('▶ TEST 3: Mirror Boss Discovery Gate');
assert(!LearningProfileTranslator.isMirrorSystemDiscovered(freshProfile), 'Fresh player must not have Mirror Boss discovered');

const mirrorProfile: PlayerProfile = {
  ...freshProfile,
  mirrorBossState: {
    ...DEFAULT_MIRROR_STATE,
    encounteredMirrors: ['mirror_math_archon'],
    defeatedMirrors: ['mirror_math_archon'],
  },
};
assert(LearningProfileTranslator.isMirrorSystemDiscovered(mirrorProfile), 'Profile with defeated mirrors must discover Mirror system');

const htmlMirror = renderToString(
  React.createElement(ProfileScreen, {
    profile: mirrorProfile,
    onBack: () => {},
    onRefreshProfile: () => {},
  })
);
assert(htmlMirror.includes('Mirror Encounters'), 'Rendered profile must display Mirror Encounters after discovery');
assert(htmlMirror.includes('1 Defeated'), 'Rendered profile must display 1 Defeated mirror');
console.log('  ✓ Verified: Mirror Boss section appears only after legitimate discovery.');
console.log('✅ TEST 3 PASSED!\n');

// =========================================================================
// TEST 4: Surprise Attack appears ONLY after discovery
// =========================================================================
console.log('▶ TEST 4: Surprise Attack Discovery Gate');
assert(!LearningProfileTranslator.isSurpriseAttackDiscovered(freshProfile), 'Fresh player must not have Surprise Attack discovered');

const surpriseProfile: PlayerProfile = {
  ...freshProfile,
  surpriseAttacksCompleted: 2,
};
assert(LearningProfileTranslator.isSurpriseAttackDiscovered(surpriseProfile), 'Profile with 2 completed ambushes must discover Surprise Attacks');

const htmlSurprise = renderToString(
  React.createElement(ProfileScreen, {
    profile: surpriseProfile,
    onBack: () => {},
    onRefreshProfile: () => {},
  })
);
assert(htmlSurprise.includes('Surprise Attacks Survived'), 'Rendered profile must display Surprise Attacks Survived');
assert(!htmlSurprise.includes('Threat Level'), 'Rendered profile must NEVER display internal Threat Level');
assert(!htmlSurprise.includes('opportunityProbability'), 'Rendered profile must NEVER display ambush probability');
console.log('  ✓ Verified: Surprise Attack section appears without exposing threat levels or probabilities.');
console.log('✅ TEST 4 PASSED!\n');

// =========================================================================
// TEST 5: The Convergence appears ONLY after unlock/completion/all 8 bosses
// =========================================================================
console.log('▶ TEST 5: The Convergence Discovery Gate');
assert(!LearningProfileTranslator.isConvergenceDiscovered(freshProfile), 'Fresh player must not have Convergence discovered');

// Profile with all 8 bosses defeated
const allBossProfile: PlayerProfile = {
  ...freshProfile,
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
  convergenceUnlocked: true,
};
assert(LearningProfileTranslator.isConvergenceDiscovered(allBossProfile), 'Profile with all 8 bosses defeated must discover Convergence');

const htmlConvergence = renderToString(
  React.createElement(ProfileScreen, {
    profile: allBossProfile,
    onBack: () => {},
    onRefreshProfile: () => {},
  })
);
assert(htmlConvergence.includes('The Convergence'), 'Rendered profile must display The Convergence after 8 bosses defeated');
assert(!htmlConvergence.includes('bossRage'), 'Rendered profile must NEVER expose boss rage mechanics');
console.log('  ✓ Verified: Convergence is strictly secret until all 8 sovereigns are defeated.');
console.log('✅ TEST 5 PASSED!\n');

// =========================================================================
// TEST 6: Last Question Final Reflection appears ONLY after completion
// =========================================================================
console.log('▶ TEST 6: Last Question / Final Reflection Gate');
assert(!LearningProfileTranslator.hasFinalReflection(freshProfile), 'Fresh profile must not have Final Reflection');

const lastQProfile: PlayerProfile = {
  ...freshProfile,
  lastQuestionResult: {
    completedAt: Date.now(),
    endingVariant: 'THE SCHOLAR',
    studentResponse: 'Knowledge is not a weapon of destruction, but an eternal lantern against entropy.',
  },
};
assert(LearningProfileTranslator.hasFinalReflection(lastQProfile), 'Profile with response must have Final Reflection');

const htmlLastQ = renderToString(
  React.createElement(ProfileScreen, {
    profile: lastQProfile,
    onBack: () => {},
    onRefreshProfile: () => {},
  })
);
assert(htmlLastQ.includes('Final Reflection: THE SCHOLAR'), 'Profile must render Final Reflection with ending variant');
assert(htmlLastQ.includes('eternal lantern against entropy'), 'Profile must render student response text');
console.log('  ✓ Verified: Final Reflection renders player ending narrative with zero pre-spoilers.');
console.log('✅ TEST 6 PASSED!\n');

// =========================================================================
// TEST 7: Learning DNA raw numerical scores NEVER appear in rendered Profile
// =========================================================================
console.log('▶ TEST 7: Learning DNA Numerical Secrecy');
const dnaSampleProfile: PlayerProfile = {
  ...freshProfile,
  learningDNA: {
    speedProfile: 91,
    persistence: 88,
    accuracy: 94,
    riskTaking: 42,
    verificationHabit: 82,
    patternRecognition: 79,
    transferAbility: 71,
    recoveryAfterMistakes: 85,
    conceptualConsistency: 80,
    adaptability: 77,
    lastUpdated: Date.now(),
  },
};

const htmlDNA = renderToString(
  React.createElement(ProfileScreen, {
    profile: dnaSampleProfile,
    onBack: () => {},
    onRefreshProfile: () => {},
  })
);

assert(!htmlDNA.includes('speedProfile'), 'speedProfile property name must not appear');
// Remove SVG paths so vector float coordinates (like Lucide Zap's M15.914) do not false-positive match
const textContentDNA = htmlDNA.replace(/<svg[\s\S]*?<\/svg>/g, '');
assert(!textContentDNA.includes('91'), 'Raw speed score 91 must not appear in profile text');
assert(!textContentDNA.includes('88'), 'Raw persistence score 88 must not appear in profile text');
assert(!htmlDNA.includes('Learning DNA Score'), 'Must not display "Learning DNA Score"');
assert(htmlDNA.includes('Strong Pattern Recognition') || htmlDNA.includes('pattern recognition'), 'Qualitative pattern recognition must appear');
assert(htmlDNA.includes('Consistent Recovery After Mistakes') || htmlDNA.includes('recovery after mistakes'), 'Qualitative recovery trait must appear');
console.log('  ✓ Verified: Raw DNA numbers are 100% secluded; only qualitative traits render.');
console.log('✅ TEST 7 PASSED!\n');

// =========================================================================
// TEST 8 & TEST 9: Internal Probabilities & Counter-Strategy Secrecy
// =========================================================================
console.log('▶ TEST 8 & 9: Threat & Counter-Strategy Secrecy');
assert(!htmlDNA.includes('Need Score'), 'Need Score must not appear');
assert(!htmlDNA.includes('Threat Level'), 'Threat Level must not appear');
assert(!htmlDNA.includes('Counter-Strategy Signature'), 'Counter-Strategy Signature must not appear');
assert(!htmlDNA.includes('StrategySignature'), 'Internal strategy types must not appear');
console.log('  ✓ Verified: Zero danger probabilities, threat scores, or counter-strategy internals exposed.');
console.log('✅ TEST 8 & 9 PASSED!\n');

// =========================================================================
// TEST 10: Accurate Boss Victory Tracking
// =========================================================================
console.log('▶ TEST 10: Accurate Realm Boss Victory Tracking');
const twoBossProfile: PlayerProfile = {
  ...freshProfile,
  clearedLevels: {
    mathematics: [1, 2, 3, 4, 5],
    computerScience: [1, 2, 3, 4, 5],
    physics: [1, 2], // Boss is level 3, not yet cleared
    chemistry: [],
    biology: [],
    history: [],
    geography: [],
    language: [],
  },
};

assert(LearningProfileTranslator.isBossDefeated(twoBossProfile, 'mathematics'), 'Math boss must be marked defeated');
assert(LearningProfileTranslator.isBossDefeated(twoBossProfile, 'computerScience'), 'CS boss must be marked defeated');
assert(!LearningProfileTranslator.isBossDefeated(twoBossProfile, 'physics'), 'Physics boss must NOT be marked defeated');
assert(LearningProfileTranslator.getDefeatedBossCount(twoBossProfile) === 2, 'Defeated boss count must be exactly 2');

const htmlTwoBoss = renderToString(
  React.createElement(ProfileScreen, {
    profile: twoBossProfile,
    onBack: () => {},
    onRefreshProfile: () => {},
  })
);
assert(htmlTwoBoss.includes('2 / 8 Defeated'), 'Record must state 2 / 8 Defeated');
assert(htmlTwoBoss.includes('The Singularity Archon'), 'Math boss name must appear');
assert(htmlTwoBoss.includes('The Turing Archon'), 'CS boss name must appear');
assert(htmlTwoBoss.includes('The Entropy Colossus'), 'Physics boss name must appear');
console.log('  ✓ Verified: Boss victory states accurately match authoritative curriculum levels.');
console.log('✅ TEST 10 PASSED!\n');

// =========================================================================
// TEST 11: Hidden Mastery Achievements
// =========================================================================
console.log('▶ TEST 11: Hidden Mastery Achievements');
const compressionProfile: PlayerProfile = {
  ...freshProfile,
  clearedHiddenTrials: {
    mathematics: ['math_hidden_trial_1', 'math_hidden_trial_2'],
    computerScience: ['cs_hidden_trial_1'],
    physics: [],
    chemistry: [],
    biology: [],
    history: [],
    geography: [],
    language: [],
  },
};

const htmlCompression = renderToString(
  React.createElement(ProfileScreen, {
    profile: compressionProfile,
    onBack: () => {},
    onRefreshProfile: () => {},
  })
);
assert(htmlCompression.includes('Trial of Dual Axioms'), 'Must display cleared Math Trial 1');
assert(htmlCompression.includes('Trial of the Singularity'), 'Must display cleared Math Trial 2');
assert(htmlCompression.includes('Trial of Boundary &amp; Halving') || htmlCompression.includes('Trial of Boundary & Halving'), 'Must display cleared CS Trial 1');
console.log('  ✓ Verified: Cleared compression trials display correctly.');
console.log('✅ TEST 11 PASSED!\n');

// =========================================================================
// TEST 12: Only Earned Prestige Titles Appear
// =========================================================================
console.log('▶ TEST 12: Prestige Titles Display');
const titledProfile: PlayerProfile = {
  ...freshProfile,
  prestigeTitles: ['Axiom Compressor', 'Apex of the Spire'],
};
const htmlTitled = renderToString(
  React.createElement(ProfileScreen, {
    profile: titledProfile,
    onBack: () => {},
    onRefreshProfile: () => {},
  })
);
assert(htmlTitled.includes('Axiom Compressor'), 'Earned title Axiom Compressor must render');
assert(htmlTitled.includes('Apex of the Spire'), 'Earned title Apex of the Spire must render');
assert(!htmlTitled.includes('Entropy Compressor'), 'Unearned title Entropy Compressor must NOT render');
console.log('  ✓ Verified: Only earned prestige titles render.');
console.log('✅ TEST 12 PASSED!\n');

// =========================================================================
// TEST 13: Separation of Equipped vs. Discovered Relics
// =========================================================================
console.log('▶ TEST 13: Relic Separation (Equipped vs. Discovered)');
const relicRichProfile: PlayerProfile = {
  ...freshProfile,
  equippedRelics: ['Focus Rune', 'Time Shard'],
  discoveredRelics: ['Focus Rune', 'Time Shard', 'Singularity Prism', 'Quantum Cache'],
  relics: ['Focus Rune', 'Time Shard', 'Singularity Prism', 'Quantum Cache'],
};

const htmlRelics = renderToString(
  React.createElement(ProfileScreen, {
    profile: relicRichProfile,
    onBack: () => {},
    onRefreshProfile: () => {},
  })
);
assert(htmlRelics.includes('Equipped Relics (2)'), 'Equipped relics must count exactly 2');
assert(htmlRelics.includes('Relics Discovered (4)'), 'Discovered relics must count 4');
assert(htmlRelics.includes('Singularity Prism'), 'Discovered section must list Singularity Prism');
assert(htmlRelics.includes('Quantum Cache'), 'Discovered section must list Quantum Cache');
console.log('  ✓ Verified: Equipped relics and discovered relics are cleanly separated.');
console.log('✅ TEST 13 PASSED!\n');

// =========================================================================
// TEST 14: StorageManager Backward Compatibility with Old Saved Profiles
// =========================================================================
console.log('▶ TEST 14: StorageManager Backward Compatibility');
// Simulate an old save JSON from a previous version without new fields
const oldSaveJson = JSON.stringify({
  name: 'Hunter Vaelen',
  title: 'Novice of the Fractured Spire',
  level: 3,
  xp: 140,
  xpToNextLevel: 490,
  subjectMastery: { mathematics: 50, computerScience: 25 },
  clearedLevels: { mathematics: [1, 2], computerScience: [1] },
  relics: ['Focus Rune', 'Time Shard', 'Singularity Prism'],
  // Notice missing: equippedRelics, discoveredRelics, prestigeTitles, learningDNA
});

// Mock localStorage
const mockStorage: Record<string, string> = {
  algo_spire_profile_v1: oldSaveJson,
};
(globalThis as any).localStorage = {
  getItem: (k: string) => mockStorage[k] || null,
  setItem: (k: string, v: string) => { mockStorage[k] = v; },
  removeItem: (k: string) => { delete mockStorage[k]; },
};

const loadedOldProfile = StorageManager.loadProfile();
assert(loadedOldProfile.level === 3, 'Old profile level preserved');
assert(loadedOldProfile.xp === 140, 'Old profile XP preserved');
assert(loadedOldProfile.equippedRelics !== undefined && loadedOldProfile.equippedRelics.length === 2, 'Equipped relics auto-populated');
assert(loadedOldProfile.discoveredRelics !== undefined && loadedOldProfile.discoveredRelics.includes('Singularity Prism'), 'Discovered relics preserved from old relics list');
assert(Array.isArray(loadedOldProfile.prestigeTitles), 'Prestige titles defaulted to array');
console.log('  ✓ Verified: Old profile loaded safely without corruption, data loss, or crashes.');
console.log('✅ TEST 14 PASSED!\n');

// =========================================================================
// TEST 15: Mobile Rendering & Responsive Touch Targets
// =========================================================================
console.log('▶ TEST 15: Responsive Structure & Accessibility Touch Targets');
assert(htmlFresh.includes('min-h-[44px]'), 'Buttons must include minimum 44px touch targets');
assert(htmlFresh.includes('min-w-[44px]'), 'Buttons must include minimum 44px touch targets');
assert(htmlFresh.includes('overflow-x-auto'), 'Tables must allow smooth horizontal containment without page overflow');
assert(htmlFresh.includes('grid-cols-1 lg:grid-cols-12'), 'Grid must collapse to 1 column on mobile screens');
console.log('  ✓ Verified: Responsive mobile grid and 44x44px touch targets enforced.');
console.log('✅ TEST 15 PASSED!\n');

console.log('==============================================================');
console.log('🎉 ALL 15 HUNTER\'S CODEX & PROFILE TESTS PASSED (100%)! 🎉');
console.log('==============================================================');
