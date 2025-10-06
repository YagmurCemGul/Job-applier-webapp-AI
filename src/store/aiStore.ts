import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AISettings, AIModelRef, AITask } from '@/types/ai.types'

interface AIState {
  settings: AISettings
  setModelForTask: (task: AITask, ref: AIModelRef) => void
  setDefaults: (patch: Partial<AISettings['defaults']>) => void
  setToggles: (
    patch: Partial<Pick<AISettings, 'enableSafety' | 'enableCache' | 'cacheTTLms' | 'showMeters'>>
  ) => void
  reset: () => void
}

const DEFAULTS: AISettings = {
  perTask: {},
  defaults: {
    temperature: 0.2,
    timeoutMs: 30000,
    retryAttempts: 2,
    backoffMs: 600,
  },
  enableSafety: true,
  enableCache: true,
  cacheTTLms: 15 * 60 * 1000,
  showMeters: true,
}

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      settings: DEFAULTS,

      setModelForTask: (task, ref) =>
        set({
          settings: {
            ...get().settings,
            perTask: {
              ...get().settings.perTask,
              [task]: ref,
            },
          },
        }),

      setDefaults: (patch) =>
        set({
          settings: {
            ...get().settings,
            defaults: {
              ...get().settings.defaults,
              ...patch,
            },
          },
        }),

      setToggles: (patch) =>
        set({
          settings: {
            ...get().settings,
            ...patch,
          },
        }),

      reset: () => set({ settings: DEFAULTS }),
    }),
    { name: 'ai-settings', storage: createJSONStorage(() => localStorage), version: 1 }
  )
)

export function getAISettings(): AISettings {
  return useAIStore.getState().settings
}
