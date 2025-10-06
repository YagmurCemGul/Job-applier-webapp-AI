import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Objective } from '@/types/okr.types'

interface OKRState {
  items: Objective[]
  upsert: (o: Objective) => void
  update: (id: string, patch: Partial<Objective>) => void
  byPlan: (planId: string) => Objective[]
}

export const useOKRsStore = create<OKRState>()(
  persist(
    (set, get) => ({
      items: [],

      upsert: (o) =>
        set({ items: [o, ...get().items.filter((x) => x.id !== o.id)] }),

      update: (id, patch) =>
        set({
          items: get().items.map((o) =>
            o.id === id
              ? { ...o, ...patch, updatedAt: new Date().toISOString() }
              : o
          )
        }),

      byPlan: (planId) => get().items.filter((o) => o.planId === planId)
    }),
    {
      name: 'okrs',
      storage: createJSONStorage(() => localStorage),
      version: 1
    }
  )
)
