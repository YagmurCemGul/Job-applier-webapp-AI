import type { ParsedJob } from '@/types/ats.types'
import { detectLang } from './normalize'
import { splitSections } from './sections'
import { inferEmploymentType, inferSeniority, inferRemoteType } from './employment'
import { parseSalary } from './salary'
import { parseDates } from './dates'
import { extractEntities } from './entities'
import { extractKeywords } from './keywords'

/**
 * Parse job posting from plain text
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

  const employmentType = inferEmploymentType(raw, lang)
  const seniority = inferSeniority(raw, lang)
  const remoteType = inferRemoteType(raw, lang)

  return {
    title: ents.title?.value ?? undefined,
    company: ents.company?.value ?? undefined,
    location: ents.location?.value ?? undefined,
    remoteType,
    employmentType,
    seniority,
    salary,
    sections,
    keywords,
    lang,
    source: { type: 'paste', url: meta?.url, filename: meta?.filename, site: meta?.site },
    postedAt: dates.postedAt?.value,
    deadlineAt: dates.deadlineAt?.value,
    recruiter: ents.recruiter?.value,
    _conf: {
      title: ents.title,
      company: ents.company,
      location: ents.location,
      employmentType: { value: employmentType, confidence: 0.5 },
      seniority: { value: seniority, confidence: 0.5 },
      salary: { value: salary, confidence: salary ? 0.6 : 0 },
      postedAt: dates.postedAt,
      deadlineAt: dates.deadlineAt,
      recruiter: ents.recruiter,
      overall: 0, // Computed in finalizeParsedJob
    },
  }
}
