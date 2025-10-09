import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Contact } from '@/types/contacts.types';

interface ContactsState {
  items: Contact[];
  upsert: (c: Contact) => void;
  update: (id: string, patch: Partial<Contact>) => void;
  remove: (id: string) => void;
  findByEmail: (email?: string) => Contact|undefined;
  getById: (id: string) => Contact|undefined;
}

export const useContacts = create<ContactsState>()(
  persist(
    (set, get) => ({
      items: [],
      upsert: (c) => set({ items: [c, ...get().items.filter(x => x.id !== c.id)] }),
      update: (id, patch) => set({ items: get().items.map(x => x.id===id ? ({ ...x, ...patch, updatedAt: new Date().toISOString() }) : x) }),
      remove: (id) => set({ items: get().items.filter(x => x.id !== id) }),
      findByEmail: (email) => email ? get().items.find(x => x.email?.toLowerCase() === email.toLowerCase()) : undefined,
      getById: (id) => get().items.find(x => x.id===id)
    }),
    { name:'contacts', storage: createJSONStorage(()=>localStorage), version:1 }
  )
);
