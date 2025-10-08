/**
 * @fileoverview Equity valuation service for Step 37 — simplified equity calculations
 * @module services/offer/equityValuation
 * 
 * WARNING: This is an estimate for comparison only — not investment advice.
 * Actual equity value depends on many factors not modeled here.
 */

import type { Offer, ValuationInputs, EquityGrant } from '@/types/offer.types';

/**
 * Stub stock price lookup (clearly marked for replacement)
 */
async function stubPrice(_ticker: string): Promise<number> {
  // In production, replace with actual API (e.g., Yahoo Finance, Alpha Vantage)
  return 50;
}

/**
 * Calculate vesting percentage for custom schedule
 */
function customPct(steps: Array<{ atMonths: number; pct: number }>, years: number): number {
  const months = years * 12;
  return steps.filter(s => s.atMonths <= months).reduce((a, s) => a + s.pct, 0) / 100;
}

/**
 * Calculate vesting percentage based on schedule and horizon
 */
function calculateVestPct(grant: EquityGrant, years: number): number {
  const schedule = grant.vestSchedule ?? '4y_1y_cliff';
  
  switch (schedule) {
    case '4y_1y_cliff':
      // 25% at year 1, then 2.08% monthly (25/12) for 36 months
      return Math.min(1, Math.max(0, (years - 0.25) / 3.75));
    case '4y_no_cliff':
      // Linear vesting over 4 years
      return Math.min(1, years / 4);
    case 'custom':
      return customPct(grant.vestCustom ?? [], years);
    default:
      return Math.min(1, years / 4);
  }
}

/**
 * Calculate annualized equity value over horizon
 * 
 * Simplified models:
 * - RSU/PSU: units * assumedSharePrice * (vested% in horizon) / years
 * - Options: max(assumedSharePrice - strike, 0) * vestedUnits / years
 * - If only targetValue given, spread over vesting horizon (4y default)
 */
export async function annualizeEquity(o: Offer, v: ValuationInputs): Promise<number> {
  const years = v.horizonYears;
  let total = 0;

  for (const g of (o.equity ?? [])) {
    const sp = g.assumedSharePrice ?? (g.ticker ? await stubPrice(g.ticker) : 0);
    const vestPct = calculateVestPct(g, years);

    if (g.units) {
      if (g.type === 'Options') {
        const intrinsicValue = Math.max(sp - (g.strikePrice ?? 0), 0);
        total += intrinsicValue * (g.units * vestPct);
      } else {
        // RSU, PSU, ESPP
        total += sp * (g.units * vestPct);
      }
    } else if (g.targetValue) {
      total += g.targetValue * vestPct;
    }
  }

  return total / v.horizonYears;
}
