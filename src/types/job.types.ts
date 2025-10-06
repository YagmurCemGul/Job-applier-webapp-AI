import type { JobPosting } from './jobPosting.types'

export interface FetchJobUrlResult {
  ok: boolean
  text?: string
  html?: string
  status?: number
  error?: string
  meta?: { url?: string; site?: string }
}

export interface SaveJobResult {
  ok: boolean
  id?: string
  error?: string
}

export interface DeleteJobResult {
  ok: boolean
  error?: string
}

export interface ListJobsResult {
  ok: boolean
  items?: JobPosting[]
  error?: string
}
