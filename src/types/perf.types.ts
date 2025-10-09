/**
 * Performance Review & Promotion Readiness Types
 * 
 * Defines types for 360 feedback, evidence linking, review cycles,
 * calibration, rating simulation, promotion readiness, and packet export.
 */

export type ReviewCycleKind = 'mid_year' | 'year_end' | 'probation' | 'custom';
export type ReviewerRole = 'manager' | 'peer' | 'cross_func' | 'skip_level' | 'direct_report';
export type RubricKey = 'clarity' | 'structure' | 'impact' | 'ownership' | 'collaboration' | 'craft';

/**
 * Template for structured 360 feedback forms.
 */
export interface FeedbackTemplate {
  id: string;
  name: string;
  sections: Array<{ key: string; title: string; prompt: string; maxChars?: number }>;
  rubric?: RubricKey[];
}

/**
 * Outbound feedback request sent via email.
 */
export interface FeedbackRequest {
  id: string;
  toEmail: string;
  toName?: string;
  role: ReviewerRole;
  cycleId?: string;
  subject: string;
  messageHtml: string;
  dueISO?: string;
  sentAt?: string;
  reminderAt?: string;
  status: 'draft' | 'sent' | 'returned' | 'declined' | 'expired';
  token: string; // link token for form (local-only)
}

/**
 * Inbound feedback response from reviewer.
 */
export interface FeedbackResponse {
  id: string;
  requestId: string;
  receivedAt: string;
  answers: Record<string, string>;
  rubric?: Record<RubricKey, number>; // 0..4
  quotes?: string[];
}

/**
 * Link between a SMART goal and a concrete evidence artifact.
 */
export interface EvidenceLink {
  id: string;
  goalId: string; // from Step 45 SMART goals
  source: 'evidence' | 'portfolio' | 'interview' | 'review';
  refId: string; // external store id
  title: string;
  metricDelta?: number; // +25, -10, etc.
  url?: string;
}

/**
 * Review cycle with tasks and reviewer assignments.
 */
export interface ReviewCycle {
  id: string;
  kind: ReviewCycleKind;
  title: string;
  startISO: string;
  dueISO: string;
  tz: string;
  tasks: Array<{ id: string; title: string; done: boolean; owner: 'self' | 'manager' | 'peer' }>;
  reviewers: FeedbackRequest[];
}

/**
 * Rubric definition with weighted dimensions.
 */
export interface RubricDef {
  id: string;
  name: string;
  weights: Record<RubricKey, number>; // sum ~ 1
  notes?: string;
}

/**
 * Aggregated calibration summary for a review cycle.
 */
export interface CalibSummary {
  id: string;
  cycleId: string;
  aggScores: Record<RubricKey, number>;
  overall: number; // 0..4
  outliers: Array<{ reviewer: string; key: RubricKey; delta: number }>;
  notes?: string;
}

/**
 * Rating simulation scenario with configurable parameters.
 */
export interface RatingScenario {
  id: string;
  rubricId: string;
  weightOverrides?: Partial<Record<RubricKey, number>>;
  evidenceBoostPct?: number; // boost when strong evidence attached
  sensitivity?: number; // 0..1 extra noise
  result?: { overall: number; perKey: Record<RubricKey, number> };
}

/**
 * Expected behaviors for a given promotion level.
 */
export interface PromotionExpectation {
  id: string;
  level: string; // e.g., "L5"
  behaviors: Array<{ key: RubricKey; descriptor: string; bar: number }>; // bar 0..4
}

/**
 * Gap analysis between current performance and promotion bar.
 */
export interface GapAnalysis {
  id: string;
  level: string;
  gaps: Array<{ key: RubricKey; current: number; target: number; actions: string[] }>;
  ready: boolean;
}

/**
 * Self-review narrative document.
 */
export interface NarrativeDoc {
  id: string;
  cycleId?: string;
  title: string;
  html: string;
  lastEditedISO: string;
}

/**
 * Exported performance review packet.
 */
export interface PerfPacketExport {
  id: string;
  cycleId?: string;
  url?: string;
  createdAt: string;
  kind: 'pdf' | 'gdoc';
}
