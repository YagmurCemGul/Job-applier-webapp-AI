/**
 * Firestore-backed job postings service with local storage fallback
 * 
 * Automatically falls back to localStorage when Firebase is not configured
 * All methods return Result envelopes for type-safe error handling
 */

import type { JobPosting } from '@/types/jobPosting.types'
import type { SaveJobResult, DeleteJobResult, ListJobsResult } from '@/types/job.types'

let useLocal = false

// Check if Firebase is configured (synchronous check)
try {
  // Try to require firebase config to see if it's available
  // This will throw if Firebase env vars are missing
  // Note: In production, this should be determined at build time
  if (typeof window !== 'undefined') {
    // Check if Firebase env vars exist
    const hasFirebaseConfig = 
      import.meta.env.VITE_FIREBASE_API_KEY &&
      import.meta.env.VITE_FIREBASE_PROJECT_ID
    
    if (!hasFirebaseConfig) {
      useLocal = true
      console.warn('[jobPostings.service] Firebase not configured, using local storage fallback')
    }
  }
} catch (error) {
  console.warn('[jobPostings.service] Firebase check failed, using local storage fallback')
  useLocal = true
}

/**
 * Serialize JobPosting for Firestore storage
 * Converts Date objects to ISO strings
 */
function serialize(doc: JobPosting): any {
  const { createdAt, updatedAt, postedAt, deadlineAt, lastATS, ...rest } = doc
  
  return {
    ...rest,
    createdAt: createdAt instanceof Date ? createdAt.toISOString() : createdAt,
    updatedAt: updatedAt instanceof Date ? updatedAt.toISOString() : updatedAt,
    postedAt: postedAt ? (postedAt instanceof Date ? postedAt.toISOString() : postedAt) : undefined,
    deadlineAt: deadlineAt ? (deadlineAt instanceof Date ? deadlineAt.toISOString() : deadlineAt) : undefined,
    lastATS: lastATS
      ? {
          ...lastATS,
          at: lastATS.at ? (lastATS.at instanceof Date ? lastATS.at.toISOString() : lastATS.at) : undefined,
        }
      : undefined,
  }
}

/**
 * Deserialize JobPosting from Firestore
 * Converts ISO strings back to Date objects
 */
function deserialize(data: any): JobPosting {
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    postedAt: data.postedAt ? new Date(data.postedAt) : undefined,
    deadlineAt: data.deadlineAt ? new Date(data.deadlineAt) : undefined,
    lastATS: data.lastATS
      ? {
          ...data.lastATS,
          at: data.lastATS.at ? new Date(data.lastATS.at) : undefined,
        }
      : undefined,
  }
}

/**
 * Save or update job posting
 */
export async function saveJobPosting(doc: JobPosting): Promise<SaveJobResult> {
  if (useLocal) {
    const local = await import('./jobPostings.local')
    return local.saveJobPostingLocal(doc)
  }

  try {
    const { db } = await import('@/config/firebase')
    const { doc: fsDoc, setDoc } = await import('firebase/firestore')
    
    const docRef = fsDoc(db, 'job_postings', doc.id)
    await setDoc(docRef, serialize(doc), { merge: true })
    
    return { ok: true, id: doc.id }
  } catch (error: any) {
    console.error('[jobPostings.service] Save error:', error)
    return { ok: false, error: error?.message ?? 'Save failed' }
  }
}

/**
 * Get single job posting by ID
 */
export async function getJobPosting(id: string): Promise<JobPosting | undefined> {
  if (useLocal) {
    const local = await import('./jobPostings.local')
    return local.getJobPostingLocal(id)
  }

  try {
    const { db } = await import('@/config/firebase')
    const { doc: fsDoc, getDoc } = await import('firebase/firestore')
    
    const docRef = fsDoc(db, 'job_postings', id)
    const snap = await getDoc(docRef)
    
    if (!snap.exists()) return undefined
    
    return deserialize({ id: snap.id, ...snap.data() })
  } catch (error: any) {
    console.error('[jobPostings.service] Get error:', error)
    return undefined
  }
}

/**
 * List job postings ordered by updatedAt desc
 */
export async function listJobPostings(limit = 100): Promise<ListJobsResult> {
  if (useLocal) {
    const local = await import('./jobPostings.local')
    return local.listJobPostingsLocal(limit)
  }

  try {
    const { db } = await import('@/config/firebase')
    const { collection, query, orderBy, limit: qLimit, getDocs } = await import('firebase/firestore')
    
    const q = query(
      collection(db, 'job_postings'),
      orderBy('updatedAt', 'desc'),
      qLimit(limit)
    )
    
    const snap = await getDocs(q)
    const items = snap.docs.map((d) => deserialize({ id: d.id, ...d.data() }))
    
    return { ok: true, items }
  } catch (error: any) {
    console.error('[jobPostings.service] List error:', error)
    return { ok: false, error: error?.message ?? 'List failed' }
  }
}

/**
 * Delete job posting
 */
export async function deleteJobPosting(id: string): Promise<DeleteJobResult> {
  if (useLocal) {
    const local = await import('./jobPostings.local')
    return local.deleteJobPostingLocal(id)
  }

  try {
    const { db } = await import('@/config/firebase')
    const { doc: fsDoc, deleteDoc } = await import('firebase/firestore')
    
    const docRef = fsDoc(db, 'job_postings', id)
    await deleteDoc(docRef)
    
    return { ok: true }
  } catch (error: any) {
    console.error('[jobPostings.service] Delete error:', error)
    return { ok: false, error: error?.message ?? 'Delete failed' }
  }
}
