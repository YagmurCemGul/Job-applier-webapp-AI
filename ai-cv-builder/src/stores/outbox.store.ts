/**
 * Outbox store for managing sent and pending emails
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { OutboxMessage } from '@/types/gmail.types';

interface OutboxState {
  messages: OutboxMessage[];
  upsert: (m: OutboxMessage) => void;
  setStatus: (id: string, status: OutboxMessage['status'], patch?: Partial<OutboxMessage>) => void;
  byThread: (threadId: string) => OutboxMessage[];
  getById: (id: string) => OutboxMessage | undefined;
}

export const useOutbox = create<OutboxState>()(
  persist(
    (set, get) => ({
      messages: [],
      upsert: (m) => set({ messages: [m, ...get().messages.filter(x => x.id !== m.id)] }),
      setStatus: (id, status, patch) => set({ 
        messages: get().messages.map(m => 
          m.id === id ? ({ ...m, status, ...patch }) : m
        ) 
      }),
      byThread: (threadId) => get().messages.filter(m => m.threadId === threadId),
      getById: (id) => get().messages.find(m => m.id === id)
    }),
    { name: 'outbox', storage: createJSONStorage(() => localStorage), version: 1 }
  )
);
