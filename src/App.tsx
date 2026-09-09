import React, { useState, useEffect } from 'react';
import { AppScreen, SubjectId, Card } from './types/game';
import { EncounterDefinition } from './types/curriculum';
import { PlayerProfile, DangerEventDefinition } from './types/telemetry';
import { ENCOUNTERS_MAP, ECHO_VAULTS_MAP, getAvailableSubjectsForClass, getClass } from './curriculum/registry';
import { StorageManager } from './persistence/StorageManager';
import { dangerEngine } from './engine/DangerEngine';
import { surpriseAttackEngine } from './engine/SurpriseAttackEngine';
import { SurpriseAttackDefinition } from './types/surpriseAttack';
import { TopNavigation } from './components/TopNavigation';
import { HomeScreen } from './screens/HomeScreen';
import { SubjectSelectScreen } from './screens/SubjectSelectScreen';
import { EducationSelectScreen } from './screens/EducationSelectScreen';
import { WorldMapScreen } from './screens/WorldMapScreen';
import { StoryIntroScreen } from './screens/StoryIntroScreen';
import { BattleScreen } from './screens/BattleScreen';
import { EchoDungeonScreen } from './screens/EchoDungeonScreen';
import { VictoryScreen } from './screens/VictoryScreen';
import { DefeatScreen } from './screens/DefeatScreen';
import { DeckScreen } from './screens/DeckScreen';
import { KnowledgeMapScreen } from './screens/KnowledgeMapScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { SurpriseAttackWarningScreen } from './screens/SurpriseAttackWarningScreen';
import { SurpriseAttackBattleScreen } from './screens/SurpriseAttackBattleScreen';
import { ConvergenceRevealScreen } from './screens/ConvergenceRevealScreen';
import { ConvergenceBattleScreen } from './screens/ConvergenceBattleScreen';
import { ConvergenceVictoryScreen } from './screens/ConvergenceVictoryScreen';
import { ObserverChallengeScreen } from './screens/ObserverChallengeScreen';
import { ObserverDialogueScreen } from './screens/ObserverDialogueScreen';
import { MirrorBossScreen } from './screens/MirrorBossScreen';
import { LastQuestionScreen } from './screens/LastQuestionScreen';
import { TrueEndingScreen } from './screens/TrueEndingScreen';
import { MirrorBossDefinition, EndingVariant } from './types/learningDna';
import { observerEngine } from './engine/ObserverEngine';
import { mirrorBossEngine } from './engine/MirrorBossEngine';
import { sounds } from './audio/SoundEffects';
import { questionSelectionEngine } from './engine/QuestionSelectionEngine';

