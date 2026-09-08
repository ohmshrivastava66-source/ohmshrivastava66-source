import { SubjectId, Card } from '../types/game';
import { SubjectInfo, EncounterDefinition, EchoDungeonDefinition } from '../types/curriculum';
import { MATHEMATICS_SUBJECT_INFO, MATH_ENCOUNTERS, MATH_ECHO_VAULT, MATH_STARTER_CARDS } from './mathematics';
import { CS_SUBJECT_INFO, CS_ENCOUNTERS, CS_ECHO_VAULT, CS_STARTER_CARDS } from './computerScience';

export interface EducationTier {
  id: string;
  label: string;
  sublabel: string;
  badge: string;
  description: string;
}

export const EDUCATION_TIERS: EducationTier[] = [
  {
    id: 'class_1_5',
    label: 'Primary Academy',
    sublabel: 'Classes 1–5',
    badge: 'Foundations',
    description: 'Fundamental operations, patterns, spatial awareness, and core rules.',
  },
  {
    id: 'class_6_8',
    label: 'Middle Spire',
    sublabel: 'Classes 6–8',
    badge: 'Intermediate',
    description: 'Pre-algebra, basic kinetics, elemental states, and living cells.',
  },
  {
    id: 'class_9_10',
    label: 'Secondary Bastion',
    sublabel: 'Classes 9–10',
    badge: 'Core Mastery',
    description: 'Quadratic equations, Newton laws, stoichiometry, and algorithms.',
  },
  {
    id: 'class_11_12',
    label: 'Higher Sanctuary',
    sublabel: 'Classes 11–12',
    badge: 'Advanced',
    description: 'Calculus, quantum models, organic synthesis, and recursion.',
  },
  {
    id: 'college_foundation',
    label: 'Undergraduate Forge',
    sublabel: 'University Foundational',
    badge: 'Scholarly',
    description: 'Linear algebra, data structures, thermodynamics, and cellular genetics.',
  },
  {
    id: 'college_advanced',
    label: 'Archon Observatory',
    sublabel: 'University Advanced',
    badge: 'Mastery',
    description: 'Dynamic programming, abstract algebra, relativity, and molecular dynamics.',
  },
];

/* SEED DEFINITIONS FOR REMAINING 6 WORLDS */
const PHYSICS_SUBJECT_INFO: SubjectInfo = {
  id: 'physics',
  name: 'Physics',
  realmName: 'The Quantum Forge',
  realmDescription: 'A pulsating anomaly where energy, momentum, and gravitation warp physical dimensions.',
  themeColor: '#8b5cf6',
  accentColor: '#a78bfa',
  secondaryColor: '#7c3aed',
  iconName: 'Zap',
  storyIntro: {
    title: 'The Resonance of the Quantum Forge',
    narration: [
      'Forces once obeyed precise mathematical symmetries.',
      'Now, entropy colossi and momentum phantoms drift unchecked through gravitational fields.',
      'Wield the conservation laws to restore planetary equilibrium.',
    ],
    conceptCardIntro: [
      { cardName: 'RESOLVE_FORCES', quote: 'Isolate vectors along perpendicular coordinate axes.', role: 'Decomposition' },
      { cardName: 'APPLY_NEWTON', quote: 'Calculate acceleration proportional to net kinetic force.', role: 'Strike' },
      { cardName: 'CONSERVE_ENERGY', quote: 'Potential transforms into kinetic energy without loss.', role: 'Shield' },
    ],
  },
  levels: [
    { id: 'phys_lvl_1', levelNumber: 1, title: 'The Inertial Barrier', topic: 'Kinematics & Force', isBoss: false },
    { id: 'phys_lvl_2', levelNumber: 2, title: 'The Gravitational Well', topic: 'Potential Energy', isBoss: false, requiredCompletedLevel: 1 },
    { id: 'phys_boss', levelNumber: 3, title: 'The Entropy Colossus', topic: 'Thermodynamics & Gravitation', isBoss: true, requiredCompletedLevel: 2 },
  ],
};

