/**
 * @fileoverview Reminder service for scheduling calendar reminders.
 * @module services/onboarding/reminder
 */

import { calendarCreate } from '@/services/integrations/calendar.real.service';
import { getBearer } from '@/services/integrations/google.oauth.service';

/**
 * Schedule a reminder event in calendar.
 * @param accountId - Google account ID
 * @param label - Reminder label
 * @param whenISO - When to remind (ISO string)
 * @returns Calendar event
 */
export async function scheduleReminder(
  accountId: string,
  label: string,
  whenISO: string
): Promise<any> {
  const bearer = await getBearer(
    accountId,
    import.meta.env.VITE_OAUTH_PASSPHRASE,
    import.meta.env.VITE_GOOGLE_CLIENT_ID
  );
  return await calendarCreate(bearer, {
    title: label,
    whenISO,
    durationMin: 15,
  });
}
