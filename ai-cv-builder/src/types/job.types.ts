export interface JobPosting {
  id: string
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
  createdAt: Date
  updatedAt: Date
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

// Step 26: Job Posting service result types
export interface SaveJobResult {
  ok: boolean
  id?: string
  error?: string
}

export interface DeleteJobResult {
  ok: boolean
  error?: string
}

export interface ListJobsResult {
  ok: boolean
  items?: import('./jobPosting.types').JobPosting[]
  error?: string
}