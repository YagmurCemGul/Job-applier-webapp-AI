/**
 * @fileoverview Review cycle deadline scheduler
 * Creates calendar events for review deadlines via Step 35 integration
 */

import { calendarCreate } from '@/services/integrations/calendar.real.service';
import { getBearer } from '@/services/integrations/google.oauth.service';

/**
 * Schedule a review cycle deadline as a calendar event
 */
export async function scheduleCycleDeadline(opts: {
  accountId: string;
  clientId: string;
  passphrase: string;
  label: string;
  atISO: string;
  attendees?: string[];
}): Promise<any> {
  const bearer = await getBearer(opts.accountId, opts.passphrase, opts.clientId);
  
  return await calendarCreate(bearer, {
    title: opts.label,
    whenISO: opts.atISO,
    durationMin: 30,
    attendees: opts.attendees ?? []
  });
}
