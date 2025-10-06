import { describe, it, expect } from 'vitest'
import { parseSalary } from '@/services/jobs/parsing/salary'

describe('salary', () => {
  it('should parse dollar range', () => {
    const result = parseSalary('Salary: $120,000 - $180,000', 'en')

    expect(result?.min).toBe(120000)
    expect(result?.max).toBe(180000)
    expect(result?.currency).toBe('USD')
  })

  it('should parse euro range with period', () => {
    const result = parseSalary('€60,000 - €80,000 per year', 'en')

    expect(result?.min).toBe(60000)
    expect(result?.max).toBe(80000)
    expect(result?.currency).toBe('EUR')
    expect(result?.period).toBe('y')
  })

  it('should parse Turkish lira', () => {
    const result = parseSalary('₺35.000–₺45.000', 'tr')

    expect(result?.min).toBe(35000)
    expect(result?.max).toBe(45000)
    expect(result?.currency).toBe('TRY')
  })

  it('should handle k multiplier', () => {
    const result = parseSalary('$60k-$80k', 'en')

    expect(result?.min).toBe(60000)
    expect(result?.max).toBe(80000)
  })

  it('should parse single value', () => {
    const result = parseSalary('Salary: $100,000', 'en')

    expect(result?.min).toBe(100000)
    expect(result?.max).toBeUndefined()
  })

  it('should return undefined for no match', () => {
    const result = parseSalary('No salary mentioned', 'en')

    expect(result).toBeUndefined()
  })
})
