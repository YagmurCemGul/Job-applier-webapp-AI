/**
 * Application Tracking Types
 * Kanban stages, application records, contacts, and events
 */

import type { PlatformKey, FileRef, ApplyLogEntry } from './apply.types';

export type AppStage = 'applied' | 'viewed' | 'interview' | 'offer' | 'rejected' | 'hold';

/**
 * Application record with full tracking info
 */
export interface Application {
  id: string;
  jobId?: string;
  jobUrl: string;
  platform?: PlatformKey;
  company: string;
  role: string;
  location?: string;
  stage: AppStage;
  status: 'open' | 'closed';
  appliedAt?: string;
  updatedAt: string;
  files: FileRef[];
  notes?: string;
  contacts: ContactRef[];
  events: AppEvent[];
  score?: number;
  sequenceId?: string;
  logs: ApplyLogEntry[];
}

/**
 * Contact reference for recruiters, hiring managers, etc.
 */
export interface ContactRef { 
  id: string; 
  name: string; 
  email?: string; 
  role?: string; 
  phone?: string; 
  linkedin?: string;
}

/**
 * Event for interviews, calls, follow-ups
 */
export interface AppEvent { 
  id: string; 
  type: 'interview' | 'call' | 'other'; 
  title: string; 
  when: string; 
  durationMin?: number; 
  location?: string; 
  calendarId?: string; 
  notes?: string;
}
