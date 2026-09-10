import { SubjectId, Card } from '../types/game';
import { SubjectInfo, EncounterDefinition, EchoDungeonDefinition } from '../types/curriculum';
import { MATHEMATICS_SUBJECT_INFO, MATH_ENCOUNTERS, MATH_ECHO_VAULT, MATH_STARTER_CARDS } from './mathematics';
import { CS_SUBJECT_INFO, CS_ENCOUNTERS, CS_ECHO_VAULT, CS_STARTER_CARDS } from './computerScience';
import { DSA_SUBJECT_INFO, DSA_ENCOUNTERS, DSA_STARTER_CARDS, DSA_ECHO_VAULT, DSA_ROTATIONS_ECHO_VAULT, DSA_STRATEGY_ECHO_VAULT, DSA_OPTIMIZATION_ECHO_VAULT, DSA_COMPLEXITY_ECHO_VAULT } from './dataStructuresAlgorithms';
import { DSA_HIDDEN_TRIALS } from './dsaMasteryCompression';

export * from './educationHierarchy';

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
  data_structures_algorithms: DSA_SUBJECT_INFO,
  physics: PHYSICS_SUBJECT_INFO,
  chemistry: CHEMISTRY_SUBJECT_INFO,
  biology: BIOLOGY_SUBJECT_INFO,
  history: HISTORY_SUBJECT_INFO,
  geography: GEOGRAPHY_SUBJECT_INFO,
  language: LANGUAGE_SUBJECT_INFO,
};

/* SEED STARTER CARD SUITES FOR 6 SECONDARY WORLDS */
export const PHYSICS_STARTER_CARDS: Card[] = [
  { id: 'p_iso', name: 'Isolate Variable', cost: 1, subject: 'physics', rarity: 'common', operationKey: 'ISOLATE_VARIABLE', description: 'Rearrange equation to isolate target.', effectText: 'Deals 35 DMG & shields 10.', damage: 35, shield: 10, iconName: 'Move' },
  { id: 'p_comp', name: 'Compute Magnitude', cost: 1, subject: 'physics', rarity: 'common', operationKey: 'COMPUTE', description: 'Substitute scalar magnitudes.', effectText: 'Deals 45 DMG & shields 10.', damage: 45, shield: 10, iconName: 'Calculator' },
  { id: 'p_ver', name: 'Verify Vector', cost: 1, subject: 'physics', rarity: 'common', operationKey: 'VERIFY', description: 'Check dimensional analysis & units.', effectText: 'Deals 30 DMG & 20 Shield.', damage: 30, shield: 20, iconName: 'Check' },
  { id: 'p_res', name: 'Resolve Forces', cost: 1, subject: 'physics', rarity: 'common', operationKey: 'RESOLVE_FORCES', description: 'Decompose vectors along perpendicular axes.', effectText: 'Deals 25 DMG & shields 10.', damage: 25, shield: 10, iconName: 'Compass' },
  { id: 'p_newt', name: 'Apply Newton', cost: 1, subject: 'physics', rarity: 'common', operationKey: 'APPLY_NEWTON', description: 'Calculate net acceleration F = ma.', effectText: 'Deals 35 DMG.', damage: 35, shield: 5, iconName: 'Zap' },
  { id: 'p_cons', name: 'Conserve Energy', cost: 1, subject: 'physics', rarity: 'common', operationKey: 'CONSERVE_ENERGY', description: 'Verify kinetic and potential balance.', effectText: 'Deals 10 DMG & shields 15.', damage: 10, shield: 15, iconName: 'Shield' },
  { id: 'p_integ', name: 'Integrate Motion', cost: 1, subject: 'physics', rarity: 'common', operationKey: 'INTEGRATE_MOTION', description: 'Integrate acceleration over time interval.', effectText: 'Deals 20 DMG.', damage: 20, shield: 5, iconName: 'Activity' },
  { id: 'p_cal_pot', name: 'Calculate Potential', cost: 1, subject: 'physics', rarity: 'common', operationKey: 'CALCULATE_POTENTIAL', description: 'Compute gravitational potential U = mgh.', effectText: 'Deals 15 DMG & shields 15.', damage: 15, shield: 15, iconName: 'Zap' },
  { id: 'p_mom', name: 'Momentum Vector', cost: 1, subject: 'physics', rarity: 'common', operationKey: 'MOMENTUM_VECTOR', description: 'Compute linear momentum p = mv.', effectText: 'Deals 20 DMG.', damage: 20, shield: 5, iconName: 'ArrowRight' },
  { id: 'p_ang', name: 'Angular Torque', cost: 1, subject: 'physics', rarity: 'common', operationKey: 'ANGULAR_TORQUE', description: 'Evaluate cross product torque tau = r x F.', effectText: 'Deals 25 DMG.', damage: 25, shield: 5, iconName: 'RotateCw' },
];

