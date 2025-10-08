import type { ATSKeywordMeta, ParsedJob } from '@/types/ats.types'
import { normalizeText } from './textUtils'

/**
 * Build keyword metadata with importance scores based on section presence and frequency
 * 
 * @param job - Parsed job posting
 * @param matched - List of matched keywords
 * @param missing - List of missing keywords
 * @returns Array of keyword metadata with importance scores (0..1)
 */
export function buildKeywordMeta(
  job: ParsedJob,
  matched: string[],
  missing: string[]
): ATSKeywordMeta[] {
  const allTerms = [...matched, ...missing]
  const jobSections = {
    title: normalizeText(job.title ?? ''),
    req: normalizeText((job.sections.requirements ?? []).join(' ')),
    qual: normalizeText((job.sections.qualifications ?? []).join(' ')),
    resp: normalizeText((job.sections.responsibilities ?? []).join(' ')),
    raw: normalizeText(job.sections.raw ?? ''),
  }

  return allTerms.map((term) => {
    const norm = normalizeText(term)
    const stem = norm.toLowerCase()

    // Check section presence
    const inTitle = jobSections.title.includes(norm)
    const inReq = jobSections.req.includes(norm)
    const inQual = jobSections.qual.includes(norm)
    const inResp = jobSections.resp.includes(norm)

    // Count occurrences in raw text for frequency-based base importance
    const regex = new RegExp(escapeRegex(norm), 'gi')
    const matches = jobSections.raw.match(regex) || []
    const frequency = matches.length

    // Base importance from frequency (normalized, max 0.5 for 5+ occurrences)
    let importance = Math.min(0.5, frequency * 0.1)

    // Boost importance based on section presence
    if (inTitle) importance += 0.2
    if (inReq) importance += 0.15
    if (inResp) importance += 0.1
    if (inQual) importance += 0.05

    // Cap at 1.0 and round to 2 decimals
    importance = Math.min(1.0, importance)
    importance = Math.round(importance * 100) / 100

    return {
      term,
      stem,
      importance,
      inTitle,
      inReq,
      inQual,
      inResp,
    }
  })
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
