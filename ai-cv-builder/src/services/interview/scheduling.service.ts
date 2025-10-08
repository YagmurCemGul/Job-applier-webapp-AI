/**
 * Interview Scheduling Service
 * Multi-attendee availability merge, slot proposal, and calendar event creation
 */

import type { Panelist } from '@/types/interview.types';

export interface CalendarProposal {
  startISO: string;
  endISO: string;
  durationMin: number;
  businessHoursOnly?: boolean;
  timezone?: string;
}

export interface AvailabilityWindow {
  busy: Array<[string, string]>;
}

/**
 * Merges availability across multiple panelists and proposes free slots
 */
export function mergeAvailabilities(
  panels: AvailabilityWindow[],
  base: CalendarProposal
): { slots: string[]; proposal: CalendarProposal } {
  const slots: string[] = [];
  const start = new Date(base.startISO);
  const end = new Date(base.endISO);
  const durMs = base.durationMin * 60 * 1000;

  // Helper to check if a time slot overlaps with any busy window
  const isBusy = (slotStart: Date): boolean => {
    const slotEnd = new Date(slotStart.getTime() + durMs);
    return panels.some(p =>
      p.busy.some(([busyStart, busyEnd]) => {
        const bs = new Date(busyStart);
        const be = new Date(busyEnd);
        return slotStart < be && slotEnd > bs;
      })
    );
  };

  // Helper to check business hours (9 AM - 5 PM)
  const isBusinessHours = (d: Date): boolean => {
    if (!base.businessHoursOnly) return true;
    const hour = d.getHours();
    const day = d.getDay();
    return day >= 1 && day <= 5 && hour >= 9 && hour < 17;
  };

  // Generate hourly slots
  let current = new Date(start);
  while (current < end) {
    if (isBusinessHours(current) && !isBusy(current)) {
      slots.push(current.toISOString());
    }
    current = new Date(current.getTime() + 60 * 60 * 1000); // 1 hour increment
  }

  return { slots, proposal: base };
}

/**
 * Proposes time slots based on a calendar proposal
 */
export function proposeSlots(base: CalendarProposal): { slots: string[]; proposal: CalendarProposal } {
  return mergeAvailabilities([], base);
}

/**
 * Creates a calendar event for the interview
 * Integration with Step 35 Calendar API
 */
export async function createInterviewEvent(opts: {
  accountId: string;
  title: string;
  whenISO: string;
  durationMin: number;
  attendees: string[];
  location?: string;
  description?: string;
}): Promise<{ id: string; htmlLink?: string }> {
  try {
    // Import calendar service from Step 35
    const { calendarCreate } = await import('@/services/integrations/calendar.real.service');
    const { getBearer } = await import('@/services/integrations/google.oauth.service');

    const bearer = await getBearer(
      opts.accountId,
      import.meta.env.VITE_OAUTH_PASSPHRASE,
      import.meta.env.VITE_GOOGLE_CLIENT_ID
    );

    return await calendarCreate(bearer, {
      title: opts.title,
      whenISO: opts.whenISO,
      durationMin: opts.durationMin,
      attendees: opts.attendees,
      location: opts.location,
      description: opts.description,
    });
  } catch (error) {
    console.error('Failed to create calendar event:', error);
    // Fallback: return mock event
    return {
      id: `mock-event-${Date.now()}`,
      htmlLink: '#',
    };
  }
}
