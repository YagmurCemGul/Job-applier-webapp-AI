import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { OneOnOneSeries, OneOnOneEntry } from '@/types/oneonone.types'

interface OneOnOneState {
  series: OneOnOneSeries[]
  entries: OneOnOneEntry[]
  upsertSeries: (s: OneOnOneSeries) => void
  upsertEntry: (e: OneOnOneEntry) => void
  byPlan: (planId: string) => {
    series: OneOnOneSeries[]
    entries: OneOnOneEntry[]
  }
}

export const useOneOnOnesStore = create<OneOnOneState>()(
  persist(
    (set, get) => ({
      series: [],
      entries: [],

      upsertSeries: (s) => set({ series: [s, ...get().series.filter((x) => x.id !== s.id)] }),

      upsertEntry: (e) => set({ entries: [e, ...get().entries.filter((x) => x.id !== e.id)] }),

      byPlan: (planId) => ({
        series: get().series.filter((s) => s.planId === planId),
        entries: get().entries.filter((e) =>
          get().series.find((s) => s.id === e.seriesId)?.planId === planId ? true : false
        ),
      }),
    }),
    {
      name: 'oneonones',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
)
