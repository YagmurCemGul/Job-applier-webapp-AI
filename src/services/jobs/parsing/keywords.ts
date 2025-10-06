import {
  STOPWORDS_EN,
  STOPWORDS_TR,
  SKILL_ALIASES_EN,
  SKILL_ALIASES_TR,
  ROLE_KEYWORDS_EN,
  ROLE_KEYWORDS_TR,
} from './taxonomy'

/**
 * Extract keywords from job posting with taxonomy support
 */
export function extractKeywords(
  raw: string,
  sections: any,
  lang: 'en' | 'tr' | 'unknown'
): string[] {
  const base = [
    sections.requirements,
    sections.qualifications,
    sections.responsibilities,
    sections.summary,
  ]
    .flat()
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  // Tokenize
  const tokens = base.match(/[a-zğüşöçıİ0-9+.#]{2,}/gi) ?? []

  // Filter stopwords
  const stop = lang === 'tr' ? STOPWORDS_TR : STOPWORDS_EN
  const filtered = tokens.filter((t) => !stop.includes(t.toLowerCase()))

  // Expand with aliases
  const aliases = lang === 'tr' ? SKILL_ALIASES_TR : SKILL_ALIASES_EN
  const expanded = new Set<string>()

  for (const t of filtered) {
    expanded.add(t)
    for (const [k, arr] of Object.entries(aliases)) {
      if (arr.includes(t.toLowerCase())) {
        expanded.add(k)
      }
    }
  }

  // Add role keywords if found
  const roles = (lang === 'tr' ? ROLE_KEYWORDS_TR : ROLE_KEYWORDS_EN).filter((r) =>
    base.includes(r.toLowerCase())
  )
  roles.forEach((r) => expanded.add(r))

  return Array.from(expanded).slice(0, 150)
}
