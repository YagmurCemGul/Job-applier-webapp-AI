/**
 * Promotion and calibration types
 */

import type { Competency } from './review.types'

export interface RubricExpectation {
  level: string // e.g., "L4", "Senior"
  competency: Competency
  description: string
}

export interface CalibrationNote {
  id: string
  cycleId: string
  note: string
  risk?: 'low' | 'med' | 'high'
  createdAt: string
}

export interface PromotionCase {
  id: string
  cycleId: string
  targetLevel: string
  narrative: string // scope increase story
  supportingQuotes: string[] // selected feedback snippets
  attachments?: string[] // links to docs/artifacts
  version: number
  updatedAt: string
}
