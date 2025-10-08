import type { ParsedJob } from './ats.types'

/**
 * Remote work type classification
 */
export type RemoteType = 'remote' | 'hybrid' | 'onsite' | 'unknown'

/**
 * Employment type classification
 */
export type EmploymentType =
  | 'full_time'
  | 'part_time'
  | 'contract'
  | 'intern'
  | 'temporary'
  | 'freelance'
  | 'other'

/**
 * Seniority level classification
 */
export type Seniority =
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

/**
 * Salary information with currency and period
 */
export interface JobSalary {
  min?: number
  max?: number
  currency?: string // USD, EUR, TRY, etc.
  period?: 'y' | 'm' | 'd' | 'h'
}

/**
 * Job source information (URL and site identifier)
 */
export interface JobSource {
  url?: string
  site?: string // linkedin, indeed, glassdoor, kariyer, etc.
}

/**
 * Recruiter contact information
 */
export interface RecruiterContact {
  name?: string
  email?: string
}

/**
 * Lightweight ATS analysis summary for job posting
 */
export interface JobATSShort {
  score?: number
  matched?: number
  missing?: number
  at?: Date
}

/**
 * Job posting status in application workflow
 */
export type JobStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected'

/**
 * Complete job posting document with structured metadata
 */
export interface JobPosting {
  id: string // document id
  hash: string // stable hash for dedupe (based on text + url)
  title: string
  company: string
  location?: string
  remoteType: RemoteType
  employmentType?: EmploymentType
  seniority?: Seniority
  salary?: JobSalary
  source?: JobSource
  recruiter?: RecruiterContact
  postedAt?: Date
  deadlineAt?: Date
  tags?: string[]
  notes?: string

  // parsed raw
  rawText: string
  parsed: ParsedJob // from step 25

  // workflow state
  status?: JobStatus
  favorite?: boolean

  // lightweight ATS cache
  lastATS?: JobATSShort

  createdAt: Date
  updatedAt: Date
}
