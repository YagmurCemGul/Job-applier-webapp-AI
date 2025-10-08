/**
 * Sequence scheduler store for managing background runner state
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SchedulerState {
  running: boolean;
  tickSec: number;
  lastTick?: string;
  setRunning: (v: boolean) => void;
  setTickSec: (s: number) => void;
  updateLastTick: () => void;
}

export const useSequenceScheduler = create<SchedulerState>()(
  persist(
    (set) => ({
      running: true,
      tickSec: 30,
      setRunning: (v) => set({ running: v, lastTick: new Date().toISOString() }),
      setTickSec: (s) => set({ tickSec: s }),
      updateLastTick: () => set({ lastTick: new Date().toISOString() })
    }),
    { name: 'sequence-scheduler', storage: createJSONStorage(() => localStorage), version: 1 }
  )
);
