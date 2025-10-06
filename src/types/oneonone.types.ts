/**
 * One-on-one meeting types
 */

export interface OneOnOneSeries {
  id: string
  planId: string
  counterpartEmail: string
  counterpartName: string
  cadence: 'weekly' | 'biweekly' | 'monthly'
  weekday: 1 | 2 | 3 | 4 | 5 | 6 | 0 // Mon..Sun (0=Sun)
  timeHHMM: string // '10:30'
  durationMin: number
  calendarEventId?: string // Step 35
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface OneOnOneEntry {
  id: string
  seriesId: string
  dateISO: string
  agendaQueue: string[] // planned topics
  notes?: string // free-form notes
  actions?: Array<{
    text: string
    owner?: string
    dueISO?: string
  }>
  sentiment?: 'positive' | 'neutral' | 'negative'
  createdAt: string
  updatedAt: string
}
