import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { SequenceRun } from '@/types/outreach.run.types'

interface RunsState {
  runs: SequenceRun[]
  upsert: (r: SequenceRun) => void
  setStatus: (id: string, status: SequenceRun['status']) => void
  markStep: (
    id: string,
    entry: SequenceRun['history'][number],
    nextSendAt?: string,
    nextIndex?: number
  ) => void
}

export const useSequenceRunsStore = create<RunsState>()(
  persist(
    (set, get) => ({
      runs: [],

      upsert: (r) => set({ runs: [r, ...get().runs.filter((x) => x.id !== r.id)] }),

      setStatus: (id, status) =>
        set({
          runs: get().runs.map((r) =>
            r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r
          ),
        }),

      markStep: (id, entry, nextSendAt, nextIndex) =>
        set({
          runs: get().runs.map((r) =>
            r.id === id
              ? {
                  ...r,
                  history: [entry, ...r.history],
                  nextSendAt,
                  currentStepIndex: nextIndex ?? r.currentStepIndex,
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }),
    }),
    {
      name: 'sequence-runs',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
)
