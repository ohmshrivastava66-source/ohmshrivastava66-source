import React from 'react';
import { PlayerProfile, RunRecord } from '../types/telemetry';
import { ALL_SUBJECTS } from '../curriculum/registry';
import { CharacterRenderer } from '../components/CharacterRenderer';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { StorageManager } from '../persistence/StorageManager';
import {
  LearningProfileTranslator,
  LearningProfileSummary,
} from '../engine/LearningProfileTranslator';
import { getRelicMetadata } from '../engine/RelicCatalog';
import { BOSS_COUNCIL_MEMBERS, REALM_BOSS_LEVELS } from '../engine/ConvergenceEngine';
import { SubjectId, CanonicalRealmId } from '../types/game';
import {
  User,
  Award,
  Shield,
  Zap,
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
  RotateCcw,
  CheckCircle,
  Lock,
  Clock,
  Sparkles,
  Crown,
  Eye,
  Hourglass,
  RefreshCw,
  BookOpen,
  Compass,
  Flame,
  Star,
  Check,
  Database,
} from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface ProfileScreenProps {
  profile: PlayerProfile;
  onBack: () => void;
  onRefreshProfile: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  onBack,
  onRefreshProfile,
}) => {
  const handleReset = () => {
    if (window.confirm('Reset all demo progression and profile records to default state?')) {
      sounds.playClick();
      StorageManager.resetAllData();
      onRefreshProfile();
    }
  };

  // Safe data extraction with backward-compatible defaults
  const xpPercent = Math.min(100, Math.round((profile.xp / profile.xpToNextLevel) * 100));
  const equippedRelicsList = profile.equippedRelics && profile.equippedRelics.length > 0
    ? profile.equippedRelics
    : (profile.relics ? profile.relics.slice(0, 2) : ['Focus Rune', 'Time Shard']);

  const discoveredRelicsList = profile.discoveredRelics && profile.discoveredRelics.length > 0
    ? profile.discoveredRelics
    : (profile.relics ? [...profile.relics] : ['Focus Rune', 'Time Shard']);

  // Qualitative Learning Profile (Zero raw numbers, scores, or engine internals)
  const learningSummary: LearningProfileSummary = LearningProfileTranslator.translate(profile);

  // Discovery Firewalls (Strictly prevent spoilers)
  const observerDiscovered = LearningProfileTranslator.isObserverDiscovered(profile);
  const mirrorDiscovered = LearningProfileTranslator.isMirrorSystemDiscovered(profile);
  const surpriseDiscovered = LearningProfileTranslator.isSurpriseAttackDiscovered(profile);
  const convergenceDiscovered = LearningProfileTranslator.isConvergenceDiscovered(profile);
  const finalReflectionActive = LearningProfileTranslator.hasFinalReflection(profile);

  // Realm Boss Record
  const defeatedBossCount = LearningProfileTranslator.getDefeatedBossCount(profile);
  const canonicalRealms = Object.keys(REALM_BOSS_LEVELS) as CanonicalRealmId[];
  const allSubjects = Object.keys(ALL_SUBJECTS) as SubjectId[];

  // Realm Conqueror designations (only show legitimately earned titles)
  const realmConquerorBadges: { subject: string; title: string; color: string }[] = [];
  if (LearningProfileTranslator.isBossDefeated(profile, 'mathematics')) {
    realmConquerorBadges.push({
      subject: 'Mathematics',
      title: 'Conqueror of the Fractured Realm',
      color: '#06b6d4',
    });
  }
  if (LearningProfileTranslator.isBossDefeated(profile, 'computerScience')) {
    realmConquerorBadges.push({
      subject: 'Computer Science',
      title: 'Master of the Algorithmic Abyss',
      color: '#8b5cf6',
    });
  }
  if (LearningProfileTranslator.isBossDefeated(profile, 'physics')) {
    realmConquerorBadges.push({
      subject: 'Physics',
      title: 'Entropy Sovereign',
      color: '#f59e0b',
    });
  }

  // Prestige Titles (only show actually earned titles)
  const earnedPrestigeTitles: string[] = [];
  if (profile.prestigeTitles && profile.prestigeTitles.length > 0) {
    profile.prestigeTitles.forEach(t => {
      if (!earnedPrestigeTitles.includes(t)) earnedPrestigeTitles.push(t);
    });
  }
  // Also collect known earned titles from progression
  if (profile.convergenceCompleted && !earnedPrestigeTitles.includes('Apex of the Spire')) {
    earnedPrestigeTitles.push('Apex of the Spire');
  }
  if (profile.clearedHiddenTrials?.mathematics?.includes('math_hidden_trial_2') && !earnedPrestigeTitles.includes('Axiom Compressor')) {
    earnedPrestigeTitles.push('Axiom Compressor');
  }
  if (profile.clearedHiddenTrials?.computerScience?.includes('cs_hidden_trial_2') && !earnedPrestigeTitles.includes('Entropy Compressor')) {
    earnedPrestigeTitles.push('Entropy Compressor');
  }
  if (profile.mirrorBossState?.defeatedMirrors?.length && !earnedPrestigeTitles.includes('Reflective Sovereign')) {
    earnedPrestigeTitles.push('Reflective Sovereign');
  }
  if (profile.surpriseAttacksCompleted && !earnedPrestigeTitles.includes('Apex Invariant')) {
    earnedPrestigeTitles.push('Apex Invariant');
  }

  // Hidden Mastery Achievements
  const clearedHiddenTrialsList: { id: string; name: string; subject: string; rewardRelic?: string; title?: string }[] = [];
  if (profile.clearedHiddenTrials?.mathematics?.includes('math_hidden_trial_1')) {
    clearedHiddenTrialsList.push({
      id: 'math_ht1',
      name: 'Trial of Dual Axioms (Crucible I)',
      subject: 'Mathematics',
      rewardRelic: 'Singularity Fragment',
    });
  }
  if (profile.clearedHiddenTrials?.mathematics?.includes('math_hidden_trial_2')) {
    clearedHiddenTrialsList.push({
      id: 'math_ht2',
      name: 'Trial of the Singularity (Crucible II)',
      subject: 'Mathematics',
      rewardRelic: 'Singularity Prism',
      title: 'Axiom Compressor',
    });
  }
  if (profile.clearedHiddenTrials?.computerScience?.includes('cs_hidden_trial_1')) {
    clearedHiddenTrialsList.push({
      id: 'cs_ht1',
      name: 'Trial of Boundary & Halving',
      subject: 'Computer Science',
      rewardRelic: 'Cache Shard',
    });
  }
  if (profile.clearedHiddenTrials?.computerScience?.includes('cs_hidden_trial_2')) {
    clearedHiddenTrialsList.push({
      id: 'cs_ht2',
      name: 'Trial of Optimal Substructure',
      subject: 'Computer Science',
      rewardRelic: 'Quantum Cache',
      title: 'Entropy Compressor',
    });
  }

  // Helper for rendering relic icon
  const renderRelicIcon = (iconName: string) => {
    switch (iconName) {
      case 'Hourglass':
        return <Hourglass className="w-4 h-4 text-amber-300" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-cyan-300" />;
      case 'Crown':
        return <Crown className="w-4 h-4 text-yellow-300" />;
      case 'Database':
        return <Database className="w-4 h-4 text-purple-300" />;
      case 'RefreshCw':
        return <RefreshCw className="w-4 h-4 text-emerald-300" />;
      default:
        return <Zap className="w-4 h-4 text-cyan-300" />;
    }
  };

  return (
    <div className="relative min-h-[calc(100dvh-54px)] p-4 sm:p-8 flex flex-col items-center select-none overflow-y-auto">
      <ParticleCanvas color="#06b6d4" count={25} />

      {/* Screen Title & Codex Header */}
      <header className="z-10 text-center max-w-2xl mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-[11px] font-mono-code text-cyan-300 uppercase tracking-widest mb-2">
          <BookOpen className="w-3.5 h-3.5" /> Hunter's Codex
        </div>
        <h1 className="font-cinzel font-bold text-2xl sm:text-4xl text-slate-100 tracking-wide flex items-center justify-center gap-3">
          <User className="w-7 h-7 text-cyan-400" />
          The Annals of Ascension
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
          The permanent personal record of your mathematical proofs, algorithmic breakthroughs, discovered relics, and realm sovereign conquests.
        </p>
      </header>

      {/* Main 2-Column Responsive RPG Codex Grid */}
      <main className="z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">
        {/* =========================================================================
            LEFT COLUMN: HUNTER IDENTITY, EQUIPPED RELICS & PRESTIGE (lg:col-span-5)
            ========================================================================= */}
        <section className="lg:col-span-5 flex flex-col gap-6" aria-label="Hunter Identity and Relics">
          {/* Hunter Portrait & Identity Panel */}
          <div className="glass-panel p-6 rounded-3xl border border-cyan-500/40 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative p-2 rounded-2xl bg-gradient-to-b from-cyan-500/20 to-transparent border border-cyan-500/30 mb-2">
              <CharacterRenderer state="idle" size={210} />
            </div>

            <h2 className="font-cinzel-dec font-bold text-2xl text-slate-100 mt-2 tracking-wide">
              {profile.name}
            </h2>
            <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-lg bg-slate-900/80 border border-cyan-500/30 text-xs font-mono-code text-cyan-300 font-semibold uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 text-cyan-400" />
              {profile.title}
            </div>

            {/* Level & XP Progression */}
            <div className="w-full mt-5 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/90 text-left">
              <div className="flex items-center justify-between text-xs font-mono-code mb-1.5">
                <span className="text-cyan-300 font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400" /> LEVEL {profile.level}
                </span>
                <span className="text-slate-400">{profile.xp} / {profile.xpToNextLevel} XP</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="bg-gradient-to-r from-sky-500 via-cyan-400 to-teal-300 h-full rounded-full transition-all duration-500 shadow-sm shadow-cyan-500/50"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2 italic">
                {profile.xpToNextLevel - profile.xp} XP needed to advance to Level {profile.level + 1}
              </p>
            </div>

            {/* Realm Conqueror Designations (if earned) */}
            {realmConquerorBadges.length > 0 && (
              <div className="w-full mt-4 flex flex-col gap-2 text-left">
                <span className="text-[11px] font-cinzel font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> Realm Conqueror Designations
                </span>
                <div className="flex flex-col gap-1.5">
                  {realmConquerorBadges.map((badge, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <span className="font-cinzel text-slate-200">{badge.title}</span>
                      <span className="text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                        {badge.subject}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* EQUIPPED RELICS SECTION (Clearly separated from discovered relics) */}
          <div className="glass-panel p-5 rounded-3xl border border-cyan-500/30 flex flex-col gap-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h3 className="text-xs font-cinzel font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                {`Equipped Relics (${equippedRelicsList.length})`}
              </h3>
              <span className="text-[10px] font-mono-code text-slate-400 uppercase">Active Wards</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {equippedRelicsList.map((relicName, idx) => {
                const meta = getRelicMetadata(relicName);
                const rarityColor =
                  meta.rarity === 'mythic'
                    ? 'border-amber-500/50 text-amber-300 bg-amber-950/30'
                    : meta.rarity === 'rare'
                    ? 'border-purple-500/50 text-purple-300 bg-purple-950/30'
                    : 'border-cyan-500/40 text-cyan-300 bg-cyan-950/30';

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border ${rarityColor} flex items-start gap-3 bg-slate-950/70 transition-all hover:border-cyan-400/60`}
                  >
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex-shrink-0">
                      {renderRelicIcon(meta.icon)}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-cinzel font-bold text-slate-100 truncate">
                          {meta.name}
                        </h4>
                        <span className="text-[9px] font-mono-code px-1.5 py-0.5 rounded uppercase font-semibold bg-slate-900 text-slate-400 border border-slate-800">
                          {meta.rarity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        {meta.description}
                      </p>
                      <span className="text-[10px] text-slate-400 italic mt-0.5">
                        "{meta.flavorQuote}"
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PRESTIGE TITLES SECTION (Only shows earned titles; tasteful neutral state if none) */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col gap-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h3 className="text-xs font-cinzel font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                Prestige Titles
              </h3>
              <span className="text-[10px] font-mono-code text-slate-400">
                {earnedPrestigeTitles.length} Earned
              </span>
            </div>

            {earnedPrestigeTitles.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No prestige titles earned yet. Complete compression trials or apex encounters to earn prestigious titles.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {earnedPrestigeTitles.map((title, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-purple-950/40 border border-amber-500/40 text-xs font-cinzel font-bold text-amber-200 flex items-center gap-1.5 shadow-sm"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {title}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* =========================================================================
            RIGHT COLUMN: REALM MASTERY, SOVEREIGNS, LEARNING PROFILE & HUNTER'S RECORD (lg:col-span-7)
            ========================================================================= */}
        <section className="lg:col-span-7 flex flex-col gap-6" aria-label="Mastery and Achievements">
          {/* REALM MASTERY INDICES (All 8 realms) */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col gap-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-cinzel font-bold text-sm text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-400" />
                Realm Mastery Indices
              </h3>
              <span className="text-[11px] font-mono-code text-slate-400">8 Domains Active</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
              {canonicalRealms.map(subjId => {
                const subj = ALL_SUBJECTS[subjId];
                const mastery = profile.subjectMastery[subjId] || 0;
                const isBossDefeated = LearningProfileTranslator.isBossDefeated(profile, subjId);

                return (
                  <div
                    key={subjId}
                    className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/90 flex flex-col gap-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-cinzel font-semibold text-slate-200 flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: subj.themeColor }}
                        />
                        {subj.name}
                      </span>
                      <span className="font-mono-code font-bold text-cyan-300">{mastery}%</span>
                    </div>

                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800/80">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${mastery}%`, backgroundColor: subj.themeColor }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono-code text-slate-400">
                      <span>
                        {mastery >= 100
                          ? 'MASTERED'
                          : mastery > 0
                          ? 'ASCENDING'
                          : 'INITIATED'}
                      </span>
                      {isBossDefeated ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> SOVEREIGN DEFEATED
                        </span>
                      ) : (
                        <span className="text-slate-400">IN PROGRESS</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* REALM SOVEREIGN RECORD (Authoritative Boss Record) */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col gap-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-cinzel font-bold text-sm text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                Realm Sovereign Record
              </h3>
              <span className="text-[11px] font-mono-code text-cyan-300 font-bold">
                {`${defeatedBossCount} / 8 Defeated`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
              {canonicalRealms.map(subjId => {
                const bossInfo = BOSS_COUNCIL_MEMBERS[subjId];
                const isDefeated = LearningProfileTranslator.isBossDefeated(profile, subjId);
                const isUnlocked = StorageManager.isLevelUnlocked(profile.clearedLevels ? subjId : 'mathematics', REALM_BOSS_LEVELS[subjId], profile);

                return (
                  <div
                    key={subjId}
                    className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
                      isDefeated
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                        : isUnlocked
                        ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                        : 'bg-slate-950/30 border-slate-900 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-6 h-6 rounded-lg flex items-center justify-center font-mono-code font-bold text-xs flex-shrink-0"
                        style={{ backgroundColor: `${bossInfo.color}22`, color: bossInfo.color }}
                      >
                        {bossInfo.emblem}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-cinzel font-bold truncate text-slate-100">
                          {bossInfo.name}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">
                          {ALL_SUBJECTS[subjId].name} • {bossInfo.title}
                        </span>
                      </div>
                    </div>

                    <div className="flex-shrink-0 ml-2">
                      {isDefeated ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-900/60 border border-emerald-500/50 text-[10px] font-mono-code font-bold text-emerald-300 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> DEFEATED
                        </span>
                      ) : isUnlocked ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-950/40 border border-amber-600/40 text-[10px] font-mono-code text-amber-300 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> IN PROGRESS
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono-code text-slate-400 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> LOCKED
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CURRENT LEARNING PROFILE (Qualitative strengths & weaknesses, zero numerical leaks) */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col gap-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-cinzel font-bold text-sm text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                Current Learning Profile
              </h3>
              <span className="text-[11px] font-mono-code text-slate-400">Qualitative Insights</span>
            </div>

            {/* Headline traits derived from behavioral patterns */}
            <div className="flex flex-wrap gap-2">
              {learningSummary.headlineTraits.map((trait, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-[11px] font-mono-code text-cyan-300"
                >
                  • {trait}
                </span>
              ))}
            </div>

            {/* Cognitive Strengths & Active Weaknesses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
              {/* Cognitive Strengths */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col gap-2">
                <span className="text-xs font-cinzel font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" /> Cognitive Strengths
                </span>
                <ul className="flex flex-col gap-2 text-xs text-slate-300">
                  {learningSummary.cognitiveStrengths.map((str, i) => (
                    <li key={i} className="flex flex-col gap-0.5">
                      <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {str.title}
                      </span>
                      <span className="text-[11px] text-slate-400 pl-3 leading-tight">
                        {str.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Active Weaknesses to Fortify */}
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col gap-2">
                <span className="text-xs font-cinzel font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Active Weaknesses To Fortify
                </span>
                {learningSummary.activeWeaknesses.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    No unrepaired weaknesses active. All foundational concepts aligned!
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2 text-xs text-slate-300">
                    {learningSummary.activeWeaknesses.map((w, i) => (
                      <li key={i} className="flex flex-col gap-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-rose-300 font-mono-code flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            {w.concept}
                          </span>
                          <span
                            className={`text-[9px] font-mono-code px-1.5 py-0.5 rounded uppercase ${
                              w.status === 'Recently repaired'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : w.status === 'Improving'
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {w.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 pl-3 italic">
                          {w.educationalNote}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* HUNTER'S RECORD (Discovery-Aware Major Accomplishments) */}
          <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 flex flex-col gap-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-cinzel font-bold text-sm text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Hunter's Record
              </h3>
              <span className="text-[11px] font-mono-code text-cyan-300">Milestone Annals</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Realm Sovereigns Defeated */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-cinzel font-semibold text-slate-200">
                    Realm Sovereigns
                  </span>
                  <p className="text-[11px] text-slate-400">Total bosses overcome</p>
                </div>
                <span className="text-lg font-mono-code font-bold text-cyan-300">
                  {defeatedBossCount} / 8
                </span>
              </div>

              {/* Hidden Mastery Trials Cleared */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-cinzel font-semibold text-slate-200">
                    Mastery Compression
                  </span>
                  <p className="text-[11px] text-slate-400">High-density trials cleared</p>
                </div>
                <span className="text-lg font-mono-code font-bold text-purple-300">
                  {clearedHiddenTrialsList.length}
                </span>
              </div>

              {/* DISCOVERY GATE: Surprise Attacks Survived */}
              {surpriseDiscovered && (
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/30 flex items-center justify-between sm:col-span-2">
                  <div>
                    <span className="text-xs font-cinzel font-semibold text-amber-200 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-400" /> Surprise Attacks Survived
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Maintained composure when the Spire attempted a dimensional ambush of your velocity.
                    </p>
                  </div>
                  <span className="text-lg font-mono-code font-bold text-amber-300">
                    {profile.surpriseAttacksCompleted || 1}
                  </span>
                </div>
              )}

              {/* DISCOVERY GATE: Mirror Encounters */}
              {mirrorDiscovered && (
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-purple-500/30 flex items-center justify-between sm:col-span-2">
                  <div>
                    <span className="text-xs font-cinzel font-semibold text-purple-200 flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 text-purple-400" /> Mirror Encounters
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Faced your own behavioral reflection and inverted counter-strategies.
                    </p>
                  </div>
                  <span className="text-lg font-mono-code font-bold text-purple-300">
                    {`${profile.mirrorBossState?.defeatedMirrors?.length || 0} Defeated`}
                  </span>
                </div>
              )}

              {/* DISCOVERY GATE: The Observer */}
              {observerDiscovered && (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-sky-500/40 sm:col-span-2 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-cinzel font-bold text-sky-200 flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-sky-400" /> The Observer
                    </span>
                    <span className="text-[10px] font-mono-code text-sky-400 uppercase">
                      Audience Granted
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 italic">
                    "Something beyond the Spire has taken notice of your path."
                  </p>
                  <div className="flex items-center justify-between text-[11px] font-mono-code text-slate-400 mt-1">
                    <span>Encounter Count: {profile.observerState?.encounterCount || 1}</span>
                    <span>
                      Challenge Completed:{' '}
                      {profile.observerState?.challengeCompleted ? 'Yes' : 'In Progress'}
                    </span>
                  </div>
                </div>
              )}

              {/* DISCOVERY GATE: The Convergence */}
              {convergenceDiscovered && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-950 to-purple-950/30 border border-amber-500/40 sm:col-span-2 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-cinzel font-bold text-amber-200 flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-400" /> The Convergence
                    </span>
                    <span
                      className={`text-[10px] font-mono-code px-2 py-0.5 rounded font-bold uppercase ${
                        profile.convergenceCompleted
                          ? 'bg-amber-900/60 text-amber-300 border border-amber-500'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                      }`}
                    >
                      {profile.convergenceCompleted ? 'COMPLETED' : 'UNLOCKED'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {profile.convergenceCompleted
                      ? 'You stood against the united council of all eight sovereigns and prevailed. The Spire bows to you as the Apex Sovereign.'
                      : 'All eight realm sovereigns have fallen. The hidden gateway to the Council Examination is now open.'}
                  </p>
                  {profile.convergenceCompleted && profile.convergenceBestScore ? (
                    <div className="text-xs font-mono-code text-amber-300 font-bold">
                      Examination Score: {profile.convergenceBestScore}
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Hidden Mastery Compression Detail List (if any cleared) */}
            {clearedHiddenTrialsList.length > 0 && (
              <div className="flex flex-col gap-2 border-t border-slate-800/80 pt-3">
                <span className="text-xs font-cinzel font-bold text-slate-300 uppercase tracking-wider">
                  Cleared Compression Trials
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {clearedHiddenTrialsList.map(trial => (
                    <div
                      key={trial.id}
                      className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between text-xs"
                    >
                      <div className="flex flex-col">
                        <span className="font-cinzel text-slate-100 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                          {trial.name}
                        </span>
                        <span className="text-[10px] text-slate-400">{trial.subject}</span>
                      </div>
                      {trial.title && (
                        <span className="text-[10px] font-mono-code text-amber-300 px-1.5 py-0.5 rounded bg-slate-900 border border-amber-600/30">
                          {trial.title}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =========================================================================
            FULL-WIDTH BOTTOM SECTIONS: DISCOVERED RELICS, FINAL REFLECTION, RUNS
            ========================================================================= */}

        {/* DISCOVERED RELICS SECTION (Clearly separated from equipped relics) */}
        <section className="lg:col-span-12 glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col gap-4 shadow-xl" aria-label="Discovered Relics">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-cinzel font-bold text-sm text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              {`Relics Discovered (${discoveredRelicsList.length})`}
            </h3>
            <span className="text-[11px] font-mono-code text-slate-400">Spire Artifact Collection</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {discoveredRelicsList.map((relicName, idx) => {
              const meta = getRelicMetadata(relicName);
              const isEquipped = equippedRelicsList.includes(relicName);
              const rarityColor =
                meta.rarity === 'mythic'
                  ? 'border-amber-500/40 bg-amber-950/20'
                  : meta.rarity === 'rare'
                  ? 'border-purple-500/40 bg-purple-950/20'
                  : 'border-slate-800 bg-slate-950/60';

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border ${rarityColor} flex flex-col gap-2 transition-all hover:border-cyan-500/50`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        {renderRelicIcon(meta.icon)}
                      </div>
                      <span className="font-cinzel font-bold text-xs text-slate-100 truncate">
                        {meta.name}
                      </span>
                    </div>
                    {isEquipped && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono-code font-bold uppercase bg-cyan-950 text-cyan-300 border border-cyan-700/60">
                        Equipped
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    {meta.description}
                  </p>
                  <span className="text-[10px] text-slate-400 italic mt-auto pt-1 border-t border-slate-900/60">
                    "{meta.flavorQuote}"
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* DISCOVERY GATE: Final Reflection (The Last Question Narrative Achievement) */}
        {finalReflectionActive && profile.lastQuestionResult && (
          <section className="lg:col-span-12 glass-panel p-6 rounded-3xl border border-amber-500/40 bg-gradient-to-b from-amber-950/20 via-slate-950 to-slate-950 flex flex-col gap-3 shadow-2xl" aria-label="Final Reflection">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
              <h3 className="font-cinzel font-bold text-base text-amber-200 uppercase tracking-widest flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                {`Final Reflection: ${profile.lastQuestionResult.endingVariant}`}
              </h3>
              <span className="text-xs font-mono-code text-amber-400 uppercase">
                Narrative Resolution
              </span>
            </div>
            <p className="text-sm text-slate-200 italic leading-relaxed">
              {`"${profile.lastQuestionResult.studentResponse}"`}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your response to the Spire's final inquiry sealed your intellectual identity. Through trials of rigorous proof, adaptation under cognitive friction, and recovery from misconception, your journey is etched into the permanent foundations of the Spire.
            </p>
          </section>
        )}

        {/* RECENT EXPEDITIONS & RUN TELEMETRY */}
        <section className="lg:col-span-12 glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col gap-3 shadow-xl" aria-label="Recent Expeditions">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-cinzel font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Recent Expeditions & Run Telemetry
            </h3>
            <span className="text-[11px] font-mono-code text-slate-400">Chronological Annals</span>
          </div>

          <div className="overflow-x-auto w-full">
            {(profile.runHistory || []).length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No expeditions logged yet. Venture into a realm encounter to record your history.
              </p>
            ) : (
              <table className="w-full text-left text-xs text-slate-300 font-mono-code min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px]">
                    <th className="pb-2.5">DATE</th>
                    <th className="pb-2.5">REALM</th>
                    <th className="pb-2.5">ENCOUNTER</th>
                    <th className="pb-2.5">RESULT</th>
                    <th className="pb-2.5">SCORE</th>
                  </tr>
                </thead>
                <tbody>
                  {(profile.runHistory || []).slice(0, 8).map((run: RunRecord) => {
                    // Discovery-aware event tags
                    let eventBadge: string | null = null;
                    if (run.levelTitle.includes('[Surprise Ambush]') && surpriseDiscovered) {
                      eventBadge = 'AMBUSH';
                    } else if (run.levelTitle.includes('[THE CONVERGENCE]') && convergenceDiscovered) {
                      eventBadge = 'CONVERGENCE';
                    } else if (run.levelTitle.toLowerCase().includes('trial') || run.levelNumber > 100) {
                      eventBadge = 'TRIAL';
                    } else if (run.levelNumber === 5 || run.levelTitle.toLowerCase().includes('archon')) {
                      eventBadge = 'BOSS';
                    }

                    return (
                      <tr key={run.id} className="border-b border-slate-900/70 hover:bg-slate-900/40 transition-colors">
                        <td className="py-2.5 text-[11px] text-slate-400">{run.date}</td>
                        <td className="py-2.5 capitalize text-slate-200 font-semibold">{run.subject}</td>
                        <td className="py-2.5 flex items-center gap-2">
                          <span className="truncate max-w-[280px]">{run.levelTitle}</span>
                          {eventBadge && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-cyan-300 border border-cyan-800/40">
                              {eventBadge}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              run.result === 'VICTORY'
                                ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/40'
                                : 'text-rose-400 bg-rose-950/60 border border-rose-500/40'
                            }`}
                          >
                            {run.result}
                          </span>
                        </td>
                        <td className="py-2.5 text-cyan-300 font-bold">{run.score}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>

      {/* Action Footer */}
      <footer className="z-10 mt-auto pb-6 flex items-center justify-between w-full max-w-6xl">
        <button
          onClick={() => {
            sounds.playClick();
            onBack();
          }}
          className="min-h-[44px] min-w-[44px] px-6 py-2.5 rounded-2xl glass-panel text-xs font-cinzel font-bold text-slate-200 hover:text-white hover:border-cyan-400/60 flex items-center gap-2 transition-all shadow-md active:scale-95"
          aria-label="Return to previous screen"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Spire
        </button>

        <button
          onClick={handleReset}
          className="min-h-[44px] min-w-[44px] px-4 py-2 rounded-xl text-xs font-mono-code text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/50 flex items-center gap-1.5 transition-all shadow-sm"
          title="Reset profile data for clean judge demo"
          aria-label="Reset profile demo data"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Demo Data
        </button>
      </footer>
    </div>
  );
};
