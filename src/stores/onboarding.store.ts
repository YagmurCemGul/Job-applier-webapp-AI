/**
 * @fileoverview Zustand store for onboarding plans (Step 45 enhanced).
 * @module stores/onboarding
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  OnboardingPlan,
  PlanStage,
  PlanTask,
  EvidenceItem,
  Stakeholder,
  Plan,
  ChecklistItem,
  CadenceEvent,
  WeeklyReport,
  RiskItem,
  LearningItem,
} from '@/types/onboarding.types';

interface OnboardingState {
  // Legacy plan support
  plans: OnboardingPlan[];
  upsert: (p: OnboardingPlan) => void;
  update: (id: string, patch: Partial<OnboardingPlan>) => void;
  setStage: (id: string, stage: PlanStage) => void;
  addTask: (planId: string, t: PlanTask) => void;
  setTask: (planId: string, taskId: string, patch: Partial<PlanTask>) => void;
  addEvidence: (planId: string, e: EvidenceItem) => void;
  addStakeholder: (planId: string, s: Stakeholder) => void;
  getById: (id: string) => OnboardingPlan | undefined;
  
  // Step 45: SMART goals plan
  plan?: Plan;
  checklist: ChecklistItem[];
  cadences: CadenceEvent[];
  reports: WeeklyReport[];
  risks: RiskItem[];
  learning: LearningItem[];
  setPlan: (p: Plan) => void;
  upsertChecklist: (c: ChecklistItem) => void;
  toggleChecklist: (id: string) => void;
  upsertCadence: (e: CadenceEvent) => void;
  upsertReport: (r: WeeklyReport) => void;
  upsertRisk: (r: RiskItem) => void;
  upsertLearning: (l: LearningItem) => void;
}

export const useOnboarding = create<OnboardingState>()(
  persist(
    (set, get) => ({
      // Legacy
      plans: [],
      upsert: (p) =>
        set({
          plans: [p, ...get().plans.filter((x) => x.id !== p.id)],
        }),
      update: (id, patch) =>
        set({
          plans: get().plans.map((p) =>
            p.id === id
              ? { ...p, ...patch, updatedAt: new Date().toISOString() }
              : p
          ),
        }),
      setStage: (id, stage) =>
        set({
          plans: get().plans.map((p) =>
            p.id === id
              ? { ...p, stage, updatedAt: new Date().toISOString() }
              : p
          ),
        }),
      addTask: (planId, t) =>
        set({
          plans: get().plans.map((p) =>
            p.id === planId ? { ...p, tasks: [t, ...p.tasks] } : p
          ),
        }),
      setTask: (planId, taskId, patch) =>
        set({
          plans: get().plans.map((p) =>
            p.id === planId
              ? {
                  ...p,
                  tasks: p.tasks.map((t) =>
                    t.id === taskId ? { ...t, ...patch } : t
                  ),
                }
              : p
          ),
        }),
      addEvidence: (planId, e) =>
        set({
          plans: get().plans.map((p) =>
            p.id === planId ? { ...p, evidence: [e, ...p.evidence] } : p
          ),
        }),
      addStakeholder: (planId, s) =>
        set({
          plans: get().plans.map((p) =>
            p.id === planId ? { ...p, stakeholders: [s, ...p.stakeholders] } : p
          ),
        }),
      getById: (id) => get().plans.find((p) => p.id === id),
      
      // Step 45
      plan: undefined,
      checklist: [],
      cadences: [],
      reports: [],
      risks: [],
      learning: [],
      setPlan: (p) => set({ plan: { ...p, updatedAt: new Date().toISOString() } }),
      upsertChecklist: (c) => set({ checklist: [c, ...get().checklist.filter(x => x.id !== c.id)] }),
      toggleChecklist: (id) => set({ checklist: get().checklist.map(x => x.id === id ? { ...x, done: !x.done } : x) }),
      upsertCadence: (e) => set({ cadences: [e, ...get().cadences.filter(x => x.id !== e.id)] }),
      upsertReport: (r) => set({ reports: [r, ...get().reports.filter(x => x.id !== r.id)] }),
      upsertRisk: (r) => set({ risks: [r, ...get().risks.filter(x => x.id !== r.id)] }),
      upsertLearning: (l) => set({ learning: [l, ...get().learning.filter(x => x.id !== l.id)] }),
    }),
    {
      name: 'onboarding',
      storage: createJSONStorage(() => localStorage),
      version: 2,
    }
  )
);
