/**
 * Step 27: Unit tests for date parsing
 */

import { describe, it, expect } from 'vitest'
import { parseDates } from '@/services/jobs/parsing/dates'

describe('parseDates', () => {
  it('should parse relative posted date (days)', () => {
    const text = 'Posted 3 days ago'
    const result = parseDates(text, 'en')
    expect(result.postedAt?.value).toBeInstanceOf(Date)
    expect(result.postedAt?.confidence).toBeGreaterThan(0)
  })

  it('should parse relative posted date (weeks)', () => {
    const text = 'Posted 2 weeks ago'
    const result = parseDates(text, 'en')
    expect(result.postedAt?.value).toBeInstanceOf(Date)
  })

  it('should parse relative posted date (months)', () => {
    const text = 'Posted 1 month ago'
    const result = parseDates(text, 'en')
    expect(result.postedAt?.value).toBeInstanceOf(Date)
  })

  it('should parse Turkish relative date', () => {
    const text = 'Yayınlanma: 5 gün önce'
    const result = parseDates(text, 'tr')
    expect(result.postedAt?.value).toBeInstanceOf(Date)
  })

  it('should parse absolute deadline date', () => {
    const text = 'Deadline: 31/12/2024'
    const result = parseDates(text, 'en')
    expect(result.deadlineAt?.value).toBeInstanceOf(Date)
    expect(result.deadlineAt?.confidence).toBeGreaterThan(0.5)
  })

  it('should parse Turkish deadline', () => {
    const text = 'Son başvuru: 15.03.2024'
    const result = parseDates(text, 'tr')
    expect(result.deadlineAt?.value).toBeInstanceOf(Date)
  })

  it('should return undefined for no date info', () => {
    const text = 'No date information'
    const result = parseDates(text, 'en')
    expect(result.postedAt).toBeUndefined()
    expect(result.deadlineAt).toBeUndefined()
  })
})
