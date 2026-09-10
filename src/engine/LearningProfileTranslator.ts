import { PlayerProfile } from '../types/telemetry';
import { StorageManager } from '../persistence/StorageManager';
import { REALM_BOSS_LEVELS } from './ConvergenceEngine';
import { SubjectId } from '../types/game';

export interface QualitativeStrength {
  title: string;
  description: string;
}

export interface QualitativeWeakness {
  concept: string;
  status: 'Needs reinforcement' | 'Improving' | 'Recently repaired';
  educationalNote: string;
}

export interface LearningProfileSummary {
  headlineTraits: string[];
  cognitiveStrengths: QualitativeStrength[];
  activeWeaknesses: QualitativeWeakness[];
  learningPacing: string;
  recoveryResilience: string;
}

export class LearningProfileTranslator {
  /**
   * Translates internal behavioral records and LearningDNA into player-facing qualitative traits.
   * ABSOLUTE RULE: Never returns raw numbers, percentages, weights, probabilities, or engine terms.
   */
  public static translate(profile: PlayerProfile): LearningProfileSummary {
    const dna = profile.learningDNA;
    const strengths: QualitativeStrength[] = [];
    const headlineTraits: string[] = [];

    // 1. Evaluate genuine behavioral patterns if DNA is recorded
    if (dna) {
      if (dna.patternRecognition >= 65) {
        strengths.push({
          title: 'Strong Pattern Recognition',
          description: 'Rapidly identifies algebraic symmetries, structural invariants, and operational dependencies.',
        });
        headlineTraits.push('Strong pattern recognition across problem types');
      }

      if (dna.recoveryAfterMistakes >= 60) {
        strengths.push({
          title: 'Consistent Recovery After Mistakes',
          description: 'Recalculates solution paths constructively after encountering unexpected constraints.',
        });
        headlineTraits.push('Consistent recovery after mistakes');
      }

      if (dna.verificationHabit >= 65) {
        strengths.push({
          title: 'Careful Verification Habit',
          description: 'Rigorously confirms proofs and tests candidate roots before concluding proofs.',
        });
        headlineTraits.push('Careful verification discipline');
      }

      if (dna.transferAbility >= 65) {
        strengths.push({
          title: 'Effective Cross-Domain Transfer',
          description: 'Transfers structural intuition effectively when transitioning between unfamiliar realms.',
        });
        headlineTraits.push('Adapts well to unfamiliar problem structures');
      }

      if (dna.persistence >= 70) {
        strengths.push({
          title: 'Persistent Under Complexity',
          description: 'Demonstrates deep composure and focused tenacity through multi-stage challenges.',
        });
        headlineTraits.push('High persistence across challenging proofs');
      }

      if (dna.adaptability >= 65) {
        strengths.push({
          title: 'Strong Strategic Adaptation',
          description: 'Flexibly alters tactical routes when enemy wards or environmental modifiers interfere.',
        });
      }
    }

    // Include existing profile strengths from gameplay history
    if (profile.strengths && profile.strengths.length > 0) {
      profile.strengths.forEach(str => {
        if (!strengths.some(s => s.title.toLowerCase() === str.toLowerCase())) {
          strengths.push({
            title: str,
            description: 'Demonstrated mastery milestone documented in your expedition annals.',
          });
        }
      });
    }

    // Default baseline traits for a novice hunter if few records exist
    if (strengths.length === 0) {
      strengths.push({
        title: 'Analytical Curiosity',
        description: 'Approaches unfamiliar problem formulations with steady, methodical inquiry.',
      });
      strengths.push({
        title: 'Structural Decomposition',
        description: 'Breaks down compound equations into elementary component operations.',
      });
      headlineTraits.push('Developing foundational analytical intuition');
    }

    // 2. Evaluate Weaknesses to Fortify (Educational phrasing only)
    const activeWeaknesses: QualitativeWeakness[] = [];
    const rawWeaknesses = profile.weaknesses || [];

    rawWeaknesses.forEach(w => {
      // Clean up internal tags into readable educational concepts
      let cleanConcept = w.replace(/_/g, ' ');
      let note = 'Review core axiomatic definitions and multi-step balance.';
      let status: QualitativeWeakness['status'] = 'Needs reinforcement';

      if (w.toLowerCase().includes('factor') || w.toLowerCase().includes('zero product')) {
        cleanConcept = 'Zero Product Property & Factoring';
        note = 'Practice binomial root decomposition before executing variable isolation.';
      } else if (w.toLowerCase().includes('linear') || w.toLowerCase().includes('substitution') || w.toLowerCase().includes('simultaneous')) {
        cleanConcept = 'Substitution & Elimination Systems';
        note = 'Verify coordinate signs when substituting linear expressions into quadratic bounds.';
      } else if (w.toLowerCase().includes('inversion') || w.toLowerCase().includes('sorting') || w.toLowerCase().includes('bound')) {
        cleanConcept = 'Boundary Constraints & Sorting Invariants';
        note = 'Maintain pointer bounds carefully to avoid boundary index traps.';
      } else if (w.toLowerCase().includes('asymptot') || w.toLowerCase().includes('growth') || w.toLowerCase().includes('big_o')) {
        cleanConcept = 'Asymptotic Bounds & Growth Rates';
        note = 'Analyze dominant term behavior under asymptotic limits as n approaches infinity.';
      } else if (w.toLowerCase().includes('recurren') || w.toLowerCase().includes('master_method') || w.toLowerCase().includes('divide')) {
        cleanConcept = 'Recurrence Relations & Divide-and-Conquer';
        note = 'Compare log_b(a) with the work function f(n) to determine recurrence cases.';
      } else if (w.toLowerCase().includes('tree') || w.toLowerCase().includes('avl') || w.toLowerCase().includes('rotation')) {
        cleanConcept = 'Tree Balancing & Invariant Preservation';
        note = 'Verify balance factors after insertions to select appropriate single or double rotations.';
      } else if (w.toLowerCase().includes('graph') || w.toLowerCase().includes('bfs') || w.toLowerCase().includes('dfs')) {
        cleanConcept = 'Graph Traversal & Reachability Invariants';
        note = 'Track visited states carefully to prevent cycles and ensure complete path discovery.';
      } else if (w.toLowerCase().includes('greedy') || w.toLowerCase().includes('knapsack') || w.toLowerCase().includes('subproblem')) {
        cleanConcept = 'Greedy Invariants & Optimal Substructure';
        note = 'Confirm whether local greedy choice preserves global optimality before committing.';
      } else if (w.toLowerCase().includes('reduction') || w.toLowerCase().includes('np') || w.toLowerCase().includes('complexity')) {
        cleanConcept = 'Polynomial Reductions & Intractability';
        note = 'Ensure reduction direction maps known hard instances to target instances in polynomial time.';
      } else if (w.toLowerCase().includes('ambush') || w.toLowerCase().includes('dimensional')) {
        cleanConcept = 'Multi-Concept Synthesis Under Pressure';
        note = 'Break compound cross-domain constraints down into sequential single-axiom steps.';
        status = 'Improving';
      }

      // Check concept performance records if available
      if (profile.conceptPerformance) {
        const perf = Object.values(profile.conceptPerformance).find(
          cp => cp.conceptName.toLowerCase().includes(w.toLowerCase())
        );
        if (perf) {
          if (perf.successfulRecoveries > 0 && perf.recentMistakes < 2) {
            status = 'Improving';
          }
          if (perf.masteryLevel >= 60) {
            status = 'Recently repaired';
          }
        }
      }

      activeWeaknesses.push({
        concept: cleanConcept,
        status,
        educationalNote: note,
      });
    });

    // 3. Learning pacing & recovery narrative
    let learningPacing = 'Methodical and deliberate formulation.';
    if (dna && dna.speedProfile > 70) {
      learningPacing = 'Swift intuition with rapid analytical execution.';
    } else if (dna && dna.speedProfile < 35) {
      learningPacing = 'Deep, contemplative problem deconstruction.';
    }

    let recoveryResilience = 'Steadily builds confidence through repeated proof attempts.';
    if (dna && dna.recoveryAfterMistakes >= 60) {
      recoveryResilience = 'Demonstrates resilient self-correction when misconceptions are identified.';
    }

    return {
      headlineTraits: headlineTraits.length > 0 ? headlineTraits : ['Focused on foundational concept mastery'],
      cognitiveStrengths: strengths,
      activeWeaknesses,
      learningPacing,
      recoveryResilience,
    };
  }

