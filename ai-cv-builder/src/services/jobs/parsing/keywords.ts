/**
 * Step 27: Keyword extraction with taxonomy, alias expansion, and stopword filtering
 */

import {
  STOPWORDS_EN,
  STOPWORDS_TR,
  SKILL_ALIASES_EN,
  SKILL_ALIASES_TR,
  ROLE_KEYWORDS_EN,
  ROLE_KEYWORDS_TR,
} from './taxonomy'

type Lang = 'en' | 'tr' | 'unknown'

/**
 * Extract keywords from job sections with taxonomy-driven expansion
 * Returns up to 150 unique keywords
 */
export function extractKeywords(raw: string, sections: any, lang: Lang): string[] {
  // Combine relevant sections
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

  // Tokenize: alphanumeric + special chars like +, ., #
  const tokens = base.match(/[a-zğüşöçıİ0-9\+\.\#]{2,}/gi) ?? []

  // Filter stopwords
  const stop = lang === 'tr' ? STOPWORDS_TR : STOPWORDS_EN
  const filtered = tokens.filter((t) => !stop.includes(t.toLowerCase()))

  // Expand aliases (skill synonyms -> canonical)
  const aliases = lang === 'tr' ? SKILL_ALIASES_TR : SKILL_ALIASES_EN
  const expanded = new Set<string>()

  for (const t of filtered) {
    expanded.add(t)
    // Check if token matches any alias, add canonical
    for (const [canonical, arr] of Object.entries(aliases)) {
      if (arr.some((alias) => alias.toLowerCase() === t.toLowerCase())) {
        expanded.add(canonical)
      }
    }
  }

  // Add role keywords if found in text
  const roles = (lang === 'tr' ? ROLE_KEYWORDS_TR : ROLE_KEYWORDS_EN).filter((r) =>
    base.includes(r.toLowerCase())
  )
  roles.forEach((r) => expanded.add(r))

  // Cap at 150 keywords
  return Array.from(expanded).slice(0, 150)
}
