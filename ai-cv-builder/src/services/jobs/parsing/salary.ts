/**
 * Step 27: Salary parsing with multi-currency and period support
 */

type SalaryResult = {
  min?: number
  max?: number
  currency?: string
  period?: 'y' | 'm' | 'd' | 'h'
}

/**
 * Parse salary from text with support for:
 * - Multiple currencies: $, €, ₺, USD, EUR, TRY
 * - Ranges: 60,000-80,000
 * - K notation: $60k-$80k
 * - Periods: /year, /month, per hour, etc.
 */
export function parseSalary(raw: string, lang: 'en' | 'tr' | 'unknown'): SalaryResult | undefined {
  // Match: [$€₺] 35,000-45,000 [k] [USD/EUR/TRY] [per year/month/day/hour or /y/m/d/h]
  const re =
    /(?:(\$|€|₺)\s?)?(\d{1,3}(?:[.,]\d{3})+|\d{1,})(\s*k)?(?:\s*[-–]\s*(?:\$|€|₺)?\s*(\d{1,3}(?:[.,]\d{3})+|\d{1,})(\s*k)?)?\s*(usd|eur|try|tl)?\s*(?:per\s*(year|month|day|hour|annual)|\/\s*(y|m|d|h)|yıllık|aylık|günlük|saatlik)?/gi

  const matches = Array.from(raw.matchAll(re))
  if (!matches.length) return undefined

  const m = matches[0] // Take first match
  const sym = m[1]
  const hasK = !!m[3] || !!m[5]
  const lo = num(m[2], !!m[3])
  const hi = m[4] ? num(m[4], !!m[5]) : undefined
  const cur =
    m[6]?.toUpperCase().replace('TL', 'TRY') ||
    (sym === '$' ? 'USD' : sym === '€' ? 'EUR' : sym === '₺' ? 'TRY' : undefined)
  const period = toPeriod(m[7] || m[8] || raw)

  return { min: lo, max: hi, currency: cur, period }
}

/**
 * Parse numeric value from string, handle K multiplier
 */
function num(s?: string, k?: boolean): number | undefined {
  if (!s) return undefined
  const n = Number(s.replace(/[.,]/g, ''))
  return k ? n * 1000 : n
}

/**
 * Determine period from text
 */
function toPeriod(p?: string): 'y' | 'm' | 'd' | 'h' | undefined {
  if (!p) return undefined
  const t = p.toLowerCase()
  if (t.includes('year') || t.includes('annual') || t.includes('yıllık') || t === 'y') return 'y'
  if (t.includes('month') || t.includes('aylık') || t === 'm') return 'm'
  if (t.includes('day') || t.includes('günlük') || t === 'd') return 'd'
  if (t.includes('hour') || t.includes('saatlik') || t === 'h') return 'h'
  return undefined
}
