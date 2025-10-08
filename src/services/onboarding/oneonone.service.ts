/**
 * @fileoverview 1:1 meeting service for scheduling and action extraction.
 * @module services/onboarding/oneonone
 */

import type { OneOnOneSeries, OneOnOneEntry } from '@/types/oneonone.types';
import { calendarCreate } from '@/services/integrations/calendar.real.service';
import { getBearer } from '@/services/integrations/google.oauth.service';

/**
 * Create a recurring event series in Calendar (client-side simplified: create first instance).
 * @param s - Series configuration
 * @param accountId - Google account ID
 * @returns Event ID and next occurrence ISO
 */
export async function scheduleOneOnOne(
  s: OneOnOneSeries,
  accountId: string
): Promise<{ eventId: string; whenISO: string }> {
  const next = computeNextOccurISO(s.weekday, s.timeHHMM);
  const bearer = await getBearer(
    accountId,
    import.meta.env.VITE_OAUTH_PASSPHRASE,
    import.meta.env.VITE_GOOGLE_CLIENT_ID
  );
  const ev = await calendarCreate(bearer, {
    title: `1:1 with ${s.counterpartName}`,
    whenISO: next,
    durationMin: s.durationMin,
    attendees: [s.counterpartEmail],
  });
  return { eventId: (ev as any).id, whenISO: next };
}

/**
 * Compute next occurrence ISO string for recurring 1:1.
 * @param weekday - Day of week (0=Sun, 1=Mon, ...)
 * @param timeHHMM - Time in HH:MM format
 * @returns ISO string for next occurrence
 */
export function computeNextOccurISO(weekday: number, timeHHMM: string): string {
  const [h, m] = timeHHMM.split(':').map(Number);
  const now = new Date();
  const d = new Date(now);
  const delta = (weekday - now.getDay() + 7) % 7 || 7;
  d.setDate(now.getDate() + delta);
  d.setHours(h, m ?? 0, 0, 0);
  return d.toISOString();
}

/**
 * Convert entry notes into action items prompt for AI.
 * @param entry - 1:1 entry with notes
 * @returns AI prompt
 */
export function entryToActionPrompt(entry: OneOnOneEntry): string {
  return `Extract actionable items from 1:1 notes. Return JSON [{text, owner?, dueISO?}]. Notes:\n${entry.notes || ''}`;
}
