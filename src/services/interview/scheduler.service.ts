/**
 * @fileoverview Interview scheduling service for Step 43
 * @module services/interview/scheduler
 */

import type { InterviewPlan } from '@/types/interview.types';
import { getBearer } from '@/services/integrations/google.oauth.service';
import { calendarCreate } from '@/services/integrations/calendar.real.service';
import { withinQuietHours } from '@/services/integrations/timezone.service';

/**
 * Create a calendar event for an interview, respecting quiet hours
 * @param p - Interview plan
 * @param accountId - Google account ID
 * @param clientId - OAuth client ID
 * @param passphrase - Encryption passphrase
 * @returns Calendar event details
 * @throws Error if within quiet hours or calendar creation fails
 */
export async function scheduleInterview(
  p: InterviewPlan,
  accountId: string,
  clientId: string,
  passphrase: string
): Promise<{ id: string; htmlLink: string }> {
  // Check quiet hours if respect is enabled
  if (p.quietRespect && withinQuietHours(p.startISO, p.tz)) {
    throw new Error('Cannot schedule within quiet hours (22:00–07:00 local)');
  }

  // Get OAuth bearer token
  const bearer = await getBearer(accountId, passphrase, clientId);

  // Calculate duration in minutes
  const durationMin = Math.max(
    15,
    (Date.parse(p.endISO) - Date.parse(p.startISO)) / 60000
  );

  // Create calendar event
  const title = `${p.company ?? 'Interview'} — ${p.role ?? ''} (${p.kind})`;
  const res = await calendarCreate(bearer, {
    title,
    whenISO: p.startISO,
    durationMin,
    location: p.location
  });

  return res;
}

/**
 * Check for scheduling conflicts with existing plans
 * @param newPlan - New interview plan to check
 * @param existingPlans - Existing interview plans
 * @returns true if there's an overlap
 */
export function hasSchedulingConflict(
  newPlan: InterviewPlan,
  existingPlans: InterviewPlan[]
): boolean {
  const newStart = Date.parse(newPlan.startISO);
  const newEnd = Date.parse(newPlan.endISO);

  return existingPlans.some(plan => {
    const existingStart = Date.parse(plan.startISO);
    const existingEnd = Date.parse(plan.endISO);

    // Check for any overlap
    return (
      (newStart >= existingStart && newStart < existingEnd) ||
      (newEnd > existingStart && newEnd <= existingEnd) ||
      (newStart <= existingStart && newEnd >= existingEnd)
    );
  });
}
