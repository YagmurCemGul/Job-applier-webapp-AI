/**
 * Safe, consented context ingestion stubs
 * In production, expand with Calendar/Gmail list APIs
 * We expose pluggable functions that the UI calls explicitly
 * after showing ConsentMiningBanner
 */

export interface CalendarEventLite {
  id: string
  title: string
  startISO: string
  attendees?: string[]
}

/**
 * List upcoming calendar events (stub)
 * Wire to Step 35 Calendar list when available
 */
export async function listUpcomingEvents(_days = 7): Promise<CalendarEventLite[]> {
  // Stub returns empty
  return []
}

/**
 * Summarize events for weekly report (stub)
 */
export async function summarizeEventsForReport(_events: CalendarEventLite[]): Promise<string[]> {
  // e.g., ["Kicked off X", "Met stakeholders Y/Z", ...]
  return []
}
