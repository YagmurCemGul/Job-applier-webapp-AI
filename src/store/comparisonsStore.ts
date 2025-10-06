import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ValuationInputs } from '@/types/offer.types'

export interface Comparison {
  id: string
  name: string
  offerIds: string[]
  inputs: ValuationInputs
  createdAt: string
  updatedAt: string
}

interface ComparisonsState {
  items: Comparison[]
  upsert: (c: Comparison) => void
  remove: (id: string) => void
  getById: (id: string) => Comparison | undefined
}

export const useComparisonsStore = create<ComparisonsState>()(
  persist(
    (set, get) => ({
      items: [],

      upsert: (c) => set({ items: [c, ...get().items.filter((x) => x.id !== c.id)] }),

      remove: (id) => set({ items: get().items.filter((x) => x.id !== id) }),

      getById: (id) => get().items.find((x) => x.id === id),
    }),
    {
      name: 'offer-comparisons',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
)
