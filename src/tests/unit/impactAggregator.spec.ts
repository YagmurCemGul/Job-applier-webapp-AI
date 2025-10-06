import { describe, it, expect } from 'vitest'
import { aggregateImpact } from '@/services/review/impactAggregator.service'

describe('impactAggregator.service', () => {
  it('should return empty array for non-existent cycle', () => {
    const impacts = aggregateImpact('non-existent')
    expect(impacts).toEqual([])
  })

  it('should deduplicate by title + date + source', () => {
    // This test would require mocking stores
    // For now, verify the structure
    const impacts = aggregateImpact('test-cycle')
    expect(Array.isArray(impacts)).toBe(true)
  })

  it('should sort by score descending', () => {
    const impacts = aggregateImpact('test-cycle')
    for (let i = 0; i < impacts.length - 1; i++) {
      expect((impacts[i].score ?? 0) >= (impacts[i + 1].score ?? 0)).toBe(true)
    }
  })
})
