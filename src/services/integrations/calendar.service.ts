/**
 * Google Calendar stub
 * Creates a local object and returns id
 * Backend wiring can be added later
 */
export async function createEvent(opts: {
  title: string
  when: string
  durationMin?: number
  location?: string
  attendees?: string[]
}): Promise<{ ok: boolean; id: string; link: string }> {
  // Stub: Would integrate with Google Calendar API
  return {
    ok: true,
    id: `cal-${Date.now()}`,
    link: '#',
  }
}
