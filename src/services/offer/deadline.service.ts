import { calendarCreate } from '@/services/integrations/calendar.real.service'
import { getBearer } from '@/services/integrations/google.oauth.service'

/**
 * Create deadline reminder event in Google Calendar
 * Integrates with Step 35 Calendar service
 */
export async function createDeadlineEvent(opts: {
  accountId: string
  label: string
  atISO: string
  attendees?: string[]
}): Promise<{ id: string; htmlLink?: string }> {
  const bearer = await getBearer(
    opts.accountId,
    import.meta.env.VITE_OAUTH_PASSPHRASE || 'demo-pass',
    import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
  )

  return await calendarCreate(bearer, {
    title: opts.label,
    whenISO: opts.atISO,
    durationMin: 15,
    attendees: opts.attendees ?? []
  })
}
