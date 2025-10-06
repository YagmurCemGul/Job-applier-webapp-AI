import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ATSAnalysisResult, ATSSuggestion, ParsedJob } from '@/types/ats.types'
import type { CVData } from '@/types/cvData.types'

interface ATSState {
  currentJobText: string
  parsedJob?: ParsedJob
  result?: ATSAnalysisResult

  // History stacks for undo/redo
  past: ATSSuggestion[][]
  future: ATSSuggestion[][]

  // UI state
  filter: { category?: string; severity?: string; search?: string }
  isParsing: boolean
  isAnalyzing: boolean
  error?: string

  // Actions
  setJobText: (t: string) => void
  setFilter: (f: Partial<ATSState['filter']>) => void
  parseJob: () => Promise<void>
  analyze: (cv: CVData) => Promise<void>
  applySuggestion: (id: string) => void
  dismissSuggestion: (id: string) => void
  undo: () => void
  redo: () => void
  clear: () => void
}

export const useATSStore = create<ATSState>()(
  persist(
    (set, get) => ({
      currentJobText: '',
      past: [],
      future: [],
      filter: {},
      isParsing: false,
      isAnalyzing: false,

      setJobText: (t) => set({ currentJobText: t }),

      setFilter: (f) => set({ filter: { ...get().filter, ...f } }),

      parseJob: async () => {
        const text = get().currentJobText ?? ''
        set({ isParsing: true, error: undefined })
        try {
          const { ingestAndParseJob } = await import('@/services/jobs/parsing/ingest')
          const parsedJob = await ingestAndParseJob({ kind: 'text', data: text, meta: {} })
          set({ parsedJob, isParsing: false })
        } catch (e: any) {
          set({ error: e?.message ?? 'Parse error', isParsing: false })
        }
      },

      analyze: async (cv) => {
        const parsedJob = get().parsedJob
        if (!parsedJob) return
        set({ isAnalyzing: true, error: undefined })
        try {
          const { analyzeCVAgainstJob } = await import('@/services/ats/analysis.service')
          const result = analyzeCVAgainstJob(cv, parsedJob)
          set({ result, isAnalyzing: false, past: [], future: [] })
        } catch (e: any) {
          set({ error: e?.message ?? 'Analysis error', isAnalyzing: false })
        }
      },

      applySuggestion: async (id) => {
        const res = get().result
        if (!res) return

        const s = res.suggestions.find((x) => x.id === id)
        if (!s || s.applied) return

        // Snapshot before change
        const before = res.suggestions.map((item) => ({ ...item }))

        // Apply to CV
        await applySuggestionToCV(s)
        s.applied = true

        set({
          result: { ...res },
          past: [...get().past, before],
          future: [],
        })
      },

      dismissSuggestion: (id) => {
        const res = get().result
        if (!res) return
        const before = res.suggestions.map((s) => ({ ...s }))
        const idx = res.suggestions.findIndex((x) => x.id === id)
        if (idx >= 0) {
          res.suggestions.splice(idx, 1)
          set({ result: { ...res }, past: [...get().past, before], future: [] })
        }
      },

      undo: () => {
        const res = get().result
        if (!res) return
        const past = get().past
        if (!past.length) return

        const prev = past[past.length - 1]
        set({
          result: { ...res, suggestions: prev },
          past: past.slice(0, -1),
          future: [res.suggestions, ...get().future],
        })
      },

      redo: () => {
        const res = get().result
        if (!res) return
        const future = get().future
        if (!future.length) return

        const next = future[0]
        set({
          result: { ...res, suggestions: next },
          past: [...get().past, res.suggestions],
          future: future.slice(1),
        })
      },

      clear: () =>
        set({
          currentJobText: '',
          parsedJob: undefined,
          result: undefined,
          past: [],
          future: [],
          error: undefined,
        }),
    }),
    {
      name: 'ats-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        currentJobText: s.currentJobText,
        parsedJob: s.parsedJob,
        result: s.result,
        filter: s.filter,
      }),
      version: 1,
    }
  )
)

/**
 * Apply suggestion changes to CV store
 */
async function applySuggestionToCV(s: ATSSuggestion) {
  if (!s.target || !s.action) return

  try {
    const { useCVDataStore } = await import('@/store/cvDataStore')
    const { updateByPath } = await import('@/services/ats/textUtils')
    const cvStore = useCVDataStore.getState()
    const draft = structuredClone(cvStore.currentCV)

    if (draft) {
      updateByPath(draft, s.target, s.action)
      cvStore.updatePersonalInfo(draft.personalInfo)
      cvStore.updateSummary(draft.summary || '')
    }
  } catch (error) {
    console.error('Failed to apply suggestion to CV:', error)
  }
}
