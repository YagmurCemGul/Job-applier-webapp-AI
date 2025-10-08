import { create } from 'zustand'
import type { ATSScoringWeights } from '@/types/ats.types'

/**
 * Default scoring weights
 */
export const DEFAULT_WEIGHTS: ATSScoringWeights = {
  keywords: 0.4,
  sections: 0.2,
  length: 0.1,
  experience: 0.2,
  formatting: 0.1,
}

/**
 * ATS weights state for configurable scoring
 */
interface ATSWeightsState {
  weights: ATSScoringWeights

  setWeight: (key: keyof ATSScoringWeights, value: number) => void
  reset: () => void
  normalized: () => ATSScoringWeights
}

/**
 * ATS weights store with bounds clamping and normalization
 */
export const useATSWeightsStore = create<ATSWeightsState>((set, get) => ({
  weights: { ...DEFAULT_WEIGHTS },

  setWeight: (key, value) => {
    // Clamp value between 0 and 1
    const clamped = Math.max(0, Math.min(1, value))
    set((state) => ({
      weights: {
        ...state.weights,
        [key]: clamped,
      },
    }))
  },

  reset: () => set({ weights: { ...DEFAULT_WEIGHTS } }),

  normalized: () => {
    const weights = get().weights
    const sum = Object.values(weights).reduce((acc, val) => acc + val, 0)

    // If sum is 0, return defaults
    if (sum === 0) return { ...DEFAULT_WEIGHTS }

    // Normalize so sum = 1
    return {
      keywords: weights.keywords / sum,
      sections: weights.sections / sum,
      length: weights.length / sum,
      experience: weights.experience / sum,
      formatting: weights.formatting / sum,
    }
  },
}))
