/**
 * @fileoverview Total compensation calculation service for Step 37
 * @module services/offer/compMath
 * 
 * Combines salary, bonus, equity, and benefits into total comp estimates.
 * WARNING: These are estimates for comparison only — not financial advice.
 */

import type { Offer, ValuationInputs, TotalCompResult } from '@/types/offer.types';
import { annualizeEquity } from './equityValuation.service';
import { roughTax } from './taxRough.service';
import { convertFx } from './fxRates.service';
import { valueBenefits } from './benefitValuation.service';

/**
 * Calculate total compensation for an offer over a given horizon
 * 
 * @param o - Job offer
 * @param v - Valuation inputs (horizon, tax rate, COL adjustment, FX base)
 * @returns Total comp breakdown with pre/post-tax and normalized amounts
 */
export async function totalComp(o: Offer, v: ValuationInputs): Promise<TotalCompResult> {
  // Base components
  const base = o.baseAnnual;
  const bonus = ((o.bonusTargetPct ?? 0) / 100) * base;
  
  // Equity (annualized over horizon)
  const equity = await annualizeEquity(o, v);
  
  // Benefits valuation
  const benefits = valueBenefits(o, v);
  
  // Gross total (pre-tax)
  const gross = base + bonus + equity + benefits.signingSpread + benefits.annualValue;
  
  // Post-tax (rough estimate)
  const postTax = roughTax(gross, v.taxRatePct ?? 30);
  
  // Cost-of-living adjustment
  const adjusted = postTax * (1 + ((v.cocAdjustPct ?? 0) / 100));
  
  // Currency normalization
  const normalized = await convertFx(o.currency, v.fxBase ?? o.currency, adjusted);

  return {
    currency: v.fxBase ?? o.currency,
    base,
    bonus,
    equity,
    benefits,
    gross,
    postTax,
    adjusted,
    normalized
  };
}

/**
 * Calculate total comp for multiple offers (for comparison)
 */
export async function compareOffers(
  offers: Offer[],
  inputs: ValuationInputs
): Promise<Map<string, TotalCompResult>> {
  const results = new Map<string, TotalCompResult>();
  
  for (const offer of offers) {
    const result = await totalComp(offer, inputs);
    results.set(offer.id, result);
  }
  
  return results;
}
