/**
 * @fileoverview Stakeholders store for Step 45 onboarding
 * @module stores/stakeholders
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Stakeholder } from '@/types/onboarding.types';

interface StakeState {
  items: Stakeholder[];
  upsert: (s: Stakeholder) => void;
  remove: (id: string) => void;
  byPowerInterest: (minP: number, minI: number) => Stakeholder[];
}

/**
 * Global store for stakeholder mapping
 */
export const useStakeholders = create<StakeState>()(
  persist(
    (set, get) => ({
      items: [],
      
      upsert: (s) => {
        const existing = get().items.filter(x => x.id !== s.id);
        set({ items: [s, ...existing] });
      },
      
      remove: (id) => {
        set({ items: get().items.filter(x => x.id !== id) });
      },
      
      byPowerInterest: (p, i) => {
        return get().items.filter(x => (x.power ?? 0) >= p && (x.interest ?? 0) >= i);
      },
    }),
    {
      name: 'stakeholders',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
