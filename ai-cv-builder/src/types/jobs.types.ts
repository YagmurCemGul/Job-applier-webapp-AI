/**
 * Job Sources & Ingestion Types
 * Step 32 - Job discovery, normalization, and search
 */

export type JobSourceKind = 'api' | 'rss' | 'html';
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary' | 'other';
export type Seniority = 'intern' | 'junior' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'vp' | 'cxo' | 'unspecified';

/**
 * Raw job data from external source
 */
export interface JobRaw {
  id: string;                 // source id or stable hash
  url: string;
  source: { name: string; kind: JobSourceKind; domain: string };
  title?: string;
  company?: string;
  location?: string;
  remote?: boolean;
  postedAt?: string;          // ISO
  description?: string;       // raw (html or text)
  payload?: any;              // opaque original
  fetchedAt: string;          // ISO
}

/**
 * Salary range information
 */
export interface SalaryRange {
  currency?: string;          // e.g., USD, TRY, EUR
  min?: number;
  max?: number;
  period?: 'year' | 'month' | 'day' | 'hour';
}

/**
 * Normalized job posting with enrichment
 */
export interface JobNormalized {
  id: string;                 // final canonical id (fingerprint)
  sourceId: string;           // raw.id
  title: string;
  company: string;
  location: string;
  locationNorm?: { city?: string; country?: string; isoCountry?: string };
  remote?: boolean;
  employmentType?: EmploymentType;
  seniority?: Seniority;
  salary?: SalaryRange;
  postedAt?: string;
  descriptionText: string;    // plain text
  descriptionHtml?: string;
  keywords?: string[];        // extracted
  url: string;
  source: JobRaw['source'];
  createdAt: string;
  updatedAt: string;
  fingerprint: string;        // for dedupe
  score?: number;             // match score (0..1) when computed
}

/**
 * Fetch run log entry
 */
export interface FetchLog {
  id: string;
  source: string;             // domain or adapter key
  startedAt: string;
  finishedAt?: string;
  ok: boolean;
  message?: string;
  created: number;            // # new jobs
  updated: number;
  skipped: number;
}

/**
 * Job source configuration
 */
export interface SourceConfig {
  key: string;                // 'linkedin.api' | 'rss' | 'indeed.api' | 'linkedin.html' | etc.
  enabled: boolean;
  kind: JobSourceKind;
  domain: string;
  params?: Record<string, string>;
  headers?: Record<string, string>;  // user-provided cookies for **their** sessions
  rateLimitPerMin?: number;   // per-domain throttle
  legalMode?: boolean;        // user affirms rights to fetch (required for html)
}
