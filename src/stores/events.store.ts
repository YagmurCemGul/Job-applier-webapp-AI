import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { EventItem } from '@/types/events.types';

interface EventState {
  items: EventItem[];
  upsert: (e: EventItem) => void;
  remove: (id: string) => void;
}

export const useEvents = create<EventState>()(
  persist(
    (set, get) => ({
      items: [],
      upsert: (e) => set({ items: [e, ...get().items.filter(x=>x.id!==e.id)] }),
      remove: (id) => set({ items: get().items.filter(x=>x.id!==id) })
    }),
    { name:'events', storage: createJSONStorage(()=>localStorage), version:1 }
  )
);
