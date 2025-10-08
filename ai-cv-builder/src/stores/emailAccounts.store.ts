/**
 * Email accounts store for managing Gmail OAuth connections
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GmailAccount } from '@/types/gmail.types';

interface EmailAccountsState {
  items: GmailAccount[];
  upsert: (acc: GmailAccount) => void;
  remove: (id: string) => void;
  setDryRun: (id: string, v: boolean) => void;
  getById: (id: string) => GmailAccount | undefined;
}

export const useEmailAccounts = create<EmailAccountsState>()(
  persist(
    (set, get) => ({
      items: [],
      upsert: (acc) => set({ items: [acc, ...get().items.filter(a => a.id !== acc.id)] }),
      remove: (id) => set({ items: get().items.filter(a => a.id !== id) }),
      setDryRun: (id, v) => set({ items: get().items.map(a => a.id === id ? ({ ...a, dryRun: v }) : a) }),
      getById: (id) => get().items.find(a => a.id === id)
    }),
    { name: 'email-accounts', storage: createJSONStorage(() => localStorage), version: 1 }
  )
);
