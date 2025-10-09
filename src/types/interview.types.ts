/**
 * @fileoverview Interview and coaching types for Step 43 — Interview Coach & Scheduler
 * @module types/interview
 */

export type InterviewKind = 'behavioral' | 'system_design' | 'coding' | 'product' | 'design' | 'analytics' | 'managerial';
export type Medium = 'in_person' | 'video' | 'phone';
export type Consent = { audio: boolean; video: boolean; transcription: boolean };

/**
 * Interview plan with scheduling details
 */
export interface InterviewPlan {
  id: string;
  applicationId?: string;        // Step 33 link
  pipelineItemId?: string;       // Step 41 link
  company?: string;
  role?: string;
  kind: InterviewKind;
  medium: Medium;
  interviewer?: string;
  location?: string;
  startISO: string;
  endISO: string;
  tz: string;
  quietRespect: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Question bank item
 */
export interface QuestionItem {
  id: string;
  kind: InterviewKind | 'behavioral';
  prompt: string;
  tags: string[];            // e.g., 'leadership','ownership','sql'
  difficulty: 1 | 2 | 3 | 4 | 5;
  source: 'bank' | 'ai' | 'jd' | 'custom';
}

/**
 * STAR story (Situation, Task, Action, Result)
 */
export interface StorySTAR {
  id: string;
  title: string;
  tags: string[];
  S: string; // Situation
  T: string; // Task
  A: string; // Action
  R: string; // Result
  metrics?: string[];                            // quantified outcomes
  links?: string[];                              // evidence/portfolio URLs
  lastUsedISO?: string;
}

/**
 * Mock interview session run
 */
export interface SessionRun {
  id: string;
  planId?: string;
  questionIds: string[];
  storyIds: string[];
  consent: Consent;
  startedAt: string;
  endedAt?: string;
  media?: { audioUrl?: string; videoUrl?: string };
  transcript?: Transcript;
  rubric?: RubricScore;
  feedbackHtml?: string;
  notes?: string;
}

/**
 * Interview transcript
 */
export interface Transcript {
  lang: 'en' | 'tr';
  text: string;
  segments: Array<{ t0: number; t1: number; text: string }>;
  wordsPerMin?: number;
  fillerCount?: number;
  talkListenRatio?: number;     // 0..1
}

/**
 * Follow-up email (thank you or follow-up)
 */
export interface FollowUp {
  id: string;
  planId?: string;
  to: string;
  subject: string;
  html: string;
  kind: 'thank_you' | 'follow_up';
  scheduledISO?: string;
  sentId?: string;
}

/**
 * Import RubricScore from rubric.types
 */
import type { RubricScore } from './rubric.types';
