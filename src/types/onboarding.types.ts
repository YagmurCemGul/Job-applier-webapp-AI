/**
 * Onboarding plan types for first 90 days
 */

export type PlanStage = 'draft' | 'active' | 'paused' | 'completed'
export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done'
export type ChecklistKind = 'it' | 'hr' | 'policies' | 'equipment' | 'other'

export interface PlanMilestone {
  id: string
  title: string
  targetDay: 7 | 14 | 30 | 45 | 60 | 90
  summary?: string
}

export interface PlanTask {
  id: string
  title: string
  details?: string
  milestoneId?: string
  status: TaskStatus
  dueISO?: string
  owner?: string // self by default
  tags?: string[]
  evidenceIds?: string[]
}

export interface ChecklistItem {
  id: string
  kind: ChecklistKind
  label: string
  done: boolean
  note?: string
}

export interface Stakeholder {
  id: string // email or contact id
  name: string
  email: string
  org?: string
  role?: string
  influence: 'low' | 'med' | 'high'
  interest: 'low' | 'med' | 'high'
  cadence?: 'weekly' | 'biweekly' | 'monthly' | 'ad_hoc'
  notes?: string
}

export interface EvidenceItem {
  id: string
  title: string
  kind: 'doc' | 'metric' | 'screenshot' | 'link' | 'note'
  url?: string
  text?: string
  createdAt: string
  tags?: string[]
  relatedTaskIds?: string[]
}

export interface OnboardingPlan {
  id: string
  applicationId: string // links Step 33
  role: string
  company: string
  startDateISO?: string
  stage: PlanStage
  lang: 'en' | 'tr'
  milestones: PlanMilestone[]
  tasks: PlanTask[]
  checklists: ChecklistItem[]
  stakeholders: Stakeholder[]
  evidence: EvidenceItem[]
  retentionDays: 30 | 60 | 90 | 180 | 365
  createdAt: string
  updatedAt: string
}