export const CHEMISTRY_STARTER_CARDS: Card[] = [
  { id: 'c_bal', name: 'Balance Equation', cost: 1, subject: 'chemistry', rarity: 'common', operationKey: 'BALANCE_EQUATION', description: 'Equalize atom counts across phases.', effectText: 'Deals 40 DMG & shields 10.', damage: 40, shield: 10, iconName: 'Scale' },
  { id: 'c_stoi', name: 'Stoichiometry', cost: 1, subject: 'chemistry', rarity: 'common', operationKey: 'STOICHIOMETRY', description: 'Derive stoichiometric mole ratios.', effectText: 'Deals 45 DMG & shields 10.', damage: 45, shield: 10, iconName: 'Percent' },
  { id: 'c_ver', name: 'Conservation Proof', cost: 1, subject: 'chemistry', rarity: 'common', operationKey: 'VERIFY', description: 'Validate mass and charge conservation.', effectText: 'Deals 30 DMG & 15 Shield.', damage: 30, shield: 15, iconName: 'CheckCircle' },
  { id: 'c_cat', name: 'Catalyze', cost: 1, subject: 'chemistry', rarity: 'common', operationKey: 'CATALYZE', description: 'Lower activation barrier via catalyst.', effectText: 'Deals 25 DMG.', damage: 25, shield: 5, iconName: 'Flame' },
  { id: 'c_neut', name: 'Neutralize', cost: 1, subject: 'chemistry', rarity: 'common', operationKey: 'NEUTRALIZE', description: 'Titrate hydronium with hydroxide.', effectText: 'Deals 15 DMG & shields 15.', damage: 15, shield: 15, iconName: 'Shield' },
  { id: 'c_dil', name: 'Dilute Solution', cost: 1, subject: 'chemistry', rarity: 'common', operationKey: 'DILUTE_SOLUTION', description: 'Compute molar concentration M1V1 = M2V2.', effectText: 'Deals 20 DMG & shields 10.', damage: 20, shield: 10, iconName: 'Droplet' },
  { id: 'c_prec', name: 'Precipitate', cost: 1, subject: 'chemistry', rarity: 'common', operationKey: 'PRECIPITATE', description: 'Apply solubility product constant Ksp.', effectText: 'Deals 25 DMG.', damage: 25, shield: 10, iconName: 'Layers' },
  { id: 'c_ph', name: 'Calculate pH', cost: 1, subject: 'chemistry', rarity: 'common', operationKey: 'CALCULATE_PH', description: 'Compute logarithmic acidity pH = -log[H+].', effectText: 'Deals 20 DMG & shields 10.', damage: 20, shield: 10, iconName: 'Activity' },
  { id: 'c_ox', name: 'Oxidize', cost: 1, subject: 'chemistry', rarity: 'common', operationKey: 'OXIDIZE', description: 'Assign oxidation numbers & electron loss.', effectText: 'Deals 30 DMG.', damage: 30, shield: 5, iconName: 'Zap' },
  { id: 'c_red', name: 'Reduce Agent', cost: 1, subject: 'chemistry', rarity: 'common', operationKey: 'REDUCE_AGENT', description: 'Track cathode electron gain.', effectText: 'Deals 25 DMG.', damage: 25, shield: 10, iconName: 'MinusCircle' },
];

