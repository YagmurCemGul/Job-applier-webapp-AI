/**
 * Google Calendar real service for event creation and time proposals
 */
import type { CalendarEventInput, CalendarProposal } from '@/types/calendar.types';

/**
 * Propose meeting time slots within a window
 * Returns slots at hourly intervals during business hours (8am-6pm UTC)
 */
export function proposeSlots(
  p: Omit<CalendarProposal, 'slots'>
): CalendarProposal {
  const start = new Date(p.windowStartISO).getTime();
  const end = new Date(p.windowEndISO).getTime();
  const slots: string[] = [];

  // Iterate hourly through the window
  for (let t = start; t + p.durationMin * 60000 <= end; t += 60 * 60 * 1000) {
    const dt = new Date(t);
    const h = dt.getUTCHours();
    
    // Business hours only (8am-6pm UTC)
    if (h >= 8 && h <= 18) {
      slots.push(new Date(t).toISOString());
    }
  }

  return { ...p, slots };
}

/**
 * Create Google Calendar event via API
 */
export async function calendarCreate(
  bearer: string,
  ev: CalendarEventInput
): Promise<{ id: string; htmlLink?: string }> {
  const endISO = new Date(
    new Date(ev.whenISO).getTime() + ev.durationMin * 60000
  ).toISOString();

  const body = {
    summary: ev.title,
    start: { dateTime: ev.whenISO },
    end: { dateTime: endISO },
    attendees: (ev.attendees ?? []).map(email => ({ email })),
    location: ev.location,
    description: ev.description
  };

  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${bearer}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Calendar create failed: ${res.status} - ${error}`);
  }

  return await res.json() as { id: string; htmlLink?: string };
}
