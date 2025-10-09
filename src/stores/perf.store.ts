/**
 * Performance Review Store
 * 
 * Manages state for feedback, evidence, cycles, calibration, ratings, and exports.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  FeedbackTemplate,
  FeedbackRequest,
  FeedbackResponse,
  EvidenceLink,
  ReviewCycle,
  RubricDef,
  CalibSummary,
  RatingScenario,
  PromotionExpectation,
  GapAnalysis,
  NarrativeDoc,
  PerfPacketExport,
} from '@/types/perf.types';

interface PerfState {
  templates: FeedbackTemplate[];
  requests: FeedbackRequest[];
  responses: FeedbackResponse[];
  graph: EvidenceLink[];
  cycles: ReviewCycle[];
  rubrics: RubricDef[];
  calibrations: CalibSummary[];
  scenarios: RatingScenario[];
  expectations: PromotionExpectation[];
  gaps: GapAnalysis[];
  narratives: NarrativeDoc[];
  exports: PerfPacketExport[];

  upsertTemplate: (t: FeedbackTemplate) => void;
  upsertRequest: (r: FeedbackRequest) => void;
  upsertResponse: (r: FeedbackResponse) => void;
  upsertEvidence: (e: EvidenceLink) => void;
  upsertCycle: (c: ReviewCycle) => void;
  upsertRubric: (r: RubricDef) => void;
  upsertCalib: (c: CalibSummary) => void;
  upsertScenario: (s: RatingScenario) => void;
  upsertExpectation: (e: PromotionExpectation) => void;
  upsertGap: (g: GapAnalysis) => void;
  upsertNarrative: (n: NarrativeDoc) => void;
  upsertExport: (e: PerfPacketExport) => void;
}

export const usePerf = create<PerfState>()(
  persist(
    (set, get) => ({
      templates: [],
      requests: [],
      responses: [],
      graph: [],
      cycles: [],
      rubrics: [],
      calibrations: [],
      scenarios: [],
      expectations: [],
      gaps: [],
      narratives: [],
      exports: [],

      upsertTemplate: (t) =>
        set({ templates: [t, ...get().templates.filter((x) => x.id !== t.id)] }),
      upsertRequest: (r) =>
        set({ requests: [r, ...get().requests.filter((x) => x.id !== r.id)] }),
      upsertResponse: (r) =>
        set({ responses: [r, ...get().responses.filter((x) => x.id !== r.id)] }),
      upsertEvidence: (e) =>
        set({ graph: [e, ...get().graph.filter((x) => x.id !== e.id)] }),
      upsertCycle: (c) =>
        set({ cycles: [c, ...get().cycles.filter((x) => x.id !== c.id)] }),
      upsertRubric: (r) =>
        set({ rubrics: [r, ...get().rubrics.filter((x) => x.id !== r.id)] }),
      upsertCalib: (c) =>
        set({ calibrations: [c, ...get().calibrations.filter((x) => x.id !== c.id)] }),
      upsertScenario: (s) =>
        set({ scenarios: [s, ...get().scenarios.filter((x) => x.id !== s.id)] }),
      upsertExpectation: (e) =>
        set({ expectations: [e, ...get().expectations.filter((x) => x.id !== e.id)] }),
      upsertGap: (g) =>
        set({ gaps: [g, ...get().gaps.filter((x) => x.id !== g.id)] }),
      upsertNarrative: (n) =>
        set({ narratives: [n, ...get().narratives.filter((x) => x.id !== n.id)] }),
      upsertExport: (e) =>
        set({ exports: [e, ...get().exports.filter((x) => x.id !== e.id)] }),
    }),
    { name: 'perf', storage: createJSONStorage(() => localStorage), version: 1 }
  )
);
