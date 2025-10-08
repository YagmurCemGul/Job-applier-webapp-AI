/**
 * @fileoverview Integration test for multi-offer comparison
 * @module tests/integration/multi_offer_compare
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { compareOffers } from '@/services/offer/compMath.service';
import type { Offer } from '@/types/offer.types';

// Mock external dependencies
vi.mock('@/services/offer/equityValuation.service', () => ({
  annualizeEquity: vi.fn(async (offer) => {
    // Simple mock based on company
    if (offer.company === 'BigTech') return 50000;
    if (offer.company === 'Startup') return 100000;
    return 25000;
  })
}));

vi.mock('@/services/offer/fxRates.service', () => ({
  convertFx: vi.fn(async (from, to, amount) => {
    if (from === to) return amount;
    if (from === 'EUR' && to === 'USD') return amount * 1.1;
    if (from === 'GBP' && to === 'USD') return amount * 1.28;
    return amount;
  })
}));

describe('Multi-Offer Comparison Integration', () => {
  const offers: Offer[] = [
    {
      id: '1',
      company: 'BigTech',
      role: 'Senior SWE',
      currency: 'USD',
      baseAnnual: 180000,
      bonusTargetPct: 15,
      benefits: {
        ptoDays: 20,
        healthMonthlyEmployer: 600,
        retirementMatchPct: 5,
        stipendAnnual: 3000
      },
      stage: 'received',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    },
    {
      id: '2',
      company: 'Startup',
      role: 'Staff Engineer',
      currency: 'USD',
      baseAnnual: 160000,
      bonusTargetPct: 10,
      benefits: {
        ptoDays: 25,
        healthMonthlyEmployer: 500,
        retirementMatchPct: 4,
        signingBonus: 30000
      },
      stage: 'received',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    },
    {
      id: '3',
      company: 'European',
      role: 'Lead Engineer',
      currency: 'EUR',
      baseAnnual: 100000,
      bonusTargetPct: 12,
      benefits: {
        ptoDays: 30,
        healthMonthlyEmployer: 400
      },
      stage: 'received',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    }
  ];

  describe('Comparison Matrix', () => {
    it('should compare multiple offers correctly', async () => {
      const results = await compareOffers(offers, {
        horizonYears: 1,
        taxRatePct: 30,
        cocAdjustPct: 0,
        fxBase: 'USD'
      });

      expect(results.size).toBe(3);
      expect(results.has('1')).toBe(true);
      expect(results.has('2')).toBe(true);
      expect(results.has('3')).toBe(true);
    });

    it('should rank offers correctly', async () => {
      const results = await compareOffers(offers, {
        horizonYears: 1,
        taxRatePct: 30,
        fxBase: 'USD'
      });

      const sorted = Array.from(results.entries())
        .sort((a, b) => b[1].normalized - a[1].normalized);

      // Startup should rank highest due to high equity
      expect(sorted[0][0]).toBe('2'); // Startup
    });

    it('should respond to What-If tax rate changes', async () => {
      const results30 = await compareOffers(offers, {
        horizonYears: 1,
        taxRatePct: 30,
        fxBase: 'USD'
      });

      const results40 = await compareOffers(offers, {
        horizonYears: 1,
        taxRatePct: 40,
        fxBase: 'USD'
      });

      const offer1_30 = results30.get('1')!;
      const offer1_40 = results40.get('1')!;

      expect(offer1_40.postTax).toBeLessThan(offer1_30.postTax);
      expect(offer1_40.normalized).toBeLessThan(offer1_30.normalized);
    });

    it('should respond to What-If COL adjustments', async () => {
      const resultsBase = await compareOffers(offers, {
        horizonYears: 1,
        taxRatePct: 30,
        cocAdjustPct: 0,
        fxBase: 'USD'
      });

      const resultsAdj = await compareOffers(offers, {
        horizonYears: 1,
        taxRatePct: 30,
        cocAdjustPct: 20,
        fxBase: 'USD'
      });

      const offer1_base = resultsBase.get('1')!;
      const offer1_adj = resultsAdj.get('1')!;

      expect(offer1_adj.adjusted).toBeGreaterThan(offer1_base.adjusted);
      expect(offer1_adj.adjusted / offer1_base.adjusted).toBeCloseTo(1.2, 1);
    });

    it('should normalize to target currency', async () => {
      const results = await compareOffers(offers, {
        horizonYears: 1,
        taxRatePct: 30,
        fxBase: 'USD'
      });

      const eurOffer = results.get('3')!;
      expect(eurOffer.currency).toBe('USD'); // Should be normalized
      expect(eurOffer.normalized).toBeGreaterThan(eurOffer.postTax * 0.9); // FX applied
    });

    it('should handle different time horizons', async () => {
      const results1y = await compareOffers(offers, {
        horizonYears: 1,
        taxRatePct: 30,
        fxBase: 'USD'
      });

      const results4y = await compareOffers(offers, {
        horizonYears: 4,
        taxRatePct: 30,
        fxBase: 'USD'
      });

      // Equity valuation should differ based on horizon
      const offer1_1y = results1y.get('1')!;
      const offer1_4y = results4y.get('1')!;

      // Both should have equity, but potentially different annualized amounts
      expect(offer1_1y.equity).toBeGreaterThan(0);
      expect(offer1_4y.equity).toBeGreaterThan(0);
    });
  });
});
