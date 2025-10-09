/**
 * @fileoverview Zustand store for autofill mappings and plans
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FieldMapping, AutofillPlan } from '@/types/autofill.types';

interface AutofillState {
  mappings: FieldMapping[];
  plans: AutofillPlan[];
  upsertMapping: (m: FieldMapping) => void;
  upsertPlan: (p: AutofillPlan) => void;
  byAts: (ats: FieldMapping['ats']) => FieldMapping[];
  planById: (id: string) => AutofillPlan | undefined;
}

export const useAutofill = create<AutofillState>()(
  persist(
    (set, get) => ({
      mappings: [],
      plans: [],
      upsertMapping: (m) => set({ mappings: [m, ...get().mappings.filter(x=>x.id!==m.id)] }),
      upsertPlan: (p) => set({ plans: [p, ...get().plans.filter(x=>x.id!==p.id)] }),
      byAts: (ats) => get().mappings.filter(m=>m.ats===ats),
      planById: (id) => get().plans.find(p=>p.id===id)
    }),
    { name:'autofill', storage: createJSONStorage(()=>localStorage), version:1 }
  )
);
