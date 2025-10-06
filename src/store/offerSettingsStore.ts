import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CurrencyCode } from '@/types/offer.types'

interface OfferSettings {
  baseCurrency: CurrencyCode
  effectiveTaxPct: number // default 30
  colAdjustPct: number // default 0
  equityGrowthPct: number // annual assumed growth (display only)
}

export const useOfferSettingsStore = create<OfferSettings>()(
  persist(
    () => ({
      baseCurrency: 'USD',
      effectiveTaxPct: 30,
      colAdjustPct: 0,
      equityGrowthPct: 0
    }),
    {
      name: 'offer-settings',
      storage: createJSONStorage(() => localStorage),
      version: 1
    }
  )
)
