/**
 * @fileoverview Onboarding plan types for first 30/60/90 days.
 * @module types/onboarding
 */

export type PlanStage = 'draft' | 'active' | 'paused' | 'completed';
export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';
export type ChecklistKind = 'it' | 'hr' | 'policies' | 'equipment' | 'other';

/** Milestone in a 30/60/90 day plan. */
export interface PlanMilestone {
  id: string;
  title: string;
  targetDay: 7 | 14 | 30 | 45 | 60 | 90;
  summary?: string;
}

/** Task within an onboarding plan. */
export interface PlanTask {
  id: string;
  title: string;
  details?: string;
  milestoneId?: string;
  status: TaskStatus;
  dueISO?: string;
  owner?: string; // self by default
  tags?: string[];
  evidenceIds?: string[];
}

/** Checklist item for IT/HR/policies/equipment setup. */
export interface ChecklistItem {
  id: string;
  kind: ChecklistKind;
  label: string;
  done: boolean;
  note?: string;
}

/** Key stakeholder in the organization. */
export interface Stakeholder {
  id: string; // email or contact id
  name: string;
  email: string;
  org?: string;
  role?: string;
  influence: 'low' | 'med' | 'high';
  interest: 'low' | 'med' | 'high';
  cadence?: 'weekly' | 'biweekly' | 'monthly' | 'ad_hoc';
  notes?: string;
}

/** Evidence item (doc, metric, screenshot, link, note). */
export interface EvidenceItem {
  id: string;
  title: string;
  kind: 'doc' | 'metric' | 'screenshot' | 'link' | 'note';
  url?: string;
  text?: string;
  createdAt: string;
  tags?: string[];
  relatedTaskIds?: string[];
}

/** Complete onboarding plan. */
export interface OnboardingPlan {
  id: string;
  applicationId: string; // links Step 33
  role: string;
  company: string;
  startDateISO?: string;
  stage: PlanStage;
  lang: 'en' | 'tr';
  milestones: PlanMilestone[];
  tasks: PlanTask[];
  checklists: ChecklistItem[];
  stakeholders: Stakeholder[];
  evidence: EvidenceItem[];
  retentionDays: 30 | 60 | 90 | 180 | 365;
  createdAt: string;
  updatedAt: string;
}
