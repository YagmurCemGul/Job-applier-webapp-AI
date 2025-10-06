import type { ParsedJob } from '@/types/ats.types'
import { detectLang, normalizeText, tokenize } from './textUtils'
import { COMMON_EN_KEYWORDS, COMMON_TR_KEYWORDS } from './keywordSets'

/**
 * Heuristic parser for raw job posting text
 * Extracts structure, keywords, and metadata
 */
export function parseJobText(raw: string): ParsedJob {
  const lang = detectLang(raw)
  const text = raw.trim()
  const norm = normalizeText(text)

  const sections = splitSections(text)
  const title = matchLine(/(title|position|pozisyon|role)\s*[:\-]\s*(.*)$/im, text)
  const company = matchLine(/(company|şirket)\s*[:\-]\s*(.*)$/im, text)
  const location = matchLine(/(location|konum|lokasyon)\s*[:\-]\s*(.*)$/im, text)
  const remoteType = inferRemoteType(norm)
  const salary = inferSalary(text)

  const keywordSeed = lang === 'tr' ? COMMON_TR_KEYWORDS : COMMON_EN_KEYWORDS
  const tokens = tokenize(text)
  const keywords = dedupe([
    ...keywordSeed.filter((k) => tokens.includes(normalizeText(k))),
    ...extractKeywordsFromSections(sections),
  ])

  return {
    title: title ?? undefined,
    company: company ?? undefined,
    location: location ?? undefined,
    remoteType,
    salary,
    sections,
    keywords,
    lang,
    source: { type: 'paste' },
  }
}

function splitSections(text: string) {
  return {
    summary: captureAfter(text, /(summary|özet|about the role|about|hakkında)/i),
    responsibilities: captureList(
      text,
      /(responsibilities|görevler|sorumluluklar|what you will do|yapacakların)/i
    ),
    requirements: captureList(text, /(requirements|gereksinimler|aranan nitelikler|requirements)/i),
    qualifications: captureList(text, /(qualifications|nitelikler|yetkinlikler)/i),
    benefits: captureList(text, /(benefits|yan haklar|imkanlar|avantajlar)/i),
    raw: text,
  }
}

function captureAfter(text: string, re: RegExp) {
  const m = re.exec(text)
  if (!m) return undefined
  const rest = text.slice(m.index + m[0].length)
  return rest.split(/\n{2,}/)[0]?.trim()
}

function captureList(text: string, re: RegExp) {
  const m = re.exec(text)
  if (!m) return undefined
  const rest = text.slice(m.index + m[0].length)
  const block = rest.split(/\n{2,}/)[0] ?? ''
  return block
    .split(/\n|\r/)
    .map((s) => s.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean)
}

function matchLine(re: RegExp, text: string) {
  const m = re.exec(text)
  return m?.[2]?.trim() || m?.[1]?.trim() || null
}

function inferRemoteType(n: string): ParsedJob['remoteType'] {
  if (/\bremote\b|uzaktan/i.test(n)) return 'remote'
  if (/\bhybrid\b|hibrit|karma/i.test(n)) return 'hybrid'
  if (/\bonsite\b|ofis|yerinde/i.test(n)) return 'onsite'
  return 'unknown'
}

function inferSalary(text: string) {
  const m = text.match(/(\$|€|₺|usd|eur|try)\s?(\d+(?:[.,]\d{3})*)(?:\s*-\s*(\d+(?:[.,]\d{3})*))?/i)
  if (!m) return undefined
  const currency = m[1].toLowerCase() === 'usd' ? '$' : m[1].toLowerCase() === 'eur' ? '€' : m[1]
  const min = Number((m[2] || '').replace(/[.,]/g, '')) || undefined
  const max = m[3] ? Number(m[3].replace(/[.,]/g, '')) : undefined
  return { min, max, currency, period: 'y' as const }
}

function extractKeywordsFromSections(sections: ReturnType<typeof splitSections>) {
  const pool = [
    ...(sections.requirements ?? []),
    ...(sections.qualifications ?? []),
    ...(sections.responsibilities ?? []),
  ].join(' ')
  return Array.from(new Set(pool.toLowerCase().match(/[a-zA-Zğüşöçıİ0-9+.#]{2,}/g) ?? []))
    .filter(Boolean)
    .slice(0, 100)
}

function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}
