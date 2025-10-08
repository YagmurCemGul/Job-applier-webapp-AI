/**
 * @fileoverview Rough tax calculation service for Step 37
 * @module services/offer/taxRough
 * 
 * WARNING: This is a simplified estimate. Actual taxes depend on jurisdiction,
 * deductions, credits, and other factors. Not tax advice.
 */

/**
 * Apply rough effective tax rate to amount
 * @param amount - Gross amount
 * @param ratePct - Effective tax rate percentage (0-100)
 * @returns Net amount after tax
 */
export function roughTax(amount: number, ratePct: number): number {
  const rate = Math.max(0, Math.min(100, ratePct));
  return amount * (1 - rate / 100);
}

/**
 * Calculate tax amount
 */
export function taxAmount(amount: number, ratePct: number): number {
  const rate = Math.max(0, Math.min(100, ratePct));
  return amount * (rate / 100);
}
