/**
 * @fileoverview Deadline management service for Step 37 — integrates with Step 35 Calendar
 * @module services/offer/deadline
 */

/**
 * Create calendar event for offer deadline
 * 
 * Integrates with Step 35 Google Calendar service
 */
export async function createDeadlineEvent(opts: {
  accountId: string;
  label: string;
  atISO: string;
  attendees?: string[];
}): Promise<{ eventId: string; htmlLink?: string }> {
  try {
    // Import Step 35 services
    const { calendarCreate } = await import('@/services/integrations/calendar.real.service');
    const { getBearer } = await import('@/services/integrations/google.oauth.service');

    const bearer = await getBearer(
      opts.accountId,
      import.meta.env.VITE_OAUTH_PASSPHRASE,
      import.meta.env.VITE_GOOGLE_CLIENT_ID
    );

    const event = await calendarCreate(bearer, {
      title: opts.label,
      whenISO: opts.atISO,
      durationMin: 15,
      attendees: opts.attendees ?? []
    });

    return {
      eventId: event.id ?? '',
      htmlLink: event.htmlLink
    };
  } catch (error) {
    console.error('Failed to create calendar event:', error);
    throw new Error('Failed to create deadline event. Ensure Google Calendar is connected.');
  }
}

/**
 * Check if deadline is approaching (within 72 hours)
 */
export function isDeadlineApproaching(deadlineISO: string): boolean {
  const deadline = new Date(deadlineISO);
  const now = new Date();
  const hoursUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntil > 0 && hoursUntil <= 72;
}

/**
 * Get deadline status
 */
export function getDeadlineStatus(deadlineISO: string): 'past' | 'approaching' | 'future' {
  const deadline = new Date(deadlineISO);
  const now = new Date();
  
  if (deadline < now) return 'past';
  if (isDeadlineApproaching(deadlineISO)) return 'approaching';
  return 'future';
}
