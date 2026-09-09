import { SubjectId, KingdomId, ClassId } from '../types/game';
import { PlayerProfile } from '../types/telemetry';

export interface AcademicClass {
  id: ClassId;
  name: string;
  rankTitle: string;
  kingdomId: KingdomId;
  availableSubjectIds: SubjectId[];
  defaultSubjectId: SubjectId;
  status: 'playable' | 'future_expansion';
  description: string;
}

export interface EducationKingdom {
  id: KingdomId;
  name: string;
  subtitle: string;
  badge: string;
  description: string;
  defaultClassId: ClassId;
  classes: AcademicClass[];
}

// ---------------------------------------------------------------------------
// 1. ALL ACADEMIC CLASSES
// ---------------------------------------------------------------------------
export const ACADEMIC_CLASSES: Record<ClassId, AcademicClass> = {
  // Primary Academy (Classes 1–5) - Future Expansion (No fake curriculum)
  class_1: {
    id: 'class_1',
    name: 'Class 1',
    rankTitle: 'Initiate of Counting',
    kingdomId: 'primary_academy',
    availableSubjectIds: ['mathematics', 'language'],
    defaultSubjectId: 'mathematics',
    status: 'future_expansion',
    description: 'Number sense, elementary patterns, and fundamental signs.',
  },
  class_2: {
    id: 'class_2',
    name: 'Class 2',
    rankTitle: 'Acolyte of Arithmetic',
    kingdomId: 'primary_academy',
    availableSubjectIds: ['mathematics', 'language'],
    defaultSubjectId: 'mathematics',
    status: 'future_expansion',
    description: 'Addition, subtraction, geometric shapes, and spatial awareness.',
  },
  class_3: {
    id: 'class_3',
    name: 'Class 3',
    rankTitle: 'Scholar of Foundations',
    kingdomId: 'primary_academy',
    availableSubjectIds: ['mathematics', 'biology', 'language'],
    defaultSubjectId: 'mathematics',
    status: 'future_expansion',
    description: 'Multiplication grids, division basics, and natural phenomena.',
  },
  class_4: {
    id: 'class_4',
    name: 'Class 4',
    rankTitle: 'Seeker of Structures',
    kingdomId: 'primary_academy',
    availableSubjectIds: ['mathematics', 'geography', 'language'],
    defaultSubjectId: 'mathematics',
    status: 'future_expansion',
    description: 'Fractions, perimeter, physical maps, and elemental matter.',
  },
  class_5: {
    id: 'class_5',
    name: 'Class 5',
    rankTitle: 'Guardian of the Gate',
    kingdomId: 'primary_academy',
    availableSubjectIds: ['mathematics', 'geography', 'language'],
    defaultSubjectId: 'mathematics',
    status: 'future_expansion',
    description: 'Decimals, volume, coordinate concepts, and environmental systems.',
  },

  // Middle Spire (Classes 6–8) - Future Expansion (No fake curriculum)
  class_6: {
    id: 'class_6',
    name: 'Class 6',
    rankTitle: 'Apprentice of Axioms',
    kingdomId: 'middle_spire',
    availableSubjectIds: ['mathematics', 'physics', 'chemistry', 'biology', 'history', 'geography', 'language'],
    defaultSubjectId: 'mathematics',
    status: 'future_expansion',
    description: 'Integers, ratios, kinetic states, and cell architecture.',
  },
  class_7: {
    id: 'class_7',
    name: 'Class 7',
    rankTitle: 'Disciple of the Spire',
    kingdomId: 'middle_spire',
    availableSubjectIds: ['mathematics', 'physics', 'chemistry', 'biology', 'history', 'geography', 'language'],
    defaultSubjectId: 'mathematics',
    status: 'future_expansion',
    description: 'Algebraic expressions, linear motion, respiration, and historical epochs.',
  },
  class_8: {
    id: 'class_8',
    name: 'Class 8',
    rankTitle: 'Adept of Equilibria',
    kingdomId: 'middle_spire',
    availableSubjectIds: ['mathematics', 'physics', 'chemistry', 'biology', 'history', 'geography', 'language', 'computerScience'],
    defaultSubjectId: 'mathematics',
    status: 'future_expansion',
    description: 'Rational numbers, chemical effects, cell division, and intro algorithms.',
  },

  // Secondary Bastion (Classes 9–10) - Playable Content
  class_9: {
    id: 'class_9',
    name: 'Class 9',
    rankTitle: 'Sentinel of Polynomials',
    kingdomId: 'secondary_bastion',
    availableSubjectIds: ['mathematics', 'computerScience', 'physics', 'chemistry', 'biology', 'history', 'geography', 'language'],
    defaultSubjectId: 'mathematics',
    status: 'playable',
    description: 'Polynomial factorization, linear systems, and computational structures.',
  },
  class_10: {
    id: 'class_10',
    name: 'Class 10',
    rankTitle: 'Champion of Core Mastery',
    kingdomId: 'secondary_bastion',
    availableSubjectIds: ['mathematics', 'computerScience', 'physics', 'chemistry', 'biology', 'history', 'geography', 'language'],
    defaultSubjectId: 'mathematics',
    status: 'playable',
    description: 'Quadratic equations, algorithmic invariants, and multi-concept synthesis.',
  },

  // Higher Sanctuary (Classes 11–12) - Future Expansion
  class_11: {
    id: 'class_11',
    name: 'Class 11',
    rankTitle: 'Warden of Calculus',
    kingdomId: 'higher_sanctuary',
    availableSubjectIds: ['mathematics', 'physics', 'chemistry', 'biology', 'computerScience', 'language'],
    defaultSubjectId: 'mathematics',
    status: 'future_expansion',
    description: 'Limits, trigonometric synthesis, Newtonian vectors, and recursion.',
  },
  class_12: {
    id: 'class_12',
    name: 'Class 12',
    rankTitle: 'Sovereign of Integration',
    kingdomId: 'higher_sanctuary',
    availableSubjectIds: ['mathematics', 'physics', 'chemistry', 'biology', 'computerScience', 'language'],
    defaultSubjectId: 'mathematics',
    status: 'future_expansion',
    description: 'Differential calculus, electrodynamics, organic reaction paths, and algorithmic DAGs.',
  },

  // Undergraduate Forge (University Years 1–4)
  undergraduate_year_1: {
    id: 'undergraduate_year_1',
    name: 'Year 1',
    rankTitle: 'Scholar of Algorithmic Foundations',
    kingdomId: 'undergraduate_forge',
    availableSubjectIds: ['data_structures_algorithms', 'computerScience', 'mathematics'],
    defaultSubjectId: 'data_structures_algorithms',
    status: 'playable',
    description: 'Data Structures & Algorithms (BACSE105), asymptotic analysis, and core data structures.',
  },
  undergraduate_year_2: {
    id: 'undergraduate_year_2',
    name: 'Year 2',
    rankTitle: 'Weaver of Complex Systems',
    kingdomId: 'undergraduate_forge',
    availableSubjectIds: ['data_structures_algorithms', 'computerScience', 'mathematics'],
    defaultSubjectId: 'data_structures_algorithms',
    status: 'future_expansion',
    description: 'Advanced graph algorithms, greedy optimization, and dynamic programming.',
  },
  undergraduate_year_3: {
    id: 'undergraduate_year_3',
    name: 'Year 3',
    rankTitle: 'Master of Computability',
    kingdomId: 'undergraduate_forge',
    availableSubjectIds: ['data_structures_algorithms', 'computerScience'],
    defaultSubjectId: 'data_structures_algorithms',
    status: 'future_expansion',
    description: 'Intractability, NP-completeness reductions, and approximation algorithms.',
  },
  undergraduate_year_4: {
    id: 'undergraduate_year_4',
    name: 'Year 4',
    rankTitle: 'Architect of Computational Proof',
    kingdomId: 'undergraduate_forge',
    availableSubjectIds: ['data_structures_algorithms', 'computerScience'],
    defaultSubjectId: 'data_structures_algorithms',
    status: 'future_expansion',
    description: 'Distributed algorithms, sovereign synthesis, and advanced thesis proofs.',
  },

  // Archon Observatory (Advanced Research)
  archon_research_1: {
    id: 'archon_research_1',
    name: 'Research Tier I',
    rankTitle: 'Fellow of the Archons',
    kingdomId: 'archon_observatory',
    availableSubjectIds: ['data_structures_algorithms', 'computerScience', 'mathematics'],
    defaultSubjectId: 'data_structures_algorithms',
    status: 'future_expansion',
    description: 'Theoretical computing, asymptotic frontier analysis, and structural proof.',
  },
  archon_research_2: {
    id: 'archon_research_2',
    name: 'Research Tier II',
    rankTitle: 'Archon of the Final Void',
    kingdomId: 'archon_observatory',
    availableSubjectIds: ['data_structures_algorithms', 'computerScience', 'mathematics'],
    defaultSubjectId: 'data_structures_algorithms',
    status: 'future_expansion',
    description: 'Sovereign algorithmic convergence and unified field theories of computation.',
  },

  // Legacy Tier (Preserves pre-upgrade profiles without guessing class)
  legacy_tier: {
    id: 'legacy_tier',
    name: 'Legacy Expedition',
    rankTitle: 'Veteran of the Citadel',
    kingdomId: 'secondary_bastion',
    availableSubjectIds: ['mathematics', 'computerScience', 'physics', 'chemistry', 'biology', 'history', 'geography', 'language'],
    defaultSubjectId: 'mathematics',
    status: 'playable',
    description: 'Preserved expedition record from prior Spire incursions.',
  },
};

