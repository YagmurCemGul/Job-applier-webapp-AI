export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  lang: 'en' | 'tr'
  createdAt: string
  updatedAt: string
}

export interface SequenceStep {
  id: string
  offsetDays: number
  sendTime?: string
  templateId: string
}

export interface OutreachSequence {
  id: string
  name: string
  steps: SequenceStep[]
  active: boolean
  createdAt: string
  updatedAt: string
}