export const BIOLOGY_STARTER_CARDS: Card[] = [
  { id: 'b_trans', name: 'Transcribe', cost: 1, subject: 'biology', rarity: 'common', operationKey: 'TRANSCRIBE', description: 'Synthesize complementary mRNA.', effectText: 'Deals 40 DMG & shields 10.', damage: 40, shield: 10, iconName: 'Dna' },
  { id: 'b_trsl', name: 'Translate', cost: 1, subject: 'biology', rarity: 'common', operationKey: 'TRANSLATE', description: 'Assemble peptide amino acids.', effectText: 'Deals 45 DMG & shields 10.', damage: 45, shield: 10, iconName: 'Cpu' },
  { id: 'b_ver', name: 'Proofread Frame', cost: 1, subject: 'biology', rarity: 'common', operationKey: 'VERIFY', description: 'Check open reading frame for mutations.', effectText: 'Deals 30 DMG & 20 Shield.', damage: 30, shield: 20, iconName: 'ShieldCheck' },
  { id: 'b_rep', name: 'Cell Repair', cost: 1, subject: 'biology', rarity: 'common', operationKey: 'CELL_REPAIR', description: 'Enzymatic proofreading of mismatch.', effectText: 'Deals 15 DMG & shields 15.', damage: 15, shield: 15, iconName: 'HeartPulse' },
  { id: 'b_repl', name: 'Replicate DNA', cost: 1, subject: 'biology', rarity: 'common', operationKey: 'REPLICATE_DNA', description: 'Polymerase DNA synthesis from primer.', effectText: 'Deals 25 DMG & shields 10.', damage: 25, shield: 10, iconName: 'Copy' },
  { id: 'b_cross', name: 'Crossing Over', cost: 1, subject: 'biology', rarity: 'common', operationKey: 'CROSSING_OVER', description: 'Meiotic homologous recombination.', effectText: 'Deals 30 DMG.', damage: 30, shield: 5, iconName: 'GitMerge' },
  { id: 'b_cleave', name: 'Restriction Cleave', cost: 1, subject: 'biology', rarity: 'common', operationKey: 'RESTRICTION_CLEAVE', description: 'Endonuclease palindromic cut.', effectText: 'Deals 35 DMG.', damage: 35, shield: 5, iconName: 'Scissors' },
  { id: 'b_phos', name: 'Phosphorylate', cost: 1, subject: 'biology', rarity: 'common', operationKey: 'PHOSPHORYLATE', description: 'Kinase activation via ATP transfer.', effectText: 'Deals 20 DMG & shields 10.', damage: 20, shield: 10, iconName: 'Zap' },
  { id: 'b_lig', name: 'Ligate Strands', cost: 1, subject: 'biology', rarity: 'common', operationKey: 'LIGATE', description: 'Phosphodiester bond repair by ligase.', effectText: 'Deals 20 DMG & shields 15.', damage: 20, shield: 15, iconName: 'Link' },
  { id: 'b_mut', name: 'Mutate Codon', cost: 1, subject: 'biology', rarity: 'common', operationKey: 'MUTATE_CODON', description: 'Test nonsynonymous base substitution.', effectText: 'Deals 15 DMG.', damage: 15, shield: 5, iconName: 'AlertTriangle' },
];

