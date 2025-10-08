/**
 * @fileoverview Stakeholder management service.
 * @module services/onboarding/stakeholder
 */

import type { Stakeholder } from '@/types/onboarding.types';

/**
 * Deduplicate stakeholders by email and rank by (influence, interest).
 * @param items - Stakeholder list
 * @returns Deduplicated and sorted list
 */
export function dedupeStakeholders(items: Stakeholder[]): Stakeholder[] {
  const map = new Map<string, Stakeholder>();
  for (const s of items) {
    map.set(s.email.toLowerCase(), s);
  }
  return Array.from(map.values()).sort((a, b) => score(b) - score(a));
}

function score(s: Stakeholder): number {
  const v = (x: 'low' | 'med' | 'high') => (x === 'high' ? 3 : x === 'med' ? 2 : 1);
  return v(s.influence) + v(s.interest);
}
