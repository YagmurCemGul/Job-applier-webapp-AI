/**
 * @fileoverview Risk scoring service (Step 45)
 * @module services/onboarding/risk
 */

import type { RiskItem } from '@/types/onboarding.types';

/**
 * Calculate risk level from probability and impact.
 * @param r - Risk item with probability and impact
 * @returns Risk level and score
 */
export function scoreRisk(r: Pick<RiskItem, 'probability' | 'impact'>): {
  level: 'low' | 'medium' | 'high';
  score: number;
} {
  const score = r.probability * r.impact; // 1..25
  const level = score >= 16 ? 'high' : score >= 9 ? 'medium' : 'low';
  return { level, score };
}
