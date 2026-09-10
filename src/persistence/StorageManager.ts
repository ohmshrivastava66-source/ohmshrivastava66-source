import { PlayerProfile, RunRecord } from '../types/telemetry';
import { SubjectId } from '../types/game';
import { EncounterDefinition } from '../types/curriculum';
import { dangerEngine } from '../engine/DangerEngine';
import { MasteryCompressionEngine } from '../engine/MasteryCompressionEngine';
import { convergenceEngine } from '../engine/ConvergenceEngine';
import { DEFAULT_LEARNING_DNA, learningDNAEngine } from '../engine/LearningDNAEngine';
import { DEFAULT_OBSERVER_STATE, observerEngine } from '../engine/ObserverEngine';
import { DEFAULT_MIRROR_STATE } from '../engine/MirrorBossEngine';
import { EndingVariant } from '../types/learningDna';
import { telemetry } from '../engine/Telemetry';

const STORAGE_KEY = 'algo_spire_profile_v1';
const SETTINGS_KEY = 'algo_spire_settings_v1';

export interface GameSettings {
  isMuted: boolean;
  volume: number;
  reducedMotion: boolean;
}

const DEFAULT_PROFILE: PlayerProfile = {
  name: 'Hunter Vaelen',
  title: 'Novice of the Fractured Spire',
  level: 1,
  xp: 0,
  xpToNextLevel: 250,
  subjectMastery: {
    mathematics: 0,
    computerScience: 0,
    data_structures_algorithms: 0,
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
    data_structures_algorithms: [],
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
    data_structures_algorithms: [],
    physics: [],
    chemistry: [],
    biology: [],
    history: [],
    geography: [],
    language: [],
  },
  masteryCompressionRecords: {},
  unlockedCardIds: ['math_factor', 'math_solve', 'math_verify', 'math_expand', 'math_substitute', 'math_simplify'],
  relics: ['Focus Rune', 'Time Shard'],
  equippedRelics: ['Focus Rune', 'Time Shard'],
  discoveredRelics: ['Focus Rune', 'Time Shard'],
  prestigeTitles: [],
  strengths: ['Pattern Recognition', 'Structural Decomposition'],
  weaknesses: [],
  runHistory: [],
  activeEducationLevel: 'class_9_10',
  activeKingdom: 'secondary_bastion',
  activeClass: 'legacy_tier',
  contextProgress: {},
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
  dsaHiddenPathDiscovered: false,
  dsaHiddenPathClearedLevels: [],
  dsaHiddenPathBossDefeated: false,
  behaviorClassification: 'GENUINE_MASTERY',
  exploitStreakCount: 0,
};

const DEFAULT_SETTINGS: GameSettings = {
  isMuted: false,
  volume: 0.7,
  reducedMotion: false,
};

let inMemoryProfile: PlayerProfile | null = null;
let inMemorySettings: GameSettings | null = null;

export class StorageManager {
  public static createInitialProfile(): PlayerProfile {
    return JSON.parse(JSON.stringify(DEFAULT_PROFILE));
  }

