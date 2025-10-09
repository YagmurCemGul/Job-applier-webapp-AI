/**
 * @fileoverview Outreach CRM & Sequencer types
 * Step 48: Networking CRM & Outreach Sequencer
 */

export type ProspectStatus = 'new'|'qualified'|'contacted'|'replied'|'intro_requested'|'intro_made'|'scheduled'|'unsubscribed'|'bounced'|'do_not_contact';
export type StepKind = 'email'|'task_manual'|'wait';
export type VariantKey = 'A'|'B';
export type MetricKey = 'sent'|'delivered'|'opens'|'clicks'|'replies'|'bounces'|'unsubs';
export type Channel = 'gmail'|'manual';
export type AbGoal = 'open_rate'|'reply_rate'|'click_rate';

export interface Prospect {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  company?: string;
  linkedin?: string;
  cityCountry?: string;
  tags: string[];
  status: ProspectStatus;
  notes?: string;
  lastContactISO?: string;
  listIds?: string[];
}

export interface ProspectList {
  id: string;
  name: string;
  description?: string;
  count?: number;
}

export interface Template {
  id: string;
  name: string;
  subject: string;
  html: string;
  footer?: string; // compliance footer with address/unsubscribe links
  variables: string[]; // e.g. ["firstName","role","company"]
  snippets?: Record<string,string>;
}

export interface SeqStep {
  id: string;
  kind: StepKind;
  waitDays?: number;            // for 'wait'
  subject?: string;             // for 'email'
  html?: string;                // for 'email'
  channel?: Channel;            // 'gmail' or 'manual'
  stopOnReply?: boolean;
  stopOnUnsub?: boolean;
}

export interface Sequence {
  id: string;
  name: string;
  description?: string;
  steps: SeqStep[];
  ab?: { enabled: boolean; goal: AbGoal; variants: Record<VariantKey, Partial<SeqStep>> };
  rules?: { throttlePerHour: number; dailyCap: number; quietHours: boolean };
}

export interface Campaign {
  id: string;
  name: string;
  sequenceId: string;
  listId: string;
  startedAt?: string;
  finishedAt?: string;
  status: 'draft'|'running'|'paused'|'finished';
  metrics: Record<MetricKey, number>;
}

export interface SendLog {
  id: string;
  campaignId: string;
  prospectId: string;
  stepId: string;
  variant?: VariantKey;
  gmailMsgId?: string;
  sentAt: string;
  status: 'queued'|'sent'|'bounced'|'failed';
  opens?: number;
  clicks?: number;
  replied?: boolean;
}

export interface TrackingEvent {
  id: string;
  logId: string;
  type: 'open'|'click'|'reply'|'bounce'|'unsub';
  at: string;
  meta?: Record<string,string>;
}

export interface Referral {
  id: string;
  prospectId: string;
  introducerEmail: string;
  introState: 'requested'|'sent'|'intro_made'|'declined';
  threadId?: string;
  notes?: string;
}

export interface SchedulerLink {
  id: string;
  title: string;
  tz: string;
  durationMin: number;
  availabilityHint?: string; // e.g., Mon–Thu 10:00–16:00
  url: string;
}

export interface Suppression {
  id: string;
  email: string;
  reason: 'unsub'|'bounce'|'manual';
  addedAt: string;
}

export interface CampaignReportExport {
  id: string;
  url?: string;
  kind: 'pdf'|'gdoc';
  createdAt: string;
}
