import type { Offer, ValuationInputs } from '@/types/offer.types'

/**
 * Rough benefit valuation
 * Converts benefits to annual cash equivalent
 */
export function valueBenefits(
  o: Offer,
  _v: ValuationInputs
): {
  signingSpread: number
  annualValue: number
} {
  const b = o.benefits ?? {}

  // Signing bonus (one-time, spread over horizon)
  const signingSpread = b.signingBonus ?? 0

  // PTO value (assume daily rate * 30% recoverable)
  const ptoAnnual = (b.ptoDays ?? 0) * (o.baseAnnual / 260) * 0.3

  // Health insurance (employer contribution)
  const health = (b.healthMonthlyEmployer ?? 0) * 12

  // Retirement match (assume partial capture)
  const retire = ((b.retirementMatchPct ?? 0) / 100) * o.baseAnnual * 0.6

  // Annual stipend
  const stip = b.stipendAnnual ?? 0

  return {
    signingSpread,
    annualValue: ptoAnnual + health + retire + stip
  }
}
