import type { ParsedJob } from '@/types/ats.types'
import { extractTextFromHtml, extractMeta, extractJsonLd } from './readability'
import { parseJobText } from './parse-text'

/**
 * Parse job posting from HTML
 * Priority: JSON-LD > meta tags > body text
 */
export async function parseJobHtml(
  html: string,
  meta?: { url?: string; site?: string }
): Promise<ParsedJob> {
  const ld = extractJsonLd(html)
  const metaTags = extractMeta(html)
  const bodyText = extractTextFromHtml(html)

  // Prefer JSON-LD for title/company if present
  const seedTitle = ld.title || metaTags.ogTitle || metaTags.title
  const seedCompany = ld.hiringOrganization || metaTags.siteName

  const base = await parseJobText(bodyText, { url: meta?.url, site: meta?.site })

  return {
    ...base,
    title: base.title || seedTitle || undefined,
    company: base.company || seedCompany || undefined,
    source: { type: 'url', url: meta?.url, site: meta?.site },
  }
}
