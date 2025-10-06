import { create } from 'zustand'
import { OptimizationResult, OptimizationChange } from '@/services/ai.service'

interface OptimizationState {
  result: OptimizationResult | null
  isOptimizing: boolean
  error: string | null
  currentCV: string
  setResult: (result: OptimizationResult) => void
  setOptimizing: (isOptimizing: boolean) => void
  setError: (error: string | null) => void
  setCurrentCV: (cv: string) => void
  toggleChange: (changeId: string) => void
  revertChange: (changeId: string) => void
  applyAllChanges: () => void
  revertAllChanges: () => void
  reset: () => void
}

export const useOptimizationStore = create<OptimizationState>((set, get) => ({
  result: null,
  isOptimizing: false,
  error: null,
  currentCV: '',

  setResult: (result) => set({ result, currentCV: result.optimizedCV }),

  setOptimizing: (isOptimizing) => set({ isOptimizing }),

  setError: (error) => set({ error }),

  setCurrentCV: (currentCV) => set({ currentCV }),

  toggleChange: (changeId) => {
    const { result, currentCV } = get()
    if (!result) return

    const changes = result.changes.map((change) => {
      if (change.id === changeId) {
        return { ...change, applied: !change.applied }
      }
      return change
    })

    // Rebuild CV with applied changes
    let newCV = result.optimizedCV
    changes.forEach((change) => {
      if (!change.applied) {
        // Revert this change
        newCV = newCV.replace(change.optimized, change.original)
      }
    })

    set({
      result: { ...result, changes },
      currentCV: newCV,
    })
  },

  revertChange: (changeId) => {
    const { result, currentCV } = get()
    if (!result) return

    const change = result.changes.find((c) => c.id === changeId)
    if (!change) return

    const newCV = currentCV.replace(change.optimized, change.original)
    const changes = result.changes.map((c) => (c.id === changeId ? { ...c, applied: false } : c))

    set({
      result: { ...result, changes },
      currentCV: newCV,
    })
  },

  applyAllChanges: () => {
    const { result } = get()
    if (!result) return

    const changes = result.changes.map((change) => ({
      ...change,
      applied: true,
    }))

    set({
      result: { ...result, changes },
      currentCV: result.optimizedCV,
    })
  },

  revertAllChanges: () => {
    const { result } = get()
    if (!result) return

    const changes = result.changes.map((change) => ({
      ...change,
      applied: false,
    }))

    // Rebuild original CV
    let originalCV = result.optimizedCV
    result.changes.forEach((change) => {
      originalCV = originalCV.replace(change.optimized, change.original)
    })

    set({
      result: { ...result, changes },
      currentCV: originalCV,
    })
  },

  reset: () =>
    set({
      result: null,
      isOptimizing: false,
      error: null,
      currentCV: '',
    }),
}))
