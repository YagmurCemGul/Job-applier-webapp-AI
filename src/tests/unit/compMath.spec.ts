import { describe, it, expect } from 'vitest'
import { totalComp } from '@/services/offer/compMath.service'
import type { Offer } from '@/types/offer.types'

describe('compMath.service', () => {
  it('should calculate total compensation with all components', async () => {
    const offer: Offer = {
      id: 'offer1',
      company: 'Acme',
      role: 'Engineer',
      currency: 'USD',
      baseAnnual: 120000,
      bonusTargetPct: 15,
      equity: [
        {
          id: 'eq1',
          type: 'RSU',
          units: 1000,
          assumedSharePrice: 100,
          vestSchedule: '4y_no_cliff'
        }
      ],
      benefits: {
        ptoDays: 20,
        healthMonthlyEmployer: 500,
        retirementMatchPct: 4,
        stipendAnnual: 2000,
        signingBonus: 10000
      },
      stage: 'received',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const result = await totalComp(offer, {
      horizonYears: 1,
      taxRatePct: 30,
      fxBase: 'USD'
    })

    expect(result.base).toBe(120000)
    expect(result.bonus).toBe(18000) // 15% of 120k
    expect(result.equity).toBeGreaterThan(0) // 25% of 100k vested
    expect(result.benefits.signingSpread).toBe(10000)
    expect(result.gross).toBeGreaterThan(140000)
  })

  it('should handle offers without equity', async () => {
    const offer: Offer = {
      id: 'offer1',
      company: 'Acme',
      role: 'Engineer',
      currency: 'USD',
      baseAnnual: 100000,
      stage: 'received',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const result = await totalComp(offer, {
      horizonYears: 1,
      taxRatePct: 30,
      fxBase: 'USD'
    })

    expect(result.base).toBe(100000)
    expect(result.equity).toBe(0)
  })

  it('should apply tax rate correctly', async () => {
    const offer: Offer = {
      id: 'offer1',
      company: 'Acme',
      role: 'Engineer',
      currency: 'USD',
      baseAnnual: 100000,
      stage: 'received',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const result = await totalComp(offer, {
      horizonYears: 1,
      taxRatePct: 25,
      fxBase: 'USD'
    })

    // Post-tax should be roughly 75% of gross
    expect(result.postTax).toBeLessThan(result.gross)
    expect(result.postTax / result.gross).toBeCloseTo(0.75, 1)
  })
})
