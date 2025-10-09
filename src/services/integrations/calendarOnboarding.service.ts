/**
 * @fileoverview Calendar integration for onboarding cadences (Step 45)
 * @module services/integrations/calendarOnboarding
 */

import type { CadenceEvent } from '@/types/onboarding.types';
import { getBearer } from '@/services/integrations/google.oauth.service';
import { calendarCreate } from '@/services/integrations/calendar.real.service';

/**
 * Create recurring Calendar events for onboarding cadences (consent-first).
 * @param events - Cadence events to create
 * @param accountId - Google account ID
 * @param clientId - OAuth client ID
 * @param passphrase - Encryption passphrase
 * @returns Array of created event results
 */
export async function createCadenceEvents(
  events: CadenceEvent[],
  accountId: string,
  clientId: string,
  passphrase: string
): Promise<Array<{ id: string; htmlLink: string }>> {
  const bearer = await getBearer(accountId, passphrase, clientId);
  const results = [];
  
  for (const ev of events) {
    const durationMin = Math.max(25, (Date.parse(ev.endISO) - Date.parse(ev.startISO)) / 60000);
    const res = await calendarCreate(bearer, {
      title: ev.title,
      whenISO: ev.startISO,
      durationMin,
      attendees: ev.attendees
    });
    results.push(res);
  }
  
  return results;
}
