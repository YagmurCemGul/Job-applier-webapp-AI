import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  OnboardingPlan,
  PlanStage,
  PlanTask,
  EvidenceItem,
  Stakeholder
} from '@/types/onboarding.types'

interface OnboardingState {
  plans: OnboardingPlan[]
  upsert: (p: OnboardingPlan) => void
  update: (id: string, patch: Partial<OnboardingPlan>) => void
  setStage: (id: string, stage: PlanStage) => void
  addTask: (planId: string, t: PlanTask) => void
  setTask: (
    planId: string,
    taskId: string,
    patch: Partial<PlanTask>
  ) => void
  addEvidence: (planId: string, e: EvidenceItem) => void
  addStakeholder: (planId: string, s: Stakeholder) => void
  getById: (id: string) => OnboardingPlan | undefined
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      plans: [],

      upsert: (p) =>
        set({ plans: [p, ...get().plans.filter((x) => x.id !== p.id)] }),

      update: (id, patch) =>
        set({
          plans: get().plans.map((p) =>
            p.id === id
              ? { ...p, ...patch, updatedAt: new Date().toISOString() }
              : p
          )
        }),

      setStage: (id, stage) =>
        set({
          plans: get().plans.map((p) =>
            p.id === id
              ? { ...p, stage, updatedAt: new Date().toISOString() }
              : p
          )
        }),

      addTask: (planId, t) =>
        set({
          plans: get().plans.map((p) =>
            p.id === planId ? { ...p, tasks: [t, ...p.tasks] } : p
          )
        }),

      setTask: (planId, taskId, patch) =>
        set({
          plans: get().plans.map((p) =>
            p.id === planId
              ? {
                  ...p,
                  tasks: p.tasks.map((t) =>
                    t.id === taskId ? { ...t, ...patch } : t
                  )
                }
              : p
          )
        }),

      addEvidence: (planId, e) =>
        set({
          plans: get().plans.map((p) =>
            p.id === planId ? { ...p, evidence: [e, ...p.evidence] } : p
          )
        }),

      addStakeholder: (planId, s) =>
        set({
          plans: get().plans.map((p) =>
            p.id === planId
              ? { ...p, stakeholders: [s, ...p.stakeholders] }
              : p
          )
        }),

      getById: (id) => get().plans.find((p) => p.id === id)
    }),
    {
      name: 'onboarding',
      storage: createJSONStorage(() => localStorage),
      version: 1
    }
  )
)