// ---------------------------------------------------------------------------
// 2. ALL EDUCATION KINGDOMS
// ---------------------------------------------------------------------------
export const EDUCATION_KINGDOMS: EducationKingdom[] = [
  {
    id: 'primary_academy',
    name: 'Primary Academy',
    subtitle: 'Classes 1–5',
    badge: 'Foundations',
    description: 'Foundational arithmetic, spatial perception, and verbal axioms.',
    defaultClassId: 'class_5',
    classes: [
      ACADEMIC_CLASSES.class_1,
      ACADEMIC_CLASSES.class_2,
      ACADEMIC_CLASSES.class_3,
      ACADEMIC_CLASSES.class_4,
      ACADEMIC_CLASSES.class_5,
    ],
  },
  {
    id: 'middle_spire',
    name: 'Middle Spire',
    subtitle: 'Classes 6–8',
    badge: 'Intermediate',
    description: 'Pre-algebraic equations, physical laws, and cellular foundations.',
    defaultClassId: 'class_8',
    classes: [
      ACADEMIC_CLASSES.class_6,
      ACADEMIC_CLASSES.class_7,
      ACADEMIC_CLASSES.class_8,
    ],
  },
  {
    id: 'secondary_bastion',
    name: 'Secondary Bastion',
    subtitle: 'Classes 9–10',
    badge: 'Core Mastery',
    description: 'Quadratic factorization, linear systems, and fundamental algorithmic logic.',
    defaultClassId: 'class_10',
    classes: [
      ACADEMIC_CLASSES.class_9,
      ACADEMIC_CLASSES.class_10,
    ],
  },
  {
    id: 'higher_sanctuary',
    name: 'Higher Sanctuary',
    subtitle: 'Classes 11–12',
    badge: 'Advanced',
    description: 'Calculus, quantum structures, dynamic data structures, and advanced proof.',
    defaultClassId: 'class_12',
    classes: [
      ACADEMIC_CLASSES.class_11,
      ACADEMIC_CLASSES.class_12,
    ],
  },
  {
    id: 'undergraduate_forge',
    name: 'Undergraduate Forge',
    subtitle: 'University Years 1–4',
    badge: 'Scholarly',
    description: 'Data Structures & Algorithms, discrete computational theory, and asymptotic complexity.',
    defaultClassId: 'undergraduate_year_1',
    classes: [
      ACADEMIC_CLASSES.undergraduate_year_1,
      ACADEMIC_CLASSES.undergraduate_year_2,
      ACADEMIC_CLASSES.undergraduate_year_3,
      ACADEMIC_CLASSES.undergraduate_year_4,
    ],
  },
  {
    id: 'archon_observatory',
    name: 'Archon Observatory',
    subtitle: 'University Advanced',
    badge: 'Mastery',
    description: 'Advanced complexity classes, intractability reductions, and sovereign synthesis.',
    defaultClassId: 'archon_research_1',
    classes: [
      ACADEMIC_CLASSES.archon_research_1,
      ACADEMIC_CLASSES.archon_research_2,
    ],
  },
];

