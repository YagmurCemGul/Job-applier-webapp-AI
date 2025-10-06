import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Offer, OfferStage } from '@/types/offer.types'

interface OffersState {
  items: Offer[]
  upsert: (o: Offer) => void
  update: (id: string, patch: Partial<Offer>) => void
  setStage: (id: string, stage: OfferStage) => void
  getById: (id: string) => Offer | undefined
  byApplication: (applicationId: string) => Offer[]
}

export const useOffersStore = create<OffersState>()(
  persist(
    (set, get) => ({
      items: [],

      upsert: (o) => set({ items: [o, ...get().items.filter((x) => x.id !== o.id)] }),

      update: (id, patch) =>
        set({
          items: get().items.map((x) =>
            x.id === id ? { ...x, ...patch, updatedAt: new Date().toISOString() } : x
          ),
        }),

      setStage: (id, stage) =>
        set({
          items: get().items.map((x) =>
            x.id === id ? { ...x, stage, updatedAt: new Date().toISOString() } : x
          ),
        }),

      getById: (id) => get().items.find((x) => x.id === id),

      byApplication: (appId) => get().items.filter((x) => x.applicationId === appId),
    }),
    {
      name: 'offers',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
)