const CHEMISTRY_SUBJECT_INFO: SubjectInfo = {
  id: 'chemistry',
  name: 'Chemistry',
  realmName: 'The Alchemical Depths',
  realmDescription: 'Subterranean vats of reacting reagents, ionic lattices, and molecular hydras.',
  themeColor: '#10b981',
  accentColor: '#34d399',
  secondaryColor: '#059669',
  iconName: 'FlaskConical',
  storyIntro: {
    title: 'The Volatile Reactions of the Depths',
    narration: [
      'Chemical bonds define the architecture of matter.',
      'In these depths, unbalanced stoichiometry fuels corrosive reaction golems.',
      'Synthesize, balance, and catalyze to restore molecular stability.',
    ],
    conceptCardIntro: [
      { cardName: 'BALANCE_MOLES', quote: 'Equalize atoms across reactant and product phases.', role: 'Equilibrium' },
      { cardName: 'CATALYZE', quote: 'Lower activation energy to accelerate synthesis.', role: 'Surge' },
      { cardName: 'NEUTRALIZE', quote: 'Combine hydronium and hydroxide into pure water.', role: 'Shield' },
    ],
  },
  levels: [
    { id: 'chem_lvl_1', levelNumber: 1, title: 'The Unbalanced Crucible', topic: 'Reaction Stoichiometry', isBoss: false },
    { id: 'chem_lvl_2', levelNumber: 2, title: 'The Acidic Cavern', topic: 'Titration & pH', isBoss: false, requiredCompletedLevel: 1 },
    { id: 'chem_boss', levelNumber: 3, title: 'The Molecular Hydra', topic: 'Chemical Equilibrium & Kinetics', isBoss: true, requiredCompletedLevel: 2 },
  ],
};

const BIOLOGY_SUBJECT_INFO: SubjectInfo = {
  id: 'biology',
  name: 'Biology',
  realmName: 'The Living Labyrinth',
  realmDescription: 'An ancient organic biome populated by genetic mutations, cellular swarms, and neural synapses.',
  themeColor: '#14b8a6',
  accentColor: '#2dd4bf',
  secondaryColor: '#0d9488',
  iconName: 'Dna',
  storyIntro: {
    title: 'Pulse of the Living Labyrinth',
    narration: [
      'The genetic code is life\'s purest script.',
      'Unchecked mutations threaten to unravel the evolutionary tree.',
      'Transcribe DNA, fold protective proteins, and defend the cellular sanctum.',
    ],
    conceptCardIntro: [
      { cardName: 'TRANSCRIBE', quote: 'Copy nucleotide sequence from DNA to messenger RNA.', role: 'Preparation' },
      { cardName: 'TRANSLATE', quote: 'Assemble amino acids at the ribosomal nexus.', role: 'Synthesis' },
      { cardName: 'CELL_REPAIR', quote: 'Enzymatic proofreading to eliminate point mutations.', role: 'Recovery' },
    ],
  },
  levels: [
    { id: 'bio_lvl_1', levelNumber: 1, title: 'The Helical Rift', topic: 'DNA Transcription', isBoss: false },
    { id: 'bio_lvl_2', levelNumber: 2, title: 'The Mitotic Hive', topic: 'Cell Division', isBoss: false, requiredCompletedLevel: 1 },
    { id: 'bio_boss', levelNumber: 3, title: 'The Genetic Chimera', topic: 'Cellular Regulation & Mutation', isBoss: true, requiredCompletedLevel: 2 },
  ],
};

const HISTORY_SUBJECT_INFO: SubjectInfo = {
  id: 'history',
  name: 'History',
  realmName: 'The Chrono Ruins',
  realmDescription: 'Shattered marble temples and floating astrolabes where ancient empires and historical epochs collide.',
  themeColor: '#f59e0b',
  accentColor: '#fbbf24',
  secondaryColor: '#d97706',
  iconName: 'Hourglass',
  storyIntro: {
    title: 'Echoes of the Chrono Ruins',
    narration: [
      'Time is an unbroken causal chain of human endeavor and consequence.',
      'When chronological links rupture, forgotten specters rewrite historical memory.',
      'Anchor eras, analyze primary sources, and reconstruct truth.',
    ],
    conceptCardIntro: [
      { cardName: 'ANCHOR_ERA', quote: 'Identify the geographical and temporal context.', role: 'Grounding' },
      { cardName: 'PROVE_CAUSATION', quote: 'Distinguish direct cause from accidental correlation.', role: 'Strike' },
      { cardName: 'SYNTHESIZE', quote: 'Weave disparate primary sources into cohesive narrative.', role: 'Proof' },
    ],
  },
  levels: [
    { id: 'hist_lvl_1', levelNumber: 1, title: 'The Broken Dynasty', topic: 'Chronological Sequencing', isBoss: false },
    { id: 'hist_lvl_2', levelNumber: 2, title: 'The Industrial Forge', topic: 'Cause & Effect', isBoss: false, requiredCompletedLevel: 1 },
    { id: 'hist_boss', levelNumber: 3, title: 'The Chrono Sovereign', topic: 'Historical Causation & Dialectics', isBoss: true, requiredCompletedLevel: 2 },
  ],
};

