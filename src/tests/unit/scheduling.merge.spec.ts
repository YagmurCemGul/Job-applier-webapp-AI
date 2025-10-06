import { describe, it, expect } from 'vitest'
import { mergeAvailabilities } from '@/services/interview/scheduling.service'

describe('scheduling.merge', () => {
  it('should merge availabilities and exclude busy slots', () => {
    const panels = [
      {
        busy: [
          ['2025-10-10T09:00:00Z', '2025-10-10T10:00:00Z'],
          ['2025-10-10T14:00:00Z', '2025-10-10T15:00:00Z']
        ]
      },
      {
        busy: [['2025-10-10T11:00:00Z', '2025-10-10T12:00:00Z']]
      }
    ]

    const base = {
      durationMin: 60,
      windowStartISO: '2025-10-10T08:00:00Z',
      windowEndISO: '2025-10-10T18:00:00Z',
      timeZone: 'UTC',
      slots: []
    }

    const result = mergeAvailabilities(panels, base)

    // Should exclude 9-10, 11-12, 14-15
    expect(result.slots).toBeDefined()
    expect(result.slots.length).toBeGreaterThan(0)

    // 9:00 should be excluded (busy for panel 0)
    const has9am = result.slots.some((s) => s.includes('T09:00:00'))
    expect(has9am).toBe(false)

    // 11:00 should be excluded (busy for panel 1)
    const has11am = result.slots.some((s) => s.includes('T11:00:00'))
    expect(has11am).toBe(false)
  })

  it('should handle no busy windows', () => {
    const panels = [{ busy: [] }, { busy: [] }]

    const base = {
      durationMin: 30,
      windowStartISO: '2025-10-10T10:00:00Z',
      windowEndISO: '2025-10-10T12:00:00Z',
      timeZone: 'UTC',
      slots: []
    }

    const result = mergeAvailabilities(panels, base)

    expect(result.slots.length).toBeGreaterThan(0)
  })

  it('should handle overlapping busy windows', () => {
    const panels = [
      { busy: [['2025-10-10T09:00:00Z', '2025-10-10T11:00:00Z']] },
      { busy: [['2025-10-10T10:00:00Z', '2025-10-10T12:00:00Z']] }
    ]

    const base = {
      durationMin: 60,
      windowStartISO: '2025-10-10T08:00:00Z',
      windowEndISO: '2025-10-10T16:00:00Z',
      timeZone: 'UTC',
      slots: []
    }

    const result = mergeAvailabilities(panels, base)

    // 9:00, 10:00, 11:00 should all be excluded
    const has9 = result.slots.some((s) => s.includes('T09:00:00'))
    const has10 = result.slots.some((s) => s.includes('T10:00:00'))
    const has11 = result.slots.some((s) => s.includes('T11:00:00'))

    expect(has9).toBe(false)
    expect(has10).toBe(false)
    expect(has11).toBe(false)
  })
})
