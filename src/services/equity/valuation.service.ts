/**
 * @fileoverview Equity valuation service for Step 44
 * @module services/equity/valuation
 */

import type { VestingEvent, EquityValuation } from '@/types/equity.types';

/**
 * Value vesting events at modeled growth rate
 * @param events - Vesting schedule
 * @param model - Pricing model parameters
 * @param years - Time horizon
 * @returns Total value over period
 */
export function valueEquity(
  events: VestingEvent[],
  model: { currentPrice: number; growthRatePct: number },
  years: number
): number {
  const months = years * 12;
  let total = 0;

  for (const e of events) {
    if (e.monthIndex > months) break;
    const yrs = e.monthIndex / 12;
    const price = model.currentPrice * Math.pow(1 + model.growthRatePct / 100, yrs);
    total += e.shares * price;
  }

  return Number(total.toFixed(2));
}

/**
 * Generate detailed valuation with risk bands
 * @param events - Vesting schedule
 * @param model - Pricing model with volatility
 * @returns Detailed valuation with bands
 */
export function valuationDetail(
  events: VestingEvent[],
  model: {
    currentPrice: number;
    growthRatePct: number;
    volatilityPct?: number;
  }
): EquityValuation {
  const detailed = events.map(e => {
    const yrs = e.monthIndex / 12;
    const price = model.currentPrice * Math.pow(1 + model.growthRatePct / 100, yrs);
    return { ...e, amount: Number((e.shares * price).toFixed(2)) };
  });

  const total = detailed.reduce((a, b) => a + b.amount, 0);
  const vol = model.volatilityPct ?? 0;
  const low = total * (1 - vol / 100);
  const high = total * (1 + vol / 100);

  return {
    events: detailed,
    totalGross: Number(total.toFixed(2)),
    lowBand: Number(low.toFixed(2)),
    highBand: Number(high.toFixed(2))
  };
}
