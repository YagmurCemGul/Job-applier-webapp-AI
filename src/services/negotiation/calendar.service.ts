/**
 * @fileoverview Calendar scheduling service for Step 44
 * @module services/negotiation/calendar
 */

import { getBearer } from '@/services/integrations/google.oauth.service';
import { calendarCreate } from '@/services/integrations/calendar.real.service';

/**
 * Schedule negotiation call on Google Calendar
 * @param opts - Calendar event options
 * @returns Calendar event
 */
export async function scheduleNegotiationCall(opts: {
  accountId: string;
  clientId: string;
  passphrase: string;
  title: string;
  whenISO: string;
  durationMin?: number;
  attendees?: string[];
}) {
  const bearer = await getBearer(
    opts.accountId,
    opts.passphrase,
    opts.clientId
  );

  return await calendarCreate(bearer, {
    title: opts.title,
    whenISO: opts.whenISO,
    durationMin: opts.durationMin ?? 30,
    attendees: opts.attendees ?? []
  });
}
