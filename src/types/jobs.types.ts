export type JobSourceKind = 'api' | 'rss' | 'html'
export type EmploymentType =
  | 'full-time'
  | 'part-time'
  | 'contract'
  | 'internship'
  | 'temporary'
  | 'other'
export type Seniority =
  | 'intern'
  | 'junior'
  | 'mid'
  | 'senior'
  | 'lead'
  | 'manager'
  | 'director'
  | 'vp'
  | 'cxo'
  | 'unspecified'

export interface JobRaw {
  id: string
  url: string
  source: { name: string; kind: JobSourceKind; domain: string }
  title?: string
  company?: string
  location?: string
  remote?: boolean
  postedAt?: string
  description?: string
  payload?: any
  fetchedAt: string
}

export interface SalaryRange {
  currency?: string
  min?: number
  max?: number
  period?: 'year' | 'month' | 'day' | 'hour'
}

export interface JobNormalized {
  id: string
  sourceId: string
  title: string
  company: string
  location: string
  locationNorm?: { city?: string; country?: string; isoCountry?: string }
  remote?: boolean
  employmentType?: EmploymentType
  seniority?: Seniority
  salary?: SalaryRange
  postedAt?: string
  descriptionText: string
  descriptionHtml?: string
  keywords?: string[]
  url: string
  source: JobRaw['source']
  createdAt: string
  updatedAt: string
  fingerprint: string
  score?: number
}

export interface FetchLog {
  id: string
  source: string
  startedAt: string
  finishedAt?: string
  ok: boolean
  message?: string
  created: number
  updated: number
  skipped: number
}

export interface SourceConfig {
  key: string
  enabled: boolean
  kind: JobSourceKind
  domain: string
  params?: Record<string, string>
  headers?: Record<string, string>
  rateLimitPerMin?: number
  legalMode?: boolean
}
