/**
 * @fileoverview Interview store for Step 43 — Interview Coach & Scheduler
 * @module stores/interview
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { InterviewPlan, SessionRun, StorySTAR, FollowUp } from '@/types/interview.types';

interface InterviewState {
  plans: InterviewPlan[];
  runs: SessionRun[];
  stories: StorySTAR[];
  followups: FollowUp[];
  upsertPlan: (p: InterviewPlan) => void;
  upsertRun: (r: SessionRun) => void;
  updateRun: (id: string, patch: Partial<SessionRun>) => void;
  upsertStory: (s: StorySTAR) => void;
  upsertFollow: (f: FollowUp) => void;
  getRunById: (id: string) => SessionRun | undefined;
  getPlanById: (id: string) => InterviewPlan | undefined;
}

/**
 * Global store for interview coaching data
 */
export const useInterview = create<InterviewState>()(
  persist(
    (set, get) => ({
      plans: [],
      runs: [],
      stories: [],
      followups: [],
      
      upsertPlan: (p) => {
        const existing = get().plans.filter(x => x.id !== p.id);
        set({ plans: [p, ...existing] });
      },
      
      upsertRun: (r) => {
        const existing = get().runs.filter(x => x.id !== r.id);
        set({ runs: [r, ...existing] });
      },
      
      updateRun: (id, patch) => {
        set({
          runs: get().runs.map(x =>
            x.id === id
              ? { ...x, ...patch, endedAt: patch.endedAt ?? x.endedAt }
              : x
          )
        });
      },
      
      upsertStory: (s) => {
        const existing = get().stories.filter(x => x.id !== s.id);
        set({ stories: [s, ...existing] });
      },
      
      upsertFollow: (f) => {
        const existing = get().followups.filter(x => x.id !== f.id);
        set({ followups: [f, ...existing] });
      },
      
      getRunById: (id) => get().runs.find(x => x.id === id),
      
      getPlanById: (id) => get().plans.find(x => x.id === id)
    }),
    {
      name: 'interview',
      storage: createJSONStorage(() => localStorage),
      version: 1
    }
  )
);
