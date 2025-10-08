/**
 * Step 25/27: Job parser with backward compatibility
 * Step 27 adds advanced multi-source ingestion; Step 25 text parser preserved
 */

import type { ParsedJob } from '@/types/ats.types'

/**
 * Step 25: Legacy text parser (backward compatible)
 * For new code, use ingestAndParseJob() from Step 27
 */
export function parseJobText(raw: string): ParsedJob {
  // For backward compatibility with Step 25, use the legacy synchronous implementation
  // New code should use the async ingestAndParseJob() function instead
  return parseJobTextLegacy(raw)
}

/**
 * Step 25: Original synchronous implementation (fallback)
 */
function parseJobTextLegacy(raw: string): ParsedJob {
  const { detectLang, normalizeText, tokenize } = require('./textUtils')
  const { COMMON_EN_KEYWORDS, COMMON_TR_KEYWORDS } = require('./keywordSets')

  const lang = detectLang(raw)
  const text = raw.trim()
  const norm = normalizeText(text)

  const sections = splitSections(text)
  const title = matchLine(/(title|position|pozisyon|role)\s*[:\-]\s*(.*)$/im, text)
  const company = matchLine(/(company|şirket|employer|organization)\s*[:\-]\s*(.*)$/im, text)
  const location = matchLine(/(location|konum|city|şehir)\s*[:\-]\s*(.*)$/im, text)
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

/**
 * Split job text into logical sections
 */
function splitSections(text: string) {
  const blocks = {
    summary: captureAfter(text, /(summary|özet|about the role|about this role|overview)/i),
    responsibilities: captureList(
      text,
      /(responsibilities|görevler|what you will do|what you'll do|duties)/i
    ),
    requirements: captureList(
      text,
      /(requirements|gereksinimler|aranan nitelikler|qualifications|what we're looking for)/i
    ),
    qualifications: captureList(text, /(qualifications|nitelikler|preferred qualifications)/i),
    benefits: captureList(text, /(benefits|yan haklar|perks|what we offer)/i),
    raw: text,
  }
  return blocks
}

/**
 * Capture text after a header pattern
 */
function captureAfter(text: string, re: RegExp): string | undefined {
  const m = re.exec(text)
  if (!m) return undefined
  const rest = text.slice(m.index + m[0].length)
  return rest.split(/\n{2,}/)[0]?.trim()
}

/**
 * Capture bulleted/numbered list after a header pattern
 */
function captureList(text: string, re: RegExp): string[] | undefined {
  const m = re.exec(text)
  if (!m) return undefined
  const rest = text.slice(m.index + m[0].length)
  const block = rest.split(/\n{2,}/)[0] ?? ''
  return block
    .split(/\n|\r/)
    .map((s) => s.replace(/^[\-\*•\d]+[\.\)]\s*/, '').trim())
    .filter(Boolean)
}

/**
 * Match a line pattern and extract value
 */
function matchLine(re: RegExp, text: string): string | null {
  const m = re.exec(text)
  return m?.[2]?.trim() || m?.[1]?.trim() || null
}

/**
 * Infer remote work type from text
 */
function inferRemoteType(n: string): 'remote' | 'hybrid' | 'onsite' | 'unknown' {
  if (/\b(remote|uzaktan|work from home|wfh)\b/i.test(n)) return 'remote'
  if (/\b(hybrid|hibrit)\b/i.test(n)) return 'hybrid'
  if (/\b(onsite|on-site|ofis|office)\b/i.test(n)) return 'onsite'
  return 'unknown'
}

/**
 * Extract salary information from text
 */
function inferSalary(
  text: string
): { min?: number; max?: number; currency?: string; period?: 'y' | 'm' | 'd' | 'h' } | undefined {
  const m = text.match(/(\$|€|₺|USD|EUR|TRY)\s?(\d+(?:[.,]\d{3})*)(?:\s*[-–to]\s*(\d+(?:[.,]\d{3})*))?/i)
  if (!m) return undefined
  const currency = m[1]
  const min = Number((m[2] || '').replace(/[.,]/g, '')) || undefined
  const max = m[3] ? Number(m[3].replace(/[.,]/g, '')) : undefined
  return { min, max, currency, period: 'y' }
}

/**
 * Extract keywords from section content
 */
function extractKeywordsFromSections(sections: ReturnType<typeof splitSections>): string[] {
  const pool = [
    ...(sections.requirements ?? []),
    ...(sections.qualifications ?? []),
    ...(sections.responsibilities ?? []),
  ].join(' ')
  return Array.from(new Set(pool.toLowerCase().match(/[a-zA-Zğüşöçıİ0-9\+\.#]{2,}/g) ?? []))
    .filter(Boolean)
    .slice(0, 100)
}

/**
 * Deduplicate array items
 */
function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}

// ============================================================================
// Step 27: Re-export advanced parsing functions (for new code)
// ============================================================================

export { ingestAndParseJob } from '../jobs/parsing/ingest'
export type { IngestInput } from '../jobs/parsing/ingest'
export { parseJobText as parseJobTextV27 } from '../jobs/parsing/parse-text'
export { parseJobHtml } from '../jobs/parsing/parse-html'
export { parseJobPdf } from '../jobs/parsing/parse-pdf'
export { parseJobDocx } from '../jobs/parsing/parse-docx'
