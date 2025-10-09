/**
 * @fileoverview Tax estimation stub service for Step 44
 * @module services/equity/tax.stub
 * 
 * WARNING: Extremely simplified blended marginal tax stub — not advice
 */

/**
 * Estimate tax amount (educational purpose only)
 * @param amount - Pre-tax amount
 * @param blendedPct - Blended marginal tax rate
 * @returns Estimated tax
 */
export function estimateTax(amount: number, blendedPct: number): number {
  return Number((amount * (blendedPct / 100)).toFixed(2));
}

/**
 * Calculate after-tax amount
 * @param amount - Pre-tax amount
 * @param blendedPct - Blended marginal tax rate
 * @returns After-tax amount
 */
export function afterTax(amount: number, blendedPct: number): number {
  return Number((amount - estimateTax(amount, blendedPct)).toFixed(2));
}
