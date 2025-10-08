import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ATSAnalysisResult, ATSSuggestion, ParsedJob } from '@/types/ats.types'
import type { CVData } from '@/types/cvData.types'
import { useCVDataStore } from './cvData.store'
import { updateByPath } from '@/services/ats/textUtils'

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
          const { parseJobText } = await import('@/services/ats/jobParser')
          const parsedJob = parseJobText(text)
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

      applySuggestion: (id) => {
        const res = get().result
        if (!res) return

        const s = res.suggestions.find((x) => x.id === id)
        if (!s || s.applied) return

        // Snapshot before change
        const before = res.suggestions.map((item) => ({ ...item }))

        // Apply to CV
        if (s.target && s.action) {
          const cvStore = useCVDataStore.getState()
          const draft = structuredClone(cvStore.currentCV!)
          updateByPath(draft, s.target, s.action)
          
          // Update CV store
          set({ currentCV: draft } as any)
          
          // In a real implementation, we'd call cvStore methods
          // For now, directly update the summary if that's the target
          if (s.target.section === 'summary') {
            cvStore.updateSummary(draft.summary ?? '')
          }
        }

        // Mark as applied
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
          set({
            result: { ...res },
            past: [...get().past, before],
            future: [],
          })
        }
      },

      undo: () => {
        const past = get().past
        if (!past.length) return
        const res = get().result
        if (!res) return

        const prev = past[past.length - 1]
        set({
          past: past.slice(0, -1),
          future: [res.suggestions, ...get().future],
          result: { ...res, suggestions: prev },
        })
      },

      redo: () => {
        const future = get().future
        if (!future.length) return
        const res = get().result
        if (!res) return

        const next = future[0]
        set({
          future: future.slice(1),
          past: [...get().past, res.suggestions],
          result: { ...res, suggestions: next },
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
