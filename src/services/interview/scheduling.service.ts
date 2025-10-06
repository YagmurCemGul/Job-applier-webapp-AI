import type { CalendarProposal } from '@/types/calendar.types'
import { proposeSlots } from '@/services/integrations/calendar.real.service'
import { calendarCreate } from '@/services/integrations/calendar.real.service'
import { getBearer } from '@/services/integrations/google.oauth.service'

/**
 * Merge availabilities across multiple panelists
 * Simple merge: propose hourly slots not overlapping any busy window
 */
export function mergeAvailabilities(
  panels: Array<{ busy: Array<[string, string]> }>,
  base: CalendarProposal
): CalendarProposal {
  const prop = proposeSlots(base)

  const isBusy = (iso: string) =>
    panels.some((p) =>
      p.busy.some(([s, e]) => {
        const slotStart = new Date(iso).getTime()
        const slotEnd = slotStart + base.durationMin * 60000
        const busyStart = new Date(s).getTime()
        const busyEnd = new Date(e).getTime()
        return slotStart < busyEnd && slotEnd > busyStart
      })
    )

  return { ...prop, slots: prop.slots.filter((s) => !isBusy(s)) }
}

/**
 * Create Google Calendar event for the interview (Step 35 bearers)
 */
export async function createInterviewEvent(opts: {
  accountId: string
  title: string
  whenISO: string
  durationMin: number
  attendees: string[]
  location?: string
  description?: string
}): Promise<{ id: string; htmlLink?: string }> {
  const bearer = await getBearer(
    opts.accountId,
    import.meta.env.VITE_OAUTH_PASSPHRASE || 'demo-pass',
    import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
  )

  return await calendarCreate(bearer, {
    title: opts.title,
    whenISO: opts.whenISO,
    durationMin: opts.durationMin,
    attendees: opts.attendees,
    location: opts.location,
    description: opts.description,
  })
}
