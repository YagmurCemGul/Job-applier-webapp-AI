/**
 * @fileoverview Scenario modeling service for Step 44
 * @module services/equity/scenarios
 */

import { scheduleVesting } from './vesting.service';
import { valuationDetail } from './valuation.service';

/**
 * Run scenario analysis for equity with low/base/high growth projections
 * @param input - Scenario parameters
 * @returns Base, low, and high scenarios
 */
export function runScenarios(input: {
  shares: number;
  price: number;
  growthBasePct: number;
  growthLowPct?: number;
  growthHighPct?: number;
  years: number;
  cliffMonths: number;
  schedule: 'monthly' | 'quarterly' | 'semiannual' | 'annual';
  volatilityPct?: number;
}) {
  const events = scheduleVesting({
    kind: 'rsu',
    totalShares: input.shares,
    years: input.years,
    cliffMonths: input.cliffMonths,
    schedule: input.schedule
  });

  const base = valuationDetail(events, {
    currentPrice: input.price,
    growthRatePct: input.growthBasePct,
    volatilityPct: input.volatilityPct
  });

  const low = valuationDetail(events, {
    currentPrice: input.price,
    growthRatePct: input.growthLowPct ?? (input.growthBasePct - 10),
    volatilityPct: input.volatilityPct
  });

  const high = valuationDetail(events, {
    currentPrice: input.price,
    growthRatePct: input.growthHighPct ?? (input.growthBasePct + 10),
    volatilityPct: input.volatilityPct
  });

  return { base, low, high };
}
