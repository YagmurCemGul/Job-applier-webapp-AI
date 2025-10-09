/**
 * @fileoverview Rubric scoring service for Step 43
 * @module services/interview/rubric
 */

import type { Rubric, RubricScore } from '@/types/rubric.types';

/**
 * Default behavioral rubric
 */
export const DEFAULT_RUBRIC: Rubric = {
  id: 'default-behavioral',
  name: 'Behavioral Core',
  competencies: [
    { key: 'clarity', label: 'Communication Clarity', weight: 0.25 },
    { key: 'structure', label: 'Structured Thinking', weight: 0.25 },
    { key: 'impact', label: 'Impact & Metrics', weight: 0.25 },
    { key: 'ownership', label: 'Ownership/Leadership', weight: 0.25 }
  ]
};

/**
 * System design rubric
 */
export const SYSTEM_DESIGN_RUBRIC: Rubric = {
  id: 'system-design',
  name: 'System Design',
  competencies: [
    { key: 'requirements', label: 'Requirements Gathering', weight: 0.2 },
    { key: 'architecture', label: 'System Architecture', weight: 0.3 },
    { key: 'scalability', label: 'Scalability & Performance', weight: 0.25 },
    { key: 'tradeoffs', label: 'Trade-off Analysis', weight: 0.25 }
  ]
};

/**
 * Coding rubric
 */
export const CODING_RUBRIC: Rubric = {
  id: 'coding',
  name: 'Coding',
  competencies: [
    { key: 'correctness', label: 'Correctness', weight: 0.3 },
    { key: 'efficiency', label: 'Efficiency', weight: 0.25 },
    { key: 'code_quality', label: 'Code Quality', weight: 0.25 },
    { key: 'communication', label: 'Communication', weight: 0.2 }
  ]
};

/**
 * Compute weighted rubric score
 * @param input - Rubric and ratings
 * @returns Computed rubric score
 */
export function computeScore(input: {
  rubric: Rubric;
  ratings: Record<string, number>;
  notes?: string;
}): RubricScore {
  let total = 0;

  for (const c of input.rubric.competencies) {
    const rating = input.ratings[c.key] ?? 0;
    total += rating * c.weight;
  }

  return {
    rubricId: input.rubric.id,
    scores: input.ratings,
    total: Number(total.toFixed(2)),
    notes: input.notes
  };
}

/**
 * Get rubric by ID
 * @param id - Rubric ID
 * @returns Rubric or default
 */
export function getRubricById(id: string): Rubric {
  const rubrics = [DEFAULT_RUBRIC, SYSTEM_DESIGN_RUBRIC, CODING_RUBRIC];
  return rubrics.find(r => r.id === id) || DEFAULT_RUBRIC;
}

/**
 * Get all available rubrics
 * @returns Array of rubrics
 */
export function getAllRubrics(): Rubric[] {
  return [DEFAULT_RUBRIC, SYSTEM_DESIGN_RUBRIC, CODING_RUBRIC];
}

/**
 * Validate rubric competency weights sum to ~1
 * @param rubric - Rubric to validate
 * @returns true if valid
 */
export function validateRubric(rubric: Rubric): boolean {
  const sum = rubric.competencies.reduce((acc, c) => acc + c.weight, 0);
  return Math.abs(sum - 1) < 0.01; // Allow small floating point errors
}
