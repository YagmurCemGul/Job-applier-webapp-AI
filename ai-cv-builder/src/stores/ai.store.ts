/**
 * AI Settings Store
 * Zustand store for AI orchestration settings with persistence
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AISettings, AIModelRef, AITask } from '@/types/ai.types';

interface AIState {
  settings: AISettings;
  setModelForTask: (task: AITask, ref: AIModelRef) => void;
  setDefaults: (patch: Partial<AISettings['defaults']>) => void;
  setToggles: (patch: Partial<Pick<AISettings, 'enableSafety' | 'enableCache' | 'cacheTTLms' | 'showMeters'>>) => void;
  reset: () => void;
}

const DEFAULTS: AISettings = {
  perTask: {},
  defaults: { temperature: 0.2, timeoutMs: 30000, retryAttempts: 2, backoffMs: 600 },
  enableSafety: true,
  enableCache: true,
  cacheTTLms: 15 * 60 * 1000,
  showMeters: true
};

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      settings: DEFAULTS,
      setModelForTask: (task: AITask, ref: AIModelRef) => set({ 
        settings: { 
          ...get().settings, 
          perTask: { ...get().settings.perTask, [task]: ref } 
        } 
      }),
      setDefaults: (patch: Partial<AISettings['defaults']>) => set({ 
        settings: { 
          ...get().settings, 
          defaults: { ...get().settings.defaults, ...patch } 
        } 
      }),
      setToggles: (patch: Partial<Pick<AISettings, 'enableSafety' | 'enableCache' | 'cacheTTLms' | 'showMeters'>>) => set({ 
        settings: { ...get().settings, ...patch } 
      }),
      reset: () => set({ settings: DEFAULTS })
    }),
    { name: 'ai-settings', storage: createJSONStorage(() => localStorage), version: 1 }
  )
);

export function getAISettings() { return useAIStore.getState().settings; }
