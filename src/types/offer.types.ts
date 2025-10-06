/**
 * Offer and compensation types
 */

export type CurrencyCode =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'TRY'
  | 'AUD'
  | 'CAD'
  | 'JPY'
  | 'CNY'
  | 'INR'
  | 'BRL'

export type EquityType = 'RSU' | 'Options' | 'PSU' | 'ESPP'

export type OfferStage =
  | 'draft'
  | 'received'
  | 'negotiating'
  | 'accepted'
  | 'declined'
  | 'expired'

export interface EquityGrant {
  id: string
  type: EquityType
  units?: number // RSU/PSU units
  strikePrice?: number // for options
  vestSchedule?: '4y_1y_cliff' | '4y_no_cliff' | 'custom'
  vestCustom?: Array<{ atMonths: number; pct: number }>
  targetValue?: number // $ value if units unknown
  ticker?: string // for price lookup (stub in fx service)
  assumedSharePrice?: number // user override
}

export interface Benefits {
  ptoDays?: number
  healthMonthlyEmployer?: number // monthly employer contribution
  retirementMatchPct?: number // e.g., 4 (% of salary)
  stipendAnnual?: number // learning/wfh/etc
  signingBonus?: number
  relocation?: number
  visaSupport?: boolean
  notes?: string
}

export interface Offer {
  id: string
  applicationId?: string // Step 33
  company: string
  role: string
  level?: string
  location?: string
  remote?: 'on_site' | 'hybrid' | 'remote'
  currency: CurrencyCode
  baseAnnual: number
  bonusTargetPct?: number // % of base
  equity?: EquityGrant[]
  benefits?: Benefits
  stage: OfferStage
  createdAt: string
  updatedAt: string
  deadlines?: Array<{
    id: string
    label: string
    atISO: string
    kind: 'accept' | 'expire' | 'background' | 'other'
  }>
  customFields?: Record<string, string | number | boolean>
}

export interface ValuationInputs {
  horizonYears: 1 | 2 | 4
  taxRatePct?: number // user-estimated effective tax rate
  cocAdjustPct?: number // cost-of-living adjustment delta vs baseline
  fxBase?: CurrencyCode // normalize totals to this currency
}

export interface CompResult {
  currency: CurrencyCode
  base: number
  bonus: number
  equity: number
  benefits: {
    signingSpread: number
    annualValue: number
  }
  gross: number
  postTax: number
  adjusted: number
  normalized: number
}
