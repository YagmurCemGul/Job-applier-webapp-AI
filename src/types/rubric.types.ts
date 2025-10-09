/**
 * @fileoverview Rubric and scoring types for Step 43 — Interview Coach & Scheduler
 * @module types/rubric
 */

/**
 * Competency rubric definition
 */
export interface Rubric {
  id: string;
  name: string;
  competencies: Array<{ 
    key: string; 
    label: string; 
    weight: number; // sum ~ 1
  }>;
}

/**
 * Rubric score for a session
 */
export interface RubricScore {
  rubricId: string;
  scores: Record<string, number>;   // 0..4 per competency
  total: number;                    // weighted 0..4
  notes?: string;
}