  public static loadProfile(): PlayerProfile {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
          const parsed = JSON.parse(data);
          const discoveredRelics: string[] = parsed.discoveredRelics && Array.isArray(parsed.discoveredRelics)
            ? [...parsed.discoveredRelics]
            : (parsed.relics ? [...parsed.relics] : ['Focus Rune', 'Time Shard']);

          if (parsed.relics && Array.isArray(parsed.relics)) {
            parsed.relics.forEach((r: string) => {
              if (!discoveredRelics.includes(r)) discoveredRelics.push(r);
            });
          }

          const equippedRelics: string[] = parsed.equippedRelics && Array.isArray(parsed.equippedRelics)
            ? [...parsed.equippedRelics]
            : (parsed.relics ? parsed.relics.slice(0, 2) : ['Focus Rune', 'Time Shard']);

          const prestigeTitles: string[] = parsed.prestigeTitles && Array.isArray(parsed.prestigeTitles)
            ? [...parsed.prestigeTitles]
            : [];

          if (parsed.title && !prestigeTitles.includes(parsed.title) && parsed.title !== DEFAULT_PROFILE.title) {
            prestigeTitles.push(parsed.title);
          }

          return {
            ...DEFAULT_PROFILE,
            ...parsed,
            subjectMastery: { ...DEFAULT_PROFILE.subjectMastery, ...parsed.subjectMastery },
            clearedLevels: { ...DEFAULT_PROFILE.clearedLevels, ...parsed.clearedLevels },
            clearedHiddenTrials: { ...DEFAULT_PROFILE.clearedHiddenTrials, ...parsed.clearedHiddenTrials },
            masteryCompressionRecords: { ...DEFAULT_PROFILE.masteryCompressionRecords, ...parsed.masteryCompressionRecords },
            conceptPerformance: { ...DEFAULT_PROFILE.conceptPerformance, ...parsed.conceptPerformance },
            relics: parsed.relics ? [...parsed.relics] : ['Focus Rune', 'Time Shard'],
            equippedRelics,
            discoveredRelics,
            prestigeTitles,
            dangerCooldownBattles: parsed.dangerCooldownBattles ?? 0,
            surpriseAttackCooldownBattles: parsed.surpriseAttackCooldownBattles ?? 0,
            surpriseAttacksCompleted: parsed.surpriseAttacksCompleted ?? 0,
            convergenceUnlocked: parsed.convergenceUnlocked ?? false,
            convergenceCompleted: parsed.convergenceCompleted ?? false,
            convergenceBestScore: parsed.convergenceBestScore ?? 0,
            convergenceCompletedAt: parsed.convergenceCompletedAt,
            convergenceAttempts: parsed.convergenceAttempts ?? 0,
            activeKingdom: parsed.activeKingdom ?? 'secondary_bastion',
            activeClass: parsed.activeClass ?? 'legacy_tier',
            contextProgress: parsed.contextProgress ?? {},
            learningDNA: parsed.learningDNA ? { ...DEFAULT_LEARNING_DNA, ...parsed.learningDNA } : { ...DEFAULT_LEARNING_DNA },
            observerState: parsed.observerState ? { ...DEFAULT_OBSERVER_STATE, ...parsed.observerState } : { ...DEFAULT_OBSERVER_STATE },
            mirrorBossState: parsed.mirrorBossState ? { ...DEFAULT_MIRROR_STATE, ...parsed.mirrorBossState } : { ...DEFAULT_MIRROR_STATE },
            lastQuestionResult: parsed.lastQuestionResult,
            dsaHiddenPathDiscovered: parsed.dsaHiddenPathDiscovered ?? false,
            dsaHiddenPathClearedLevels: parsed.dsaHiddenPathClearedLevels ? [...parsed.dsaHiddenPathClearedLevels] : [],
            dsaHiddenPathBossDefeated: parsed.dsaHiddenPathBossDefeated ?? false,
            behaviorClassification: parsed.behaviorClassification ?? 'GENUINE_MASTERY',
            exploitStreakCount: parsed.exploitStreakCount ?? 0,
          };
        }
      }
    } catch {
      // In-memory fallback if localStorage fails
    }
    if (inMemoryProfile) {
      return {
        ...DEFAULT_PROFILE,
        ...inMemoryProfile,
        learningDNA: inMemoryProfile.learningDNA
          ? { ...DEFAULT_LEARNING_DNA, ...inMemoryProfile.learningDNA }
          : { ...DEFAULT_LEARNING_DNA },
        observerState: inMemoryProfile.observerState
          ? { ...DEFAULT_OBSERVER_STATE, ...inMemoryProfile.observerState }
          : { ...DEFAULT_OBSERVER_STATE },
        mirrorBossState: inMemoryProfile.mirrorBossState
          ? { ...DEFAULT_MIRROR_STATE, ...inMemoryProfile.mirrorBossState }
          : { ...DEFAULT_MIRROR_STATE },
      };
    }
    return { ...DEFAULT_PROFILE };
  }

  public static saveProfile(profile: PlayerProfile) {
    inMemoryProfile = { ...profile };
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      }
    } catch {}
  }

  public static recordLevelVictory(
    subject: SubjectId,
    levelNumber: number,
    levelTitle: string,
    xpGained: number,
    masteryGained: number,
    unlockedCardId?: string,
    encounter?: EncounterDefinition,
    realElapsedSeconds?: number,
    turnsUsed?: number
  ): PlayerProfile {
    let profile = this.loadProfile();

    const liveMetrics = telemetry.getLiveMetrics();
    const actualTime = Math.max(1, realElapsedSeconds !== undefined ? realElapsedSeconds : telemetry.getElapsedTimeSeconds());
    const actualTurns = Math.max(1, turnsUsed !== undefined ? turnsUsed : 3);

    // Update behavioral classification and exploit streak
    profile.behaviorClassification = liveMetrics.behaviorClassification;
    if (liveMetrics.isRapidExploit) {
      profile.exploitStreakCount = (profile.exploitStreakCount || 0) + 1;
    } else {
      profile.exploitStreakCount = Math.max(0, (profile.exploitStreakCount || 0) - 1);
    }

    // Check if this is a Hidden Path compressed trial
    if (encounter && encounter.pathType === 'hidden_trial') {
      profile = MasteryCompressionEngine.recordHiddenTrialCompletion(subject, encounter, profile);

      const run: RunRecord = {
        id: `run_${Date.now()}`,
        subject,
        levelNumber,
        levelTitle,
        result: 'VICTORY',
        score: (xpGained + (encounter.prestigeRewards?.bonusXp || 0)) * 10,
        timeTakenSeconds: actualTime,
        date: new Date().toLocaleDateString(),
        turnsUsed: actualTurns,
      };
      profile.runHistory.unshift(run);
      if (profile.runHistory.length > 20) profile.runHistory.pop();

      dangerEngine.applyRecencyDecay(profile);

      // Update Learning DNA
      const currentDna = profile.learningDNA || { ...DEFAULT_LEARNING_DNA };
      profile.learningDNA = learningDNAEngine.recordRunOutcome(
        currentDna,
        'VICTORY',
        actualTime,
        actualTurns,
        true
      );

      this.saveProfile(profile);
      return profile;
    }

    // Normal Main Path victory
    profile.xp += xpGained;
    while (profile.xp >= profile.xpToNextLevel) {
      profile.xp -= profile.xpToNextLevel;
      profile.level += 1;
      profile.xpToNextLevel = Math.round(profile.xpToNextLevel * 1.4);
      if (profile.level === 2) profile.title = 'Adept of Axioms';
      if (profile.level === 3) profile.title = 'Weaver of Invariants';
      if (profile.level >= 5) profile.title = 'Archon Scholar';
    }

    // Update Mastery
    const currentMastery = profile.subjectMastery[subject] || 0;
    profile.subjectMastery[subject] = Math.min(100, currentMastery + masteryGained);

    // Record Cleared Level
    const currentCleared = profile.clearedLevels[subject] || [];
    if (!currentCleared.includes(levelNumber)) {
      profile.clearedLevels[subject] = [...currentCleared, levelNumber].sort((a, b) => a - b);
    }

    // Context-isolated progress tracking
    const activeK = profile.activeKingdom || 'secondary_bastion';
    const activeC = profile.activeClass || 'legacy_tier';
    const ctxProgress = this.getContextProgress(profile, activeK, activeC, subject);
    if (!ctxProgress.clearedLevels.includes(levelNumber)) {
      ctxProgress.clearedLevels.push(levelNumber);
      ctxProgress.clearedLevels.sort((a, b) => a - b);
    }
    ctxProgress.mastery = Math.min(100, ctxProgress.mastery + masteryGained);

    if (!profile.contextProgress) profile.contextProgress = {};
    const ctxKey = this.getContextKey(activeK, activeC, subject);
    profile.contextProgress[ctxKey] = ctxProgress;

    // Unlock Card
    if (unlockedCardId && !profile.unlockedCardIds.includes(unlockedCardId)) {
      profile.unlockedCardIds.push(unlockedCardId);
    }

    // Add Run History
    const run: RunRecord = {
      id: `run_${Date.now()}`,
      subject,
      levelNumber,
      levelTitle,
      result: 'VICTORY',
      score: xpGained * 10,
      timeTakenSeconds: actualTime,
      date: new Date().toLocaleDateString(),
      turnsUsed: actualTurns,
    };
    profile.runHistory.unshift(run);
    if (profile.runHistory.length > 20) profile.runHistory.pop();

    // Apply recency decay to performance data
    dangerEngine.applyRecencyDecay(profile);

    // Update Learning DNA
    const currentDna = profile.learningDNA || { ...DEFAULT_LEARNING_DNA };
    profile.learningDNA = learningDNAEngine.recordRunOutcome(
      currentDna,
      'VICTORY',
      actualTime,
      actualTurns,
      encounter?.pathType === 'hidden_trial'
    );

    this.saveProfile(profile);
    return profile;
  }

  public static recordDefeatOrRevision(
    subject: SubjectId,
    levelNumber: number,
    levelTitle: string,
    weaknessName: string,
    isRevisionVictory = false
  ): PlayerProfile {
    const profile = this.loadProfile();

    const run: RunRecord = {
      id: `run_${Date.now()}`,
      subject,
      levelNumber,
      levelTitle,
      result: isRevisionVictory ? 'VICTORY' : 'DEFEAT',
      score: isRevisionVictory ? 100 : 25,
      timeTakenSeconds: 30,
      date: new Date().toLocaleDateString(),
      turnsUsed: 2,
    };
    profile.runHistory.unshift(run);
    if (profile.runHistory.length > 20) profile.runHistory.pop();

    if (!isRevisionVictory) {
      if (!profile.weaknesses.includes(weaknessName)) {
        profile.weaknesses.push(weaknessName);
      }
    } else {
      profile.weaknesses = profile.weaknesses.filter(w => w !== weaknessName);
      if (profile.conceptPerformance) {
        const record = Object.values(profile.conceptPerformance).find(
          c => c.conceptName.toLowerCase().includes(weaknessName.toLowerCase())
        );
        if (record) {
          record.successfulRecoveries += 1;
          record.recentMistakes = Math.max(0, record.recentMistakes - 2);
          record.repeatedMistakes = Math.max(0, record.repeatedMistakes - 1);
          record.masteryLevel = Math.min(100, record.masteryLevel + 15);
        }
      }
    }

    // Update Learning DNA
    const currentDna = profile.learningDNA || { ...DEFAULT_LEARNING_DNA };
    profile.learningDNA = learningDNAEngine.recordRunOutcome(
      currentDna,
      isRevisionVictory ? 'REVISED' : 'DEFEAT',
      30,
      2,
      false,
      isRevisionVictory
    );

    this.saveProfile(profile);
    return profile;
  }

  public static repairWeakness(weaknessLabel: string, subject: SubjectId, masteryBonus: number): PlayerProfile {
    const profile = this.loadProfile();
    profile.weaknesses = profile.weaknesses.filter(w => w !== weaknessLabel);
    if (!profile.strengths.includes(`Repaired: ${weaknessLabel}`)) {
      profile.strengths.push(`Repaired: ${weaknessLabel}`);
    }
    profile.subjectMastery[subject] = Math.min(100, (profile.subjectMastery[subject] || 0) + masteryBonus);
    profile.xp += 60;

    // Find and update the concept performance record with recovery
    if (profile.conceptPerformance) {
      for (const key in profile.conceptPerformance) {
        const record = profile.conceptPerformance[key];
        if (record.subject === subject) {
          record.successfulRecoveries += 1;
          record.recentMistakes = Math.max(0, record.recentMistakes - 2);
          record.repeatedMistakes = Math.max(0, record.repeatedMistakes - 1);
          record.masteryLevel = Math.min(100, record.masteryLevel + 15);
        }
      }
    }

    this.saveProfile(profile);
    return profile;
  }

  public static recordSurpriseAttackResult(
    subject: SubjectId,
    attackId: string,
    outcome: 'victory' | 'defeat',
    xpReward: number,
    masteryReward: number,
    title?: string,
    relic?: string
  ): PlayerProfile {
    const profile = this.loadProfile();

    // Set 2-battle cooldown regardless of outcome to prevent immediate repeats
    profile.surpriseAttackCooldownBattles = 2;
    profile.lastSurpriseAttackTimestamp = Date.now();

    // Telemetry run logging
    const run: RunRecord = {
      id: `ambush_${Date.now()}`,
      subject,
      levelNumber: 999, // Ambush has no normal level number
      levelTitle: `[Surprise Ambush] ${attackId}`,
      result: outcome === 'victory' ? 'VICTORY' : 'DEFEAT',
      score: outcome === 'victory' ? xpReward * 12 : 50,
      timeTakenSeconds: 60,
      date: new Date().toLocaleDateString(),
      turnsUsed: outcome === 'victory' ? 2 : 4,
    };
    profile.runHistory.unshift(run);
    if (profile.runHistory.length > 20) profile.runHistory.pop();

    if (outcome === 'victory') {
      profile.surpriseAttacksCompleted = (profile.surpriseAttacksCompleted || 0) + 1;
      profile.xp += xpReward;
      while (profile.xp >= profile.xpToNextLevel) {
        profile.xp -= profile.xpToNextLevel;
        profile.level += 1;
        profile.xpToNextLevel = Math.round(profile.xpToNextLevel * 1.4);
      }
      const currentMastery = profile.subjectMastery[subject] || 0;
      profile.subjectMastery[subject] = Math.min(100, currentMastery + masteryReward);

      if (title) {
        if (!profile.title.includes(title)) {
          profile.title = `${title} of the Spire`;
        }
        if (!profile.prestigeTitles) profile.prestigeTitles = [];
        if (!profile.prestigeTitles.includes(title)) profile.prestigeTitles.push(title);
      }
      if (relic) {
        if (!profile.relics.includes(relic)) {
          profile.relics.push(relic);
        }
        if (!profile.discoveredRelics) profile.discoveredRelics = [...profile.relics];
        if (!profile.discoveredRelics.includes(relic)) {
          profile.discoveredRelics.push(relic);
        }
      }
      if (!profile.strengths.includes(`Ambush Conqueror: ${subject}`)) {
        profile.strengths.push(`Ambush Conqueror: ${subject}`);
      }
    } else {
      // DEFENSIVE PERSISTENCE: Defeat preserves 100% of cleared levels, XP, cards, relics, and mastery!
      // Simply log diagnosed weakness for Echo Dungeon repair without modifying core progression
      const weaknessTag = 'Dimensional Ambush Disruption';
      if (!profile.weaknesses.includes(weaknessTag)) {
        profile.weaknesses.push(weaknessTag);
      }
    }

    this.saveProfile(profile);
    return profile;
  }

  public static hasDefeatedAllRealmBosses(profileOverride?: PlayerProfile): boolean {
    const profile = profileOverride || this.loadProfile();
    return convergenceEngine.hasDefeatedAllRealmBosses(profile);
  }

  public static recordConvergenceCompletion(score: number): PlayerProfile {
    const profile = this.loadProfile();
    const isFirstClear = !profile.convergenceCompleted;

    profile.convergenceAttempts = (profile.convergenceAttempts || 0) + 1;
    profile.convergenceCompleted = true;
    profile.convergenceCompletedAt = Date.now();
    profile.convergenceBestScore = Math.max(profile.convergenceBestScore || 0, score);

    // Defensive reward logic: only grant unique title and relic on first clear (no infinite farming)
    if (isFirstClear) {
      profile.xp += 350;
      while (profile.xp >= profile.xpToNextLevel) {
        profile.xp -= profile.xpToNextLevel;
        profile.level += 1;
        profile.xpToNextLevel = Math.round(profile.xpToNextLevel * 1.4);
      }
      profile.title = 'Apex of the Spire';
      if (!profile.prestigeTitles) profile.prestigeTitles = [];
      if (!profile.prestigeTitles.includes('Apex of the Spire')) {
        profile.prestigeTitles.push('Apex of the Spire');
      }
      const relicName = 'Prism of the Council';
      if (!profile.relics.includes(relicName)) {
        profile.relics.push(relicName);
      }
      if (!profile.discoveredRelics) profile.discoveredRelics = [...profile.relics];
      if (!profile.discoveredRelics.includes(relicName)) {
        profile.discoveredRelics.push(relicName);
      }
      if (!profile.strengths.includes('Conqueror of the Council')) {
        profile.strengths.push('Conqueror of the Council');
      }
      const cardName = 'conv_invariant';
      if (!profile.unlockedCardIds.includes(cardName)) {
        profile.unlockedCardIds.push(cardName);
      }
    }

    const run: RunRecord = {
      id: `conv_${Date.now()}`,
      subject: 'mathematics',
      levelNumber: 9999,
      levelTitle: '[THE CONVERGENCE] Final Examination',
      result: 'VICTORY',
      score,
      timeTakenSeconds: 120,
      date: new Date().toLocaleDateString(),
      turnsUsed: 5,
    };
    profile.runHistory.unshift(run);
    if (profile.runHistory.length > 20) profile.runHistory.pop();

    this.saveProfile(profile);
    return profile;
  }

  public static recordObserverImpression(
    eventType:
      | 'high_difficulty_victory'
      | 'recovery_from_repeated_mistakes'
      | 'counter_strategy_adapted'
      | 'cross_domain_synthesis'
      | 'mirror_boss_defeated'
      | 'mastery_compression_cleared'
      | 'convergence_triumph'
      | 'easy_level_cleared',
    details?: string
  ): PlayerProfile {
    const profile = this.loadProfile();
    const currentState = profile.observerState || { ...DEFAULT_OBSERVER_STATE };
    const updated = observerEngine.recordImpressionEvent(currentState, eventType, details);
    profile.observerState = updated;
    this.saveProfile(profile);
    return profile;
  }

  public static recordObserverChallengeCompletion(isVictory: boolean): PlayerProfile {
    const profile = this.loadProfile();
    const currentState = profile.observerState || { ...DEFAULT_OBSERVER_STATE };
    if (isVictory) {
      currentState.challengeCompleted = true;
      currentState.impression = 100;
      const askOpp = observerEngine.evaluateAskAnythingOpportunity(currentState, true);
      if (askOpp.unlocked) {
        currentState.askAnythingUnlocked = true;
      }
    }
    currentState.cooldownEncounters = 5;
    profile.observerState = currentState;
    this.saveProfile(profile);
    return profile;
  }

  public static recordAskAnythingUsed(): PlayerProfile {
    const profile = this.loadProfile();
    if (profile.observerState) {
      profile.observerState.askAnythingUsed = true;
      profile.observerState.askAnythingUnlocked = false;
      this.saveProfile(profile);
    }
    return profile;
  }

  public static recordMirrorBossResult(
    mirrorId: string,
    result: 'victory' | 'defeat',
    rewardXp: number = 150,
    mirrorMark?: string
  ): PlayerProfile {
    const profile = this.loadProfile();
    const mirrorState = profile.mirrorBossState || { ...DEFAULT_MIRROR_STATE };

    if (!mirrorState.encounteredMirrors.includes(mirrorId)) {
      mirrorState.encounteredMirrors.push(mirrorId);
    }
    mirrorState.cooldownEncounters = 3;
    mirrorState.lastMirrorBossId = mirrorId;

    if (result === 'victory') {
      if (!mirrorState.defeatedMirrors.includes(mirrorId)) {
        mirrorState.defeatedMirrors.push(mirrorId);
      }
      profile.xp += rewardXp;
      if (mirrorMark) {
        if (!profile.relics.includes(mirrorMark)) {
          profile.relics.push(mirrorMark);
        }
        if (!profile.discoveredRelics) profile.discoveredRelics = [...profile.relics];
        if (!profile.discoveredRelics.includes(mirrorMark)) {
          profile.discoveredRelics.push(mirrorMark);
        }
      }
      if (profile.title !== 'Apex of the Spire') {
        profile.title = 'Reflective Sovereign';
      }
      if (!profile.prestigeTitles) profile.prestigeTitles = [];
      if (!profile.prestigeTitles.includes('Reflective Sovereign')) {
        profile.prestigeTitles.push('Reflective Sovereign');
      }
    }

    profile.mirrorBossState = mirrorState;
    this.saveProfile(profile);
    return profile;
  }

  public static recordLastQuestionResponse(
    studentResponse: string,
    endingVariant: EndingVariant
  ): PlayerProfile {
    const profile = this.loadProfile();
    profile.lastQuestionResult = {
      completedAt: Date.now(),
      endingVariant,
      studentResponse,
    };
    this.saveProfile(profile);
    return profile;
  }

  public static getContextKey(
    kingdomId: string = 'secondary_bastion',
    classId: string = 'legacy_tier',
    subjectId: SubjectId = 'mathematics'
  ): string {
    return `${kingdomId}:${classId}:${subjectId}`;
  }

  public static getContextProgress(
    profile: PlayerProfile,
    kingdomId?: string,
    classId?: string,
    subjectId: SubjectId = 'mathematics'
  ): { mastery: number; clearedLevels: number[]; clearedHiddenTrials: string[] } {
    const k = kingdomId || profile.activeKingdom || 'secondary_bastion';
    const c = classId || profile.activeClass || 'legacy_tier';
    const key = this.getContextKey(k, c, subjectId);

    if (profile.contextProgress && profile.contextProgress[key]) {
      return {
        mastery: profile.contextProgress[key].mastery ?? 0,
        clearedLevels: profile.contextProgress[key].clearedLevels ?? [],
        clearedHiddenTrials: profile.contextProgress[key].clearedHiddenTrials ?? [],
      };
    }

    // Safe legacy fallback: if in legacy context, return existing root progress
    if (c === 'legacy_tier') {
      return {
        mastery: profile.subjectMastery[subjectId] ?? 0,
        clearedLevels: profile.clearedLevels[subjectId] ?? [],
        clearedHiddenTrials: profile.clearedHiddenTrials?.[subjectId] ?? [],
      };
    }

    // Clean isolated progression for unplayed classes
    return {
      mastery: 0,
      clearedLevels: [],
      clearedHiddenTrials: [],
    };
  }

  public static saveContextProgress(
    profile: PlayerProfile,
    kingdomId: string,
    classId: string,
    subjectId: SubjectId,
    progress: { mastery: number; clearedLevels: number[]; clearedHiddenTrials?: string[] }
  ): PlayerProfile {
    if (!profile.contextProgress) {
      profile.contextProgress = {};
    }
    const key = this.getContextKey(kingdomId, classId, subjectId);
    profile.contextProgress[key] = {
      mastery: Math.min(100, progress.mastery),
      clearedLevels: [...progress.clearedLevels].sort((a, b) => a - b),
      clearedHiddenTrials: progress.clearedHiddenTrials ? [...progress.clearedHiddenTrials] : [],
    };

    // Keep active root subjectMastery/clearedLevels in sync for backward compatibility
    const activeK = profile.activeKingdom || 'secondary_bastion';
    const activeC = profile.activeClass || 'legacy_tier';
    if (activeK === kingdomId && activeC === classId) {
      profile.subjectMastery[subjectId] = profile.contextProgress[key].mastery;
      if (!profile.clearedHiddenTrials && DEFAULT_PROFILE.clearedHiddenTrials) {
        profile.clearedHiddenTrials = { ...DEFAULT_PROFILE.clearedHiddenTrials };
      }
      if (profile.clearedHiddenTrials) {
        profile.clearedHiddenTrials[subjectId] = [...profile.contextProgress[key].clearedHiddenTrials!];
      }
    }

    this.saveProfile(profile);
    return profile;
  }

  public static setActiveKingdomAndClass(
    kingdomId: string,
    classId: string
  ): PlayerProfile {
    const profile = this.loadProfile();
    profile.activeKingdom = kingdomId;
    profile.activeClass = classId;
    this.saveProfile(profile);
    return profile;
  }

  public static isLevelUnlocked(
    subject: SubjectId,
    levelIdentifier: number | string,
    profileOverride?: PlayerProfile,
    contextClassId?: string,
    contextKingdomId?: string
  ): boolean {
    const profile = profileOverride || this.loadProfile();
    const activeKingdom = contextKingdomId || profile.activeKingdom || 'secondary_bastion';
    const activeClass = contextClassId || profile.activeClass || 'legacy_tier';
    const ctxProgress = this.getContextProgress(profile, activeKingdom, activeClass, subject);
    const cleared = ctxProgress.clearedLevels;
    const clearedTrials = ctxProgress.clearedHiddenTrials;

    // String identifier checks
    if (typeof levelIdentifier === 'string') {
      if (levelIdentifier === 'dsa_m1_01' || levelIdentifier.endsWith('_lvl_1')) return true;

      // Modular encounter pattern (e.g., dsa_m1_01 -> 1, dsa_m2_01 -> 11, etc.)
      const modMatch = levelIdentifier.match(/_m(\d+)_(\d+)/);
      if (modMatch) {
        const modNum = parseInt(modMatch[1], 10);
        const seqNum = parseInt(modMatch[2], 10);
        let lvlNum = seqNum;
        if (modNum === 1) lvlNum = seqNum;
        else if (modNum === 2) lvlNum = 10 + seqNum;
        else if (modNum === 3) lvlNum = 24 + seqNum;
        else if (modNum === 4) lvlNum = 34 + seqNum;
        else if (modNum === 5) lvlNum = 44 + seqNum;

        if (lvlNum === 1) return true;
        return cleared.includes(lvlNum - 1);
      }

      if (levelIdentifier.endsWith('_lvl_2')) return cleared.includes(1);
      if (levelIdentifier.endsWith('_lvl_3')) return cleared.includes(2);
      if (levelIdentifier.endsWith('_lvl_4')) {
        if (subject === 'data_structures_algorithms' || levelIdentifier === 'dsa_lvl_4') {
          return cleared.includes(34);
        }
        return cleared.includes(3);
      }
      if (levelIdentifier.endsWith('_boss')) {
        return cleared.includes(4) || MasteryCompressionEngine.canAccessFinalBoss(subject, profile).allowed;
      }
      if (levelIdentifier.includes('hidden_trial_1')) {
        return cleared.includes(1);
      }
      if (levelIdentifier.includes('hidden_trial_2')) {
        const trial1Id = `${subject === 'mathematics' ? 'math' : subject === 'data_structures_algorithms' ? 'dsa' : 'cs'}_hidden_trial_1`;
        return clearedTrials.includes(trial1Id);
      }

      // DSA Hidden Mastery Compression Path (HD1 to HD12)
      const dsaHdMatch = levelIdentifier.match(/(?:dsa_hidden_hd|hd_dsa_)(\d+)/);
      if (dsaHdMatch) {
        if (!profile.dsaHiddenPathDiscovered) return false;
        const hdNum = parseInt(dsaHdMatch[1], 10);
        if (hdNum === 1) {
          return cleared.includes(10) || cleared.length >= 10;
        }
        const prevHdId = `dsa_hidden_hd${hdNum - 1}`;
        const prevHdAlt = `hd_dsa_${String(hdNum - 1).padStart(2, '0')}`;
        const dsaClearedTrials = profile.dsaHiddenPathClearedLevels || [];
        return (
          clearedTrials.includes(prevHdId) ||
          clearedTrials.includes(prevHdAlt) ||
          dsaClearedTrials.includes(100 + hdNum - 1)
        );
      }
    }

    // DSA numeric hidden trials (levels 101 to 112)
    if (subject === 'data_structures_algorithms' && typeof levelIdentifier === 'number' && levelIdentifier >= 101 && levelIdentifier <= 112) {
      if (!profile.dsaHiddenPathDiscovered) return false;
      if (levelIdentifier === 101) {
        return cleared.includes(10) || cleared.length >= 10;
      }
      const dsaClearedTrials = profile.dsaHiddenPathClearedLevels || [];
      return dsaClearedTrials.includes(levelIdentifier - 1) || clearedTrials.includes(`dsa_hidden_hd${levelIdentifier - 100 - 1}`);
    }

    // Numeric identifier checks
    if (levelIdentifier === 1) return true;
    if (levelIdentifier === 2) return cleared.includes(1);
    if (levelIdentifier === 3) return cleared.includes(2);
    if (levelIdentifier === 4) return cleared.includes(3);
    if (levelIdentifier === 5) {
      return cleared.includes(4) || MasteryCompressionEngine.canAccessFinalBoss(subject, profile).allowed;
    }
    // Hidden Trial 1 (level 101) requires Main Stage 1 for non-DSA subjects
    if (levelIdentifier === 101) {
      return cleared.includes(1);
    }
    // Hidden Trial 2 (level 102) requires Hidden Trial 1
    if (levelIdentifier === 102) {
      const trial1Id = `${subject === 'mathematics' ? 'math' : 'cs'}_hidden_trial_1`;
      return clearedTrials.includes(trial1Id);
    }

    // Default fallback
    if (typeof levelIdentifier === 'number') {
      return cleared.includes(levelIdentifier - 1);
    }
    return false;
  }

  public static isDSAHiddenPathDiscovered(profile?: PlayerProfile): boolean {
    const prof = profile || this.loadProfile();
    return !!prof.dsaHiddenPathDiscovered;
  }

  public static unlockDSAHiddenPath(profile?: PlayerProfile): { unlocked: boolean; reason: string; profile: PlayerProfile } {
    let prof = profile ? { ...profile } : this.loadProfile();
    if (prof.dsaHiddenPathDiscovered) {
      return { unlocked: true, reason: 'Crucible of DSA is already accessible.', profile: prof };
    }

    // Anti-exploit gate: rapid pattern exploiters cannot discover the hidden path
    const liveMetrics = telemetry.getLiveMetrics();
    if (
      liveMetrics.isRapidExploit ||
      prof.behaviorClassification === 'RAPID_PATTERN_EXPLOIT' ||
      (prof.exploitStreakCount && prof.exploitStreakCount >= 2)
    ) {
      return {
        unlocked: false,
        reason: 'The Crucible shifts out of phase. Rapid pattern exploits disrupt the resonance frequency.',
        profile: prof,
      };
    }

    // Gated requirement: Player must have cleared at least Module 1 (Level 10) of DSA
    const cleared = prof.clearedLevels['data_structures_algorithms'] || [];
    const hasFoundation = cleared.includes(10) || cleared.length >= 10;
    if (!hasFoundation) {
      return {
        unlocked: false,
        reason: 'Mastery of foundational Module 1 algorithmic proofs required before Crucible synthesis opens.',
        profile: prof,
      };
    }

    prof.dsaHiddenPathDiscovered = true;
    this.saveProfile(prof);
    return {
      unlocked: true,
      reason: 'Crucible of Compression unlocked! The 12 Dense Synthesis Trials are now accessible.',
      profile: prof,
    };
  }

  public static recordDSAHiddenTrialVictory(
    levelNumber: number,
    trialId: string,
    isBoss: boolean = false
  ): PlayerProfile {
    let profile = this.loadProfile();
    if (!profile.dsaHiddenPathClearedLevels) profile.dsaHiddenPathClearedLevels = [];
    if (!profile.dsaHiddenPathClearedLevels.includes(levelNumber)) {
      profile.dsaHiddenPathClearedLevels.push(levelNumber);
      profile.dsaHiddenPathClearedLevels.sort((a, b) => a - b);
    }
    if (isBoss || levelNumber === 112 || trialId === 'hd_dsa_12' || trialId === 'dsa_hidden_hd12') {
      profile.dsaHiddenPathBossDefeated = true;
      if (!profile.prestigeTitles) profile.prestigeTitles = [];
      if (!profile.prestigeTitles.includes('Ascendant of Algorithms')) {
        profile.prestigeTitles.push('Ascendant of Algorithms');
      }
    }
    if (!profile.clearedHiddenTrials) {
      profile.clearedHiddenTrials = {
        mathematics: [],
        computerScience: [],
        data_structures_algorithms: [],
        physics: [],
        chemistry: [],
        biology: [],
        history: [],
        geography: [],
        language: [],
      };
    }
    if (!profile.clearedHiddenTrials.data_structures_algorithms) {
      profile.clearedHiddenTrials.data_structures_algorithms = [];
    }
    if (!profile.clearedHiddenTrials.data_structures_algorithms.includes(trialId)) {
      profile.clearedHiddenTrials.data_structures_algorithms.push(trialId);
    }
    this.saveProfile(profile);
    return profile;
  }

  public static loadSettings(): GameSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {}
    return { ...DEFAULT_SETTINGS };
  }

  public static saveSettings(settings: GameSettings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
  }

  public static resetAllData() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SETTINGS_KEY);
    } catch {}
  }
}
