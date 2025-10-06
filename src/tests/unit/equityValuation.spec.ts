import { describe, it, expect } from 'vitest'
import { annualizeEquity } from '@/services/offer/equityValuation.service'
import type { Offer } from '@/types/offer.types'

describe('equityValuation.service', () => {
  it('should calculate RSU value with 4y no cliff', async () => {
    const offer: Offer = {
      id: 'offer1',
      company: 'Acme',
      role: 'Engineer',
      currency: 'USD',
      baseAnnual: 120000,
      equity: [
        {
          id: 'eq1',
          type: 'RSU',
          units: 1000,
          assumedSharePrice: 100,
          vestSchedule: '4y_no_cliff'
        }
      ],
      stage: 'received',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // 1 year: 25% vested = 250 units * $100 = $25,000 annualized
    const result1yr = await annualizeEquity(offer, { horizonYears: 1 })
    expect(result1yr).toBe(25000)

    // 2 years: 50% vested = 500 units * $100 = $50,000 / 2 = $25,000 annualized
    const result2yr = await annualizeEquity(offer, { horizonYears: 2 })
    expect(result2yr).toBe(25000)

    // 4 years: 100% vested = 1000 units * $100 = $100,000 / 4 = $25,000 annualized
    const result4yr = await annualizeEquity(offer, { horizonYears: 4 })
    expect(result4yr).toBe(25000)
  })

  it('should calculate Options value with intrinsic value', async () => {
    const offer: Offer = {
      id: 'offer1',
      company: 'Acme',
      role: 'Engineer',
      currency: 'USD',
      baseAnnual: 120000,
      equity: [
        {
          id: 'eq1',
          type: 'Options',
          units: 10000,
          strikePrice: 50,
          assumedSharePrice: 100,
          vestSchedule: '4y_no_cliff'
        }
      ],
      stage: 'received',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // 1 year: 25% vested = 2500 options * ($100 - $50) = $125,000 annualized
    const result = await annualizeEquity(offer, { horizonYears: 1 })
    expect(result).toBe(125000)
  })

  it('should handle targetValue when units unknown', async () => {
    const offer: Offer = {
      id: 'offer1',
      company: 'Acme',
      role: 'Engineer',
      currency: 'USD',
      baseAnnual: 120000,
      equity: [
        {
          id: 'eq1',
          type: 'RSU',
          targetValue: 100000,
          vestSchedule: '4y_no_cliff'
        }
      ],
      stage: 'received',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // 1 year: 25% of $100k = $25k annualized
    const result = await annualizeEquity(offer, { horizonYears: 1 })
    expect(result).toBe(25000)
  })

  it('should handle 1 year cliff', async () => {
    const offer: Offer = {
      id: 'offer1',
      company: 'Acme',
      role: 'Engineer',
      currency: 'USD',
      baseAnnual: 120000,
      equity: [
        {
          id: 'eq1',
          type: 'RSU',
          units: 1000,
          assumedSharePrice: 100,
          vestSchedule: '4y_1y_cliff'
        }
      ],
      stage: 'received',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // 1 year: 0% vested (cliff not reached)
    const result1yr = await annualizeEquity(offer, { horizonYears: 1 })
    expect(result1yr).toBe(0)

    // 2 years: ~33% vested
    const result2yr = await annualizeEquity(offer, { horizonYears: 2 })
    expect(result2yr).toBeGreaterThan(15000)
  })
})
