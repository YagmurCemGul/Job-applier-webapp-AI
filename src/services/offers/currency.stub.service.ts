/**
 * @fileoverview Currency conversion stub service for Step 44
 * @module services/offers/currency.stub
 * 
 * Offline FX stub with user-editable rates
 * In production, replace with real-time API
 */

/** Default exchange rates relative to USD */
const DEFAULT_RATES: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  TRY: 0.034,
  CAD: 0.74,
  AUD: 0.66
};

/**
 * Get exchange rate from one currency to another
 * @param from - Source currency code
 * @param to - Target currency code
 * @returns Exchange rate
 */
export function fxRate(from: string, to: string): number {
  const r = (DEFAULT_RATES[to] ?? 1) / (DEFAULT_RATES[from] ?? 1);
  return Number(r.toFixed(4));
}

/**
 * Convert amount between currencies
 * @param amount - Amount in source currency
 * @param from - Source currency code
 * @param to - Target currency code
 * @returns Amount in target currency
 */
export function convert(amount: number, from: string, to: string): number {
  return Number((amount * fxRate(from, to)).toFixed(2));
}
