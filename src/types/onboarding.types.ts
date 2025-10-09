/**
 * @fileoverview Onboarding plan types for first 30/60/90 days.
 * @module types/onboarding
 */

export type PlanStage = 'draft' | 'active' | 'paused' | 'completed';
export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';
export type ChecklistKind = 'it' | 'hr' | 'policies' | 'equipment' | 'other';
export type MilestoneKey = 'd30' | 'd60' | 'd90';
export type Priority = 'P0' | 'P1' | 'P2';
export type RiskLevel = 'low' | 'medium' | 'high';
export type CadenceKind = 'manager_1_1' | 'mentor' | 'buddy' | 'team_ceremony' | 'cross_func' | 'skip_level';
export type LearningKind = 'course' | 'doc' | 'repo' | 'person' | 'video';

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

/** SMART goal for 30/60/90 plan (Step 45). */
export interface SmartGoal {
  id: string;
  title: string;
  description: string;
  metric?: string;           // success KPI
  baseline?: string;
  target?: string;
  dueISO?: string;
  priority: Priority;
  milestone: MilestoneKey;
  status: 'not_started' | 'in_progress' | 'blocked' | 'done';
  tags: string[];
}

/** 30/60/90 Plan with SMART goals (Step 45). */
export interface Plan {
  id: string;
  company?: string;
  role?: string;
  startISO?: string;
  summary?: string;
  goals: SmartGoal[];
  dependencies: string[];     // access/tools/people
  createdAt: string;
  updatedAt: string;
}

/** Checklist item for IT/HR/policies/equipment setup. */
export interface ChecklistItem {
  id: string;
  kind?: ChecklistKind;
  label: string;
  done: boolean;
  dueISO?: string;
  notes?: string;
  note?: string; // legacy
}

/** Key stakeholder in the organization. */
export interface Stakeholder {
  id: string; // email or contact id
  name: string;
  email?: string;
  org?: string;
  role?: string;
  power?: 1 | 2 | 3 | 4 | 5; // Step 45
  interest?: 1 | 2 | 3 | 4 | 5; // Step 45
  influence?: 'low' | 'med' | 'high'; // legacy
  cadence?: CadenceKind | 'weekly' | 'biweekly' | 'monthly' | 'ad_hoc';
  notes?: string;
}

/** Cadence meeting event (Step 45). */
export interface CadenceEvent {
  id: string;
  kind: CadenceKind;
  title: string;
  attendees: string[];
  tz: string;
  startISO: string;
  endISO: string;
  recurrence?: 'weekly' | 'biweekly' | 'monthly';
  quietRespect: boolean;
  calendarEventId?: string;
}

/** Weekly status report (Step 45). */
export interface WeeklyReport {
  id: string;
  weekStartISO: string;
  accomplishments: string[];
  risks: string[];
  asks: string[];
  nextWeek: string[];
  html?: string;
  sentGmailId?: string;
  docUrl?: string;
}

/** Risk item with probability/impact (Step 45). */
export interface RiskItem {
  id: string;
  title: string;
  probability: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  level: RiskLevel;
  owner?: string;
  mitigation: string;
  dueISO?: string;
  status: 'open' | 'watch' | 'mitigating' | 'closed';
}

/** Learning plan item (Step 45). */
export interface LearningItem {
  id: string;
  kind: LearningKind;
  title: string;
  url?: string;
  owner?: string;
  dueISO?: string;
  status: 'planned' | 'in_progress' | 'done';
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