export const HISTORY_STARTER_CARDS: Card[] = [
  { id: 'h_anc', name: 'Anchor Era', cost: 1, subject: 'history', rarity: 'common', operationKey: 'ANCHOR_ERA', description: 'Establish temporal and spatial frame.', effectText: 'Deals 40 DMG & shields 10.', damage: 40, shield: 10, iconName: 'Hourglass' },
  { id: 'h_cau', name: 'Prove Causation', cost: 1, subject: 'history', rarity: 'common', operationKey: 'PROVE_CAUSATION', description: 'Link proximate cause to consequence.', effectText: 'Deals 45 DMG & shields 10.', damage: 45, shield: 10, iconName: 'GitCommit' },
  { id: 'h_ver', name: 'Corroborate Source', cost: 1, subject: 'history', rarity: 'common', operationKey: 'VERIFY', description: 'Check primary source provenance.', effectText: 'Deals 30 DMG & 20 Shield.', damage: 30, shield: 20, iconName: 'FileCheck' },
  { id: 'h_syn', name: 'Synthesize Dialectic', cost: 1, subject: 'history', rarity: 'common', operationKey: 'SYNTHESIZE', description: 'Weave contradictory testimonies.', effectText: 'Deals 25 DMG & shields 10.', damage: 25, shield: 10, iconName: 'Layers' },
  { id: 'h_cross', name: 'Cross Examine', cost: 1, subject: 'history', rarity: 'common', operationKey: 'CROSS_EXAMINE', description: 'Detect ideological bias in records.', effectText: 'Deals 20 DMG & shields 15.', damage: 20, shield: 15, iconName: 'Search' },
  { id: 'h_trade', name: 'Map Trade Route', cost: 1, subject: 'history', rarity: 'common', operationKey: 'MAP_TRADE_ROUTE', description: 'Analyze mercantilist economic corridors.', effectText: 'Deals 25 DMG.', damage: 25, shield: 5, iconName: 'Navigation' },
  { id: 'h_treaty', name: 'Decode Treaty', cost: 1, subject: 'history', rarity: 'common', operationKey: 'DECODE_TREATY', description: 'Interpret diplomatic accord clauses.', effectText: 'Deals 30 DMG & shields 10.', damage: 30, shield: 10, iconName: 'Book' },
  { id: 'h_period', name: 'Periodize Epoch', cost: 1, subject: 'history', rarity: 'common', operationKey: 'PERIODIZE', description: 'Classify structural epoch transition.', effectText: 'Deals 20 DMG & shields 10.', damage: 20, shield: 10, iconName: 'Calendar' },
  { id: 'h_corr', name: 'Corroborate Chronicle', cost: 1, subject: 'history', rarity: 'common', operationKey: 'CORROBORATE', description: 'Cross-reference independent accounts.', effectText: 'Deals 25 DMG & shields 15.', damage: 25, shield: 15, iconName: 'CheckSquare' },
  { id: 'h_dig', name: 'Stratigraphic Record', cost: 1, subject: 'history', rarity: 'common', operationKey: 'ARCHAEOLOGICAL_DIG', description: 'Inspect material artifact strata.', effectText: 'Deals 15 DMG & shields 10.', damage: 15, shield: 10, iconName: 'Archive' },
];

export const GEOGRAPHY_STARTER_CARDS: Card[] = [
  { id: 'g_map', name: 'Map Terrain', cost: 1, subject: 'geography', rarity: 'common', operationKey: 'MAP_TERRAIN', description: 'Plot topographical boundaries.', effectText: 'Deals 40 DMG & shields 10.', damage: 40, shield: 10, iconName: 'Compass' },
  { id: 'g_tra', name: 'Trace Watershed', cost: 1, subject: 'geography', rarity: 'common', operationKey: 'TRACE_WATERSHED', description: 'Follow tectonic and hydrological flow.', effectText: 'Deals 45 DMG & shields 10.', damage: 45, shield: 10, iconName: 'Waves' },
  { id: 'g_ver', name: 'Triangulate Seismic', cost: 1, subject: 'geography', rarity: 'common', operationKey: 'VERIFY', description: 'Verify seismic contours and focal depth.', effectText: 'Deals 30 DMG & 20 Shield.', damage: 30, shield: 20, iconName: 'Check' },
  { id: 'g_cont', name: 'Map Contours', cost: 1, subject: 'geography', rarity: 'common', operationKey: 'MAP_CONTOURS', description: 'Calculate slope from contour lines.', effectText: 'Deals 25 DMG & shields 10.', damage: 25, shield: 10, iconName: 'TrendingUp' },
  { id: 'g_cor', name: 'Coriolis Deflect', cost: 1, subject: 'geography', rarity: 'common', operationKey: 'CORIOLIS_DEFLECT', description: 'Track atmospheric cyclonic deflection.', effectText: 'Deals 20 DMG & shields 15.', damage: 20, shield: 15, iconName: 'Wind' },
  { id: 'g_tect', name: 'Tectonic Stabilize', cost: 1, subject: 'geography', rarity: 'common', operationKey: 'TECTONIC_STABILIZE', description: 'Lock subduction fault equilibrium.', effectText: 'Deals 15 DMG & shields 15.', damage: 15, shield: 15, iconName: 'Shield' },
  { id: 'g_biome', name: 'Analyze Biome', cost: 1, subject: 'geography', rarity: 'common', operationKey: 'ANALYZE_BIOME', description: 'Classify Köppen climate zones.', effectText: 'Deals 25 DMG.', damage: 25, shield: 5, iconName: 'Globe' },
  { id: 'g_grad', name: 'Calculate Gradient', cost: 1, subject: 'geography', rarity: 'common', operationKey: 'CALCULATE_GRADIENT', description: 'Evaluate elevation change per unit distance.', effectText: 'Deals 20 DMG & shields 10.', damage: 20, shield: 10, iconName: 'Percent' },
  { id: 'g_iso', name: 'Isobar Mapping', cost: 1, subject: 'geography', rarity: 'common', operationKey: 'ISOBAR_MAP', description: 'Plot pressure gradients across frontal systems.', effectText: 'Deals 25 DMG & shields 10.', damage: 25, shield: 10, iconName: 'CloudRain' },
  { id: 'g_sed', name: 'Sediment Core', cost: 1, subject: 'geography', rarity: 'common', operationKey: 'SEDIMENT_CORE', description: 'Analyze fluvial deposition layering.', effectText: 'Deals 15 DMG & shields 10.', damage: 15, shield: 10, iconName: 'Database' },
];

