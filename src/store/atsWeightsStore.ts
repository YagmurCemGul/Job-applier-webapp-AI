import { create } from 'zustand'
import type { ATSScoringWeights } from '@/types/ats.types'

const DEFAULT_WEIGHTS: ATSScoringWeights = {
  keywords: 0.4,
  sections: 0.2,
  length: 0.1,
  experience: 0.2,
  formatting: 0.1,
}

interface ATSWeightsState {
  weights: ATSScoringWeights

  setWeight: (k: keyof ATSScoringWeights, v: number) => void
  reset: () => void
  normalized: () => ATSScoringWeights
}

export const useATSWeightsStore = create<ATSWeightsState>((set, get) => ({
  weights: { ...DEFAULT_WEIGHTS },

  setWeight: (k, v) => {
    // Clamp to [0, 1]
    const clamped = Math.max(0, Math.min(1, v))
    set((s) => ({
      weights: { ...s.weights, [k]: clamped },
    }))
  },

  reset: () => set({ weights: { ...DEFAULT_WEIGHTS } }),

  normalized: () => {
    const w = get().weights
    const sum = Object.values(w).reduce((a, b) => a + b, 0)

    if (sum === 0) return { ...DEFAULT_WEIGHTS }

    return {
      keywords: w.keywords / sum,
      sections: w.sections / sum,
      length: w.length / sum,
      experience: w.experience / sum,
      formatting: w.formatting / sum,
    }
  },
}))
