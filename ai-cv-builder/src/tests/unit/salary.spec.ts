/**
 * Step 27: Unit tests for salary parsing
 */

import { describe, it, expect } from 'vitest'
import { parseSalary } from '@/services/jobs/parsing/salary'

describe('parseSalary', () => {
  it('should parse USD salary range', () => {
    const text = 'Salary: $80,000 - $120,000 per year'
    const result = parseSalary(text, 'en')
    expect(result?.min).toBe(80000)
    expect(result?.max).toBe(120000)
    expect(result?.currency).toBe('USD')
    expect(result?.period).toBe('y')
  })

  it('should parse Euro salary', () => {
    const text = 'Compensation: €60,000 - €90,000 annual'
    const result = parseSalary(text, 'en')
    expect(result?.min).toBe(60000)
    expect(result?.max).toBe(90000)
    expect(result?.currency).toBe('EUR')
    expect(result?.period).toBe('y')
  })

  it('should parse Turkish Lira salary', () => {
    const text = 'Maaş: ₺35.000 - ₺45.000 aylık'
    const result = parseSalary(text, 'tr')
    expect(result?.min).toBe(35000)
    expect(result?.max).toBe(45000)
    expect(result?.currency).toBe('TRY')
    expect(result?.period).toBe('m')
  })

  it('should parse K notation', () => {
    const text = 'Salary: $60k-$80k'
    const result = parseSalary(text, 'en')
    expect(result?.min).toBe(60000)
    expect(result?.max).toBe(80000)
  })

  it('should parse single value without range', () => {
    const text = 'Salary: $100,000 per year'
    const result = parseSalary(text, 'en')
    expect(result?.min).toBe(100000)
    expect(result?.max).toBeUndefined()
  })

  it('should parse hourly rate', () => {
    const text = 'Rate: $50/h'
    const result = parseSalary(text, 'en')
    expect(result?.min).toBe(50)
    expect(result?.period).toBe('h')
  })

  it('should parse monthly salary', () => {
    const text = 'Salary: $5,000 per month'
    const result = parseSalary(text, 'en')
    expect(result?.min).toBe(5000)
    expect(result?.period).toBe('m')
  })

  it('should return undefined for no salary info', () => {
    const text = 'No salary information available'
    const result = parseSalary(text, 'en')
    expect(result).toBeUndefined()
  })
})
