import { BaseEntity } from './index'

export interface JobPosting extends BaseEntity {
  rawText: string
  parsed: {
    title?: string
    company?: string
    location?: string
    employmentType?: string
    experienceLevel?: string
    salary?: {
      min?: number
      max?: number
      currency?: string
    }
    requirements: string[]
    responsibilities: string[]
    skills: string[]
    keywords: string[]
  }
}

export interface JobAnalysis {
  matchScore: number
  missingSkills: string[]
  matchingSkills: string[]
  suggestions: string[]
  atsKeywords: string[]
}

export const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Internship',
  'Remote',
  'Hybrid',
  'On-site',
] as const

export const EXPERIENCE_LEVELS = [
  'Entry Level',
  'Mid Level',
  'Senior Level',
  'Lead',
  'Principal',
  'Executive',
] as const

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number]
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number]
