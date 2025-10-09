/**
 * Calendar Performance Integration Service
 * 
 * Creates calendar events for review milestones and reminders.
 */

import type { ReviewCycle } from '@/types/perf.types';
import { getBearer } from '@/services/integrations/google.oauth.service';
import { calendarCreate } from '@/services/integrations/calendar.real.service';

/**
 * Create Calendar events for review milestones and gentle nudges.
 */
export async function createReviewEvents(
  cycle: ReviewCycle,
  accountId: string,
  clientId: string,
  passphrase: string
) {
  const bearer = await getBearer(accountId, passphrase, clientId);
  const events = [
    { title: `${cycle.title} — Kickoff`, whenISO: cycle.startISO, durationMin: 25 },
    { title: `${cycle.title} — Submit Self-Review`, whenISO: cycle.dueISO, durationMin: 30 },
  ];
  const out = [];
  for (const e of events) out.push(await calendarCreate(bearer, e));
  return out;
}
