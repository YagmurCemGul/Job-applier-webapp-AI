/**
 * @fileoverview OKR (Objectives & Key Results) types.
 * @module types/okr
 */

/** Key Result with target, current value, and optional weight. */
export interface KeyResult {
  id: string;
  label: string;
  target: number; // numeric target
  unit?: string; // e.g., '%', 'issues', 'sessions'
  current: number; // latest value
  weight?: number; // default 1
  evidenceId?: string;
}

/** Objective with multiple key results. */
export interface Objective {
  id: string;
  planId: string;
  title: string;
  owner: string;
  krs: KeyResult[];
  confidence: 0 | 1 | 2 | 3 | 4 | 5; // RAG-friendly
  createdAt: string;
  updatedAt: string;
}