  // =========================================================================
  // SECRET SYSTEM DISCOVERY FIREWALLS (Zero leaks before actual discovery)
  // =========================================================================

  /**
   * Observer discovery gate: Strictly hidden until the player has had at least 1 encounter.
   */
  public static isObserverDiscovered(profile: PlayerProfile): boolean {
    return (profile.observerState?.encounterCount ?? 0) > 0;
  }

  /**
   * Mirror Boss discovery gate: Strictly hidden until at least 1 mirror is encountered or defeated.
   */
  public static isMirrorSystemDiscovered(profile: PlayerProfile): boolean {
    const state = profile.mirrorBossState;
    if (!state) return false;
    return (state.encounteredMirrors?.length ?? 0) > 0 || (state.defeatedMirrors?.length ?? 0) > 0;
  }

  /**
   * Surprise Attack discovery gate: Strictly hidden until at least 1 ambush was survived or completed.
   */
  public static isSurpriseAttackDiscovered(profile: PlayerProfile): boolean {
    return (profile.surpriseAttacksCompleted ?? 0) > 0 || profile.lastSurpriseAttackTimestamp !== undefined;
  }

  /**
   * The Convergence discovery gate: Strictly hidden until all 8 realm bosses are defeated,
   * or convergence is unlocked / completed.
   */
  public static isConvergenceDiscovered(profile: PlayerProfile): boolean {
    if (profile.convergenceUnlocked || profile.convergenceCompleted) {
      return true;
    }
    return StorageManager.hasDefeatedAllRealmBosses(profile);
  }

