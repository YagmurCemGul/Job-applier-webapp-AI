/**
 * Step 27: Unit tests for confidence utilities
 */

import { describe, it, expect } from 'vitest'
import { combine } from '@/services/jobs/parsing/confidence'

describe('combine', () => {
  it('should average multiple confidence scores', () => {
    const result = combine(0.8, 0.9, 0.7)
    expect(result).toBeCloseTo(0.8, 1)
  })

  it('should filter out undefined values', () => {
    const result = combine(0.8, undefined, 0.6, undefined)
    expect(result).toBeCloseTo(0.7, 1)
  })

  it('should return 0 for all undefined', () => {
    const result = combine(undefined, undefined)
    expect(result).toBe(0)
  })

  it('should clamp to [0, 1]', () => {
    const result = combine(0.5, 0.3, 0.9)
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(1)
  })

  it('should handle single value', () => {
    const result = combine(0.75)
    expect(result).toBe(0.75)
  })

  it('should handle edge case of 0', () => {
    const result = combine(0, 0, 0)
    expect(result).toBe(0)
  })

  it('should handle edge case of 1', () => {
    const result = combine(1, 1, 1)
    expect(result).toBe(1)
  })
})
