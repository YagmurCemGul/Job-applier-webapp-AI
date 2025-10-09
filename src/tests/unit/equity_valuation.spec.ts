/**
 * @fileoverview Equity valuation unit tests for Step 44
 */

import { describe, it, expect } from 'vitest';
import { scheduleVesting } from '@/services/equity/vesting.service';
import { valueEquity, valuationDetail } from '@/services/equity/valuation.service';

describe('Equity Valuation', () => {
  it('should apply growth compounding', () => {
    const events = scheduleVesting({
      kind: 'rsu',
      totalShares: 1000,
      years: 2,
      cliffMonths: 0,
      schedule: 'annual'
    });

    const value = valueEquity(events, {
      currentPrice: 10,
      growthRatePct: 10
    }, 2);

    // Year 0: 500 * 10 = 5000
    // Year 1: 500 * 11 = 5500
    // Total ~10500
    expect(value).toBeGreaterThan(10000);
    expect(value).toBeLessThan(11000);
  });

  it('should produce volatility bands', () => {
    const events = scheduleVesting({
      kind: 'rsu',
      totalShares: 1000,
      years: 4,
      cliffMonths: 12,
      schedule: 'quarterly'
    });

    const valuation = valuationDetail(events, {
      currentPrice: 50,
      growthRatePct: 10,
      volatilityPct: 20
    });

    expect(valuation.lowBand).toBeLessThan(valuation.totalGross);
    expect(valuation.highBand).toBeGreaterThan(valuation.totalGross);
    expect(valuation.lowBand).toBe(valuation.totalGross * 0.8);
    expect(valuation.highBand).toBe(valuation.totalGross * 1.2);
  });

  it('should produce deterministic totals', () => {
    const events = scheduleVesting({
      kind: 'rsu',
      totalShares: 1000,
      years: 4,
      cliffMonths: 12,
      schedule: 'monthly'
    });

    const val1 = valueEquity(events, { currentPrice: 100, growthRatePct: 5 }, 4);
    const val2 = valueEquity(events, { currentPrice: 100, growthRatePct: 5 }, 4);

    expect(val1).toBe(val2);
  });
});
