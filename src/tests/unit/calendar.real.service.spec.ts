import { describe, it, expect } from 'vitest'
import { proposeSlots } from '@/services/integrations/calendar.real.service'

describe('calendar.real.service', () => {
  it('should propose slots within window', () => {
    const now = new Date('2025-10-10T09:00:00.000Z')
    const end = new Date('2025-10-10T17:00:00.000Z')

    const proposal = proposeSlots({
      durationMin: 30,
      windowStartISO: now.toISOString(),
      windowEndISO: end.toISOString(),
      timeZone: 'UTC',
    })

    expect(proposal.slots.length).toBeGreaterThan(0)
    expect(proposal.slots.length).toBeLessThanOrEqual(8) // 8 hours
  })

  it('should filter out non-business hours', () => {
    const now = new Date('2025-10-10T00:00:00.000Z') // Midnight
    const end = new Date('2025-10-11T00:00:00.000Z') // 24 hours later

    const proposal = proposeSlots({
      durationMin: 30,
      windowStartISO: now.toISOString(),
      windowEndISO: end.toISOString(),
      timeZone: 'UTC',
    })

    // Should only propose between 8 AM - 6 PM
    for (const slot of proposal.slots) {
      const hour = new Date(slot).getHours()
      expect(hour).toBeGreaterThanOrEqual(8)
      expect(hour).toBeLessThanOrEqual(18)
    }
  })

  it('should respect duration', () => {
    const now = new Date('2025-10-10T09:00:00.000Z')
    const end = new Date('2025-10-10T10:00:00.000Z') // 1 hour window

    const proposal = proposeSlots({
      durationMin: 90, // 90 minutes
      windowStartISO: now.toISOString(),
      windowEndISO: end.toISOString(),
      timeZone: 'UTC',
    })

    // Should not propose any slots (duration exceeds window)
    expect(proposal.slots.length).toBe(0)
  })
})
