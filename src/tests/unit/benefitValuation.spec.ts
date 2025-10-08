/**
 * @fileoverview Unit tests for benefits valuation service
 * @module tests/unit/benefitValuation
 */

import { describe, it, expect } from 'vitest';
import { valueBenefits } from '@/services/offer/benefitValuation.service';
import type { Offer } from '@/types/offer.types';

describe('benefitValuation.service', () => {
  const baseOffer: Offer = {
    id: '1',
    company: 'TestCo',
    role: 'Engineer',
    currency: 'USD',
    baseAnnual: 100000,
    stage: 'received',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  };

  it('should value PTO days', () => {
    const offer = {
      ...baseOffer,
      benefits: { ptoDays: 20 }
    };

    const result = valueBenefits(offer, { horizonYears: 1 });

    // 20 days * (100000/260) * 0.3 = ~2307
    expect(result.annualValue).toBeGreaterThan(2000);
    expect(result.annualValue).toBeLessThan(3000);
  });

  it('should value health insurance', () => {
    const offer = {
      ...baseOffer,
      benefits: { healthMonthlyEmployer: 500 }
    };

    const result = valueBenefits(offer, { horizonYears: 1 });

    // 500 * 12 = 6000
    expect(result.annualValue).toBe(6000);
  });

  it('should value retirement match', () => {
    const offer = {
      ...baseOffer,
      benefits: { retirementMatchPct: 4 }
    };

    const result = valueBenefits(offer, { horizonYears: 1 });

    // 100000 * 0.04 * 0.6 = 2400
    expect(result.annualValue).toBe(2400);
  });

  it('should value annual stipend', () => {
    const offer = {
      ...baseOffer,
      benefits: { stipendAnnual: 5000 }
    };

    const result = valueBenefits(offer, { horizonYears: 1 });

    expect(result.annualValue).toBe(5000);
  });

  it('should spread signing bonus', () => {
    const offer = {
      ...baseOffer,
      benefits: { signingBonus: 20000 }
    };

    const result = valueBenefits(offer, { horizonYears: 1 });

    expect(result.signingSpread).toBe(20000);
  });

  it('should sum all benefits', () => {
    const offer = {
      ...baseOffer,
      benefits: {
        ptoDays: 20,
        healthMonthlyEmployer: 500,
        retirementMatchPct: 4,
        stipendAnnual: 2000,
        signingBonus: 10000
      }
    };

    const result = valueBenefits(offer, { horizonYears: 1 });

    expect(result.annualValue).toBeGreaterThan(10000);
    expect(result.signingSpread).toBe(10000);
  });

  it('should handle missing benefits', () => {
    const offer = { ...baseOffer };

    const result = valueBenefits(offer, { horizonYears: 1 });

    expect(result.annualValue).toBe(0);
    expect(result.signingSpread).toBe(0);
  });
});
