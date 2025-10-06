import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ContactRef } from '@/types/applications.types'

interface ContactsState {
  items: ContactRef[]
  upsert: (c: ContactRef) => void
  remove: (id: string) => void
}

export const useContactsStore = create<ContactsState>()(
  persist(
    (set, get) => ({
      items: [],

      upsert: (c) =>
        set({ items: [c, ...get().items.filter((x) => x.id !== c.id)] }),

      remove: (id) => set({ items: get().items.filter((x) => x.id !== id) })
    }),
    {
      name: 'contacts',
      storage: createJSONStorage(() => localStorage),
      version: 1
    }
  )
)
