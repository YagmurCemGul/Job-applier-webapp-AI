import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  ReviewCycle,
  ImpactEntry,
  SelfReview
} from '@/types/review.types'

interface ReviewState {
  cycles: ReviewCycle[]
  impacts: ImpactEntry[]
  selfReviews: SelfReview[]
  upsertCycle: (c: ReviewCycle) => void
  updateCycle: (id: string, patch: Partial<ReviewCycle>) => void
  addImpact: (e: ImpactEntry) => void
  setImpact: (id: string, patch: Partial<ImpactEntry>) => void
  upsertSelfReview: (s: SelfReview) => void
  byId: (id: string) => ReviewCycle | undefined
  impactsByCycle: (cycleId: string) => ImpactEntry[]
  selfByCycle: (cycleId: string) => SelfReview | undefined
}

export const useReviewsStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      cycles: [],
      impacts: [],
      selfReviews: [],

      upsertCycle: (c) =>
        set({ cycles: [c, ...get().cycles.filter((x) => x.id !== c.id)] }),

      updateCycle: (id, patch) =>
        set({
          cycles: get().cycles.map((c) =>
            c.id === id
              ? { ...c, ...patch, updatedAt: new Date().toISOString() }
              : c
          )
        }),

      addImpact: (e) => set({ impacts: [e, ...get().impacts] }),

      setImpact: (id, patch) =>
        set({
          impacts: get().impacts.map((i) =>
            i.id === id ? { ...i, ...patch } : i
          )
        }),

      upsertSelfReview: (s) =>
        set({
          selfReviews: [
            s,
            ...get().selfReviews.filter((x) => x.cycleId !== s.cycleId)
          ]
        }),

      byId: (id) => get().cycles.find((c) => c.id === id),

      impactsByCycle: (cycleId) =>
        get().impacts.filter((i) => i.cycleId === cycleId),

      selfByCycle: (cycleId) =>
        get().selfReviews.find((s) => s.cycleId === cycleId)
    }),
    {
      name: 'reviews',
      storage: createJSONStorage(() => localStorage),
      version: 1
    }
  )
)
