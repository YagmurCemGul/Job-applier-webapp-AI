import type { JobPosting } from '@/types/jobPosting.types'
import type { SaveJobResult, DeleteJobResult, ListJobsResult } from '@/types/job.types'

const STORAGE_KEY = 'job_postings_local'

/**
 * Read all job postings from localStorage
 */
function readJobsMap(): Record<string, JobPosting> {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return {}
    
    const parsed = JSON.parse(data)
    
    // Deserialize dates
    Object.values(parsed).forEach((job: any) => {
      if (job.createdAt) job.createdAt = new Date(job.createdAt)
      if (job.updatedAt) job.updatedAt = new Date(job.updatedAt)
      if (job.postedAt) job.postedAt = new Date(job.postedAt)
      if (job.deadlineAt) job.deadlineAt = new Date(job.deadlineAt)
      if (job.lastATS?.at) job.lastATS.at = new Date(job.lastATS.at)
    })
    
    return parsed
  } catch (error) {
    console.error('[jobPostings.local] Read error:', error)
    return {}
  }
}

/**
 * Write all job postings to localStorage
 */
function writeJobsMap(map: Record<string, JobPosting>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch (error) {
    console.error('[jobPostings.local] Write error:', error)
    throw new Error('Failed to save job posting to local storage')
  }
}

/**
 * Save job posting to local storage
 */
export async function saveJobPostingLocal(doc: JobPosting): Promise<SaveJobResult> {
  try {
    const map = readJobsMap()
    map[doc.id] = doc
    writeJobsMap(map)
    return { ok: true, id: doc.id }
  } catch (error: any) {
    return { ok: false, error: error?.message ?? 'Save failed' }
  }
}

/**
 * Get single job posting from local storage
 */
export async function getJobPostingLocal(id: string): Promise<JobPosting | undefined> {
  const map = readJobsMap()
  return map[id]
}

/**
 * List all job postings from local storage
 */
export async function listJobPostingsLocal(limit = 100): Promise<ListJobsResult> {
  try {
    const map = readJobsMap()
    const items = Object.values(map)
      .sort((a, b) => +b.updatedAt - +a.updatedAt)
      .slice(0, limit)
    
    return { ok: true, items }
  } catch (error: any) {
    return { ok: false, error: error?.message ?? 'List failed' }
  }
}

/**
 * Delete job posting from local storage
 */
export async function deleteJobPostingLocal(id: string): Promise<DeleteJobResult> {
  try {
    const map = readJobsMap()
    delete map[id]
    writeJobsMap(map)
    return { ok: true }
  } catch (error: any) {
    return { ok: false, error: error?.message ?? 'Delete failed' }
  }
}
