import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Interview, InterviewStage } from '@/types/interview.types'

interface InterviewsState {
  items: Interview[]
  upsert: (i: Interview) => void
  update: (id: string, patch: Partial<Interview>) => void
  setStage: (id: string, stage: InterviewStage) => void
  byApplication: (applicationId: string) => Interview[]
  getById: (id: string) => Interview | undefined
}

export const useInterviewsStore = create<InterviewsState>()(
  persist(
    (set, get) => ({
      items: [],

      upsert: (i) => set({ items: [i, ...get().items.filter((x) => x.id !== i.id)] }),

      update: (id, patch) =>
        set({
          items: get().items.map((x) =>
            x.id === id ? { ...x, ...patch, updatedAt: new Date().toISOString() } : x
          ),
        }),

      setStage: (id, stage) =>
        set({
          items: get().items.map((x) =>
            x.id === id ? { ...x, stage, updatedAt: new Date().toISOString() } : x
          ),
        }),

      byApplication: (applicationId) =>
        get().items.filter((x) => x.applicationId === applicationId),

      getById: (id) => get().items.find((x) => x.id === id),
    }),
    {
      name: 'interviews',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
)
