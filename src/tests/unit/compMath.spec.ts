/**
 * @fileoverview Unit tests for compensation math service
 * @module tests/unit/compMath
 */

import { describe, it, expect, vi } from 'vitest';
import { totalComp } from '@/services/offer/compMath.service';
import type { Offer } from '@/types/offer.types';

// Mock dependencies
vi.mock('@/services/offer/equityValuation.service', () => ({
  annualizeEquity: vi.fn(async () => 25000)
}));

vi.mock('@/services/offer/fxRates.service', () => ({
  convertFx: vi.fn(async (_from, _to, amount) => amount)
}));

describe('compMath.service', () => {
  const mockOffer: Offer = {
    id: '1',
    company: 'TestCo',
    role: 'Engineer',
    currency: 'USD',
    baseAnnual: 100000,
    bonusTargetPct: 10,
    benefits: {
      ptoDays: 20,
      healthMonthlyEmployer: 500,
      retirementMatchPct: 4,
      stipendAnnual: 2000,
      signingBonus: 10000
    },
    stage: 'received',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  };

  it('should calculate base compensation correctly', async () => {
    const result = await totalComp(mockOffer, {
      horizonYears: 1,
      taxRatePct: 30,
      cocAdjustPct: 0
    });

    expect(result.base).toBe(100000);
    expect(result.bonus).toBe(10000);
  });

  it('should include equity in total', async () => {
    const result = await totalComp(mockOffer, {
      horizonYears: 1,
      taxRatePct: 30
    });

    expect(result.equity).toBe(25000); // Mocked value
  });

  it('should apply tax rate correctly', async () => {
    const result = await totalComp(mockOffer, {
      horizonYears: 1,
      taxRatePct: 30,
      cocAdjustPct: 0
    });

    // postTax should be ~70% of gross
    expect(result.postTax).toBeLessThan(result.gross);
    expect(result.postTax / result.gross).toBeCloseTo(0.7, 1);
  });

  it('should apply cost-of-living adjustment', async () => {
    const resultNoAdj = await totalComp(mockOffer, {
      horizonYears: 1,
      taxRatePct: 30,
      cocAdjustPct: 0
    });

    const resultWithAdj = await totalComp(mockOffer, {
      horizonYears: 1,
      taxRatePct: 30,
      cocAdjustPct: 10
    });

    expect(resultWithAdj.adjusted).toBeGreaterThan(resultNoAdj.adjusted);
    expect(resultWithAdj.adjusted / resultNoAdj.adjusted).toBeCloseTo(1.1, 2);
  });

  it('should handle zero bonus', async () => {
    const offerNoBonus = { ...mockOffer, bonusTargetPct: 0 };
    const result = await totalComp(offerNoBonus, {
      horizonYears: 1,
      taxRatePct: 30
    });

    expect(result.bonus).toBe(0);
  });

  it('should handle missing benefits', async () => {
    const offerNoBenefits = { ...mockOffer, benefits: undefined };
    const result = await totalComp(offerNoBenefits, {
      horizonYears: 1,
      taxRatePct: 30
    });

    expect(result.benefits.annualValue).toBe(0);
    expect(result.benefits.signingSpread).toBe(0);
  });
});
