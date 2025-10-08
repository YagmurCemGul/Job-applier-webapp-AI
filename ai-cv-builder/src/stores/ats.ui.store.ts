import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Highlights mode for keyword highlighting
 */
export type HighlightsMode = 'off' | 'job' | 'cv' | 'both'

/**
 * ATS UI state for highlighting, filtering, and keyword selection
 */
interface ATSUIState {
  highlights: HighlightsMode
  showLegend: boolean
  kwSearch: string
  selectedKw?: string

  setHighlights: (mode: HighlightsMode) => void
  toggleLegend: () => void
  setKwSearch: (query: string) => void
  setSelectedKw: (term?: string) => void
}

/**
 * ATS UI store with persistent highlights and legend preferences
 */
export const useATSUIStore = create<ATSUIState>()(
  persist(
    (set) => ({
      highlights: 'both',
      showLegend: true,
      kwSearch: '',
      selectedKw: undefined,

      setHighlights: (mode) => set({ highlights: mode }),
      toggleLegend: () => set((state) => ({ showLegend: !state.showLegend })),
      setKwSearch: (query) => set({ kwSearch: query }),
      setSelectedKw: (term) => set({ selectedKw: term }),
    }),
    {
      name: 'ats-ui-storage',
      partialize: (state) => ({
        highlights: state.highlights,
        showLegend: state.showLegend,
      }),
    }
  )
)
