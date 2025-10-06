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
export * from './jobPosting.types'

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
