/**
 * @fileoverview Benefits valuation service for Step 37
 * @module services/offer/benefitValuation
 * 
 * Provides rough estimates of benefits value. Actual value varies by individual.
 */

import type { Offer, ValuationInputs, BenefitValuation } from '@/types/offer.types';

/**
 * Calculate annualized value of benefits package
 * 
 * Methodology:
 * - PTO: valued at 30% of daily rate (conservative recovery)
 * - Health: employer contribution * 12
 * - Retirement: match percentage * salary * 60% (partial capture assumption)
 * - Stipends: taken at face value
 * - Signing bonus: spread over first year
 */
export function valueBenefits(o: Offer, _v: ValuationInputs): BenefitValuation {
  const b = o.benefits ?? {};

  // Signing bonus (one-time, but spread for comparison)
  const signingSpread = b.signingBonus ?? 0;

  // PTO value (naive: days * daily rate * 30% recoverable)
  const dailyRate = o.baseAnnual / 260; // assume 260 working days
  const ptoAnnual = (b.ptoDays ?? 0) * dailyRate * 0.3;

  // Health insurance (monthly employer contribution * 12)
  const health = (b.healthMonthlyEmployer ?? 0) * 12;

  // Retirement match (% of salary, assume 60% capture)
  const retire = ((b.retirementMatchPct ?? 0) / 100) * o.baseAnnual * 0.6;

  // Stipends (learning, WFH, etc.)
  const stip = b.stipendAnnual ?? 0;

  const annualValue = ptoAnnual + health + retire + stip;

  return {
    signingSpread,
    annualValue
  };
}