// ---------------------------------------------------------------------------
// 3. HELPER FUNCTIONS & REGISTRY RESOLVERS
// ---------------------------------------------------------------------------

export function getAllKingdoms(): EducationKingdom[] {
  return EDUCATION_KINGDOMS;
}

export function getKingdom(kingdomId: string): EducationKingdom | undefined {
  return EDUCATION_KINGDOMS.find(k => k.id === kingdomId);
}

export function getAllClasses(): AcademicClass[] {
  return Object.values(ACADEMIC_CLASSES);
}

export function getClass(classId: string): AcademicClass | undefined {
  return ACADEMIC_CLASSES[classId as ClassId];
}

export function getClassesForKingdom(kingdomId: string): AcademicClass[] {
  const kingdom = getKingdom(kingdomId);
  return kingdom ? kingdom.classes : [];
}

export function getKingdomForClass(classId: string): EducationKingdom | undefined {
  const cls = getClass(classId);
  if (!cls) return undefined;
  return getKingdom(cls.kingdomId);
}

export function getDefaultClassForKingdom(kingdomId: string): AcademicClass {
  const kingdom = getKingdom(kingdomId);
  if (kingdom) {
    const cls = getClass(kingdom.defaultClassId);
    if (cls) return cls;
  }
  return ACADEMIC_CLASSES.class_10;
}

