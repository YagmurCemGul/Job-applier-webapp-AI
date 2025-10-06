import { describe, it, expect } from 'vitest'
import { buildICS } from '@/services/integrations/ics.service'

describe('ics.service', () => {
  it('should build valid ICS file', () => {
    const ics = buildICS({
      uid: 'test-123',
      title: 'Interview with Acme',
      startISO: '2025-10-10T14:00:00.000Z',
      durationMin: 30,
    })

    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('END:VCALENDAR')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('END:VEVENT')
    expect(ics).toContain('UID:test-123')
    expect(ics).toContain('SUMMARY:Interview with Acme')
  })

  it('should include location when provided', () => {
    const ics = buildICS({
      uid: 'test-123',
      title: 'Meeting',
      startISO: '2025-10-10T14:00:00.000Z',
      durationMin: 60,
      location: 'Office Room 123',
    })

    expect(ics).toContain('LOCATION:Office Room 123')
  })

  it('should include description when provided', () => {
    const ics = buildICS({
      uid: 'test-123',
      title: 'Meeting',
      startISO: '2025-10-10T14:00:00.000Z',
      durationMin: 60,
      description: 'Discuss project timeline',
    })

    expect(ics).toContain('DESCRIPTION:Discuss project timeline')
  })

  it('should escape special characters', () => {
    const ics = buildICS({
      uid: 'test-123',
      title: 'Meeting, with; comma',
      startISO: '2025-10-10T14:00:00.000Z',
      durationMin: 30,
    })

    expect(ics).toContain('SUMMARY:Meeting\\, with\\; comma')
  })
})
