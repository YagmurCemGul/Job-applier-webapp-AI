import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { EmailTemplate } from '@/types/outreach.types'

interface TemplateState {
  items: EmailTemplate[]
  upsert: (t: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => string
  remove: (id: string) => void
  getById: (id: string) => EmailTemplate | undefined
}

function rid() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)
}

export const useEmailTemplatesStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      items: [],

      upsert: (t) => {
        const id = t.id ?? rid()
        const now = new Date().toISOString()
        const doc: EmailTemplate = {
          id,
          createdAt: now,
          updatedAt: now,
          ...t,
        }
        set({ items: [doc, ...get().items.filter((x) => x.id !== id)] })
        return id
      },

      remove: (id) => set({ items: get().items.filter((x) => x.id !== id) }),

      getById: (id) => get().items.find((x) => x.id === id),
    }),
    {
      name: 'email-templates',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
)
