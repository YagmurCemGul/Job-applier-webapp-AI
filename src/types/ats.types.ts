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

export interface ATSAnalysisResult {
  id: string
  jobHash: string
  score: number
  suggestions: ATSSuggestion[]
  matchedKeywords: string[]
  missingKeywords: string[]
  createdAt: Date
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
  source?: { type: 'paste' | 'url' | 'file'; url?: string; filename?: string }
}
