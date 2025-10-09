/**
 * @fileoverview SMART goal validation and formatting (Step 45)
 * @module services/onboarding/smartGoal
 */

import type { SmartGoal } from '@/types/onboarding.types';

/**
 * Validate SMART structure and produce a short label.
 * @param g - SMART goal
 * @returns Validation result
 */
export function validateSmart(g: SmartGoal): { ok: boolean; msg: string } {
  const hasMeasure = Boolean(g.metric && g.target);
  const hasTime = Boolean(g.dueISO || g.milestone);
  const ok = g.title.length >= 6 && hasMeasure && hasTime;
  const msg = ok ? 'OK' : 'Goal should include metric/target and a due date or milestone.';
  return { ok, msg };
}

/**
 * Format a SMART bullet for reports.
 * @param g - SMART goal
 * @returns Formatted bullet string
 */
export function smartBullet(g: SmartGoal): string {
  const when = g.dueISO ? new Date(g.dueISO).toLocaleDateString() : g.milestone.toUpperCase();
  return `• ${g.title} — ${g.description} (Metric: ${g.metric ?? '—'} → Target: ${g.target ?? '—'} by ${when})`;
}
