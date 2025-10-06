import { describe, it, expect } from 'vitest'
import { valueBenefits } from '@/services/offer/benefitValuation.service'
import type { Offer } from '@/types/offer.types'

describe('benefitValuation.service', () => {
  it('should value all benefit components', () => {
    const offer: Offer = {
      id: 'offer1',
      company: 'Acme',
      role: 'Engineer',
      currency: 'USD',
      baseAnnual: 120000,
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

    const result = valueBenefits(offer, { horizonYears: 1 })

    expect(result.signingSpread).toBe(10000)
    expect(result.annualValue).toBeGreaterThan(0)

    // Health: 500 * 12 = 6000
    // Retirement: 120k * 4% * 60% = 2880
    // Stipend: 2000
    // PTO: ~some value
    expect(result.annualValue).toBeGreaterThan(10000)
  })

  it('should handle missing benefits', () => {
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

    const result = valueBenefits(offer, { horizonYears: 1 })

    expect(result.signingSpread).toBe(0)
    expect(result.annualValue).toBe(0)
  })
})
