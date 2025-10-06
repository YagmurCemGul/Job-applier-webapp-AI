// Re-export all types from here
export * from './user.types'
export * from './cv.types'
export * from './api.types'
export * from './store.types'
export * from './job.types'
export * from './coverLetter.types'
export * from './customPrompt.types'
export * from './template.types'
export * from './cvData.types'
export * from './savedCV.types'
export * from './auth.types'
export * from './ats.types'
export * from './job.types'
export * from './variants.types'
export * from './export.types'
export * from './coverletter.types'
export * from './prompts.types'
export * from './ai.types'
export * from './jobPosting.types'
export * from './jobs.types'
export * from './searches.types'
export * from './apply.types'
export * from './applications.types'
export * from './outreach.types'
export * from './gmail.types'
export * from './calendar.types'
export * from './outreach.run.types'
export * from './interview.types'
export * from './scorecard.types'
export * from './transcript.types'
export * from './offer.types'
export * from './negotiation.types'
export * from './onboarding.types'
export * from './oneonone.types'
export * from './okr.types'

// Common types
export type ID = string
export type Timestamp = string | Date

export interface BaseEntity {
  id: ID
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type Language = 'en' | 'tr'

export type Theme = 'light' | 'dark' | 'system'

export interface APIResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
