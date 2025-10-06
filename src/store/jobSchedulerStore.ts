import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface SchedulerState {
  running: boolean
  intervalMin: number
  lastRun?: string
  setIntervalMin: (m: number) => void
  setRunning: (on: boolean) => void
}

export const useJobSchedulerStore = create<SchedulerState>()(
  persist(
    (set) => ({
      running: false,
      intervalMin: 60,

      setIntervalMin: (m) => set({ intervalMin: m }),

      setRunning: (on) =>
        set({
          running: on,
          lastRun: on ? new Date().toISOString() : undefined
        })
    }),
    {
      name: 'job-scheduler',
      storage: createJSONStorage(() => localStorage),
      version: 1
    }
  )
)
