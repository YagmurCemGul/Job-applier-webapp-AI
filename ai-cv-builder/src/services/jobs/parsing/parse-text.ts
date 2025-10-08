/**
 * Step 27: Enhanced text parser with confidence scoring and inference
 */

import type { ParsedJob } from '@/types/ats.types'
import { detectLang } from './normalize'
import { splitSections } from './sections'
import { inferEmploymentType, inferSeniority, inferRemoteType } from './employment'
import { parseSalary } from './salary'
import { parseDates } from './dates'
import { extractEntities } from './entities'
import { extractKeywords } from './keywords'

/**
 * Parse plain text job posting with full inference and confidence scoring
 */
export async function parseJobText(
  raw: string,
  meta?: { url?: string; filename?: string; site?: string }
): Promise<ParsedJob> {
  const lang = detectLang(raw)
  const sections = splitSections(raw, lang)
  const ents = extractEntities(raw, sections, lang)
  const salary = parseSalary(raw, lang)
  const dates = parseDates(raw, lang)
  const keywords = extractKeywords(raw, sections, lang)

  return {
    // Core fields
    title: ents.title?.value ?? undefined,
    company: ents.company?.value ?? undefined,
    location: ents.location?.value ?? undefined,
    remoteType: inferRemoteType(raw, lang),
    employmentType: inferEmploymentType(raw, lang),
    seniority: inferSeniority(raw, lang),
    salary,
    sections,
    keywords,
    lang,
    source: { type: 'paste', url: meta?.url, filename: meta?.filename, site: meta?.site },

    // Extended fields
    postedAt: dates.postedAt?.value,
    deadlineAt: dates.deadlineAt?.value,
    recruiter: ents.recruiter?.value,

    // Confidence scores
    _conf: {
      title: ents.title,
      company: ents.company,
      location: ents.location,
      employmentType: { value: undefined, confidence: 0.5 }, // Heuristic-based, medium confidence
      seniority: { value: undefined, confidence: 0.5 },
      salary: { value: salary, confidence: salary ? 0.6 : 0 },
      postedAt: dates.postedAt,
      deadlineAt: dates.deadlineAt,
      recruiter: ents.recruiter,
      overall: 0, // Will be set in finalizeParsedJob
    },
  }
}
