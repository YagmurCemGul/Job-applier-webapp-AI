/**
 * @fileoverview Zustand store for promotion cases, calibration notes, and rubrics
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PromotionCase, CalibrationNote, RubricExpectation } from '@/types/promotion.types';

interface PromotionState {
  cases: PromotionCase[];
  notes: CalibrationNote[];
  rubric: RubricExpectation[]; // editable
  
  upsertCase: (c: PromotionCase) => void;
  addNote: (n: CalibrationNote) => void;
  setRubric: (r: RubricExpectation[]) => void;
  
  byCycle: (cycleId: string) => {
    case?: PromotionCase;
    notes: CalibrationNote[];
    rubric: RubricExpectation[];
  };
}

export const usePromotion = create<PromotionState>()(
  persist(
    (set, get) => ({
      cases: [],
      notes: [],
      rubric: [],
      
      upsertCase: (c) => set({
        cases: [c, ...get().cases.filter(x => x.cycleId !== c.cycleId)]
      }),
      
      addNote: (n) => set({
        notes: [n, ...get().notes]
      }),
      
      setRubric: (r) => set({ rubric: r }),
      
      byCycle: (cycleId) => ({
        case: get().cases.find(c => c.cycleId === cycleId),
        notes: get().notes.filter(n => n.cycleId === cycleId),
        rubric: get().rubric
      })
    }),
    {
      name: 'promotion',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