const GEOGRAPHY_SUBJECT_INFO: SubjectInfo = {
  id: 'geography',
  name: 'Geography',
  realmName: 'The Atlas Wilds',
  realmDescription: 'Shifting tectonic continents, volcanic ridges, and atmospheric trade winds.',
  themeColor: '#0ea5e9',
  accentColor: '#38bdf8',
  secondaryColor: '#0284c7',
  iconName: 'Globe',
  storyIntro: {
    title: 'The Winds of the Atlas Wilds',
    narration: [
      'Earth’s physical systems dictate human habitation, climate, and survival.',
      'Tectonic colossi shift fault lines, threatening continental stability.',
      'Chart isobaric currents, measure elevation, and master cartography.',
    ],
    conceptCardIntro: [
      { cardName: 'MAP_CONTOURS', quote: 'Interpret topographic elevation and steepness.', role: 'Navigation' },
      { cardName: 'CORIOLIS_DEFLECT', quote: 'Track rotating planetary pressure systems.', role: 'Deflection' },
      { cardName: 'TECTONIC_STABILIZE', quote: 'Lock subduction zones with geological equilibrium.', role: 'Shield' },
    ],
  },
  levels: [
    { id: 'geo_lvl_1', levelNumber: 1, title: 'The Subduction Trench', topic: 'Plate Tectonics', isBoss: false },
    { id: 'geo_lvl_2', levelNumber: 2, title: 'The Monsoon Pass', topic: 'Atmospheric Circulation', isBoss: false, requiredCompletedLevel: 1 },
    { id: 'geo_boss', levelNumber: 3, title: 'The Tectonic Leviathan', topic: 'Lithospheric Geodynamics', isBoss: true, requiredCompletedLevel: 2 },
  ],
};

const LANGUAGE_SUBJECT_INFO: SubjectInfo = {
  id: 'language',
  name: 'Language',
  realmName: 'The Linguistic Citadel',
  realmDescription: 'A towering library of glowing parchment, unraveled lexicons, and semantic runes.',
  themeColor: '#ec4899',
  accentColor: '#f472b6',
  secondaryColor: '#db2777',
  iconName: 'BookOpen',
  storyIntro: {
    title: 'The Whispers of the Linguistic Citadel',
    narration: [
      'Words give shape to thought; syntax provides structure to knowledge.',
      'Syntax phantoms scramble clauses and corrupt semantic meaning.',
      'Dissect morphemes, parse grammatical dependencies, and construct clear rhetoric.',
    ],
    conceptCardIntro: [
      { cardName: 'PARSE_SYNTAX', quote: 'Deconstruct sentences into subject, predicate, and modifier.', role: 'Structure' },
      { cardName: 'DISAMBIGUATE', quote: 'Determine semantic nuance from textual context.', role: 'Insight' },
      { cardName: 'SYNTHESIZE_CLAUSE', quote: 'Assemble compound-complex structures with precision.', role: 'Finisher' },
    ],
  },
  levels: [
    { id: 'lang_lvl_1', levelNumber: 1, title: 'The Scrambled Codex', topic: 'Syntax & Predicates', isBoss: false },
    { id: 'lang_lvl_2', levelNumber: 2, title: 'The Rhetorical Tower', topic: 'Etymology & Semantics', isBoss: false, requiredCompletedLevel: 1 },
    { id: 'lang_boss', levelNumber: 3, title: 'The Semantic Overlord', topic: 'Syntactic & Rhetorical Synthesis', isBoss: true, requiredCompletedLevel: 2 },
  ],
};

