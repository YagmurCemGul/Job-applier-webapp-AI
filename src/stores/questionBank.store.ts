/**
 * @fileoverview Question bank store for Step 43 — Interview Coach & Scheduler
 * @module stores/questionBank
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { QuestionItem } from '@/types/interview.types';

interface QBState {
  items: QuestionItem[];
  upsert: (q: QuestionItem) => void;
  bulk: (qs: QuestionItem[]) => void;
  remove: (id: string) => void;
}

/**
 * Global store for interview question bank
 */
export const useQuestionBank = create<QBState>()(
  persist(
    (set, get) => ({
      items: [],
      
      upsert: (q) => {
        const existing = get().items.filter(x => x.id !== q.id);
        set({ items: [q, ...existing] });
      },
      
      bulk: (qs) => {
        set({ items: [...qs, ...get().items] });
      },
      
      remove: (id) => {
        set({ items: get().items.filter(x => x.id !== id) });
      }
    }),
    {
      name: 'question-bank',
      storage: createJSONStorage(() => localStorage),
      version: 1
    }
  )
);
