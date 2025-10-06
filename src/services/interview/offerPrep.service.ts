/**
 * Offer preparation service
 */

export interface CompBand {
  level: string
  baseMin: number
  baseMax: number
  currency: string
  equityPctMin?: number
  equityPctMax?: number
}

export function recommendOffer(level: string, bands: CompBand[]) {
  const b = bands.find((x) => x.level === level)

  if (!b) {
    return {
      note: 'No band found',
      base: undefined,
      equityPct: undefined,
      currency: 'USD'
    }
  }

  const base = Math.round((b.baseMin + b.baseMax) / 2)
  const equityPct =
    b.equityPctMin && b.equityPctMax
      ? (b.equityPctMin + b.equityPctMax) / 2
      : undefined

  return { base, equityPct, currency: b.currency }
}

/**
 * Default compensation bands for common levels
 */
export const DEFAULT_COMP_BANDS: CompBand[] = [
  {
    level: 'Junior',
    baseMin: 60000,
    baseMax: 80000,
    currency: 'USD',
    equityPctMin: 0.05,
    equityPctMax: 0.15
  },
  {
    level: 'Mid',
    baseMin: 80000,
    baseMax: 120000,
    currency: 'USD',
    equityPctMin: 0.1,
    equityPctMax: 0.3
  },
  {
    level: 'Senior',
    baseMin: 120000,
    baseMax: 160000,
    currency: 'USD',
    equityPctMin: 0.2,
    equityPctMax: 0.5
  },
  {
    level: 'Staff',
    baseMin: 160000,
    baseMax: 220000,
    currency: 'USD',
    equityPctMin: 0.3,
    equityPctMax: 0.8
  },
  {
    level: 'Principal',
    baseMin: 220000,
    baseMax: 300000,
    currency: 'USD',
    equityPctMin: 0.5,
    equityPctMax: 1.2
  }
]
