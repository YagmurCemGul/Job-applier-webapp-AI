/**
 * @fileoverview Stakeholder mapping service (Step 45)
 * @module services/onboarding/stakeholders
 */

import type { Stakeholder } from '@/types/onboarding.types';

/**
 * Classify stakeholders into a power-interest matrix quadrant.
 * @param s - Stakeholder
 * @returns Quadrant classification
 */
export function quadrant(s: Stakeholder): 'manage_closely' | 'keep_satisfied' | 'keep_informed' | 'monitor' {
  const highPower = (s.power ?? 0) >= 4;
  const highInterest = (s.interest ?? 0) >= 4;
  
  if (highPower && highInterest) return 'manage_closely';
  if (highPower && !highInterest) return 'keep_satisfied';
  if (!highPower && highInterest) return 'keep_informed';
  return 'monitor';
}
