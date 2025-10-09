/**
 * @fileoverview Zustand store for job applications and auto-apply runs
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { JobPosting, ApplyRun, VariantDoc } from '@/types/apply.types';

interface ApplyState {
  postings: JobPosting[];
  runs: ApplyRun[];
  variants: VariantDoc[];
  upsertPosting: (p: JobPosting) => void;
  upsertRun: (r: ApplyRun) => void;
  updateRun: (id: string, patch: Partial<ApplyRun>) => void;
  upsertVariant: (v: VariantDoc) => void;
  byId: (id: string) => JobPosting | undefined;
  runById: (id: string) => ApplyRun | undefined;
}

export const useApply = create<ApplyState>()(
  persist(
    (set, get) => ({
      postings: [],
      runs: [],
      variants: [],
      upsertPosting: (p) => set({ postings: [p, ...get().postings.filter(x=>x.id!==p.id)] }),
      upsertRun: (r) => set({ runs: [r, ...get().runs.filter(x=>x.id!==r.id)] }),
      updateRun: (id, patch) => set({
        runs: get().runs.map(x=>x.id===id?({ ...x, ...patch, updatedAt: new Date().toISOString() }):x)
      }),
      upsertVariant: (v) => set({ variants: [v, ...get().variants.filter(x=>x.id!==v.id)] }),
      byId: (id) => get().postings.find(p=>p.id===id),
      runById: (id) => get().runs.find(r=>r.id===id)
    }),
    { name:'apply', storage: createJSONStorage(()=>localStorage), version:1 }
  )
);
