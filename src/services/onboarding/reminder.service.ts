import { calendarCreate } from '@/services/integrations/calendar.real.service'
import { getBearer } from '@/services/integrations/google.oauth.service'

/**
 * Schedule a reminder in Google Calendar
 */
export async function scheduleReminder(
  accountId: string,
  label: string,
  whenISO: string
): Promise<{ id: string; htmlLink?: string }> {
  const bearer = await getBearer(
    accountId,
    import.meta.env.VITE_OAUTH_PASSPHRASE || 'demo-pass',
    import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
  )

  return await calendarCreate(bearer, {
    title: label,
    whenISO,
    durationMin: 15
  })
}
