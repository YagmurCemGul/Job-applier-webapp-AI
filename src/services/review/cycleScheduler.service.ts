import { calendarCreate } from '@/services/integrations/calendar.real.service'
import { getBearer } from '@/services/integrations/google.oauth.service'

/**
 * Schedule a review cycle deadline in Google Calendar
 */
export async function scheduleCycleDeadline(opts: {
  accountId: string
  clientId: string
  passphrase: string
  label: string
  atISO: string
  attendees?: string[]
}): Promise<{ id: string; htmlLink?: string }> {
  const bearer = await getBearer(opts.accountId, opts.passphrase, opts.clientId)

  return await calendarCreate(bearer, {
    title: opts.label,
    whenISO: opts.atISO,
    durationMin: 30,
    attendees: opts.attendees ?? []
  })
}
