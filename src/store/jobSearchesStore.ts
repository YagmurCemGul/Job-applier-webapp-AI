import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { SavedSearch } from '@/types/searches.types'

interface JobSearchesState {
  searches: SavedSearch[]
  upsert: (
    s: Omit<SavedSearch, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => string
  remove: (id: string) => void
  getById: (id: string) => SavedSearch | undefined
}

function rid() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `s_${Math.random().toString(36).slice(2)}`
}

export const useJobSearchesStore = create<JobSearchesState>()(
  persist(
    (set, get) => ({
      searches: [],

      upsert: (s) => {
        const id = s.id ?? rid()
        const now = new Date().toISOString()
        const doc: SavedSearch = {
          id,
          name: s.name,
          query: s.query,
          filters: s.filters ?? {},
          alerts: s.alerts ?? { enabled: false, intervalMin: 60 },
          createdAt: now,
          updatedAt: now
        }
        set({
          searches: [doc, ...get().searches.filter((x) => x.id !== id)]
        })
        return id
      },

      remove: (id) =>
        set({
          searches: get().searches.filter((x) => x.id !== id)
        }),

      getById: (id) => get().searches.find((x) => x.id === id)
    }),
    {
      name: 'job-searches',
      storage: createJSONStorage(() => localStorage),
      version: 1
    }
  )
)
