/**
 * Google Calendar integration types
 */

/**
 * Calendar time proposal with slots
 */
export interface CalendarProposal {
  durationMin: number;
  windowStartISO: string;         // earliest candidate
  windowEndISO: string;           // latest candidate
  timeZone: string;               // e.g., "Europe/Istanbul"
  slots: string[];                // computed ISO start times
}

/**
 * Calendar event input for creation
 */
export interface CalendarEventInput {
  title: string;
  whenISO: string;
  durationMin: number;
  attendees?: string[];
  location?: string;
  description?: string;
}
