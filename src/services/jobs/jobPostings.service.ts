/**
 * Firestore-backed job postings service with local fallback
 * Falls back to localStorage when Firebase is not configured
 */
import type { JobPosting } from '@/types/jobPosting.types'
import type { SaveJobResult, DeleteJobResult, ListJobsResult } from '@/types/job.types'

let useLocal = false
try {
  require('@/lib/firebase.config')
} catch {
  useLocal = true
}

/**
 * Save or update a job posting
 */
export async function saveJobPosting(doc: JobPosting): Promise<SaveJobResult> {
  if (useLocal) {
    const local = await import('./jobPostings.local')
    return local.saveJobPostingLocal(doc)
  }

  try {
    const { db } = await import('@/lib/firebase.config')
    const { doc: fsDoc, setDoc, Timestamp } = await import('firebase/firestore')
    const serialized = serialize(doc)
    await setDoc(fsDoc(db, 'job_postings', doc.id), serialized, { merge: true })
    return { ok: true, id: doc.id }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Save failed' }
  }
}

/**
 * Get a single job posting by ID
 */
export async function getJobPosting(id: string): Promise<JobPosting | undefined> {
  if (useLocal) {
    const local = await import('./jobPostings.local')
    return local.getJobPostingLocal(id)
  }

  try {
    const { db } = await import('@/lib/firebase.config')
    const { doc: fsDoc, getDoc } = await import('firebase/firestore')
    const snap = await getDoc(fsDoc(db, 'job_postings', id))
    if (!snap.exists()) return undefined
    return deserialize({ id: snap.id, ...snap.data() })
  } catch {
    return undefined
  }
}

/**
 * List all job postings (ordered by updatedAt desc)
 */
export async function listJobPostings(limit = 100): Promise<ListJobsResult> {
  if (useLocal) {
    const local = await import('./jobPostings.local')
    return local.listJobPostingsLocal(limit)
  }

  try {
    const { db } = await import('@/lib/firebase.config')
    const {
      collection,
      query,
      orderBy,
      limit: qLimit,
      getDocs,
    } = await import('firebase/firestore')
    const q = query(collection(db, 'job_postings'), orderBy('updatedAt', 'desc'), qLimit(limit))
    const snap = await getDocs(q)
    const items = snap.docs.map((d) => deserialize({ id: d.id, ...d.data() }))
    return { ok: true, items }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'List failed' }
  }
}

/**
 * Delete a job posting
 */
export async function deleteJobPosting(id: string): Promise<DeleteJobResult> {
  if (useLocal) {
    const local = await import('./jobPostings.local')
    return local.deleteJobPostingLocal(id)
  }

  try {
    const { db } = await import('@/lib/firebase.config')
    const { doc: fsDoc, deleteDoc } = await import('firebase/firestore')
    await deleteDoc(fsDoc(db, 'job_postings', id))
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Delete failed' }
  }
}

/**
 * Convert JobPosting to Firestore format
 */
function serialize(d: JobPosting): any {
  return {
    ...d,
    createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : d.createdAt,
    updatedAt: d.updatedAt instanceof Date ? d.updatedAt.toISOString() : d.updatedAt,
    postedAt: d.postedAt instanceof Date ? d.postedAt.toISOString() : d.postedAt,
    deadlineAt: d.deadlineAt instanceof Date ? d.deadlineAt.toISOString() : d.deadlineAt,
    lastATS: d.lastATS
      ? {
          ...d.lastATS,
          at: d.lastATS.at instanceof Date ? d.lastATS.at.toISOString() : d.lastATS.at,
        }
      : undefined,
  }
}

/**
 * Convert Firestore format to JobPosting
 */
function deserialize(d: any): JobPosting {
  return {
    ...d,
    createdAt: new Date(d.createdAt),
    updatedAt: new Date(d.updatedAt),
    postedAt: d.postedAt ? new Date(d.postedAt) : undefined,
    deadlineAt: d.deadlineAt ? new Date(d.deadlineAt) : undefined,
    lastATS: d.lastATS
      ? {
          ...d.lastATS,
          at: d.lastATS.at ? new Date(d.lastATS.at) : undefined,
        }
      : undefined,
  }
}
