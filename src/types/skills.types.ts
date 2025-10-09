/**
 * Skills & Career Ladder Navigator types (Step 47)
 * Educational skill matrix, competency frameworks, learning paths, assessments, badges, spaced repetition.
 */

export type LevelKey = 'L3'|'L4'|'L5'|'L6'|'L7';
export type SkillKind = 'technical'|'product'|'people'|'process'|'domain';
export type ResourceKind = 'course'|'doc'|'video'|'lab'|'repo'|'quiz'|'flashcard';
export type AssessmentKind = 'quiz'|'code'|'case';
export type BadgeTier = 'bronze'|'silver'|'gold'|'platinum';

/**
 * A competency/skill tracked in a role framework.
 */
export interface Competency {
  id: string;
  key: string;              // e.g., "system_design"
  title: string;
  kind: SkillKind;
  description?: string;
  expectedByLevel: Partial<Record<LevelKey, number>>; // 0..4 bar
  rubricKey?: 'clarity'|'structure'|'impact'|'ownership'|'collaboration'|'craft'; // map to Step 46
  prereqs?: string[];       // competency keys
}

/**
 * A role framework defining ladder and competencies.
 */
export interface RoleFramework {
  id: string;
  role: string;             // e.g., "Software Engineer"
  ladder: LevelKey[];
  competencies: Competency[];
}

/**
 * User's self-assessed skill inventory row.
 */
export interface SkillInventoryRow {
  id: string;
  competencyKey: string;
  selfLevel: number;        // 0..4
  confidencePct: number;    // 0..100
  lastEvidenceAt?: string;
  notes?: string;
}

/**
 * Link between a competency and evidence (goal/artifact).
 */
export interface SkillEvidenceLink {
  id: string;
  competencyKey: string;
  goalId?: string;          // Step 45
  evidenceRefId: string;    // Step 38/40/43
  title: string;
  delta?: number;           // metric delta
  url?: string;
  createdAt: string;
}

/**
 * A learning resource (course, doc, video, etc.).
 */
export interface LearningResource {
  id: string;
  kind: ResourceKind;
  title: string;
  url?: string;
  estMinutes?: number;
  tags: string[];
  competencyKeys: string[];
  difficulty: 1|2|3|4|5;
}

/**
 * A step in a learning path.
 */
export interface PathStep {
  id: string;
  competencyKey: string;
  resourceId: string;
  estMinutes: number;
  dependsOn?: string[];
}

/**
 * A personalized learning path.
 */
export interface LearningPath {
  id: string;
  targetLevel: LevelKey;
  steps: PathStep[];
  totalMinutes: number;
  createdAt: string;
}

/**
 * An assessment question (quiz, code, case).
 */
export interface Question {
  id: string;
  prompt: string;
  choices?: string[];       // for quiz
  answer?: string;          // correct
  rubric?: Array<{ criterion: string; max: number }>; // for code/case
}

/**
 * An assessment with questions.
 */
export interface Assessment {
  id: string;
  title: string;
  kind: AssessmentKind;
  competencyKey: string;
  questions: Question[];
  passScore: number;        // 0..100
}

/**
 * An attempt at an assessment.
 */
export interface Attempt {
  id: string;
  assessmentId: string;
  startedAt: string;
  finishedAt?: string;
  scorePct?: number;
  answers?: Record<string, string>;     // questionId -> user answer
  rubricScores?: Record<string, number>; // criterion -> score
  feedbackHtml?: string;
}

/**
 * A badge earned for milestones.
 */
export interface Badge {
  id: string;
  tier: BadgeTier;
  title: string;
  description: string;
  awardedAt: string;
  competencyKey?: string;
}

/**
 * A flashcard for spaced repetition (SM-2).
 */
export interface Flashcard {
  id: string;
  competencyKey: string;
  front: string;
  back: string;
  // SM-2 spaced repetition fields
  ef: number;      // easiness factor
  interval: number;// days
  reps: number;    // repetitions
  dueISO: string;  // next review
}

/**
 * Growth Packet export (PDF/GDoc).
 */
export interface GrowthPacketExport {
  id: string;
  url?: string;
  kind: 'pdf'|'gdoc';
  createdAt: string;
}