export function getAvailableSubjectsForClass(classId: string): SubjectId[] {
  const cls = getClass(classId);
  if (!cls) {
    return ['mathematics', 'computerScience'];
  }
  return cls.availableSubjectIds;
}

export function isSubjectAllowedInClass(classId: string, subjectId: SubjectId): boolean {
  const allowed = getAvailableSubjectsForClass(classId);
  return allowed.includes(subjectId);
}

/**
 * Creates the isolated progression context key: `${kingdomId}:${classId}:${subjectId}`
 */
export function getProgressionContextKey(
  kingdomId: string,
  classId: string,
  subjectId: SubjectId
): string {
  const k = kingdomId || 'secondary_bastion';
  const c = classId || 'class_10';
  const s = subjectId || 'mathematics';
  return `${k}:${c}:${s}`;
}

/**
 * Safely resolves the active educational context from the profile without data loss.
 */
export function resolveEducationalContext(profile: PlayerProfile): {
  kingdomId: KingdomId;
  classId: ClassId;
  subjectId: SubjectId;
} {
  // If activeKingdom and activeClass are already set and valid
  if (profile.activeKingdom && profile.activeClass && getClass(profile.activeClass)) {
    const kId = profile.activeKingdom as KingdomId;
    const cId = profile.activeClass as ClassId;
    const cls = getClass(cId)!;
    return {
      kingdomId: kId,
      classId: cId,
      subjectId: cls.defaultSubjectId,
    };
  }

  // Safe legacy resolution without assuming class_10
  const legacyTier = profile.activeEducationLevel;
  if (legacyTier === 'college_foundation') {
    return {
      kingdomId: 'undergraduate_forge',
      classId: 'undergraduate_year_1',
      subjectId: 'data_structures_algorithms',
    };
  }
  if (legacyTier === 'class_1_5') {
    return {
      kingdomId: 'primary_academy',
      classId: 'class_5',
      subjectId: 'mathematics',
    };
  }
  if (legacyTier === 'class_6_8') {
    return {
      kingdomId: 'middle_spire',
      classId: 'class_8',
      subjectId: 'mathematics',
    };
  }
  if (legacyTier === 'class_11_12') {
    return {
      kingdomId: 'higher_sanctuary',
      classId: 'class_12',
      subjectId: 'mathematics',
    };
  }
  if (legacyTier === 'college_advanced') {
    return {
      kingdomId: 'archon_observatory',
      classId: 'archon_research_1',
      subjectId: 'data_structures_algorithms',
    };
  }

  // Legacy default: Secondary Bastion with safe legacy_tier context
  return {
    kingdomId: 'secondary_bastion',
    classId: 'legacy_tier',
    subjectId: 'mathematics',
  };
}
