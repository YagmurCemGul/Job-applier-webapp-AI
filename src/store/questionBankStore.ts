import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface Question {
  id: string
  text: string
  tag?: string // e.g., "system-design", "behavioral"
  lang: 'en' | 'tr'
}

interface QBState {
  items: Question[]
  upsert: (q: Question) => void
  remove: (id: string) => void
  byTag: (tag?: string) => Question[]
}

export const useQuestionBankStore = create<QBState>()(
  persist(
    (set, get) => ({
      items: [],

      upsert: (q) =>
        set({ items: [q, ...get().items.filter((x) => x.id !== q.id)] }),

      remove: (id) => set({ items: get().items.filter((x) => x.id !== id) }),

      byTag: (tag) =>
        tag ? get().items.filter((q) => q.tag === tag) : get().items
    }),
    {
      name: 'question-bank',
      storage: createJSONStorage(() => localStorage),
      version: 1
    }
  )
)
