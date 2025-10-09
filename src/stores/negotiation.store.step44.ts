/**
 * @fileoverview Negotiation store for Step 44
 * @module stores/negotiation.step44
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CounterAsk } from '@/types/negotiation.types.step44';

interface NegotiationState {
  counters: CounterAsk[];
  upsert: (c: CounterAsk) => void;
  update: (id: string, patch: Partial<CounterAsk>) => void;
  byOffer: (offerId: string) => CounterAsk[];
}

/**
 * Global store for negotiation counter-offers
 */
export const useNegotiation = create<NegotiationState>()(
  persist(
    (set, get) => ({
      counters: [],
      
      upsert: (c) => {
        const existing = get().counters.filter(x => x.id !== c.id);
        set({ counters: [c, ...existing] });
      },
      
      update: (id, patch) => {
        set({
          counters: get().counters.map(x =>
            x.id === id ? { ...x, ...patch } : x
          )
        });
      },
      
      byOffer: (offerId) => get().counters.filter(x => x.offerId === offerId)
    }),
    {
      name: 'negotiation-step44',
      storage: createJSONStorage(() => localStorage),
      version: 1
    }
  )
);
