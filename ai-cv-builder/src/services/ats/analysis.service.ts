import type { ATSAnalysisResult, ATSSuggestion, ParsedJob } from '@/types/ats.types'
import type { CVData } from '@/types/cvData.types'
import { normalizeText } from './textUtils'

/**
 * Analyze CV against a parsed job posting
 * Returns ATS score and actionable suggestions
 */
export function analyzeCVAgainstJob(cv: CVData, job: ParsedJob): ATSAnalysisResult {
  const id = cryptoId()
  const jobHash = hash(normalizeText(job.sections.raw ?? JSON.stringify(job)))
  const { matchedKeywords, missingKeywords } = matchKeywords(cv, job)
  const suggestions: ATSSuggestion[] = [
    ...keywordSuggestions(missingKeywords),
    ...sectionSuggestions(cv, job),
    ...contactSuggestions(cv),
    ...lengthSuggestions(cv),
    ...experienceEducationSuggestions(cv, job),
  ]
  const score = scoreFrom(matchedKeywords.length, missingKeywords.length, cv, suggestions)

  return {
    id,
    jobHash,
    score,
    suggestions,
    matchedKeywords,
    missingKeywords,
    createdAt: new Date(),
  }
}

/**
 * Match job keywords against CV content
 */
function matchKeywords(
  cv: CVData,
  job: ParsedJob
): { matchedKeywords: string[]; missingKeywords: string[] } {
  const cvText = normalizeText(stringifyCV(cv))
  const jobKeywords = Array.from(
    new Set((job.keywords ?? []).map(normalizeText).filter(Boolean))
  )
  const matched: string[] = []
  const missing: string[] = []
  jobKeywords.forEach((kw) => (cvText.includes(kw) ? matched.push(kw) : missing.push(kw)))
  return { matchedKeywords: matched, missingKeywords: missing }
}

/**
 * Generate keyword-based suggestions
 */
function keywordSuggestions(missing: string[]): ATSSuggestion[] {
  return missing.slice(0, 30).map((kw) => ({
    id: cryptoId(),
    category: 'Keywords',
    severity: 'critical',
    title: `Add keyword: ${kw}`,
    detail: `This job mentions "${kw}" but it is missing in your resume.`,
    target: { section: 'summary' },
    action: { type: 'add', payload: { text: ` ${kw}` } },
    applied: false,
  }))
}

/**
 * Generate section-based suggestions
 */
function sectionSuggestions(cv: CVData, job: ParsedJob): ATSSuggestion[] {
  const out: ATSSuggestion[] = []
  if (!cv.summary || cv.summary.trim().length < 40) {
    out.push({
      id: cryptoId(),
      category: 'Sections',
      severity: 'high',
      title: 'Improve Summary',
      detail: 'Add a concise, keyword-rich Summary of at least 40–80 words.',
      target: { section: 'summary' },
      action: { type: 'add', payload: { text: ' Experienced professional with ...' } },
      applied: false,
    })
  }
  if (!cv.skills || cv.skills.length === 0) {
    out.push({
      id: cryptoId(),
      category: 'Skills',
      severity: 'high',
      title: 'Add Skills section',
      detail: 'Provide 8–15 skills aligned with the posting.',
      applied: false,
    })
  }
  return out
}

/**
 * Generate contact information suggestions
 */
function contactSuggestions(cv: CVData): ATSSuggestion[] {
  const out: ATSSuggestion[] = []
  const missing = []
  if (!cv.personalInfo.email) missing.push('Email')
  if (!cv.personalInfo.phone) missing.push('Phone')
  if (missing.length) {
    out.push({
      id: cryptoId(),
      category: 'Contact',
      severity: 'medium',
      title: `Missing contact: ${missing.join(', ')}`,
      detail: 'Add complete contact details aligned with your region.',
      applied: false,
    })
  }
  return out
}

/**
 * Generate length-based suggestions
 */
function lengthSuggestions(cv: CVData): ATSSuggestion[] {
  const wordCount = stringifyCV(cv).split(/\s+/).filter(Boolean).length
  if (wordCount > 1200) {
    return [
      {
        id: cryptoId(),
        category: 'Length',
        severity: 'medium',
        title: 'Resume is too long',
        detail: 'Aim for 1–2 pages. Trim older roles and low-impact bullets.',
        applied: false,
      },
    ]
  }
  if (wordCount < 200) {
    return [
      {
        id: cryptoId(),
        category: 'Length',
        severity: 'low',
        title: 'Resume is too short',
        detail: 'Add more detail to experiences, quantify achievements.',
        applied: false,
      },
    ]
  }
  return []
}

/**
 * Generate experience and education suggestions
 */
function experienceEducationSuggestions(cv: CVData, job: ParsedJob): ATSSuggestion[] {
  const out: ATSSuggestion[] = []
  if (!cv.experience || cv.experience.length === 0) {
    out.push({
      id: cryptoId(),
      category: 'Experience',
      severity: 'critical',
      title: 'Add at least one experience',
      detail: 'Include role title, company, dates, and 3–5 quantified bullets.',
      applied: false,
    })
  }
  if (!cv.education || cv.education.length === 0) {
    out.push({
      id: cryptoId(),
      category: 'Education',
      severity: 'high',
      title: 'Add Education',
      detail: 'Include degree, school, field of study, and dates.',
      applied: false,
    })
  }
  return out
}

/**
 * Convert CV to searchable text
 */
function stringifyCV(cv: CVData): string {
  const skills = (cv.skills ?? []).map((s) => s.name).join(' ')
  const exp = (cv.experience ?? [])
    .map((e) => [e.title, e.company, e.description].join(' '))
    .join(' ')
  const edu = (cv.education ?? [])
    .map((e) => [e.school, e.degree, e.fieldOfStudy].join(' '))
    .join(' ')
  return [cv.summary ?? '', skills, exp, edu].join(' ')
}

/**
 * Calculate ATS score from analysis data
 */
function scoreFrom(
  matched: number,
  missing: number,
  cv: CVData,
  suggestions: ATSSuggestion[]
): number {
  const base = 50 + Math.min(40, matched * 1.5) - Math.min(30, missing)
  const penalty = suggestions.filter((s) => s.severity === 'critical').length * 2
  return Math.max(0, Math.min(100, Math.round(base - penalty)))
}

/**
 * Simple hash function for job content
 */
function hash(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return String(h >>> 0)
}

/**
 * Generate unique ID
 */
function cryptoId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id_${Math.random().toString(36).slice(2)}`
}
