/**
 * Infer employment type from text
 */
export function inferEmploymentType(
  raw: string,
  _lang: 'en' | 'tr' | 'unknown'
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
 * Infer seniority level from text
 */
export function inferSeniority(
  raw: string,
  _lang: 'en' | 'tr' | 'unknown'
):
  | 'intern'
  | 'junior'
  | 'mid'
  | 'senior'
  | 'lead'
  | 'manager'
  | 'director'
  | 'vp'
  | 'c_level'
  | 'na' {
  const t = raw.toLowerCase()

  if (/c[-\s]?level|cto|cpo|ceo|cfo|coo/.test(t)) return 'c_level'
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
 * Infer remote type from text
 */
export function inferRemoteType(
  raw: string,
  _lang: 'en' | 'tr' | 'unknown'
): 'remote' | 'hybrid' | 'onsite' | 'unknown' {
  const t = raw.toLowerCase()

  if (/\bremote\b|uzaktan|fully remote/.test(t)) return 'remote'
  if (/\bhybrid\b|hibrit|karma/.test(t)) return 'hybrid'
  if (/\bonsite\b|ofis|yerinde|in-office/.test(t)) return 'onsite'

  return 'unknown'
}
