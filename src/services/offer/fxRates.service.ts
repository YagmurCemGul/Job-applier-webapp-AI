import type { CurrencyCode } from '@/types/offer.types'

/**
 * Stub FX converter with overridable table
 * In production, plug external API (e.g., exchangerate-api.com)
 */
const TABLE: Record<string, number> = {
  USD: 1,
  EUR: 1.1,
  GBP: 1.28,
  TRY: 0.03,
  AUD: 0.67,
  CAD: 0.74,
  JPY: 0.0065,
  CNY: 0.14,
  INR: 0.012,
  BRL: 0.19,
}

export async function convertFx(
  from: CurrencyCode,
  to: CurrencyCode,
  amount: number
): Promise<number> {
  if (from === to) return amount

  // Convert to USD first, then to target currency
  const usd = amount * (TABLE[from] ?? 1)
  return usd / (TABLE[to] ?? 1)
}
