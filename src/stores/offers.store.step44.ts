/**
 * @fileoverview Offers store for Step 44 with comparison and benchmark support
 * @module stores/offers.step44
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Offer, ComparisonRow } from '@/types/offer.types.step44';
import type { BenchmarkRow } from '@/types/negotiation.types.step44';

interface OffersState {
  items: Offer[];
  comparisons: ComparisonRow[];
  benchmarks: BenchmarkRow[];
  upsert: (o: Offer) => void;
  remove: (id: string) => void;
  upsertComparison: (r: ComparisonRow) => void;
  bulkBenchmarks: (rows: BenchmarkRow[]) => void;
  byId: (id: string) => Offer | undefined;
}

/**
 * Global store for offers with comparison and benchmark capabilities
 */
export const useOffers = create<OffersState>()(
  persist(
    (set, get) => ({
      items: [],
      comparisons: [],
      benchmarks: [],
      
      upsert: (o) => {
        const existing = get().items.filter(x => x.id !== o.id);
        set({ items: [o, ...existing] });
      },
      
      remove: (id) => {
        set({ items: get().items.filter(x => x.id !== id) });
      },
      
      upsertComparison: (r) => {
        const existing = get().comparisons.filter(x => x.offerId !== r.offerId);
        set({ comparisons: [r, ...existing] });
      },
      
      bulkBenchmarks: (rows) => {
        set({ benchmarks: [...rows, ...get().benchmarks] });
      },
      
      byId: (id) => get().items.find(x => x.id === id)
    }),
    {
      name: 'offers-step44',
      storage: createJSONStorage(() => localStorage),
      version: 1
    }
  )
);
