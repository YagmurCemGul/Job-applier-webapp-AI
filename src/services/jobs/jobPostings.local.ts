import type { JobPosting } from '@/types/jobPosting.types'
import type { SaveJobResult, DeleteJobResult, ListJobsResult } from '@/types/job.types'

const KEY = 'job_postings_local'

function read(): Record<string, JobPosting> {
  try {
    const data = localStorage.getItem(KEY)
    if (!data) return {}
    const parsed = JSON.parse(data)
    // Convert date strings back to Date objects
    Object.keys(parsed).forEach((key) => {
      if (parsed[key].createdAt) parsed[key].createdAt = new Date(parsed[key].createdAt)
      if (parsed[key].updatedAt) parsed[key].updatedAt = new Date(parsed[key].updatedAt)
      if (parsed[key].postedAt) parsed[key].postedAt = new Date(parsed[key].postedAt)
      if (parsed[key].deadlineAt) parsed[key].deadlineAt = new Date(parsed[key].deadlineAt)
      if (parsed[key].lastATS?.at) parsed[key].lastATS.at = new Date(parsed[key].lastATS.at)
    })
    return parsed
  } catch {
    return {}
  }
}

function write(map: Record<string, JobPosting>) {
  localStorage.setItem(KEY, JSON.stringify(map))
}

export async function saveJobPostingLocal(doc: JobPosting): Promise<SaveJobResult> {
  try {
    const map = read()
    map[doc.id] = doc
    write(map)
    return { ok: true, id: doc.id }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Save failed' }
  }
}

export async function getJobPostingLocal(id: string): Promise<JobPosting | undefined> {
  const map = read()
  return map[id]
}

export async function listJobPostingsLocal(limit = 100): Promise<ListJobsResult> {
  try {
    const map = read()
    const items = Object.values(map)
      .sort((a, b) => +b.updatedAt - +a.updatedAt)
      .slice(0, limit)
    return { ok: true, items }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'List failed' }
  }
}

export async function deleteJobPostingLocal(id: string): Promise<DeleteJobResult> {
  try {
    const map = read()
    delete map[id]
    write(map)
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Delete failed' }
  }
}
