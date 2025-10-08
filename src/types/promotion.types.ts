/**
 * @fileoverview Type definitions for Promotion and Calibration system
 * Defines rubric expectations, calibration notes, and promotion case packets
 */

/**
 * Rubric expectation for a specific level and competency
 */
export interface RubricExpectation {
  level: string;                   // e.g., "L4", "Senior"
  competency: 'execution' | 'craft' | 'leadership' | 'collaboration' | 'communication' | 'impact';
  description: string;
}

/**
 * Calibration note with risk assessment
 */
export interface CalibrationNote {
  id: string;
  cycleId: string;
  note: string;
  risk?: 'low' | 'med' | 'high';
  createdAt: string;
}

/**
 * Promotion case packet with narrative and supporting evidence
 */
export interface PromotionCase {
  id: string;
  cycleId: string;
  targetLevel: string;
  narrative: string;               // scope increase story
  supportingQuotes: string[];      // selected feedback snippets
  attachments?: string[];          // links to docs/artifacts
  version: number;
  updatedAt: string;
}
