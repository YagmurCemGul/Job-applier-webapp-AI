import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type PipelineStage = 'prospect'|'intro_requested'|'referred'|'screening'|'in_process'|'offer'|'closed';

export interface PipelineItem {
  id: string;
  contactId: string;
  company?: string;
  role?: string;
  stage: PipelineStage;
  score?: number;        // interest/fit 0..1
  lastActionISO?: string;
  notes?: string;
}

interface PipelineState {
  items: PipelineItem[];
  upsert: (i: PipelineItem) => void;
  setStage: (id: string, s: PipelineStage) => void;
  byStage: (s: PipelineStage) => PipelineItem[];
}

export const usePipeline = create<PipelineState>()(
  persist(
    (set, get) => ({
      items: [],
      upsert: (i) => set({ items: [i, ...get().items.filter(x=>x.id!==i.id)] }),
      setStage: (id, s) => set({ items: get().items.map(x=>x.id===id?({ ...x, stage:s, lastActionISO: new Date().toISOString() }):x) }),
      byStage: (s) => get().items.filter(x=>x.stage===s)
    }),
    { name:'pipeline', storage: createJSONStorage(()=>localStorage), version:1 }
  )
);
