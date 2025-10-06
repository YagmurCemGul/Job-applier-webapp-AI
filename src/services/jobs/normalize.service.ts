import type {
  JobRaw,
  JobNormalized,
  SalaryRange,
  Seniority,
  EmploymentType,
} from '@/types/jobs.types'

/**
 * Normalize raw jobs into structured format
 */
export function normalizeJobs(raws: JobRaw[]): JobNormalized[] {
  return raws.map((r) => {
    const plain = toText(r.description ?? '')
    const salary = extractSalary(plain)
    const { seniority, employment } = classify(plain)
    const now = new Date().toISOString()
    const title = (r.title ?? '').trim()
    const company = (r.company ?? guessCompany(plain) ?? '').trim()
    const location = (r.location ?? guessLocation(plain) ?? '').trim()
    const fp = fingerprint(title, company, location, r.url)

    return {
      id: fp,
      sourceId: r.id,
      title,
      company,
      location,
      remote: detectRemote(plain),
      employmentType: employment,
      seniority,
      salary,
      postedAt: r.postedAt,
      descriptionText: plain,
      descriptionHtml: r.description,
      keywords: extractKeywords(plain),
      url: r.url,
      source: r.source,
      createdAt: now,
      updatedAt: now,
      fingerprint: fp,
    }
  })
}

/**
 * Convert HTML to plain text
 */
export function toText(htmlOrText: string): string {
  return htmlOrText
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Extract salary information from text
 */
export function extractSalary(text: string): SalaryRange | undefined {
  const m = text.match(
    /(\$|€|£|₺)?\s?(\d{2,3}(?:[.,]\d{3})*|\d+(?:\.\d+)?)[KkMm]?\s*-\s*(\d{2,3}(?:[.,]\d{3})*|\d+(?:\.\d+)?)[KkMm]?/
  )
  if (!m) return undefined

  const currency = toCur(m[1])
  const min = toNum(m[2])
  const max = toNum(m[3])

  return { currency, min, max, period: 'year' }
}

/**
 * Classify seniority and employment type
 */
export function classify(text: string): {
  seniority?: Seniority
  employment?: EmploymentType
} {
  const t = text.toLowerCase()

  const seniority: Seniority | undefined = /intern/.test(t)
    ? 'intern'
    : /junior|entry/.test(t)
      ? 'junior'
      : /senior|sr\./.test(t)
        ? 'senior'
        : /lead|principal/.test(t)
          ? 'lead'
          : /manager|head/.test(t)
            ? 'manager'
            : 'unspecified'

  const employment: EmploymentType | undefined = /full[-\s]?time/.test(t)
    ? 'full-time'
    : /part[-\s]?time/.test(t)
      ? 'part-time'
      : /contract|freelance/.test(t)
        ? 'contract'
        : /intern/.test(t)
          ? 'internship'
          : undefined

  return { seniority, employment }
}

/**
 * Detect if job is remote
 */
export function detectRemote(text: string): boolean {
  return /(remote|hybrid|work from home)/i.test(text)
}

/**
 * Extract keywords from text
 */
export function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().match(/[a-zğüşöçıİ0-9+#.]{2,}/gi) ?? []
  const freq: Record<string, number> = {}

  for (const w of words) {
    freq[w] = 1 + (freq[w] ?? 0)
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([k]) => k)
}

/**
 * Generate stable fingerprint for deduplication
 */
export function fingerprint(title: string, company: string, location: string, url: string): string {
  const s = `${title}|${company}|${location}|${url.split('?')[0]}`
    .toLowerCase()
    .replace(/\s+/g, ' ')

  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
  }

  return `job_${(h >>> 0).toString(36)}`
}

function toCur(sym?: string): string | undefined {
  return sym === '₺'
    ? 'TRY'
    : sym === '$'
      ? 'USD'
      : sym === '€'
        ? 'EUR'
        : sym === '£'
          ? 'GBP'
          : undefined
}

function toNum(s: string): number {
  const n = s.replace(/[^\d.]/g, '')
  return /k$/i.test(s) ? Number(n) * 1000 : /m$/i.test(s) ? Number(n) * 1_000_000 : Number(n)
}

function guessCompany(text: string): string | undefined {
  const m = text.match(/\b(?:at|with)\s+([A-Z][A-Za-z0-9&.\- ]{2,})/)
  return m?.[1]
}

function guessLocation(text: string): string | undefined {
  const m = text.match(/\b(?:in|located in)\s+([A-Z][A-Za-z .-]{2,})/)
  return m?.[1]
}
