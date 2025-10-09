/**
 * Google Calendar API service stub
 * In production, this would use the real Calendar API
 */

export async function calendarCreate(
  bearer: string,
  event: { title: string; whenISO: string; durationMin: number; attendees?: string[] }
): Promise<{ id: string; htmlLink: string }> {
  const start = new Date(event.whenISO);
  const end = new Date(start.getTime() + event.durationMin * 60000);
  
  const body = {
    summary: event.title,
    start: { dateTime: start.toISOString(), timeZone: 'UTC' },
    end: { dateTime: end.toISOString(), timeZone: 'UTC' },
    attendees: (event.attendees || []).map(email => ({ email }))
  };

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: { Authorization: `Bearer ${bearer}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  if (!res.ok) throw new Error(`Calendar API error: ${res.status}`);
  return res.json();
}
