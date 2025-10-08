/**
 * Outreach Sequences & Email Templates
 * For automated follow-up campaigns
 */

/**
 * Email template with variable substitution
 * Variables: {{Company}}, {{Role}}, {{YourName}}, {{RecruiterName}}
 */
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  lang: 'en' | 'tr';
  createdAt: string;
  updatedAt: string;
}

/**
 * Step in an outreach sequence
 */
export interface SequenceStep {
  id: string;
  offsetDays: number;
  sendTime?: string;
  templateId: string;
}

/**
 * Complete outreach sequence with multiple steps
 */
export interface OutreachSequence {
  id: string;
  name: string;
  steps: SequenceStep[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
