/**
 * @fileoverview Comparison table unit tests for Step 44
 */

import { describe, it, expect } from 'vitest';
import { compareOffer } from '@/services/offers/comparison.service';
import type { Offer, ComparisonRow } from '@/types/offer.types.step44';

describe('Comparison Table', () => {
  it('should sort rows by NPV', () => {
    const offers: Offer[] = [
      {
        id: '1',
        company: 'A',
        role: 'Eng',
        currency: 'USD',
        baseAnnual: 100000,
        source: 'manual',
        extractedAt: new Date().toISOString()
      },
      {
        id: '2',
        company: 'B',
        role: 'Eng',
        currency: 'USD',
        baseAnnual: 150000,
        source: 'manual',
        extractedAt: new Date().toISOString()
      }
    ];

    const horizon = {
      years: 4 as const,
      discountRatePct: 3,
      growthRatePct: 0,
      taxRatePct: 25
    };

    const rows = offers.map(o => compareOffer(o, horizon, 'USD'));
    const sorted = [...rows].sort((a, b) => b.npv - a.npv);

    expect(sorted[0].company).toBe('B');
    expect(sorted[1].company).toBe('A');
  });

  it('should include risk notes for equity offers', () => {
    const offer: Offer = {
      id: '1',
      company: 'TestCo',
      role: 'Eng',
      currency: 'USD',
      baseAnnual: 100000,
      equity: {
        kind: 'rsu',
        grantShares: 1000,
        vestYears: 4,
        cliffMonths: 12,
        schedule: 'monthly'
      },
      source: 'manual',
      extractedAt: new Date().toISOString()
    };

    const row = compareOffer(offer, {
      years: 4,
      discountRatePct: 3,
      growthRatePct: 10,
      taxRatePct: 25
    }, 'USD');

    expect(row.riskNote).toBeDefined();
  });
});
