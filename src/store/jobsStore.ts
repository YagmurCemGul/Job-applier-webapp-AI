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

type Filter = {
  q?: string
  favorite?: boolean
  status?: JobPosting['status'] | 'all'
  site?: string
}

interface JobsState {
  items: JobPosting[]
  selectedId?: string
  filter: Filter
  loading: boolean
  error?: string

  setFilter: (f: Partial<Filter>) => void
  refresh: () => Promise<void>
  select: (id?: string) => void
  upsertFromForm: (
    input: Omit<JobPosting, 'id' | 'hash' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => Promise<string | undefined>
  remove: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
  duplicate: (id: string) => Promise<string | undefined>
}

export const useJobsStore = create<JobsState>()(
  persist(
    (set, get) => ({
      items: [],
      filter: { status: 'all' },
      loading: false,

      setFilter: (f) => set({ filter: { ...get().filter, ...f } }),

      refresh: async () => {
        set({ loading: true, error: undefined })
        try {
          const r = await listJobPostings(500)
          if (r.ok) {
            set({ items: r.items ?? [], loading: false })
          } else {
            set({ error: r.error, loading: false })
          }
        } catch (e: any) {
          set({ error: e?.message ?? 'List error', loading: false })
        }
      },

      select: (id) => set({ selectedId: id }),

      upsertFromForm: async (input) => {
        const id = input.id ?? cryptoId()
        const hash = jobStableHash(input.rawText, input.source?.url)
        const now = new Date()

        // Check for existing item with same hash+url (dedupe)
        const existing = get().items.find(
          (j) => j.hash === hash && j.source?.url === input.source?.url
        )

        const doc: JobPosting = {
          ...input,
          id: existing?.id ?? id,
          hash,
          createdAt: existing?.createdAt ?? (input as any).createdAt ?? now,
          updatedAt: now,
        } as JobPosting

        const r = await saveJobPosting(doc)
        if (r.ok) {
          const next = get().items.filter((x) => x.id !== doc.id)
          set({ items: [doc, ...next] })
          return doc.id
        }
        set({ error: r.error })
        return undefined
      },

      remove: async (id) => {
        await deleteJobPosting(id)
        set({ items: get().items.filter((x) => x.id !== id), selectedId: undefined })
      },

      toggleFavorite: async (id) => {
        const curr = get().items.find((x) => x.id === id)
        if (!curr) return
        const doc = { ...curr, favorite: !curr.favorite, updatedAt: new Date() }
        await saveJobPosting(doc)
        set({ items: get().items.map((x) => (x.id === id ? doc : x)) })
      },

      duplicate: async (id) => {
        const curr = await getJobPosting(id)
        if (!curr) return
        const copyId = cryptoId()
        const copy = {
          ...curr,
          id: copyId,
          title: curr.title + ' (Copy)',
          updatedAt: new Date(),
          createdAt: new Date(),
        }
        await saveJobPosting(copy)
        set({ items: [copy, ...get().items] })
        return copyId
      },
    }),
    {
      name: 'jobs-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ filter: s.filter, selectedId: s.selectedId }),
      version: 1,
    }
  )
)

function cryptoId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `job_${Math.random().toString(36).slice(2)}`
}
