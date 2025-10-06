/**
 * OKR (Objectives and Key Results) types
 */

export interface KeyResult {
  id: string
  label: string
  target: number // numeric target
  unit?: string // e.g., '%', 'issues', 'sessions'
  current: number // latest value
  weight?: number // default 1
  evidenceId?: string
}

export interface Objective {
  id: string
  planId: string
  title: string
  owner: string
  krs: KeyResult[]
  confidence: 0 | 1 | 2 | 3 | 4 | 5 // RAG-friendly
  createdAt: string
  updatedAt: string
}