export const LANGUAGE_STARTER_CARDS: Card[] = [
  { id: 'l_par', name: 'Syntax Parse', cost: 1, subject: 'language', rarity: 'common', operationKey: 'SYNTAX_PARSE', description: 'Deconstruct constituent noun and verb phrases.', effectText: 'Deals 40 DMG & shields 10.', damage: 40, shield: 10, iconName: 'GitBranch' },
  { id: 'l_dec', name: 'Decode Etymology', cost: 1, subject: 'language', rarity: 'common', operationKey: 'DECODE_ETYMOLOGY', description: 'Extract lexical heads and arguments.', effectText: 'Deals 45 DMG & shields 10.', damage: 45, shield: 10, iconName: 'BookOpen' },
  { id: 'l_ver', name: 'Validate Agreement', cost: 1, subject: 'language', rarity: 'common', operationKey: 'VERIFY', description: 'Confirm subject-verb agreement invariants.', effectText: 'Deals 30 DMG & 20 Shield.', damage: 30, shield: 20, iconName: 'CheckCircle2' },
  { id: 'l_dis', name: 'Disambiguate', cost: 1, subject: 'language', rarity: 'common', operationKey: 'DISAMBIGUATE', description: 'Resolve polysemy through context.', effectText: 'Deals 25 DMG & shields 10.', damage: 25, shield: 10, iconName: 'Eye' },
  { id: 'l_synth', name: 'Synthesize Clause', cost: 1, subject: 'language', rarity: 'common', operationKey: 'SYNTHESIZE_CLAUSE', description: 'Assemble complex hypothetical conditionals.', effectText: 'Deals 30 DMG & shields 10.', damage: 30, shield: 10, iconName: 'FileText' },
  { id: 'l_morph', name: 'Extract Morpheme', cost: 1, subject: 'language', rarity: 'common', operationKey: 'EXTRACT_MORPHEME', description: 'Isolate root, prefix, and inflectional affixes.', effectText: 'Deals 20 DMG & shields 10.', damage: 20, shield: 10, iconName: 'Scissors' },
  { id: 'l_rhet', name: 'Analyze Rhetoric', cost: 1, subject: 'language', rarity: 'common', operationKey: 'ANALYZE_RHETORIC', description: 'Classify ethos, logos, and pathos appeals.', effectText: 'Deals 25 DMG & shields 15.', damage: 25, shield: 15, iconName: 'MessageSquare' },
  { id: 'l_conj', name: 'Conjugate Verb', cost: 1, subject: 'language', rarity: 'common', operationKey: 'CONJUGATE', description: 'Align grammatical tense and mood.', effectText: 'Deals 20 DMG & shields 10.', damage: 20, shield: 10, iconName: 'Clock' },
  { id: 'l_phon', name: 'Parse Phoneme', cost: 1, subject: 'language', rarity: 'common', operationKey: 'PARSE_PHONEME', description: 'Analyze phonetic articulation and stress.', effectText: 'Deals 15 DMG & shields 10.', damage: 15, shield: 10, iconName: 'Volume2' },
  { id: 'l_shift', name: 'Semantic Shift', cost: 1, subject: 'language', rarity: 'common', operationKey: 'SEMANTIC_SHIFT', description: 'Track historical broadening or narrowing.', effectText: 'Deals 20 DMG.', damage: 20, shield: 5, iconName: 'Shuffle' },
];