  /**
   * The Last Question discovery gate: Strictly hidden until the student has answered it.
   */
  public static hasFinalReflection(profile: PlayerProfile): boolean {
    return profile.lastQuestionResult !== undefined && !!profile.lastQuestionResult.endingVariant;
  }

  /**
   * Checks whether a specific realm sovereign has been defeated.
   */
  public static isBossDefeated(profile: PlayerProfile, subject: SubjectId): boolean {
    if (subject === 'data_structures_algorithms') {
      const cleared = profile.clearedLevels['data_structures_algorithms'] || [];
      return cleared.includes(54);
    }
    const requiredLevel = (REALM_BOSS_LEVELS as Record<string, number>)[subject];
    if (!requiredLevel) return false;
    const cleared = profile.clearedLevels[subject] || [];
    return cleared.includes(requiredLevel);
  }

  /**
   * Counts total realm sovereigns defeated across all realms (including DSA).
   */
  public static getDefeatedBossCount(profile: PlayerProfile): number {
    const allSubjects = Object.keys(REALM_BOSS_LEVELS) as SubjectId[];
    let count = allSubjects.filter(subj => this.isBossDefeated(profile, subj)).length;
    if (this.isBossDefeated(profile, 'data_structures_algorithms')) {
      count += 1;
    }
    return count;
  }

  /**
   * Counts total canonical realm council bosses defeated (out of 8).
   */
  public static getDefeatedCouncilBossCount(profile: PlayerProfile): number {
    const allSubjects = Object.keys(REALM_BOSS_LEVELS) as SubjectId[];
    return allSubjects.filter(subj => this.isBossDefeated(profile, subj)).length;
  }
}
