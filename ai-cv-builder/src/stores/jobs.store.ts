import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { jobStableHash } from '@/services/jobs/jobHash'
import type { JobPosting } from '@/types/jobPosting.types'
import {
  saveJobPosting,
  listJobPostings,
  deleteJobPosting,
  getJobPosting,
} from '@/services/jobs/jobPostings.service'

/**
 * Filter options for job list
 */
interface JobFilter {
  q?: string // search query
  favorite?: boolean // show only favorites
  status?: JobPosting['status'] | 'all'
  site?: string // filter by source site
}

/**
 * Jobs store state
 */
interface JobsState {
  items: JobPosting[]
  selectedId?: string
  filter: JobFilter
  loading: boolean
  error?: string

  // Actions
  setFilter: (f: Partial<JobFilter>) => void
  refresh: () => Promise<void>
  select: (id?: string) => void
  upsertFromForm: (
    input: Omit<JobPosting, 'id' | 'hash' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => Promise<string | undefined>
  remove: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
  duplicate: (id: string) => Promise<string | undefined>
}

/**
 * Generate unique ID using crypto API or fallback
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `job_${Math.random().toString(36).slice(2)}_${Date.now()}`
}

/**
 * Jobs store for managing saved job postings
 */
export const useJobsStore = create<JobsState>()(
  persist(
    (set, get) => ({
      items: [],
      filter: { status: 'all' },
      loading: false,

      /**
       * Update filter criteria
       */
      setFilter: (f) => set({ filter: { ...get().filter, ...f } }),

      /**
       * Refresh job list from storage
       */
      refresh: async () => {
        set({ loading: true, error: undefined })
        try {
          const result = await listJobPostings(500)
          if (result.ok) {
            set({ items: result.items ?? [], loading: false })
          } else {
            set({ error: result.error, loading: false })
          }
        } catch (e: any) {
          set({ error: e?.message ?? 'Failed to load jobs', loading: false })
        }
      },

      /**
       * Select job by ID for detail view
       */
      select: (id) => set({ selectedId: id }),

      /**
       * Save or update job posting from form input
       * Dedupes based on hash + url
       */
      upsertFromForm: async (input) => {
        try {
          const id = input.id ?? generateId()
          const hash = jobStableHash(input.rawText, input.source?.url)
          const now = new Date()

          const doc: JobPosting = {
            ...input,
            id,
            hash,
            createdAt: (input as any).createdAt ?? now,
            updatedAt: now,
          } as JobPosting

          // Dedupe: if an item with same hash and url exists, reuse its id
          const existing = get().items.find(
            (j) => j.hash === hash && j.source?.url === input.source?.url
          )
          
          if (existing && !input.id) {
            doc.id = existing.id
            doc.createdAt = existing.createdAt
          }

          const result = await saveJobPosting(doc)
          
          if (result.ok) {
            // Update local cache
            const filtered = get().items.filter((x) => x.id !== doc.id)
            set({ items: [doc, ...filtered] })
            return doc.id
          } else {
            set({ error: result.error })
            return undefined
          }
        } catch (e: any) {
          set({ error: e?.message ?? 'Failed to save job' })
          return undefined
        }
      },

      /**
       * Delete job posting
       */
      remove: async (id) => {
        try {
          await deleteJobPosting(id)
          set({
            items: get().items.filter((x) => x.id !== id),
            selectedId: get().selectedId === id ? undefined : get().selectedId,
          })
        } catch (e: any) {
          set({ error: e?.message ?? 'Failed to delete job' })
        }
      },

      /**
       * Toggle favorite status
       */
      toggleFavorite: async (id) => {
        try {
          const current = get().items.find((x) => x.id === id)
          if (!current) return

          const updated = {
            ...current,
            favorite: !current.favorite,
            updatedAt: new Date(),
          }

          await saveJobPosting(updated)
          set({ items: get().items.map((x) => (x.id === id ? updated : x)) })
        } catch (e: any) {
          set({ error: e?.message ?? 'Failed to update favorite' })
        }
      },

      /**
       * Duplicate job posting
       */
      duplicate: async (id) => {
        try {
          const current = await getJobPosting(id)
          if (!current) return undefined

          const copyId = generateId()
          const now = new Date()
          
          const copy: JobPosting = {
            ...current,
            id: copyId,
            title: `${current.title} (Copy)`,
            hash: jobStableHash(current.rawText, current.source?.url), // Same hash is OK for duplicates
            createdAt: now,
            updatedAt: now,
          }

          await saveJobPosting(copy)
          set({ items: [copy, ...get().items] })
          
          return copyId
        } catch (e: any) {
          set({ error: e?.message ?? 'Failed to duplicate job' })
          return undefined
        }
      },
    }),
    {
      name: 'jobs-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        filter: s.filter,
        selectedId: s.selectedId,
      }),
      version: 1,
    }
  )
)
