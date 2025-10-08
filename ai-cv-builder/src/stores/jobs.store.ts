/**
 * Jobs Store
 * Step 32 - Manages normalized job postings and fetch logs
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { JobNormalized, FetchLog } from '@/types/jobs.types';

interface JobsState {
  items: JobNormalized[];
  logs: FetchLog[];
  selectedId?: string;

  upsertMany: (jobs: JobNormalized[]) => void;
  select: (id?: string) => void;
  addLog: (log: FetchLog) => void;
  updateScore: (id: string, score: number) => void;
  removeBySource: (sourceKey: string) => void;
}

export const useJobsStore = create<JobsState>()(
  persist(
    (set, get) => ({
      items: [],
      logs: [],
      
      upsertMany: (jobs) => {
        const map = new Map(get().items.map(j => [j.id, j]));
        for (const j of jobs) {
          map.set(j.id, { 
            ...(map.get(j.id) ?? j), 
            ...j, 
            updatedAt: new Date().toISOString() 
          });
        }
        set({ 
          items: Array.from(map.values())
            .sort((a, b) => (b.postedAt || '').localeCompare(a.postedAt || ''))
        });
      },
      
      select: (id) => set({ selectedId: id }),
      
      addLog: (log) => set({ 
        logs: [log, ...get().logs].slice(0, 200) 
      }),
      
      updateScore: (id, score) => set({ 
        items: get().items.map(j => j.id === id ? { ...j, score } : j) 
      }),
      
      removeBySource: (key) => set({ 
        items: get().items.filter(j => j.source.name !== key) 
      })
    }),
    { 
      name: 'jobs', 
      storage: createJSONStorage(() => localStorage), 
      version: 1 
    }
  )
);
