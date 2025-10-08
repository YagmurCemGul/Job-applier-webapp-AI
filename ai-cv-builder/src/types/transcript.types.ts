/**
 * Transcript & AI Analysis Types
 * Defines transcription segments and AI-powered insights
 */

export interface Transcript {
  id: string;
  interviewId: string;
  createdAt: string;
  language: 'en' | 'tr';
  segments: Array<{
    id: string;
    atMs: number;                       // start offset
    durMs: number;
    speaker: 'Interviewer' | 'Candidate' | 'System';
    text: string;
  }>;
  ai?: {
    summary?: string;
    star?: Array<{ situation: string; task: string; action: string; result: string }>;
    strengths?: string[];
    concerns?: string[];
    riskFlags?: string[];               // e.g., "vague impact"
  };
}
