/**
 * @fileoverview Timezone and quiet hours utilities for Step 43
 * @module services/integrations/timezone
 */

/**
 * Check if a datetime falls within quiet hours (22:00–07:00 local by default)
 * @param iso - ISO datetime string
 * @param tz - IANA timezone identifier
 * @param start - Quiet hours start (24h format)
 * @param end - Quiet hours end (24h format)
 * @returns true if within quiet hours
 */
export function withinQuietHours(
  iso: string,
  tz: string,
  start = 22,
  end = 7
): boolean {
  const dt = new Date(iso);
  const hh = Number(
    dt.toLocaleTimeString('en-US', {
      hour: '2-digit',
      hour12: false,
      timeZone: tz
    })
  );
  return hh >= start || hh < end;
}

/**
 * Format a datetime in a specific timezone
 * @param iso - ISO datetime string
 * @param tz - IANA timezone identifier
 * @returns Formatted datetime string
 */
export function formatInTimezone(iso: string, tz: string): string {
  const dt = new Date(iso);
  return dt.toLocaleString('en-US', {
    timeZone: tz,
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}
