/**
 * ICS (iCalendar) file generation service
 * Generates RFC 5545 compliant calendar files
 */

/**
 * Format ISO date to iCalendar DATETIME format
 */
function formatICSDateTime(iso: string): string {
  return iso.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Escape special characters for ICS format
 */
function escapeICS(s: string): string {
  return s
    .replace(/([,;])/g, '\\$1')
    .replace(/\n/g, '\\n');
}

/**
 * Build ICS file content for a single event
 */
export function buildICS(opts: {
  uid: string;
  title: string;
  startISO: string;
  durationMin: number;
  description?: string;
  location?: string;
}): string {
  const endISO = new Date(
    new Date(opts.startISO).getTime() + opts.durationMin * 60000
  ).toISOString();

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JobPilot//Outreach//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${opts.uid}`,
    `DTSTAMP:${formatICSDateTime(new Date().toISOString())}`,
    `DTSTART:${formatICSDateTime(opts.startISO)}`,
    `DTEND:${formatICSDateTime(endISO)}`,
    `SUMMARY:${escapeICS(opts.title)}`,
    opts.location ? `LOCATION:${escapeICS(opts.location)}` : '',
    opts.description ? `DESCRIPTION:${escapeICS(opts.description)}` : '',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  return lines.filter(Boolean).join('\r\n');
}
