import type { CVData } from './cvData.types'

/**
 * Metadata for a CV variant
 */
export interface VariantMeta {
  id: string
  name: string // user-friendly variant name, e.g., "Acme Backend v1"
  linkedJobId?: string // Saved Job id (Step 26)
  createdAt: Date
  updatedAt: Date
  createdBy?: string // user id if auth exists
  notes?: string // short commit message
  atsAtCreate?: {
    score: number
    matched: number
    missing: number
  } // snapshot
}

/**
 * A CV variant with full CV snapshot and history
 */
export interface CVVariant {
  meta: VariantMeta
  cv: CVData // full CV snapshot for this variant
  baseCvId: string // reference to the base CV identity/version key
  history: Array<{
    id: string
    at: Date
    note?: string
    cv: CVData
  }>
}

/**
 * Structured diff between two CV versions
 */
export interface VariantDiff {
  summary?: DiffBlock
  skills?: DiffBlock
  experience?: DiffBlock[]
  education?: DiffBlock[]
  contact?: DiffBlock
}

/**
 * Type of change in a diff
 */
export type DiffChange = 'added' | 'removed' | 'modified' | 'unchanged'

/**
 * A single diff block representing changes in a section
 */
export interface DiffBlock {
  path: string // e.g., "summary" or "experience.0.description"
  before?: string
  after?: string
  change: DiffChange
  inline?: Array<{ text: string; change: DiffChange }>
}
