import type { CalendarEventInput, CalendarProposal } from '@/types/calendar.types'

/**
 * Propose time slots within a window
 */
export function proposeSlots(p: Omit<CalendarProposal, 'slots'>): CalendarProposal {
  const start = new Date(p.windowStartISO).getTime()
  const end = new Date(p.windowEndISO).getTime()
  const slots: string[] = []

  // Propose slots every hour during business hours (8 AM - 6 PM)
  for (let t = start; t + p.durationMin * 60000 <= end; t += 60 * 60 * 1000) {
    const dt = new Date(t)
    const h = dt.getHours() // Use local time
    if (h >= 8 && h <= 18) {
      slots.push(new Date(t).toISOString())
    }
  }

  return { ...p, slots }
}

/**
 * Create a Google Calendar event (client-side)
 */
export async function calendarCreate(
  bearer: string,
  ev: CalendarEventInput
): Promise<{ id: string; htmlLink?: string }> {
  const body = {
    summary: ev.title,
    start: { dateTime: ev.whenISO },
    end: {
      dateTime: new Date(new Date(ev.whenISO).getTime() + ev.durationMin * 60000).toISOString(),
    },
    attendees: (ev.attendees ?? []).map((e) => ({ email: e })),
    location: ev.location,
    description: ev.description,
  }

  const r = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bearer}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!r.ok) {
    const error = await r.text()
    throw new Error(`Calendar create failed: ${r.status} - ${error}`)
  }

  return (await r.json()) as { id: string; htmlLink?: string }
}
