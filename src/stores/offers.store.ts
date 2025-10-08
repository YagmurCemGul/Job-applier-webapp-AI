/**
 * @fileoverview Offers store for Step 37 — Offer & Negotiation Suite
 * @module stores/offers
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Offer, OfferStage } from '@/types/offer.types';

interface OffersState {
  items: Offer[];
  upsert: (o: Offer) => void;
  update: (id: string, patch: Partial<Offer>) => void;
  setStage: (id: string, stage: OfferStage) => void;
  remove: (id: string) => void;
  getById: (id: string) => Offer | undefined;
  byApplication: (applicationId: string) => Offer[];
}

/**
 * Global store for job offers
 */
export const useOffers = create<OffersState>()(
  persist(
    (set, get) => ({
      items: [],
      
      upsert: (o) => {
        const existing = get().items.filter(x => x.id !== o.id);
        set({ items: [o, ...existing] });
      },
      
      update: (id, patch) => {
        set({
          items: get().items.map(x =>
            x.id === id
              ? { ...x, ...patch, updatedAt: new Date().toISOString() }
              : x
          )
        });
      },
      
      setStage: (id, stage) => {
        set({
          items: get().items.map(x =>
            x.id === id
              ? { ...x, stage, updatedAt: new Date().toISOString() }
              : x
          )
        });
      },
      
      remove: (id) => {
        set({ items: get().items.filter(x => x.id !== id) });
      },
      
      getById: (id) => get().items.find(x => x.id === id),
      
      byApplication: (appId) => get().items.filter(x => x.applicationId === appId)
    }),
    {
      name: 'offers',
      storage: createJSONStorage(() => localStorage),
      version: 1
    }
  )
);
