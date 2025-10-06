import type { ParsedJob } from '@/types/ats.types'
import type { ATSKeywordMeta } from '@/types/ats.types'

/**
 * Build keyword metadata with importance scores
 * Weight rules:
 * - Base importance from frequency (normalized 0..1)
 * - +0.2 if in job title
 * - +0.15 if in requirements
 * - +0.10 if in responsibilities
 * - Cap at 1, round to 2 decimals
 */
export function buildKeywordMeta(
  job: ParsedJob,
  matched: string[],
  missing: string[]
): ATSKeywordMeta[] {
  const allTerms = [...matched, ...missing]
  const meta: ATSKeywordMeta[] = []

  // Prepare searchable text sections
  const titleText = (job.title ?? '').toLowerCase()
  const reqText = (job.sections.requirements ?? []).join(' ').toLowerCase()
  const qualText = (job.sections.qualifications ?? []).join(' ').toLowerCase()
  const respText = (job.sections.responsibilities ?? []).join(' ').toLowerCase()
  const allText = [
    titleText,
    reqText,
    qualText,
    respText,
    job.sections.summary ?? '',
  ].join(' ')

  // Calculate term frequencies
  const termFreqs = new Map<string, number>()
  for (const term of allTerms) {
    const regex = new RegExp(`\\b${escapeRegex(term)}\\b`, 'gi')
    const count = (allText.match(regex) || []).length
    termFreqs.set(term, count)
  }

  const maxFreq = Math.max(...Array.from(termFreqs.values()), 1)

  // Build metadata for each term
  for (const term of allTerms) {
    const freq = termFreqs.get(term) ?? 0
    const normalizedFreq = freq / maxFreq

    // Check section presence
    const inTitle = new RegExp(`\\b${escapeRegex(term)}\\b`, 'i').test(titleText)
    const inReq = new RegExp(`\\b${escapeRegex(term)}\\b`, 'i').test(reqText)
    const inQual = new RegExp(`\\b${escapeRegex(term)}\\b`, 'i').test(qualText)
    const inResp = new RegExp(`\\b${escapeRegex(term)}\\b`, 'i').test(respText)

    // Calculate importance
    let importance = normalizedFreq * 0.5 // Base from frequency
    if (inTitle) importance += 0.2
    if (inReq) importance += 0.15
    if (inResp) importance += 0.1

    // Cap at 1 and round
    importance = Math.min(1, importance)
    importance = Math.round(importance * 100) / 100

    meta.push({
      term,
      stem: term.toLowerCase(),
      importance,
      inTitle,
      inReq,
      inQual,
      inResp,
    })
  }

  // Sort by importance (descending)
  return meta.sort((a, b) => b.importance - a.importance)
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