/* MASTER SUBJECT REGISTRY */
export const ALL_SUBJECTS: Record<SubjectId, SubjectInfo> = {
  mathematics: MATHEMATICS_SUBJECT_INFO,
  computerScience: CS_SUBJECT_INFO,
  physics: PHYSICS_SUBJECT_INFO,
  chemistry: CHEMISTRY_SUBJECT_INFO,
  biology: BIOLOGY_SUBJECT_INFO,
  history: HISTORY_SUBJECT_INFO,
  geography: GEOGRAPHY_SUBJECT_INFO,
  language: LANGUAGE_SUBJECT_INFO,
};

/* MASTER ENCOUNTERS MAP */
export const ENCOUNTERS_MAP: Record<SubjectId, EncounterDefinition[]> = {
  mathematics: MATH_ENCOUNTERS,
  computerScience: CS_ENCOUNTERS,
  physics: [
    {
      id: 'phys_lvl_1',
      levelNumber: 1,
      levelTitle: 'The Inertial Barrier',
      subject: 'physics',
      topic: 'Newton\'s Second Law',
      conceptName: 'Force & Acceleration',
      objective: 'Apply Newton\'s second law (F = ma) to calculate net acceleration.',
      problemStatement: 'Accelerate a mass m = 5 kg with a net force F = 20 N. Compute acceleration a.',
      initialEquationOrState: 'F = 20 N, m = 5 kg | a = ?',
      targetState: 'a = 4 m/s² [CONFIRMED]',
      optimalSequence: ['ISOLATE_VARIABLE', 'COMPUTE', 'VERIFY'],
      stepTransformations: [
        { stepIndex: 0, operationKey: 'ISOLATE_VARIABLE', resultingState: 'a = F / m', explanation: 'Rearranged F = ma to isolate acceleration.', damageValue: 35 },
        { stepIndex: 1, operationKey: 'COMPUTE', resultingState: 'a = 20 / 5 = 4 m/s²', explanation: 'Substituted scalar magnitudes.', damageValue: 45 },
        { stepIndex: 2, operationKey: 'VERIFY', resultingState: 'F_net = 5(4) = 20 N [EQUAL]', explanation: 'Dimensional analysis and values match.', damageValue: 30 },
      ],
      validCards: [
        { id: 'p_iso', name: 'Isolate Variable', cost: 1, subject: 'physics', rarity: 'common', operationKey: 'ISOLATE_VARIABLE', description: 'Rearrange equation.', effectText: 'Deals 35 DMG.', damage: 35, shield: 10, iconName: 'Move' },
        { id: 'p_comp', name: 'Compute', cost: 1, subject: 'physics', rarity: 'common', operationKey: 'COMPUTE', description: 'Calculate magnitude.', effectText: 'Deals 45 DMG.', damage: 45, shield: 10, iconName: 'Calculator' },
        { id: 'p_ver', name: 'Verify Vector', cost: 1, subject: 'physics', rarity: 'common', operationKey: 'VERIFY', description: 'Check units.', effectText: 'Deals 30 DMG & 20 Shield.', damage: 30, shield: 20, iconName: 'Check' },
      ],
      misconceptions: [],
      enemy: { name: 'Momentum Titan', title: 'Guardian of Inertia', hp: 100, attack: 18, visualType: 'algorithmic_horror', flavorQuote: 'An object at rest stays at rest unless crushed!' },
      rewardXp: 120,
      rewardMastery: 25,
    },
  ],
  chemistry: [],
  biology: [],
  history: [],
  geography: [],
  language: [],
};

/* MASTER ECHO VAULTS MAP */
export const ECHO_VAULTS_MAP: Record<string, EchoDungeonDefinition> = {
  vault_factorization: MATH_ECHO_VAULT,
  vault_cs_invariants: CS_ECHO_VAULT,
};

/* STARTER CARDS MAP */
export const STARTER_CARDS_MAP: Record<SubjectId, Card[]> = {
  mathematics: MATH_STARTER_CARDS,
  computerScience: CS_STARTER_CARDS,
  physics: ENCOUNTERS_MAP.physics[0].validCards,
  chemistry: MATH_STARTER_CARDS,
  biology: CS_STARTER_CARDS,
  history: MATH_STARTER_CARDS,
  geography: MATH_STARTER_CARDS,
  language: CS_STARTER_CARDS,
};