/* MASTER ENCOUNTERS MAP */
export const ENCOUNTERS_MAP: Record<SubjectId, EncounterDefinition[]> = {
  mathematics: MATH_ENCOUNTERS,
  computerScience: CS_ENCOUNTERS,
  data_structures_algorithms: [...DSA_ENCOUNTERS, ...DSA_HIDDEN_TRIALS],
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
      validCards: PHYSICS_STARTER_CARDS,
      misconceptions: [],
      enemy: { name: 'Momentum Titan', title: 'Guardian of Inertia', hp: 125, attack: 24, visualType: 'algorithmic_horror', flavorQuote: 'An object at rest stays at rest unless crushed!' },
      rewardXp: 120,
      rewardMastery: 25,
    },
  ],
  chemistry: [
    {
      id: 'chem_lvl_1',
      levelNumber: 1,
      levelTitle: 'The Elemental Crucible',
      subject: 'chemistry',
      topic: 'Stoichiometry & Conservation',
      conceptName: 'Molar Stoichiometry',
      objective: 'Balance the reaction and compute stoichiometric mole ratios.',
      problemStatement: 'Synthesize water: Balance H₂ + O₂ -> H₂O and resolve mole constraints.',
      initialEquationOrState: 'Reaction: _H₂ + _O₂ -> _H₂O | Unbalanced',
      targetState: '2H₂ + O₂ -> 2H₂O [MASS CONSERVED]',
      correctAnswer: '2H₂ + O₂ -> 2H₂O',
      optimalSequence: ['BALANCE_EQUATION', 'STOICHIOMETRY', 'VERIFY'],
      stepTransformations: [
        { stepIndex: 0, operationKey: 'BALANCE_EQUATION', resultingState: '2H₂ + O₂ -> 2H₂O [COEFFICIENTS BALANCED]', explanation: 'Balanced oxygen and hydrogen atoms on both sides.', damageValue: 40 },
        { stepIndex: 1, operationKey: 'STOICHIOMETRY', resultingState: 'Mole Ratio: 2 mol H₂ : 1 mol O₂ : 2 mol H₂O', explanation: 'Derived stoichiometric proportions.', damageValue: 45 },
        { stepIndex: 2, operationKey: 'VERIFY', resultingState: '2H₂ + O₂ -> 2H₂O [MASS CONSERVED]', explanation: 'Mass conservation validated at atomic scale.', damageValue: 30 },
      ],
      validCards: CHEMISTRY_STARTER_CARDS,
      misconceptions: [],
      enemy: { name: 'Entropy Homunculus', title: 'Dissolver of Bonds', hp: 125, attack: 24, visualType: 'algorithmic_horror', flavorQuote: 'Atoms scatter when thermal chaos reigns!' },
      rewardXp: 120,
      rewardMastery: 25,
    },
  ],
  biology: [
    {
      id: 'bio_lvl_1',
      levelNumber: 1,
      levelTitle: 'The Helical Rift',
      subject: 'biology',
      topic: 'DNA Transcription',
      conceptName: 'Central Dogma Transcription',
      objective: 'Transcribe the template DNA triplet into messenger RNA.',
      problemStatement: 'Template DNA: 3\'-TAC-5\'. Transcribe to mRNA codon.',
      initialEquationOrState: 'Template DNA: 3\'-TAC-5\' | Codon: ?',
      targetState: 'mRNA Codon: 5\'-AUG-3\' (Start Codon Methionine) [TRANSCRIBED]',
      correctAnswer: '5\'-AUG-3\'',
      optimalSequence: ['TRANSCRIBE', 'TRANSLATE', 'VERIFY'],
      stepTransformations: [
        { stepIndex: 0, operationKey: 'TRANSCRIBE', resultingState: 'Base pairs matched: T->A, A->U, C->G => 5\'-AUG-3\'', explanation: 'RNA Polymerase incorporated complementary ribonucleotides.', damageValue: 40 },
        { stepIndex: 1, operationKey: 'TRANSLATE', resultingState: 'AUG specifies Formylmethionine / Start peptide', explanation: 'Ribosomal subunit docked on AUG start codon.', damageValue: 45 },
        { stepIndex: 2, operationKey: 'VERIFY', resultingState: '5\'-AUG-3\' [READING FRAME VERIFIED]', explanation: 'Reading frame proofread without point mutation.', damageValue: 30 },
      ],
      validCards: BIOLOGY_STARTER_CARDS,
      misconceptions: [],
      enemy: { name: 'Mutagenic Swarm', title: 'Weaver of Frame Shifts', hp: 125, attack: 24, visualType: 'algorithmic_horror', flavorQuote: 'One nucleotide shift shatters your genetic sanity!' },
      rewardXp: 120,
      rewardMastery: 25,
    },
  ],
  history: [
    {
      id: 'hist_lvl_1',
      levelNumber: 1,
      levelTitle: 'The Broken Dynasty',
      subject: 'history',
      topic: 'Chronological Sequencing',
      conceptName: 'Causal Anchoring',
      objective: 'Anchor the temporal epoch and determine primary historical causality.',
      problemStatement: 'Chronological breach: Identify causal catalyst of the Roman Republic transition.',
      initialEquationOrState: 'Crisis: 509 BCE Monarchic Overthrow | Causal Link: ?',
      targetState: 'Tarquin Expulsion -> Senate Foundation [EPOCH ANCHORED]',
      correctAnswer: 'Tarquin Expulsion -> Senate Foundation',
      optimalSequence: ['ANCHOR_ERA', 'PROVE_CAUSATION', 'VERIFY'],
      stepTransformations: [
        { stepIndex: 0, operationKey: 'ANCHOR_ERA', resultingState: 'Temporal coordinate locked: 509 BCE Classical Mediterranean', explanation: 'Geographical and cultural context established.', damageValue: 40 },
        { stepIndex: 1, operationKey: 'PROVE_CAUSATION', resultingState: 'Patrician uprising overthrew Etruscan monarchical tyranny', explanation: 'Distinguished proximate political catalyst from structural unrest.', damageValue: 45 },
        { stepIndex: 2, operationKey: 'VERIFY', resultingState: 'Consular Fasti & Polybius corroboration [AUTHENTICATED]', explanation: 'Primary source evidence corroborates causal sequence.', damageValue: 30 },
      ],
      validCards: HISTORY_STARTER_CARDS,
      misconceptions: [],
      enemy: { name: 'Chronos Revenant', title: 'Specter of False Memory', hp: 125, attack: 24, visualType: 'algorithmic_horror', flavorQuote: 'History is malleable wax in the hands of the forgotten!' },
      rewardXp: 120,
      rewardMastery: 25,
    },
  ],
  geography: [
    {
      id: 'geo_lvl_1',
      levelNumber: 1,
      levelTitle: 'The Faultline Rift',
      subject: 'geography',
      topic: 'Tectonic Drift & Plate Boundaries',
      conceptName: 'Tectonic Invariants',
      objective: 'Map the plate boundary and classify the transform faultline dynamics.',
      problemStatement: 'Lithospheric anomaly: San Andreas fault boundary dynamics.',
      initialEquationOrState: 'Boundary: Pacific Plate & North American Plate | Type: ?',
      targetState: 'Dextral Strike-Slip Transform Boundary [MAPPED]',
      correctAnswer: 'Transform Strike-Slip Boundary',
      optimalSequence: ['MAP_TERRAIN', 'TRACE_WATERSHED', 'VERIFY'],
      stepTransformations: [
        { stepIndex: 0, operationKey: 'MAP_TERRAIN', resultingState: 'Plate boundary plotted along Pacific Rim margin', explanation: 'Triangulated lateral displacement coordinates.', damageValue: 40 },
        { stepIndex: 1, operationKey: 'TRACE_WATERSHED', resultingState: 'Right-lateral shear strain identified along shear axis', explanation: 'Computed horizontal velocity vector: 35 mm/year.', damageValue: 45 },
        { stepIndex: 2, operationKey: 'VERIFY', resultingState: 'Seismological strike-slip focal mechanism [CONFIRMED]', explanation: 'Double-couple focal mechanism matches transform dynamics.', damageValue: 30 },
      ],
      validCards: GEOGRAPHY_STARTER_CARDS,
      misconceptions: [],
      enemy: { name: 'Tectonic Behemoth', title: 'Quake of the Mantle', hp: 125, attack: 24, visualType: 'algorithmic_horror', flavorQuote: 'Continents drift, mountains crumble into dust!' },
      rewardXp: 120,
      rewardMastery: 25,
    },
  ],
  language: [
    {
      id: 'lang_lvl_1',
      levelNumber: 1,
      levelTitle: 'The Tower of Babel',
      subject: 'language',
      topic: 'Grammar & Syntax Hierarchy',
      conceptName: 'Syntax Tree Parsing',
      objective: 'Deconstruct the sentence into constituent noun and verb phrases.',
      problemStatement: 'Parse clause structure: "The ancient scholar deciphered the rune."',
      initialEquationOrState: 'Sentence: "The ancient scholar deciphered the rune." | Syntax Tree: ?',
      targetState: '[S [NP The ancient scholar] [VP deciphered [NP the rune]]] [PARSED]',
      correctAnswer: '[S [NP] [VP]]',
      optimalSequence: ['SYNTAX_PARSE', 'DECODE_ETYMOLOGY', 'VERIFY'],
      stepTransformations: [
        { stepIndex: 0, operationKey: 'SYNTAX_PARSE', resultingState: 'Subject NP: "The ancient scholar" | Predicate VP: "deciphered the rune"', explanation: 'Bifurcated root clause into subject and predicate constituents.', damageValue: 40 },
        { stepIndex: 1, operationKey: 'DECODE_ETYMOLOGY', resultingState: 'Head Verb: "deciphered" (transitive) + Direct Object NP: "the rune"', explanation: 'Parsed complement clause and verbal valence.', damageValue: 45 },
        { stepIndex: 2, operationKey: 'VERIFY', resultingState: 'Grammar tree well-formedness rules satisfied [VERIFIED]', explanation: 'Agreement and government invariants confirmed.', damageValue: 30 },
      ],
      validCards: LANGUAGE_STARTER_CARDS,
      misconceptions: [],
      enemy: { name: 'Semantic Sphinx', title: 'Riddle of Ambiguity', hp: 125, attack: 24, visualType: 'algorithmic_horror', flavorQuote: 'Words deceive when structural grammar falters!' },
      rewardXp: 120,
      rewardMastery: 25,
    },
  ],
};

