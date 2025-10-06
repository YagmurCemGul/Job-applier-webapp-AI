/**
 * Performance review types
 */

export type ReviewKind = 'mid_year' | 'year_end' | 'probation' | 'promotion'

export type ReviewStage =
  | 'draft'
  | 'collecting'
  | 'synthesizing'
  | 'calibration'
  | 'finalized'
  | 'archived'

export type Competency =
  | 'execution'
  | 'craft'
  | 'leadership'
  | 'collaboration'
  | 'communication'
  | 'impact'

export interface ReviewCycle {
  id: string
  applicationId?: string // Step 33
  planId?: string // Step 38
  title: string
  kind: ReviewKind
  stage: ReviewStage
  startISO: string
  endISO: string
  deadlines: Array<{
    id: string
    label: string
    atISO: string
    kind:
      | 'self_review'
      | 'feedback_due'
      | 'calibration'
      | 'submit'
      | 'other'
  }>
  retentionDays: 30 | 60 | 90 | 180 | 365
  createdAt: string
  updatedAt: string
}

export interface ImpactEntry {
  id: string
  cycleId: string
  source: 'evidence' | 'okr' | 'weekly' | 'oneonone' | 'manual'
  title: string
  detail?: string
  dateISO?: string
  metrics?: Array<{
    label: string
    value: number
    unit?: string
  }>
  competency?: Competency
  confidence?: 0 | 1 | 2 | 3 | 4 | 5
  links?: string[]
  score?: number // normalized 0..1 for ranking
}

export interface FeedbackRequest {
  id: string
  cycleId: string
  reviewerEmail: string
  reviewerName?: string
  relationship?:
    | 'manager'
    | 'peer'
    | 'stakeholder'
    | 'direct_report'
    | 'other'
  sentAt?: string
  respondedAt?: string
  anonymous?: boolean
  status: 'pending' | 'sent' | 'responded' | 'reminded'
}

export interface FeedbackResponse {
  id: string
  requestId: string
  cycleId: string
  receivedAt: string
  anonymousView?: boolean
  body: string
  labels?: string[] // e.g., 'strength', 'area_for_growth'
  sentiment?: 'positive' | 'neutral' | 'negative'
  redactedBody?: string
}

export interface SelfReview {
  id: string
  cycleId: string
  lang: 'en' | 'tr'
  overview: string
  highlights: string[]
  growthAreas: string[]
  nextObjectives: string[]
  wordCount: number
  clarityScore: number // 0..1
  generatedAt?: string
  updatedAt: string
}
