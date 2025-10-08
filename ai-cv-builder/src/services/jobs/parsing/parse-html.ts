/**
 * Step 27: HTML parser with JSON-LD, meta extraction, and readability
 */

import type { ParsedJob } from '@/types/ats.types'
import { extractTextFromHtml, extractMeta, extractJsonLd } from './readability'
import { parseJobText } from './parse-text'

/**
 * Parse HTML job posting
 * Priority: JSON-LD > meta tags > body text
 */
export async function parseJobHtml(
  html: string,
  meta?: { url?: string; site?: string }
): Promise<ParsedJob> {
  const ld = extractJsonLd(html)
  const metaTags = extractMeta(html)
  const bodyText = extractTextFromHtml(html)

  // Prefer JSON-LD for structured data
  const seedTitle = ld.title || metaTags.ogTitle || metaTags.twitterTitle || metaTags.title
  const seedCompany = ld.hiringOrganization || metaTags.siteName
  const seedLocation = ld.jobLocation

  // Parse body text to get sections, keywords, etc.
  const base = await parseJobText(bodyText, { url: meta?.url, site: meta?.site })

  // Prioritize structured data: JSON-LD > meta > body text
  const finalTitle = seedTitle || base.title
  const finalCompany = seedCompany || base.company
  const finalLocation = seedLocation || base.location

  return {
    ...base,
    title: finalTitle,
    company: finalCompany,
    location: finalLocation,
    source: { type: 'url', url: meta?.url, site: meta?.site },

    // Override dates if JSON-LD provides them
    postedAt: ld.datePosted ? new Date(ld.datePosted) : base.postedAt,
    deadlineAt: ld.validThrough ? new Date(ld.validThrough) : base.deadlineAt,

    // Update confidence if we got data from structured sources
    _conf: {
      ...base._conf,
      title: seedTitle
        ? { value: seedTitle, confidence: 0.9 }
        : base._conf?.title || { value: undefined, confidence: 0 },
      company: seedCompany
        ? { value: seedCompany, confidence: 0.9 }
        : base._conf?.company || { value: undefined, confidence: 0 },
      overall: 0, // Will be recalculated in finalizeParsedJob
    },
  }
}
