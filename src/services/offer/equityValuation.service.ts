import type { Offer, ValuationInputs } from '@/types/offer.types'

/**
 * Extremely simplified equity annualization
 * This is an ESTIMATE for comparison only — not investment advice
 *
 * RSU/PSU: units * assumedSharePrice * (vested% in horizon) / years
 * Options: max(assumedSharePrice - strike, 0) * vestedUnits / years
 * If only targetValue is given, spread it over vesting horizon (4y default)
 */
export async function annualizeEquity(
  o: Offer,
  v: ValuationInputs
): Promise<number> {
  const years = v.horizonYears
  let total = 0

  for (const g of o.equity ?? []) {
    const sp =
      g.assumedSharePrice ?? (g.ticker ? await stubPrice(g.ticker) : 0)
    const schedule = g.vestSchedule ?? '4y_1y_cliff'

    // Calculate vested percentage based on schedule
    const vestPct =
      schedule === '4y_1y_cliff'
        ? Math.min(1, Math.max(0, (years - 0.25) / 3.75)) // 1 year cliff, then 3.75 years
        : schedule === '4y_no_cliff'
          ? Math.min(1, years / 4)
          : customPct(g.vestCustom ?? [], years)

    if (g.units) {
      if (g.type === 'Options') {
        // Options intrinsic value
        total += Math.max(sp - (g.strikePrice ?? 0), 0) * (g.units * vestPct)
      } else {
        // RSU/PSU
        total += sp * (g.units * vestPct)
      }
    } else if (g.targetValue) {
      // Target value spread over vesting
      total += g.targetValue * vestPct
    }
  }

  return total / v.horizonYears // Annualized
}

/**
 * Calculate vested percentage from custom schedule
 */
function customPct(
  steps: Array<{ atMonths: number; pct: number }>,
  years: number
): number {
  const months = years * 12
  return (
    steps.filter((s) => s.atMonths <= months).reduce((a, s) => a + s.pct, 0) /
    100
  )
}

/**
 * Stub price lookup - clearly marked stub
 * In production, use real-time stock API (e.g., Alpha Vantage, Yahoo Finance)
 * User can override via assumedSharePrice
 */
async function stubPrice(_ticker: string): Promise<number> {
  return 50 // Default stub price
}
