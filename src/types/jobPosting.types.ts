import type { ParsedJob } from './ats.types'

export type RemoteType = 'remote' | 'hybrid' | 'onsite' | 'unknown'

export type EmploymentType =
  | 'full_time'
  | 'part_time'
  | 'contract'
  | 'intern'
  | 'temporary'
  | 'freelance'
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
  | 'c_level'
  | 'na'

export interface JobSalary {
  min?: number
  max?: number
  currency?: string
  period?: 'y' | 'm' | 'd' | 'h'
}

export interface JobSource {
  url?: string
  site?: string
}

export interface RecruiterContact {
  name?: string
  email?: string
}

export interface JobATSShort {
  score?: number
  matched?: number
  missing?: number
  at?: Date
}

export interface JobPosting {
  id: string
  hash: string
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
  rawText: string
  parsed: ParsedJob
  status?: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected'
  favorite?: boolean
  lastATS?: JobATSShort
  createdAt: Date
  updatedAt: Date
}
