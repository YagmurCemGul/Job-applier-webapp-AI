export type CLTone = 'formal' | 'friendly' | 'enthusiastic'
export type CLLength = 'short' | 'medium' | 'long'
export type CLLang = 'en' | 'tr'

export interface CoverLetterMeta {
  id: string
  name: string
  linkedJobId?: string
  linkedVariantId?: string
  favorite?: boolean
  createdAt: Date
  updatedAt: Date
  notes?: string
}

export interface CoverLetterDoc {
  meta: CoverLetterMeta
  content: string
  plain?: string
  tone: CLTone
  length: CLLength
  lang: CLLang
  templateId: string
  variables: Record<string, string>
  promptsUsed?: string[]
  history: Array<{
    id: string
    at: Date
    note?: string
    content: string
  }>
}
