export type StepChannel = 'email'|'task'|'calendar';
export type QuietHours = { startHH: number; endHH: number; tz?: string };

export interface TemplateVar { key: string; label: string; sample?: string }

export interface Template {
  id: string;
  name: string;
  subject: string;
  bodyHtml: string;
  variables: TemplateVar[];
  category?: 'referral_ask'|'intro_request'|'recruiter_ping'|'thank_you'|'follow_up';
}

export interface SequenceStep {
  id: string;
  dayOffset: number;        // days after step 0
  channel: StepChannel;
  templateId?: string;      // for 'email'
  title?: string;           // for task/calendar
  minutesAfter?: number;    // for finer control
}

export interface Sequence {
  id: string;
  name: string;
  steps: SequenceStep[];
  maxPerDay: number;
  quiet?: QuietHours;
  unsubscribeFooter?: boolean;
}

export interface SequenceRun {
  id: string;
  sequenceId: string;
  contactId: string;
  startedAt: string;
  status: 'scheduled'|'running'|'paused'|'finished'|'failed';
  history: Array<{ at: string; stepId: string; status: 'queued'|'sent'|'skipped'|'error'; messageId?: string; note?: string }>;
}
