/**
 * Step 27: Employment type & seniority inference
 */

import { inferRemote } from './location'

type Lang = 'en' | 'tr' | 'unknown'

/**
 * Infer employment type from job text
 */
export function inferEmploymentType(
  raw: string,
  lang: Lang
): 'full_time' | 'part_time' | 'contract' | 'intern' | 'temporary' | 'freelance' | 'other' {
  const t = raw.toLowerCase()
  if (/full[\s-]?time|tam\s*zamanlı/.test(t)) return 'full_time'
  if (/part[\s-]?time|yarı\s*zamanlı/.test(t)) return 'part_time'
  if (/contract|sözleşmeli/.test(t)) return 'contract'
  if (/intern|staj/.test(t)) return 'intern'
  if (/temporary|geçici/.test(t)) return 'temporary'
  if (/freelance|serbest/.test(t)) return 'freelance'
  return 'other'
}

/**
 * Infer seniority level from job text
 */
export function inferSeniority(
  raw: string,
  lang: Lang
): 'intern' | 'junior' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'vp' | 'c_level' | 'na' {
  const t = raw.toLowerCase()
  if (/c[-\s]?level|cto|cpo|ceo|cfo|cio/.test(t)) return 'c_level'
  if (/\bvp\b|vice\s*president/.test(t)) return 'vp'
  if (/director|direktör/.test(t)) return 'director'
  if (/manager|yönetici|team lead|lead/.test(t)) return 'manager'
  if (/senior|kıdemli|sr\./.test(t)) return 'senior'
  if (/mid|orta seviye|mid-level/.test(t)) return 'mid'
  if (/junior|jr\.|asistan/.test(t)) return 'junior'
  if (/intern|staj/.test(t)) return 'intern'
  return 'na'
}

/**
 * Re-export inferRemote for convenience
 */
export function inferRemoteType(raw: string, lang: Lang) {
  return inferRemote(raw, lang)
}
