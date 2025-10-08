/**
 * Interview Management Types
 * Defines interview stages, panelists, meetings, and consent structures
 */

export type InterviewStage = 'planned' | 'scheduled' | 'in_progress' | 'completed' | 'canceled';
export type MeetingProvider = 'google_meet' | 'zoom' | 'other';

export interface Panelist {
  id: string;                 // contact id or email
  name: string;
  email: string;
  role?: string;              // e.g., "Hiring Manager"
  required?: boolean;
}

export interface Interview {
  id: string;
  applicationId: string;      // ties to Step 33 Applications
  candidateName: string;
  candidateEmail?: string;
  role: string;
  company: string;
  stage: InterviewStage;
  createdAt: string;
  updatedAt: string;
  meeting?: {
    provider: MeetingProvider;
    link?: string;
    calendarEventId?: string;
    whenISO?: string;
    durationMin: number;
    location?: string;
  };
  panel: Panelist[];
  consent: { recordingAllowed: boolean; capturedAt?: string };
  scorecardTemplateId?: string;
  scoreSubmissions: string[]; // scorecardSubmissionIds
  transcriptId?: string;
  notes?: string;
}
