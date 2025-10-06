import { describe, it, expect } from 'vitest'
import { combine } from '@/services/jobs/parsing/confidence'

describe('confidence', () => {
  it('should combine scores and return average', () => {
    const result = combine(0.8, 0.6, 1.0)

    expect(result).toBeCloseTo(0.8, 2)
  })

  it('should filter undefined values', () => {
    const result = combine(0.8, undefined, 0.6, undefined)

    expect(result).toBeCloseTo(0.7, 2)
  })

  it('should return 0 for no values', () => {
    const result = combine(undefined, undefined)

    expect(result).toBe(0)
  })

  it('should clamp between 0 and 1', () => {
    const result = combine(1.5, 2.0) // Should average to 1.75, then clamp

    expect(result).toBe(1)
  })

  it('should handle single value', () => {
    const result = combine(0.75)

    expect(result).toBe(0.75)
  })
})
