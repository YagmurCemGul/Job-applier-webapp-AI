import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type HighlightsMode = 'off' | 'job' | 'cv' | 'both'

interface ATSUIState {
  highlights: HighlightsMode
  showLegend: boolean
  kwSearch: string
  selectedKw?: string

  setHighlights: (m: HighlightsMode) => void
  toggleLegend: () => void
  setKwSearch: (q: string) => void
  setSelectedKw: (t?: string) => void
}

export const useATSUIStore = create<ATSUIState>()(
  persist(
    (set) => ({
      highlights: 'both',
      showLegend: true,
      kwSearch: '',
      selectedKw: undefined,

      setHighlights: (m) => set({ highlights: m }),
      toggleLegend: () => set((s) => ({ showLegend: !s.showLegend })),
      setKwSearch: (q) => set({ kwSearch: q }),
      setSelectedKw: (t) => set({ selectedKw: t }),
    }),
    {
      name: 'ats-ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        highlights: state.highlights,
        showLegend: state.showLegend,
      }),
    }
  )
)
