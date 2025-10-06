import { describe, it, expect } from 'vitest'
import { roughTax } from '@/services/offer/taxRough.service'

describe('taxRough.service', () => {
  it('should calculate post-tax amount correctly', () => {
    expect(roughTax(100000, 30)).toBe(70000)
    expect(roughTax(100000, 25)).toBe(75000)
    expect(roughTax(100000, 0)).toBe(100000)
  })

  it('should handle edge cases', () => {
    expect(roughTax(0, 30)).toBe(0)
    expect(roughTax(100000, 0)).toBe(100000)
    expect(roughTax(100000, 100)).toBe(0)
  })

  it('should handle decimal amounts', () => {
    expect(roughTax(123456.78, 30)).toBeCloseTo(86419.746, 2)
  })
})
