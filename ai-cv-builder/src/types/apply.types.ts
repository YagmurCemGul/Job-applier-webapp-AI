/**
 * Auto-Apply Engine Types
 * Defines platform keys, apply payloads, and logging structures
 */

export type PlatformKey = 'greenhouse' | 'lever' | 'workday' | 'indeed' | 'linkedin';
export type ApplyStatus = 'draft' | 'ready' | 'submitted' | 'error';
export type FileRef = { 
  id: string; 
  name: string; 
  type: 'cv' | 'coverLetter' | 'other'; 
  url?: string 
};

/**
 * Normalized apply payload structure
 * All platform mappers convert to this format
 */
export interface ApplyPayload {
  platform: PlatformKey;
  jobUrl: string;
  jobId?: string;
  company?: string;
  role?: string;
  answers?: Record<string, string | boolean | string[]>;
  files: FileRef[];
  contactEmail?: string;
  extra?: Record<string, string>;
}

/**
 * Apply log entry for tracking submissions and errors
 */
export interface ApplyLogEntry {
  id: string;
  at: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  meta?: Record<string, any>;
}
