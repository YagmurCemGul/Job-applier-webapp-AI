/**
 * @fileoverview Application follow-up reminder service
 * Creates calendar reminders for application follow-ups
 */

import { calendarCreate } from '@/services/integrations/calendar.real.service';
import { getBearer } from '@/services/integrations/google.oauth.service';

/**
 * Create a follow-up reminder in Calendar for N days later.
 * @param daysFromNow - Days until reminder
 * @param title - Reminder title
 * @param accountId - Google account ID
 * @param clientId - OAuth client ID
 * @param passphrase - Encryption passphrase
 * @returns Calendar event metadata
 */
export async function scheduleFollowUp(
  daysFromNow: number,
  title: string,
  accountId: string,
  clientId: string,
  passphrase: string
): Promise<{ id: string; htmlLink: string }> {
  const when = new Date(Date.now() + daysFromNow*86400000).toISOString();
  const bearer = await getBearer(accountId, passphrase, clientId);
  return await calendarCreate(bearer, { title, whenISO: when, durationMin: 15 });
}
