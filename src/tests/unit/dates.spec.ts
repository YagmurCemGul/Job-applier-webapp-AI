import { describe, it, expect } from 'vitest'
import { parseDates } from '@/services/jobs/parsing/dates'

describe('dates', () => {
  describe('relative dates (posted)', () => {
    it('should parse days ago', () => {
      const result = parseDates('Posted 5 days ago', 'en')

      expect(result.postedAt?.value).toBeInstanceOf(Date)
      expect(result.postedAt?.confidence).toBe(0.6)

      const daysAgo = Math.round(
        (Date.now() - result.postedAt!.value!.getTime()) / (1000 * 60 * 60 * 24)
      )
      expect(daysAgo).toBeCloseTo(5, 0)
    })

    it('should parse weeks ago', () => {
      const result = parseDates('Posted 2 weeks ago', 'en')

      const daysAgo = Math.round(
        (Date.now() - result.postedAt!.value!.getTime()) / (1000 * 60 * 60 * 24)
      )
      expect(daysAgo).toBeCloseTo(14, 1)
    })

    it('should parse Turkish relative dates', () => {
      const result = parseDates('3 gün önce yayınlandı', 'tr')

      expect(result.postedAt?.value).toBeInstanceOf(Date)
    })
  })

  describe('absolute dates (deadline)', () => {
    it('should parse deadline date', () => {
      const result = parseDates('Deadline: 12.31.2025', 'en')

      expect(result.deadlineAt?.value).toBeInstanceOf(Date)
      expect(result.deadlineAt?.confidence).toBe(0.8)
    })

    it('should return undefined for no match', () => {
      const result = parseDates('No dates mentioned', 'en')

      expect(result.postedAt).toBeUndefined()
      expect(result.deadlineAt).toBeUndefined()
    })
  })
})
