/**
 * @fileoverview FX rates service for Step 37 — currency conversion
 * @module services/offer/fxRates
 * 
 * This uses a stub exchange rate table. In production, replace with
 * real-time API (e.g., exchangerate-api.com, Open Exchange Rates).
 */

import type { CurrencyCode } from '@/types/offer.types';

/**
 * Stub FX rates table (to USD)
 * In production, fetch from external API
 */
const FX_TABLE: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 1.1,
  GBP: 1.28,
  TRY: 0.03,
  AUD: 0.67,
  CAD: 0.74,
  JPY: 0.0065,
  CNY: 0.14,
  INR: 0.012,
  BRL: 0.19
};

/**
 * Convert amount from one currency to another
 * @param from - Source currency
 * @param to - Target currency
 * @param amount - Amount in source currency
 * @returns Amount in target currency
 */
export async function convertFx(
  from: CurrencyCode,
  to: CurrencyCode,
  amount: number
): Promise<number> {
  if (from === to) return amount;

  // Convert to USD first, then to target currency
  const usd = amount * (FX_TABLE[from] ?? 1);
  return usd / (FX_TABLE[to] ?? 1);
}

/**
 * Get exchange rate between two currencies
 */
export async function getRate(from: CurrencyCode, to: CurrencyCode): Promise<number> {
  if (from === to) return 1;
  return (FX_TABLE[from] ?? 1) / (FX_TABLE[to] ?? 1);
}
