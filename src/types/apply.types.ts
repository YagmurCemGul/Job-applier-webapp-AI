/**
 * @fileoverview Type definitions for job application and auto-apply features
 */

export type ApplyStage = 'intake'|'qa'|'variants'|'mapping'|'autofill'|'review'|'submitted'|'failed';

export interface JobPosting {
  id: string;
  source: 'url'|'text'|'pdf';
  url?: string;
  rawText?: string;
  company?: string;
  role?: string;
  location?: string;
  employmentType?: 'full_time'|'part_time'|'contract'|'intern'|'other';
  description?: string;
  requirements?: string[];
  niceToHave?: string[];
  questions: Screener[];
  extractedAt: string;
}

export interface Screener {
  id: string;
  kind: 'knockout'|'screener'|'legal'|'custom';
  prompt: string;
  maxChars?: number;
  requiresEssay?: boolean;
  answer?: string;
  redactedAnswer?: string;
  flags?: ('salary'|'visa'|'location'|'discrimination_risk'|'privacy_risk')[];
}

export interface ApplyRun {
  id: string;
  postingId: string;
  stage: ApplyStage;
  ats?: 'greenhouse'|'lever'|'workday'|'smartrecruiters'|'ashby'|'unknown';
  mappingId?: string;
  resumeId?: string;
  coverId?: string;
  coverage: CoverageReport;
  audit: AuditTrailEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface CoverageReport {
  keywordMatchPct: number;     // 0..100
  missingKeywords: string[];
  sectionGaps: string[];       // e.g., "Education", "Location"
}

export interface AuditTrailEntry {
  at: string;
  kind: 'intake'|'qa_draft'|'qa_edit'|'variant_select'|'mapping'|'autofill'|'submit'|'email'|'reminder'|'export';
  note: string;
  redacted?: boolean;
}

export interface VariantDoc {
  id: string;
  kind: 'resume'|'cover';
  title: string;
  format: 'pdf'|'docx'|'gdoc';
  url?: string;           // cloud/storage
  localPath?: string;     // client cache
  keywords?: string[];
}
