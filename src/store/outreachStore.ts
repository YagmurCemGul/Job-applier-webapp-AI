import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { OutreachSequence } from '@/types/outreach.types'

interface OutreachState {
  sequences: OutreachSequence[]
  upsert: (s: Omit<OutreachSequence, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => string
  remove: (id: string) => void
  getById: (id: string) => OutreachSequence | undefined
}

function rid() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)
}

export const useOutreachStore = create<OutreachState>()(
  persist(
    (set, get) => ({
      sequences: [],

      upsert: (s) => {
        const id = s.id ?? rid()
        const now = new Date().toISOString()
        const doc: OutreachSequence = {
          id,
          createdAt: now,
          updatedAt: now,
          ...s,
        }
        set({
          sequences: [doc, ...get().sequences.filter((x) => x.id !== id)],
        })
        return id
      },

      remove: (id) => set({ sequences: get().sequences.filter((x) => x.id !== id) }),

      getById: (id) => get().sequences.find((x) => x.id === id),
    }),
    {
      name: 'outreach',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
)
