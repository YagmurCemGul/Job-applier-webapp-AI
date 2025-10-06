/**
 * Rough effective tax calculation
 * User can override rate; this is for comparison only
 */

export function roughTax(amount: number, ratePct: number): number {
  return amount * (1 - ratePct / 100)
}
