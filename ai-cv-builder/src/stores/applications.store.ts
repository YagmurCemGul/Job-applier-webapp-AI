/**
 * Applications Store
 * Manages application records, stages, events, logs, and files
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Application, AppStage, AppEvent } from '@/types/applications.types';
import type { ApplyLogEntry, FileRef } from '@/types/apply.types';

interface ApplicationsState {
  items: Application[];
  activeId?: string;
  create: (init: Omit<Application, 'id' | 'updatedAt' | 'logs' | 'status'> & Partial<Pick<Application, 'status'>>) => string;
  setStage: (id: string, stage: AppStage) => void;
  update: (id: string, patch: Partial<Application>) => void;
  addEvent: (id: string, ev: AppEvent) => void;
  addLog: (id: string, log: ApplyLogEntry) => void;
  attachFiles: (id: string, files: FileRef[]) => void;
  select: (id?: string) => void;
}

function rid() {
  return crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

export const useApplicationsStore = create<ApplicationsState>()(
  persist(
    (set, get) => ({
      items: [],
      
      create: (init) => {
        const id = rid();
        const now = new Date().toISOString();
        const doc: Application = {
          id,
          stage: 'applied',
          status: 'open',
          updatedAt: now,
          files: [],
          contacts: [],
          events: [],
          logs: [],
          ...init
        };
        set({ items: [doc, ...get().items], activeId: id });
        return id;
      },
      
      setStage: (id, stage) =>
        set({
          items: get().items.map(a =>
            a.id === id
              ? { ...a, stage, updatedAt: new Date().toISOString() }
              : a
          )
        }),
      
      update: (id, patch) =>
        set({
          items: get().items.map(a =>
            a.id === id
              ? { ...a, ...patch, updatedAt: new Date().toISOString() }
              : a
          )
        }),
      
      addEvent: (id, ev) =>
        set({
          items: get().items.map(a =>
            a.id === id ? { ...a, events: [ev, ...a.events] } : a
          )
        }),
      
      addLog: (id, log) =>
        set({
          items: get().items.map(a =>
            a.id === id
              ? { ...a, logs: [log, ...a.logs].slice(0, 200) }
              : a
          )
        }),
      
      attachFiles: (id, files) =>
        set({
          items: get().items.map(a =>
            a.id === id ? { ...a, files: [...a.files, ...files] } : a
          )
        }),
      
      select: (id) => set({ activeId: id })
    }),
    {
      name: 'applications',
      storage: createJSONStorage(() => localStorage),
      version: 1
    }
  )
);
