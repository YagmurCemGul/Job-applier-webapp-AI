/**
 * Google Calendar Integration Service (OAuth-ready stub)
 * 
 * Production mode: Calls backend /api/calendar/events when enabled
 * Dev mode: Creates local object and returns stub ID
 */

export interface CreateEventOptions {
  title: string;
  when: string;
  durationMin?: number;
  location?: string;
  attendees?: string[];
}

export interface CalendarEventResponse {
  ok: boolean;
  id: string;
  link?: string;
  error?: string;
}

/**
 * Create calendar event via Google Calendar API (or simulate in dev)
 */
export async function createEvent(opts: CreateEventOptions): Promise<CalendarEventResponse> {
  // Production path: use backend API
  if (import.meta.env.VITE_CALENDAR_ENABLED === '1') {
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opts)
      });
      
      if (!response.ok) {
        throw new Error('Calendar event creation failed');
      }
      
      return await response.json();
    } catch (error) {
      return {
        ok: false,
        id: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  // Dev stub: simulate success
  console.log('[Calendar Stub] Event created:', opts);
  return {
    ok: true,
    id: 'cal-' + Date.now(),
    link: '#'
  };
}
