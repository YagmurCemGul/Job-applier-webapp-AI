/**
 * Calendar integration types
 */

export interface CalendarProposal {
  durationMin: number
  windowStartISO: string // earliest candidate
  windowEndISO: string // latest candidate
  timeZone: string // e.g., "Europe/Istanbul"
  slots: string[] // computed ISO start times
}

export interface CalendarEventInput {
  title: string
  whenISO: string
  durationMin: number
  attendees?: string[]
  location?: string
  description?: string
}

export interface CalendarEvent {
  id: string
  htmlLink?: string
  title: string
  start: string
  end: string
}