export const App: React.FC = () => {
  // Screen & Navigation State
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('HOME');
  const [activeSubject, setActiveSubject] = useState<SubjectId>('mathematics');
  const [activeLevelNumber, setActiveLevelNumber] = useState<number>(1);
  const [activeVaultId, setActiveVaultId] = useState<string>('vault_factorization');
  const [isJudgeDemo, setIsJudgeDemo] = useState<boolean>(false);
  const [battleSessionId, setBattleSessionId] = useState<number>(0);
  const [activeEncounterInstance, setActiveEncounterInstance] = useState<EncounterDefinition | null>(null);
  const [activeDangerEvent, setActiveDangerEvent] = useState<DangerEventDefinition | undefined>(undefined);
  const [savedNormalLevel, setSavedNormalLevel] = useState<number>(1);
  const [activeSurpriseAttack, setActiveSurpriseAttack] = useState<SurpriseAttackDefinition | null>(null);
  const [activeMirrorBoss, setActiveMirrorBoss] = useState<MirrorBossDefinition | null>(null);
  const [lastEndingVariant, setLastEndingVariant] = useState<EndingVariant>('THE SCHOLAR');
  const [lastStudentResponse, setLastStudentResponse] = useState<string>('');

  // Combat Outcome Cache
  const [lastVictoryEncounter, setLastVictoryEncounter] = useState<EncounterDefinition | null>(null);
  const [lastVictoryTurns, setLastVictoryTurns] = useState<number>(3);
  const [lastUnlockedCard, setLastUnlockedCard] = useState<Card | undefined>(undefined);
  const [lastDefeatWeakness, setLastDefeatWeakness] = useState<string>('Procedural Misalignment');
  const [lastConvergenceScore, setLastConvergenceScore] = useState<number>(0);

  // Persistent Player Profile State
  const [profile, setProfile] = useState<PlayerProfile>(() => StorageManager.loadProfile());

  // Reload profile helper
  const refreshProfile = () => {
    setProfile(StorageManager.loadProfile());
  };

  // Sync sounds state with saved settings on initial mount
  useEffect(() => {
    const settings = StorageManager.loadSettings();
    sounds.setMuted(settings.isMuted);
    sounds.setVolume(settings.volume);
  }, []);

  // Get active encounter object
  const getActiveEncounter = (): EncounterDefinition => {
    if (
      activeEncounterInstance &&
      activeEncounterInstance.subject === activeSubject &&
      activeEncounterInstance.levelNumber === activeLevelNumber
    ) {
      return activeEncounterInstance;
    }
    const subjectEncounters = ENCOUNTERS_MAP[activeSubject] || ENCOUNTERS_MAP.mathematics;
    const found = subjectEncounters.find(e => e.levelNumber === activeLevelNumber) || subjectEncounters[0];
    return questionSelectionEngine.getEncounterWithSelectedQuestion(found, {
      isJudgeDemo,
    });
  };

  // Launch the 5-Minute Golden Judge Demo (Strictly 0% Danger & 0% Surprise Attack)
  const handleLaunchJudgeDemo = () => {
    sounds.playClick();
    setIsJudgeDemo(true);
    setBattleSessionId(prev => prev + 1);
    setActiveDangerEvent(undefined);
    setActiveSurpriseAttack(null);
    setActiveSubject('mathematics');
    setActiveLevelNumber(1);
    const baseMath = ENCOUNTERS_MAP.mathematics[0];
    const demoEncounter = questionSelectionEngine.getEncounterWithSelectedQuestion(baseMath, {
      isJudgeDemo: true,
    });
    setActiveEncounterInstance(demoEncounter);
    setCurrentScreen('BATTLE');
  };

  // Handlers for Screen Transitions
  const handleSelectSubject = (subj: SubjectId) => {
    setActiveSubject(subj);
    setActiveEncounterInstance(null);
    setCurrentScreen('WORLD_MAP');
  };

  const handleSelectLevel = (levelNumber: number) => {
    setActiveLevelNumber(levelNumber);
    setActiveEncounterInstance(null);
    setCurrentScreen('STORY_INTRO');
  };

  const handleStartBattle = () => {
    setIsJudgeDemo(false);
    setBattleSessionId(prev => prev + 1);
    const subjectEncounters = ENCOUNTERS_MAP[activeSubject] || ENCOUNTERS_MAP.mathematics;
    const found = subjectEncounters.find(e => e.levelNumber === activeLevelNumber) || subjectEncounters[0];
    const encounter = questionSelectionEngine.getEncounterWithSelectedQuestion(found, {
      isJudgeDemo: false,
    });
    setActiveEncounterInstance(encounter);

    // Check for Surprise Attack:
    // Only triggers for normal battles (not Judge Demo, not hidden trial, not already in surprise attack)
    if (
      !isJudgeDemo &&
      encounter.pathType !== 'hidden_trial' &&
      surpriseAttackEngine.shouldTriggerAttack(activeSubject, false, profile)
    ) {
      setSavedNormalLevel(activeLevelNumber);
      const ambush = surpriseAttackEngine.getSurpriseAttack(activeSubject, profile);
      setActiveSurpriseAttack(ambush);
      setCurrentScreen('SURPRISE_ATTACK_WARNING');
      return;
    }

    // Evaluate low-frequency weighted danger trigger
    if (dangerEngine.shouldTriggerDanger(activeSubject, false, profile)) {
      const danger = dangerEngine.selectWeightedDanger(activeSubject, profile);
      setActiveDangerEvent(danger || undefined);
    } else {
      setActiveDangerEvent(undefined);
    }
    setCurrentScreen('BATTLE');
  };

  const handleSurpriseAttackVictory = (
    attack: SurpriseAttackDefinition,
    xpReward: number,
    masteryReward: number,
    title: string,
    relic: string
  ) => {
    const updatedProfile = StorageManager.recordSurpriseAttackResult(
      attack.subject,
      attack.id,
      'victory',
      xpReward,
      masteryReward,
      title,
      relic
    );
    setProfile(updatedProfile);
    // Return seamlessly to saved normal destination
    setActiveLevelNumber(savedNormalLevel);
    setCurrentScreen('STORY_INTRO');
  };

  const handleSurpriseAttackDefeat = (
    attack: SurpriseAttackDefinition,
    _diagnosedWeakness: string
  ) => {
    const updatedProfile = StorageManager.recordSurpriseAttackResult(
      attack.subject,
      attack.id,
      'defeat',
      0,
      0
    );
    setProfile(updatedProfile);
    // Return seamlessly to saved normal destination with zero loss of progress
    setActiveLevelNumber(savedNormalLevel);
    setCurrentScreen('STORY_INTRO');
  };

  const handleEnterEchoVault = (vaultId: string) => {
    setActiveVaultId(vaultId);
    setCurrentScreen('ECHO_DUNGEON');
  };

  const [lastDefeatStepIndex, setLastDefeatStepIndex] = useState<number>(0);
  const [lastDefeatAttemptedOp, setLastDefeatAttemptedOp] = useState<string>('');

  const handleVictory = (encounter: EncounterDefinition, turnsUsed: number) => {
    setLastVictoryEncounter(encounter);
    setLastVictoryTurns(turnsUsed);
    setLastUnlockedCard(encounter.unlockedCard);

    // Persist victory & unlock next level / compression mastery
    const updatedProfile = StorageManager.recordLevelVictory(
      encounter.subject,
      encounter.levelNumber,
      encounter.levelTitle,
      encounter.rewardXp,
      encounter.rewardMastery,
      encounter.unlockedCard?.id,
      encounter
    );
    setProfile(updatedProfile);
    setCurrentScreen('VICTORY');
  };

  const handleConvergenceVictory = (score: number) => {
    setLastConvergenceScore(score);
    const updatedProfile = StorageManager.recordConvergenceCompletion(score);
    setProfile(updatedProfile);
    // Transition to the Last Question rather than immediate abrupt screen
    setCurrentScreen('LAST_QUESTION');
  };

  const handleLastQuestionComplete = (response: string, endingVariant: EndingVariant) => {
    const updated = StorageManager.recordLastQuestionResponse(response, endingVariant);
    setProfile(updated);
    setLastEndingVariant(endingVariant);
    setLastStudentResponse(response);
    setCurrentScreen('TRUE_ENDING');
  };

  const handleObserverChallengeVictory = (unlockedAskAnything: boolean) => {
    const updated = StorageManager.recordObserverChallengeCompletion(true);
    setProfile(updated);
    if (unlockedAskAnything) {
      setCurrentScreen('OBSERVER_DIALOGUE');
    } else {
      setCurrentScreen('WORLD_MAP');
    }
  };

  const handleObserverChallengeDefeat = () => {
    const updated = StorageManager.recordObserverChallengeCompletion(false);
    setProfile(updated);
    setCurrentScreen('WORLD_MAP');
  };

  const handleObserverDialogueComplete = () => {
    const updated = StorageManager.recordAskAnythingUsed();
    setProfile(updated);
    setCurrentScreen('WORLD_MAP');
  };

  const handleMirrorBossVictory = (rewardXp: number, mirrorMark: string) => {
    if (activeMirrorBoss) {
      const updated = StorageManager.recordMirrorBossResult(
        activeMirrorBoss.id,
        'victory',
        rewardXp,
        mirrorMark
      );
      setProfile(updated);
    }
    setCurrentScreen('WORLD_MAP');
  };

  const handleMirrorBossDefeat = (_weaknessName: string, _echoVaultId: string) => {
    if (activeMirrorBoss) {
      const updated = StorageManager.recordMirrorBossResult(
        activeMirrorBoss.id,
        'defeat',
        0
      );
      setProfile(updated);
    }
    refreshProfile();
    setCurrentScreen('WORLD_MAP');
  };

  const handleConvergenceDefeat = (_weaknessName: string) => {
    refreshProfile();
    setCurrentScreen('WORLD_MAP');
  };

  const handleDefeat = (
    encounter: EncounterDefinition,
    weaknessName?: string,
    failedStepIndex?: number,
    lastAttemptedOp?: string
  ) => {
    const weakness = weaknessName || 'Procedural Misalignment';
    setLastDefeatWeakness(weakness);
    setLastDefeatStepIndex(failedStepIndex ?? 0);
    setLastDefeatAttemptedOp(lastAttemptedOp ?? '');

    // Record defeat in telemetry logs
    const updatedProfile = StorageManager.recordDefeatOrRevision(
      encounter.subject,
      encounter.levelNumber,
      encounter.levelTitle,
      weakness,
      false
    );
    setProfile(updatedProfile);
    setCurrentScreen('DEFEAT');
  };

  const handleReturnToMainPathStage = (stageNumber: number) => {
    setActiveLevelNumber(stageNumber);
    setActiveEncounterInstance(null);
    setBattleSessionId(prev => prev + 1);
    setCurrentScreen('STORY_INTRO');
  };

  const handleEchoVaultRepaired = () => {
    refreshProfile();
    // Return back into combat or world map
    setCurrentScreen('BATTLE');
  };

  const handleProceedToNextLevel = () => {
    setActiveEncounterInstance(null);
    setBattleSessionId(prev => prev + 1);

    // Check if Mirror Boss triggers (only when defeated a boss, not in Judge Demo)
    if (lastVictoryEncounter?.isBoss && !isJudgeDemo) {
      const mirrorCheck = mirrorBossEngine.evaluateMirrorBossOpportunity(
        activeSubject,
        profile,
        isJudgeDemo
      );
      if (mirrorCheck.shouldTrigger && mirrorCheck.bossDef) {
        setActiveMirrorBoss(mirrorCheck.bossDef);
        setCurrentScreen('MIRROR_BOSS_BATTLE');
        return;
      }
    }

    // Check if Observer Challenge triggers (high impression, not Judge Demo)
    if (!isJudgeDemo && observerEngine.shouldTriggerObserverChallenge(profile, isJudgeDemo)) {
      setCurrentScreen('OBSERVER_CHALLENGE');
      return;
    }

    // If completed a hidden trial
    if (lastVictoryEncounter?.pathType === 'hidden_trial') {
      if (lastVictoryEncounter.trialOrder === 1) {
        const trial2 = ENCOUNTERS_MAP[activeSubject]?.find(
          e => e.pathType === 'hidden_trial' && e.trialOrder === 2
        );
        if (trial2) {
          setActiveLevelNumber(trial2.levelNumber);
          setCurrentScreen('STORY_INTRO');
          return;
        }
      } else if (lastVictoryEncounter.trialOrder === 2) {
        // Conquering Trial 2 unlocks Final Boss!
        const boss = ENCOUNTERS_MAP[activeSubject]?.find(e => e.isBoss);
        if (boss) {
          setActiveLevelNumber(boss.levelNumber);
          setCurrentScreen('STORY_INTRO');
          return;
        }
      }
    }

    const nextLevel = activeLevelNumber + 1;
    const subjectEncounters = ENCOUNTERS_MAP[activeSubject] || [];
    const hasNext = subjectEncounters.some(
      e => e.levelNumber === nextLevel && e.pathType !== 'hidden_trial'
    );

    if (hasNext) {
      setActiveLevelNumber(nextLevel);
      setCurrentScreen('STORY_INTRO');
    } else {
      setCurrentScreen('WORLD_MAP');
    }
  };

  return (
    <div className="min-h-screen bg-[#07080d] text-slate-100 flex flex-col">
      {/* Universal Top Navigation Header */}
      <TopNavigation
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
        activeSubject={['WORLD_MAP', 'STORY_INTRO', 'BATTLE', 'VICTORY', 'DEFEAT', 'SURPRISE_ATTACK_WARNING', 'SURPRISE_ATTACK_BATTLE'].includes(currentScreen) ? activeSubject : undefined}
        profile={profile}
        onLaunchJudgeDemo={handleLaunchJudgeDemo}
      />

      {/* Decoupled Screen Switcher */}
      <main className="flex-1 flex flex-col">
        {currentScreen === 'HOME' && (
          <HomeScreen
            onNavigate={(screen) => setCurrentScreen(screen)}
            onLaunchJudgeDemo={handleLaunchJudgeDemo}
          />
        )}

        {currentScreen === 'SUBJECT_SELECT' && (
          <SubjectSelectScreen
            profile={profile}
            onSelectSubject={handleSelectSubject}
            onChangeEducationRank={() => setCurrentScreen('EDUCATION_SELECT')}
            onBack={() => setCurrentScreen('HOME')}
          />
        )}

        {currentScreen === 'EDUCATION_SELECT' && (
          <EducationSelectScreen
            profile={profile}
            onSelectKingdomAndClass={(kingdomId, classId) => {
              const updated = {
                ...profile,
                activeKingdom: kingdomId,
                activeClass: classId,
              };
              StorageManager.saveProfile(updated);
              setProfile(updated);
              // Ensure activeSubject is valid for new class
              const allowed = getAvailableSubjectsForClass(classId);
              if (!allowed.includes(activeSubject)) {
                const cls = getClass(classId);
                if (cls) setActiveSubject(cls.defaultSubjectId);
              }
              setCurrentScreen('SUBJECT_SELECT');
            }}
            onBack={() => setCurrentScreen('HOME')}
          />
        )}

        {currentScreen === 'WORLD_MAP' && (
          <WorldMapScreen
            subject={activeSubject}
            profile={profile}
            onSelectLevel={handleSelectLevel}
            onOpenStory={() => setCurrentScreen('STORY_INTRO')}
            onBackToSubjects={() => setCurrentScreen('SUBJECT_SELECT')}
          />
        )}

        {currentScreen === 'STORY_INTRO' && (
          <StoryIntroScreen
            subject={activeSubject}
            onContinueToBattle={handleStartBattle}
            onBackToMap={() => setCurrentScreen('WORLD_MAP')}
          />
        )}

        {currentScreen === 'BATTLE' && (
          <BattleScreen
            key={`${getActiveEncounter().id}_${activeLevelNumber}_${battleSessionId}_${getActiveEncounter().initialEquationOrState}`}
            encounter={getActiveEncounter()}
            activeDanger={activeDangerEvent}
            onVictory={handleVictory}
            onDefeat={handleDefeat}
            onEnterEchoVault={handleEnterEchoVault}
          />
        )}

        {currentScreen === 'ECHO_DUNGEON' && (
          <EchoDungeonScreen
            vault={ECHO_VAULTS_MAP[activeVaultId] || ECHO_VAULTS_MAP.vault_factorization}
            onCompleteRepair={handleEchoVaultRepaired}
            onExitWithoutRepair={() => setCurrentScreen('BATTLE')}
          />
        )}

        {currentScreen === 'VICTORY' && lastVictoryEncounter && (
          <VictoryScreen
            encounter={lastVictoryEncounter}
            turnsUsed={lastVictoryTurns}
            unlockedCard={lastUnlockedCard}
            onProceedToNextLevel={handleProceedToNextLevel}
            onViewProfile={() => setCurrentScreen('PROFILE')}
            onReturnToMap={() => setCurrentScreen('WORLD_MAP')}
            isAllBossesDefeated={StorageManager.hasDefeatedAllRealmBosses(profile)}
            onTriggerConvergence={() => setCurrentScreen('CONVERGENCE_REVEAL')}
          />
        )}

        {currentScreen === 'DEFEAT' && (
          <DefeatScreen
            encounter={getActiveEncounter()}
            weaknessName={lastDefeatWeakness}
            echoVaultId={activeVaultId}
            failedStepIndex={lastDefeatStepIndex}
            lastAttemptedOp={lastDefeatAttemptedOp}
            onRetry={() => setCurrentScreen('BATTLE')}
            onEnterEchoVault={handleEnterEchoVault}
            onReturnToMap={() => setCurrentScreen('WORLD_MAP')}
            onReturnToMainPathStage={handleReturnToMainPathStage}
          />
        )}

        {currentScreen === 'DECK' && (
          <DeckScreen
            unlockedCardIds={profile.unlockedCardIds}
            onBack={() => setCurrentScreen('HOME')}
          />
        )}

        {currentScreen === 'KNOWLEDGE_MAP' && (
          <KnowledgeMapScreen
            initialSubject={activeSubject}
            profile={profile}
            onBack={() => setCurrentScreen('HOME')}
            onSelectLevel={(subj, lvlNum) => {
              setActiveSubject(subj);
              setActiveLevelNumber(lvlNum);
              setCurrentScreen('STORY_INTRO');
            }}
          />
        )}

        {currentScreen === 'PROFILE' && (
          <ProfileScreen
            profile={profile}
            onBack={() => setCurrentScreen('HOME')}
            onRefreshProfile={refreshProfile}
          />
        )}

        {currentScreen === 'SETTINGS' && (
          <SettingsScreen
            onBack={() => setCurrentScreen('HOME')}
            onLaunchJudgeDemo={handleLaunchJudgeDemo}
            onProfileReset={refreshProfile}
          />
        )}

        {currentScreen === 'SURPRISE_ATTACK_WARNING' && (
          <SurpriseAttackWarningScreen
            onFaceAttack={() => setCurrentScreen('SURPRISE_ATTACK_BATTLE')}
          />
        )}

        {currentScreen === 'SURPRISE_ATTACK_BATTLE' && activeSurpriseAttack && (
          <SurpriseAttackBattleScreen
            attack={activeSurpriseAttack}
            profile={profile}
            onVictory={handleSurpriseAttackVictory}
            onDefeat={handleSurpriseAttackDefeat}
            onEnterEchoVault={handleEnterEchoVault}
          />
        )}

        {currentScreen === 'CONVERGENCE_REVEAL' && (
          <ConvergenceRevealScreen
            onEnterConvergence={() => setCurrentScreen('CONVERGENCE_BATTLE')}
          />
        )}

        {currentScreen === 'CONVERGENCE_BATTLE' && (
          <ConvergenceBattleScreen
            profile={profile}
            onVictory={handleConvergenceVictory}
            onDefeat={handleConvergenceDefeat}
            onEnterEchoVault={handleEnterEchoVault}
            onReturnToMap={() => setCurrentScreen('WORLD_MAP')}
          />
        )}

        {currentScreen === 'CONVERGENCE_VICTORY' && (
          <ConvergenceVictoryScreen
            score={lastConvergenceScore}
            onReturnToSpire={() => setCurrentScreen('HOME')}
          />
        )}

        {currentScreen === 'OBSERVER_CHALLENGE' && (
          <ObserverChallengeScreen
            onVictory={handleObserverChallengeVictory}
            onDefeat={handleObserverChallengeDefeat}
          />
        )}

        {currentScreen === 'OBSERVER_DIALOGUE' && (
          <ObserverDialogueScreen
            onComplete={handleObserverDialogueComplete}
          />
        )}

        {currentScreen === 'MIRROR_BOSS_BATTLE' && activeMirrorBoss && (
          <MirrorBossScreen
            mirrorBoss={activeMirrorBoss}
            onVictory={handleMirrorBossVictory}
            onDefeat={handleMirrorBossDefeat}
            onEnterEchoVault={handleEnterEchoVault}
            onReturnToMap={() => setCurrentScreen('WORLD_MAP')}
          />
        )}

        {currentScreen === 'LAST_QUESTION' && (
          <LastQuestionScreen
            onComplete={handleLastQuestionComplete}
          />
        )}

        {currentScreen === 'TRUE_ENDING' && (
          <TrueEndingScreen
            endingVariant={lastEndingVariant}
            studentResponse={lastStudentResponse}
            onReturnToSpire={() => setCurrentScreen('HOME')}
          />
        )}
      </main>
    </div>
  );
};

export default App;
