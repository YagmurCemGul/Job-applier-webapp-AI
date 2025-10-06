import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { FeedbackRequest, FeedbackResponse } from '@/types/review.types'

interface FeedbackState {
  requests: FeedbackRequest[]
  responses: FeedbackResponse[]
  upsertRequest: (r: FeedbackRequest) => void
  markSent: (id: string, when?: string) => void
  upsertResponse: (res: FeedbackResponse) => void
  byCycle: (cycleId: string) => {
    requests: FeedbackRequest[]
    responses: FeedbackResponse[]
  }
}

export const useFeedbackStore = create<FeedbackState>()(
  persist(
    (set, get) => ({
      requests: [],
      responses: [],

      upsertRequest: (r) =>
        set({
          requests: [r, ...get().requests.filter((x) => x.id !== r.id)],
        }),

      markSent: (id, when) =>
        set({
          requests: get().requests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'sent' as const,
                  sentAt: when ?? new Date().toISOString(),
                }
              : r
          ),
        }),

      upsertResponse: (res) =>
        set({
          responses: [res, ...get().responses.filter((x) => x.id !== res.id)],
        }),

      byCycle: (cycleId) => ({
        requests: get().requests.filter((r) => r.cycleId === cycleId),
        responses: get().responses.filter((r) => r.cycleId === cycleId),
      }),
    }),
    {
      name: 'feedback',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
)
