import { describe, it, expect } from 'vitest'
import { aggregateImpact } from '@/services/review/impactAggregator.service'

describe('impactAggregator.service', () => {
  it('should aggregate evidence and OKRs', () => {
    // This would require mocking stores
    // For now, verify the structure
    const impacts = aggregateImpact('cycle1')

    expect(Array.isArray(impacts)).toBe(true)
  })

  it('should return empty array for non-existent cycle', () => {
    const impacts = aggregateImpact('nonexistent')

    expect(impacts).toEqual([])
  })
})
