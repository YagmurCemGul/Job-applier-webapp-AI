import type { Offer } from '@/types/offer.types'

/**
 * Parse raw email/text to draft Offer (best-effort heuristics)
 * Extracts common fields from job offer emails/letters
 */
export function parseOfferFromText(raw: string): Partial<Offer> {
  // Extract company name
  const company = /(?:from|at)\s+([A-Z][A-Za-z0-9&.\- ]{2,})/i.exec(raw)?.[1]?.trim()

  // Extract base salary
  const base = /(?:base|salary)[:\s]*\$?\s*([\d,]+)/i.exec(raw)?.[1]
  const baseAnnual = base ? Number(base.replace(/,/g, '')) : undefined

  // Extract bonus percentage
  const bonusPct = /bonus[^%]*?(\d{1,2})%/i.exec(raw)?.[1]
  const bonusTargetPct = bonusPct ? Number(bonusPct) : undefined

  // Extract currency
  const currency = /\b(USD|EUR|GBP|TRY|AUD|CAD|JPY|CNY|INR|BRL)\b/i
    .exec(raw)?.[1]
    ?.toUpperCase() as any

  // Extract signing bonus
  const signing = /signing\s+bonus[^$]*\$?\s*([\d,]+)/i.exec(raw)?.[1]
  const signingBonus = signing ? Number(signing.replace(/,/g, '')) : undefined

  // Extract PTO days
  const pto = /(\d{1,2})\s+(?:days?|PTO)/i.exec(raw)?.[1]
  const ptoDays = pto ? Number(pto) : undefined

  // Extract role
  const role = /(?:for|as|position:?)\s+([A-Z][A-Za-z\s]{5,30})/i.exec(raw)?.[1]?.trim()

  return {
    company,
    role,
    baseAnnual,
    bonusTargetPct,
    currency: currency ?? 'USD',
    benefits: {
      signingBonus,
      ptoDays,
    },
  }
}
