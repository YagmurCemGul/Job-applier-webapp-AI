import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  ScorecardTemplate,
  ScoreSubmission
} from '@/types/scorecard.types'

interface ScorecardsState {
  templates: ScorecardTemplate[]
  submissions: ScoreSubmission[]
  upsertTemplate: (t: ScorecardTemplate) => void
  upsertSubmission: (s: ScoreSubmission) => void
  byInterview: (interviewId: string) => ScoreSubmission[]
  getTemplate: (id?: string) => ScorecardTemplate | undefined
}

export const useScorecardsStore = create<ScorecardsState>()(
  persist(
    (set, get) => ({
      templates: [],
      submissions: [],

      upsertTemplate: (t) =>
        set({
          templates: [t, ...get().templates.filter((x) => x.id !== t.id)]
        }),

      upsertSubmission: (s) =>
        set({
          submissions: [s, ...get().submissions.filter((x) => x.id !== s.id)]
        }),

      byInterview: (interviewId) =>
        get().submissions.filter((s) => s.interviewId === interviewId),

      getTemplate: (id) => get().templates.find((t) => t.id === id)
    }),
    {
      name: 'scorecards',
      storage: createJSONStorage(() => localStorage),
      version: 1
    }
  )
)
