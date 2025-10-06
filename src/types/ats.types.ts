import type { CVData } from './cvData.types'

export type ATSCategory =
  | 'Keywords'
  | 'Formatting'
  | 'Sections'
  | 'Length'
  | 'Experience'
  | 'Education'
  | 'Skills'
  | 'Contact'

export type ATSSeverity = 'critical' | 'high' | 'medium' | 'low'

export interface ATSTarget {
  section: keyof CVData
  path?: string[]
}

export type ATSActionType = 'add' | 'replace' | 'remove' | 'reorder'

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

export interface ATSKeywordMeta {
  term: string
  stem?: string
  importance: number
  inTitle?: boolean
  inReq?: boolean
  inQual?: boolean
  inResp?: boolean
}

export interface ATSScoringWeights {
  keywords: number
  sections: number
  length: number
  experience: number
  formatting: number
}

export interface ATSAnalysisResult {
  id: string
  jobHash: string
  score: number
  suggestions: ATSSuggestion[]
  matchedKeywords: string[]
  missingKeywords: string[]
  createdAt: Date
  // Step 28 extensions (optional, non-breaking)
  keywordMeta?: ATSKeywordMeta[]
  weightsUsed?: ATSScoringWeights
}

export interface FieldConfidence<T> {
  value?: T
  confidence: number
}

export interface ParsedJob {
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
  source?: { type: 'paste' | 'url' | 'file'; url?: string; filename?: string; site?: string }

  // Extended optional fields (Step 27)
  employmentType?:
    | 'full_time'
    | 'part_time'
    | 'contract'
    | 'intern'
    | 'temporary'
    | 'freelance'
    | 'other'
  seniority?:
    | 'intern'
    | 'junior'
    | 'mid'
    | 'senior'
    | 'lead'
    | 'manager'
    | 'director'
    | 'vp'
    | 'c_level'
    | 'na'
  postedAt?: Date
  deadlineAt?: Date
  recruiter?: { name?: string; email?: string }

  // Confidence scores (per-field & overall)
  _conf?: {
    title?: FieldConfidence<string>
    company?: FieldConfidence<string>
    location?: FieldConfidence<string>
    employmentType?: FieldConfidence<string>
    seniority?: FieldConfidence<string>
    salary?: FieldConfidence<{
      min?: number
      max?: number
      currency?: string
      period?: 'y' | 'm' | 'd' | 'h'
    }>
    postedAt?: FieldConfidence<Date>
    deadlineAt?: FieldConfidence<Date>
    recruiter?: FieldConfidence<{ name?: string; email?: string }>
    overall: number
  }
}
