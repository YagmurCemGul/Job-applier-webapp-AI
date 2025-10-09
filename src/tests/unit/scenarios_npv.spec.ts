/**
 * @fileoverview Scenario NPV unit tests for Step 44
 */

import { describe, it, expect } from 'vitest';
import { compareOffer } from '@/services/offers/comparison.service';
import type { Offer, ComparisonHorizon } from '@/types/offer.types.step44';

describe('Scenario NPV', () => {
  it('should calculate NPV with discount rate', () => {
    const offer: Offer = {
      id: '1',
      company: 'TestCo',
      role: 'Engineer',
      currency: 'USD',
      baseAnnual: 100000,
      bonusTargetPct: 10,
      source: 'manual',
      extractedAt: new Date().toISOString()
    };

    const horizon: ComparisonHorizon = {
      years: 4,
      discountRatePct: 3,
      growthRatePct: 0,
      taxRatePct: 25
    };

    const row = compareOffer(offer, horizon, 'USD');
    expect(row.npv).toBeGreaterThan(0);
    expect(row.npv).toBeLessThan(row.y1Total + row.y2Total + row.y4Total);
  });

  it('should show NPV decreases with higher discount rate', () => {
    const offer: Offer = {
      id: '1',
      company: 'TestCo',
      role: 'Engineer',
      currency: 'USD',
      baseAnnual: 100000,
      source: 'manual',
      extractedAt: new Date().toISOString()
    };

    const low = compareOffer(offer, {
      years: 4,
      discountRatePct: 1,
      growthRatePct: 0,
      taxRatePct: 0
    }, 'USD');

    const high = compareOffer(offer, {
      years: 4,
      discountRatePct: 10,
      growthRatePct: 0,
      taxRatePct: 0
    }, 'USD');

    expect(low.npv).toBeGreaterThan(high.npv);
  });
});
