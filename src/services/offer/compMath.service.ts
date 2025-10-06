import type { Offer, ValuationInputs, CompResult } from '@/types/offer.types'
import { annualizeEquity } from './equityValuation.service'
import { roughTax } from './taxRough.service'
import { convertFx } from './fxRates.service'
import { valueBenefits } from './benefitValuation.service'

/**
 * Compute total comp (cash + bonus + equity + benefits) for a given horizon
 * Returns pre- and post-tax approximations
 *
 * ⚠️ DISCLAIMER: Estimates only — not financial or tax advice
 */
export async function totalComp(
  o: Offer,
  v: ValuationInputs
): Promise<CompResult> {
  const base = o.baseAnnual
  const bonus = ((o.bonusTargetPct ?? 0) / 100) * base
  const equity = await annualizeEquity(o, v)
  const benefits = valueBenefits(o, v)

  const gross =
    base + bonus + equity + benefits.signingSpread + benefits.annualValue

  const postTax = roughTax(gross, v.taxRatePct ?? 30)

  // Cost-of-living adjustment
  const adjusted = postTax * (1 + (v.cocAdjustPct ?? 0) / 100)

  // FX normalization
  const fx = await convertFx(o.currency, v.fxBase ?? o.currency, adjusted)

  return {
    currency: v.fxBase ?? o.currency,
    base,
    bonus,
    equity,
    benefits,
    gross,
    postTax,
    adjusted,
    normalized: fx
  }
}
