import type { OneOnOneSeries, OneOnOneEntry } from '@/types/oneonone.types'
import { calendarCreate } from '@/services/integrations/calendar.real.service'
import { getBearer } from '@/services/integrations/google.oauth.service'

/**
 * Create a recurring event series in Calendar
 * Simplified: create first instance
 */
export async function scheduleOneOnOne(
  s: OneOnOneSeries,
  accountId: string
): Promise<{ eventId: string; whenISO: string }> {
  const next = computeNextOccurISO(s.weekday, s.timeHHMM)

  const bearer = await getBearer(
    accountId,
    import.meta.env.VITE_OAUTH_PASSPHRASE || 'demo-pass',
    import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
  )

  const ev = await calendarCreate(bearer, {
    title: `1:1 with ${s.counterpartName}`,
    whenISO: next,
    durationMin: s.durationMin,
    attendees: [s.counterpartEmail],
  })

  return {
    eventId: (ev as any).id || String(Date.now()),
    whenISO: next,
  }
}

/**
 * Compute next occurrence ISO date
 */
export function computeNextOccurISO(weekday: number, timeHHMM: string): string {
  const [h, m] = timeHHMM.split(':').map(Number)
  const now = new Date()
  const d = new Date(now)

  const delta = (weekday - now.getDay() + 7) % 7 || 7
  d.setDate(now.getDate() + delta)
  d.setHours(h, m ?? 0, 0, 0)

  return d.toISOString()
}

/**
 * Convert entry notes into action items with AI
 */
export function entryToActionPrompt(entry: OneOnOneEntry): string {
  return `Extract actionable items from 1:1 notes. Return JSON [{text, owner?, dueISO?}]. Notes:\n${entry.notes || ''}`
}