/* MASTER ECHO VAULTS MAP */
export const ECHO_VAULTS_MAP: Record<string, EchoDungeonDefinition> = {
  vault_factorization: MATH_ECHO_VAULT,
  vault_cs_invariants: CS_ECHO_VAULT,
  vault_dsa_asymptotics: DSA_ECHO_VAULT,
  vault_dsa_rotations: DSA_ROTATIONS_ECHO_VAULT,
  vault_dsa_strategy: DSA_STRATEGY_ECHO_VAULT,
  vault_dsa_optimization: DSA_OPTIMIZATION_ECHO_VAULT,
  vault_dsa_complexity: DSA_COMPLEXITY_ECHO_VAULT,
};

/* STARTER CARDS MAP */
export const STARTER_CARDS_MAP: Record<SubjectId, Card[]> = {
  mathematics: MATH_STARTER_CARDS,
  computerScience: CS_STARTER_CARDS,
  data_structures_algorithms: DSA_STARTER_CARDS,
  physics: PHYSICS_STARTER_CARDS,
  chemistry: CHEMISTRY_STARTER_CARDS,
  biology: BIOLOGY_STARTER_CARDS,
  history: HISTORY_STARTER_CARDS,
  geography: GEOGRAPHY_STARTER_CARDS,
  language: LANGUAGE_STARTER_CARDS,
};
