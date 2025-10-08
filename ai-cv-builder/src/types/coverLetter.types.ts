export interface CoverLetter {
  id: string
  content: string
  jobTitle?: string
  companyName?: string
  customPrompt?: string
  createdAt: Date
  updatedAt: Date
}

export interface CoverLetterRequest {
  cvText: string
  jobPosting: string
  jobTitle?: string
  companyName?: string
  customPrompt?: string
  tone?: 'professional' | 'casual' | 'enthusiastic' | 'formal'
  length?: 'short' | 'medium' | 'long'
}

export interface CoverLetterResult {
  content: string
  metadata: {
    wordCount: number
    characterCount: number
    tone: string
    suggestions?: string[]
  }
}

export const COVER_LETTER_TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'enthusiastic', label: 'Enthusiastic' },
  { value: 'formal', label: 'Formal' },
] as const

export const COVER_LETTER_LENGTHS = [
  { value: 'short', label: 'Short (200-250 words)' },
  { value: 'medium', label: 'Medium (300-400 words)' },
  { value: 'long', label: 'Long (400-500 words)' },
] as const

// Step 30 - Extended Types
export type CLTone = 'formal' | 'friendly' | 'enthusiastic'
export type CLLength = 'short' | 'medium' | 'long'
export type CLLang = 'en' | 'tr'

/**
 * Cover Letter Metadata
 */
export interface CoverLetterMeta {
  id: string
  name: string // e.g., "Acme Backend — v1"
  linkedJobId?: string // Saved Job id
  linkedVariantId?: string // Variant id (Step 29)
  favorite?: boolean
  createdAt: Date
  updatedAt: Date
  notes?: string // commit message
}

/**
 * Complete Cover Letter Document
 */
export interface CoverLetterDoc {
  meta: CoverLetterMeta
  content: string // HTML from editor (sanitized on save)
  plain?: string // cached plain text
  tone: CLTone
  length: CLLength
  lang: CLLang
  templateId: string
  variables: Record<string, string> // company, role, recruiterName, etc.
  promptsUsed?: string[] // prompt ids applied
  history: Array<{
    id: string
    at: Date
    note?: string
    content: string // HTML snapshot
  }>
}