/**
 * Scorecard & Rating Types
 * Defines templates, dimensions, submissions, and recommendations
 */

export type Scale = 1 | 2 | 3 | 4 | 5;

export interface ScoreDimension {
  id: string;
  name: string;                         // e.g., "System Design"
  description?: string;
  weight?: number;                      // default 1.0
}

export interface ScorecardTemplate {
  id: string;
  name: string;
  role?: string;
  dimensions: ScoreDimension[];
  rubric?: Record<Scale, string>;       // textual rubric
  createdAt: string;
  updatedAt: string;
}

export interface ScoreSubmission {
  id: string;
  interviewId: string;
  panelistId: string;                   // Panelist.id or email
  ratings: Array<{ dimensionId: string; score: Scale; note?: string }>;
  overall?: Scale;
  recommendation: 'strong_yes' | 'yes' | 'lean_yes' | 'no' | 'strong_no';
  submittedAt: string;
}
