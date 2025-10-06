import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ExportPreset } from '@/types/export.types'

interface ExportPresetsState {
  presets: ExportPreset[]
  upsert: (p: Omit<ExportPreset, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => string
  remove: (id: string) => void
  getById: (id: string) => ExportPreset | undefined
}

function rid(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `p_${Math.random().toString(36).slice(2)}`
}

export const useExportPresetsStore = create<ExportPresetsState>()(
  persist(
    (set, get) => ({
      presets: [],

      upsert: (p) => {
        const id = p.id ?? rid()
        const now = new Date()
        const doc: ExportPreset = {
          id,
          name: p.name,
          namingTemplate: p.namingTemplate,
          formats: p.formats,
          locale: p.locale ?? 'en',
          includeCoverLetter: !!p.includeCoverLetter,
          createdAt: now,
          updatedAt: now,
        }
        const others = get().presets.filter((x) => x.id !== id)
        set({ presets: [doc, ...others] })
        return id
      },

      remove: (id) => set({ presets: get().presets.filter((x) => x.id !== id) }),

      getById: (id) => get().presets.find((x) => x.id === id),
    }),
    { name: 'export-presets', storage: createJSONStorage(() => localStorage), version: 1 }
  )
)
