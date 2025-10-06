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
