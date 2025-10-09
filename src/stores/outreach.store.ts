import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Template, Sequence, SequenceRun } from '@/types/outreach.types';

interface OutreachState {
  templates: Template[];
  sequences: Sequence[];
  runs: SequenceRun[];
  upsertTemplate: (t: Template) => void;
  upsertSequence: (s: Sequence) => void;
  upsertRun: (r: SequenceRun) => void;
  updateRun: (id: string, patch: Partial<SequenceRun>) => void;
}

export const useOutreach = create<OutreachState>()(
  persist(
    (set, get) => ({
      templates: [], sequences: [], runs: [],
      upsertTemplate: (t) => set({ templates: [t, ...get().templates.filter(x=>x.id!==t.id)] }),
      upsertSequence: (s) => set({ sequences: [s, ...get().sequences.filter(x=>x.id!==s.id)] }),
      upsertRun: (r) => set({ runs: [r, ...get().runs.filter(x=>x.id!==r.id)] }),
      updateRun: (id, patch) => set({ runs: get().runs.map(r => r.id===id ? ({ ...r, ...patch }) : r) })
    }),
    { name:'outreach', storage: createJSONStorage(()=>localStorage), version:1 }
  )
);
