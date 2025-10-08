import type { ParsedJob } from '@/types/ats.types'

/**
 * Normalize text: remove diacritics, collapse whitespace, trim
 */
export function normalizeText(t: string): string {
  return t
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\S\r\n]+/g, ' ')
    .trim()
}

/**
 * Detect language from text content (EN/TR heuristics)
 */
export function detectLang(t: string): 'en' | 'tr' | 'unknown' {
  const n = t.toLowerCase()
  const trChars = /[ığüşöçİĞÜŞÖÇ]/
  if (trChars.test(t)) return 'tr'
  if (/[a-z]/.test(n)) return 'en'
  return 'unknown'
}

/**
 * Finalize parsed job: compute overall confidence score from per-field confidences
 */
export function finalizeParsedJob(pj: ParsedJob): ParsedJob {
  const confs = [
    pj._conf?.title?.confidence ?? 0,
    pj._conf?.company?.confidence ?? 0,
    pj._conf?.location?.confidence ?? 0,
  ]
  const base = confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : 0.4
  return { ...pj, _conf: { ...(pj._conf ?? { overall: 0 }), overall: clamp01(base) } }
}

/**
 * Clamp number to [0, 1]
 */
function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n))
}
