/**
 * ICS (iCalendar) file generation
 */

/**
 * Generate basic ICS string for a single event
 */
export function buildICS(opts: {
  uid: string
  title: string
  startISO: string
  durationMin: number
  description?: string
  location?: string
}): string {
  const dt = (iso: string) => iso.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')

  const end = new Date(new Date(opts.startISO).getTime() + opts.durationMin * 60000).toISOString()

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JobPilot//Outreach//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${opts.uid}`,
    `DTSTAMP:${dt(new Date().toISOString())}`,
    `DTSTART:${dt(opts.startISO)}`,
    `DTEND:${dt(end)}`,
    `SUMMARY:${escapeICS(opts.title)}`,
    opts.location ? `LOCATION:${escapeICS(opts.location)}` : '',
    opts.description ? `DESCRIPTION:${escapeICS(opts.description)}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n')
}

/**
 * Escape special characters in ICS values
 */
function escapeICS(s: string): string {
  return s.replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n')
}
