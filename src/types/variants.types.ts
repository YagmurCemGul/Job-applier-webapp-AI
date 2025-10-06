import type { CVData } from './cvData.types'

export interface VariantMeta {
  id: string
  name: string
  linkedJobId?: string
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  notes?: string
  atsAtCreate?: { score: number; matched: number; missing: number }
}

export interface CVVariant {
  meta: VariantMeta
  cv: CVData
  baseCvId: string
  history: Array<{
    id: string
    at: Date
    note?: string
    cv: CVData
  }>
}

export interface VariantDiff {
  summary?: DiffBlock
  skills?: DiffBlock
  experience?: DiffBlock[]
  education?: DiffBlock[]
  contact?: DiffBlock
}

export type DiffChange = 'added' | 'removed' | 'modified' | 'unchanged'

export interface DiffBlock {
  path: string
  before?: string
  after?: string
  change: DiffChange
  inline?: Array<{ text: string; change: DiffChange }>
}
