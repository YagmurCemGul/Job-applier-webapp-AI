import type { CVData } from './cvData.types'

/**
 * ATS analysis categories
 */
export type ATSCategory =
  | 'Keywords'
  | 'Formatting'
  | 'Sections'
  | 'Length'
  | 'Experience'
  | 'Education'
  | 'Skills'
  | 'Contact'

/**
 * Severity levels for ATS suggestions
 */
export type ATSSeverity = 'critical' | 'high' | 'medium' | 'low'

/**
 * Target location in CV for applying suggestions
 */
export interface ATSTarget {
  section: keyof CVData
  path?: string[]
}

/**
 * Types of actions that can be applied to CV
 */
export type ATSActionType = 'add' | 'replace' | 'remove' | 'reorder'

/**
 * Individual ATS suggestion with action payload
 */
export interface ATSSuggestion {
  id: string
  category: ATSCategory
  severity: ATSSeverity
  title: string
  detail: string
  target?: ATSTarget
  action?: { type: ATSActionType; payload?: unknown }
  applied: boolean
}

/**
 * Complete ATS analysis result
 */
export interface ATSAnalysisResult {
  id: string
  jobHash: string
  score: number
  suggestions: ATSSuggestion[]
  matchedKeywords: string[]
  missingKeywords: string[]
  createdAt: Date
}

/**
 * Field confidence wrapper for parsed values
 */
export interface FieldConfidence<T> {
  value?: T
  confidence: number // 0..1
}

/**
 * Parsed job posting structure (Step 27: extended with optional fields & confidences)
 */
export interface ParsedJob {
  // Core fields from Step 25
  title?: string
  company?: string
  location?: string
  remoteType?: 'remote' | 'hybrid' | 'onsite' | 'unknown'
  salary?: {
    min?: number
    max?: number
    currency?: string
    period?: 'y' | 'm' | 'd' | 'h'
  }
  sections: {
    summary?: string
    responsibilities?: string[]
    requirements?: string[]
    qualifications?: string[]
    benefits?: string[]
    raw?: string
  }
  keywords: string[]
  lang: 'en' | 'tr' | 'unknown'
  source?: {
    type: 'paste' | 'url' | 'file'
    url?: string
    filename?: string
    site?: string
  }

  // Step 27: Extended optional fields
  employmentType?: 'full_time' | 'part_time' | 'contract' | 'intern' | 'temporary' | 'freelance' | 'other'
  seniority?: 'intern' | 'junior' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'vp' | 'c_level' | 'na'
  postedAt?: Date
  deadlineAt?: Date
  recruiter?: { name?: string; email?: string }

  // Step 27: Per-field and overall confidence scores
  _conf?: {
    title?: FieldConfidence<string>
    company?: FieldConfidence<string>
    location?: FieldConfidence<string>
    employmentType?: FieldConfidence<string>
    seniority?: FieldConfidence<string>
    salary?: FieldConfidence<{ min?: number; max?: number; currency?: string; period?: 'y' | 'm' | 'd' | 'h' }>
    postedAt?: FieldConfidence<Date>
    deadlineAt?: FieldConfidence<Date>
    recruiter?: FieldConfidence<{ name?: string; email?: string }>
    overall: number // 0..1
  }
}

/**
 * Result of fetching job from URL (Step 27: enhanced with html & meta)
 */
export interface FetchJobUrlResult {
  ok: boolean
  text?: string
  html?: string
  status?: number
  error?: string
  meta?: { url?: string; site?: string }
}
