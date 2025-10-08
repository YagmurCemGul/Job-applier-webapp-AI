/**
 * Step 27: Location & remote type inference
 */

type Lang = 'en' | 'tr' | 'unknown'

/**
 * Infer remote work type from job text
 */
export function inferRemote(
  raw: string,
  lang: Lang
): 'remote' | 'hybrid' | 'onsite' | 'unknown' {
  const t = raw.toLowerCase()
  // Check hybrid first as it's more specific
  if (/\bhybrid\b|hibrit/.test(t)) return 'hybrid'
  if (/\bremote\b|uzaktan|work from home|wfh/.test(t)) return 'remote'
  if (/\bonsite\b|on-site|ofis(ten|te)?|office/.test(t)) return 'onsite'
  return 'unknown'
}
