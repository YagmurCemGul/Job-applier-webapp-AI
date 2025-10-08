/**
 * @fileoverview Meeting miner service for safe, consented context ingestion.
 * @module services/onboarding/meetingMiner
 */

/**
 * Safe, consented context ingestion stubs. In production, expand with Calendar/Gmail list APIs.
 * We expose pluggable functions that the UI calls explicitly after showing ConsentMiningBanner.
 */

export interface CalendarEventLite {
  id: string;
  title: string;
  startISO: string;
  attendees?: string[];
}

/**
 * List upcoming calendar events (stub - wire to Step 35 Calendar when available).
 * @param _days - Number of days to look ahead
 * @returns Calendar events
 */
export async function listUpcomingEvents(
  _days = 7
): Promise<CalendarEventLite[]> {
  // Stub returns empty; wire to Step 35 Calendar list when available.
  return [];
}

/**
 * Summarize events for weekly report (stub).
 * @param _events - Calendar events
 * @returns Summary bullets
 */
export async function summarizeEventsForReport(
  _events: CalendarEventLite[]
): Promise<string[]> {
  return []; // e.g., ["Kicked off X", "Met stakeholders Y/Z", ...]
}
