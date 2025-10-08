/**
 * @fileoverview Offer calculation settings store for Step 37
 * @module stores/offerSettings
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CurrencyCode } from '@/types/offer.types';

interface OfferSettings {
  baseCurrency: CurrencyCode;
  effectiveTaxPct: number;
  colAdjustPct: number;
  equityGrowthPct: number;
  setBaseCurrency: (currency: CurrencyCode) => void;
  setEffectiveTaxPct: (pct: number) => void;
  setColAdjustPct: (pct: number) => void;
  setEquityGrowthPct: (pct: number) => void;
}

/**
 * Global settings for offer calculations
 */
export const useOfferSettings = create<OfferSettings>()(
  persist(
    (set) => ({
      baseCurrency: 'USD',
      effectiveTaxPct: 30,
      colAdjustPct: 0,
      equityGrowthPct: 0,
      
      setBaseCurrency: (currency) => set({ baseCurrency: currency }),
      setEffectiveTaxPct: (pct) => set({ effectiveTaxPct: pct }),
      setColAdjustPct: (pct) => set({ colAdjustPct: pct }),
      setEquityGrowthPct: (pct) => set({ equityGrowthPct: pct })
    }),
    {
      name: 'offer-settings',
      storage: createJSONStorage(() => localStorage),
      version: 1
    }
  )
);
