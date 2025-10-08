/**
 * Step 27: Entity extraction (title, company, location, recruiter, email)
 */

import type { FieldConfidence } from '@/types/ats.types'

type Lang = 'en' | 'tr' | 'unknown'

/**
 * Extract entities from job text with confidence scores
 */
export function extractEntities(raw: string, sections: any, lang: Lang) {
  const title =
    firstMatch(raw, /(title|position|pozisyon|role)\s*[:\-]\s*(.+)/i, 2, 0.8) ||
    firstLineHeuristic(raw, 0.6)

  const company = firstMatch(raw, /(company|şirket|employer|organization)\s*[:\-]\s*(.+)/i, 2, 0.8)

  const location =
    firstMatch(raw, /(location|konum|city|şehir)\s*[:\-]\s*(.+)/i, 2, 0.7) ||
    emailSignatureLocation(raw, 0.4)

  const email = raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0]
  const recruiterName = raw.match(
    /\b(?:recruiter|hr|ik|contact|iletişim)[:]\s*([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/i
  )?.[1]

  return {
    title,
    company,
    location,
    recruiter: withConf({ name: recruiterName, email }, email ? 0.8 : 0.3),
  }
}

/**
 * Match pattern and extract specific capture group
 */
function firstMatch(
  raw: string,
  re: RegExp,
  group: number,
  conf: number
): FieldConfidence<string> | undefined {
  const m = re.exec(raw)
  if (!m) return undefined
  const v = (m[group] ?? '').trim()
  if (!v) return undefined
  return { value: v, confidence: conf }
}

/**
 * Extract title from first non-empty line (heuristic)
 */
function firstLineHeuristic(raw: string, conf: number): FieldConfidence<string> | undefined {
  const first = raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .find(Boolean)
  if (!first) return undefined
  const v = first.replace(/^(we are hiring|hiring)[:\-]\s*/i, '').trim()
  if (!v) return undefined
  return { value: v, confidence: conf }
}

/**
 * Extract location from email signature or common city names
 */
function emailSignatureLocation(raw: string, conf: number): FieldConfidence<string> | undefined {
  const m = raw.match(
    /(?:istanbul|ankara|izmir|berlin|london|new york|san francisco|remote|hybrid|onsite)/i
  )?.[0]
  return m ? { value: m, confidence: conf } : undefined
}

/**
 * Wrap value with confidence
 */
function withConf<T>(value: T, confidence: number): FieldConfidence<T> {
  return { value, confidence }
}
