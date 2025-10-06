/**
 * Parse salary from text
 * Supports: $60k-$80k, ₺35.000–₺45.000, 60,000-80,000 EUR/month/year/hour
 */
export function parseSalary(raw: string, _lang: 'en' | 'tr' | 'unknown') {
  const re =
    /(?:(\$|€|₺)\s?)?(\d{1,3}(?:[.,]\d{3})+|\d{3,})(?:\s*[-–]\s*(\d{1,3}(?:[.,]\d{3})+|\d{3,}))?\s*(k)?\s*(usd|eur|try|tl)?\s*(?:per\s*(year|month|day|hour)|\/\s*(y|m|d|h))?/i

  const m = raw.match(re)
  if (!m) return undefined

  const sym = m[1]
  const lo = num(m[2], !!m[4])
  const hi = m[3] ? num(m[3], !!m[4]) : undefined

  const cur =
    m[5]?.toUpperCase() ||
    (sym === '$' ? 'USD' : sym === '€' ? 'EUR' : sym === '₺' ? 'TRY' : undefined)

  const period = toPeriod(m[6] || m[7])

  return { min: lo, max: hi, currency: cur, period }
}

function num(s?: string, k?: boolean): number | undefined {
  if (!s) return undefined
  const n = Number(s.replace(/[.,]/g, ''))
  return k ? n * 1000 : n
}

function toPeriod(p?: string): 'y' | 'm' | 'd' | 'h' | undefined {
  if (!p) return undefined
  const t = p[0].toLowerCase()
  return t === 'y' ? 'y' : t === 'm' ? 'm' : t === 'd' ? 'd' : t === 'h' ? 'h' : undefined
}
