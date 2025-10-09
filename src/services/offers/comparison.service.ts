/**
 * @fileoverview Offer comparison service for Step 44
 * @module services/offers/comparison
 */

import type { Offer, ComparisonHorizon, ComparisonRow } from '@/types/offer.types.step44';
import { scheduleVesting } from '@/services/equity/vesting.service';
import { valueEquity } from '@/services/equity/valuation.service';
import { convert } from './currency.stub.service';

/**
 * Build comparison row with totals and NPV under given horizon
 * @param o - Offer to analyze
 * @param hz - Comparison horizon assumptions
 * @param targetCurrency - Currency for results
 * @returns Comparison row with multi-year totals and NPV
 */
export function compareOffer(
  o: Offer,
  hz: ComparisonHorizon,
  targetCurrency: string
): ComparisonRow {
  // Calculate bonus amount
  const bonus = (pct?: number) => (pct ?? 0) / 100 * o.baseAnnual;
  
  // Year 1: base + bonus + sign-on
  const y1 = o.baseAnnual + bonus(o.bonusTargetPct) + (o.signOnYr1 ?? 0);
  
  // Year 2: base + bonus + sign-on (if applicable)
  const y2 = o.baseAnnual + bonus(o.bonusTargetPct) + (o.signOnYr2 ?? 0);
  
  // Calculate equity value over 4 years
  let equityY1to4 = 0;
  if (o.equity) {
    const vest = scheduleVesting({
      kind: o.equity.kind,
      totalShares: o.equity.grantShares ?? 0,
      strikePrice: o.equity.strikePrice,
      years: o.equity.vestYears,
      cliffMonths: o.equity.cliffMonths,
      schedule: o.equity.schedule
    });
    
    // Estimate current price (strike + spread for options, or use a default)
    const currentPrice = o.equity.strikePrice ?? 50;
    
    equityY1to4 = valueEquity(vest, {
      currentPrice,
      growthRatePct: hz.growthRatePct
    }, 4);
  }
  
  // Year 4: rough additive estimate
  const y4 = y2 * 2 + (o.signOnYr1 ?? 0) + (o.signOnYr2 ?? 0) + equityY1to4;

  // Calculate NPV with tax and discount
  const tax = hz.taxRatePct / 100;
  const disc = (amt: number, years: number) =>
    amt * Math.pow(1 - (hz.discountRatePct / 100), years);
  
  const npv = 
    disc(y1 * (1 - tax), 1/12) +
    disc(y2 * (1 - tax), 1.5) +
    disc((y4 - y1 - y2) * (1 - tax), 3);

  const row: ComparisonRow = {
    offerId: o.id,
    company: o.company,
    currency: targetCurrency,
    y1Total: convert(y1, o.currency, targetCurrency),
    y2Total: convert(y2, o.currency, targetCurrency),
    y4Total: convert(y4, o.currency, targetCurrency),
    npv: Number(convert(npv, o.currency, targetCurrency).toFixed(2)),
    riskNote: o.equity ? 'Equity modeled with assumptions' : undefined
  };
  
  return row;
}
