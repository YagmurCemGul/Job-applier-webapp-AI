import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface SchedulerState {
  running: boolean
  tickSec: number
  lastTick?: string
  setRunning: (v: boolean) => void
  setTickSec: (s: number) => void
}

export const useSequenceSchedulerStore = create<SchedulerState>()(
  persist(
    (set) => ({
      running: true,
      tickSec: 30,

      setRunning: (v) => set({ running: v, lastTick: new Date().toISOString() }),

      setTickSec: (s) => set({ tickSec: s }),
    }),
    {
      name: 'sequence-scheduler',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
)
