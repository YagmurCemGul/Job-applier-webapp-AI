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
 * Parsed job posting structure
 */
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
  source?: {
    type: 'paste' | 'url' | 'file'
    url?: string
    filename?: string
  }
}

/**
 * Result of fetching job from URL
 */
export interface FetchJobUrlResult {
  ok: boolean
  text?: string
  status?: number
  error?: string
}
