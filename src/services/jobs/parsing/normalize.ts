import type { ParsedJob } from '@/types/ats.types'

/**
 * Normalize text: remove diacritics, normalize whitespace
 */
export function normalizeText(t: string): string {
  return t
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\S\r\n]+/g, ' ')
    .trim()
}

/**
 * Detect language based on character distribution
 */
export function detectLang(t: string): 'en' | 'tr' | 'unknown' {
  const trChars = /[ığüşöçİĞÜŞÖÇ]/
  if (trChars.test(t)) return 'tr'
  const enChars = /[a-z]/i
  if (enChars.test(t)) return 'en'
  return 'unknown'
}

/**
 * Finalize parsed job: compute overall confidence
 */
export function finalizeParsedJob(pj: ParsedJob): ParsedJob {
  const confs = [
    pj._conf?.title?.confidence ?? 0,
    pj._conf?.company?.confidence ?? 0,
    pj._conf?.location?.confidence ?? 0,
  ].filter((c) => c > 0)

  const base = confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : 0.4

  return {
    ...pj,
    _conf: {
      ...(pj._conf ?? { overall: 0 }),
      overall: clamp01(base),
    },
  }
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n))
}

/**
 * Fix hyphenation from PDF extraction
 */
export function fixHyphenation(t: string): string {
  return t
    .replace(/(\w)-\s+(\w)/g, '$1$2')
    .replace(/\s+/g, ' ')
    .trim()
}
