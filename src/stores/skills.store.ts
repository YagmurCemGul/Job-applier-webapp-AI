/**
 * Skills & Career Ladder store (Step 47)
 * Manages frameworks, inventory, evidence, learning paths, assessments, badges, flashcards.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  RoleFramework, SkillInventoryRow, SkillEvidenceLink, LearningResource, LearningPath,
  Assessment, Attempt, Badge, Flashcard, GrowthPacketExport
} from '@/types/skills.types';

interface SkillsState {
  frameworks: RoleFramework[];
  inventory: SkillInventoryRow[];
  evidence: SkillEvidenceLink[];
  resources: LearningResource[];
  paths: LearningPath[];
  assessments: Assessment[];
  attempts: Attempt[];
  badges: Badge[];
  cards: Flashcard[];
  exports: GrowthPacketExport[];

  upsertFramework: (f: RoleFramework) => void;
  upsertInventory: (r: SkillInventoryRow) => void;
  upsertEvidence: (e: SkillEvidenceLink) => void;
  upsertResource: (r: LearningResource) => void;
  upsertPath: (p: LearningPath) => void;
  upsertAssessment: (a: Assessment) => void;
  upsertAttempt: (a: Attempt) => void;
  upsertBadge: (b: Badge) => void;
  upsertCard: (c: Flashcard) => void;
  upsertExport: (e: GrowthPacketExport) => void;

  byCompetency: (key: string) => { inventory?: SkillInventoryRow; evidence: SkillEvidenceLink[]; resources: LearningResource[]; };
}

export const useSkills = create<SkillsState>()(
  persist((set, get) => ({
    frameworks: [],
    inventory: [],
    evidence: [],
    resources: [],
    paths: [],
    assessments: [],
    attempts: [],
    badges: [],
    cards: [],
    exports: [],

    upsertFramework: (f: RoleFramework) => set({ 
      frameworks: [f, ...get().frameworks.filter(x => x.id !== f.id)] 
    }),

    upsertInventory: (r: SkillInventoryRow) => set({ 
      inventory: [r, ...get().inventory.filter(x => x.id !== r.id && x.competencyKey !== r.competencyKey)] 
    }),

    upsertEvidence: (e: SkillEvidenceLink) => set({ 
      evidence: [e, ...get().evidence.filter(x => x.id !== e.id)] 
    }),

    upsertResource: (r: LearningResource) => set({ 
      resources: [r, ...get().resources.filter(x => x.id !== r.id)] 
    }),

    upsertPath: (p: LearningPath) => set({ 
      paths: [p, ...get().paths.filter(x => x.id !== p.id)] 
    }),

    upsertAssessment: (a: Assessment) => set({ 
      assessments: [a, ...get().assessments.filter(x => x.id !== a.id)] 
    }),

    upsertAttempt: (a: Attempt) => set({ 
      attempts: [a, ...get().attempts.filter(x => x.id !== a.id)] 
    }),

    upsertBadge: (b: Badge) => set({ 
      badges: [b, ...get().badges.filter(x => x.id !== b.id)] 
    }),

    upsertCard: (c: Flashcard) => set({ 
      cards: [c, ...get().cards.filter(x => x.id !== c.id)] 
    }),

    upsertExport: (e: GrowthPacketExport) => set({ 
      exports: [e, ...get().exports.filter(x => x.id !== e.id)] 
    }),

    byCompetency: (key: string) => ({
      inventory: get().inventory.find(i => i.competencyKey === key),
      evidence: get().evidence.filter(e => e.competencyKey === key),
      resources: get().resources.filter(r => r.competencyKeys.includes(key))
    })
  }), { 
    name: 'skills', 
    storage: createJSONStorage(() => localStorage), 
    version: 1 
  })
);
