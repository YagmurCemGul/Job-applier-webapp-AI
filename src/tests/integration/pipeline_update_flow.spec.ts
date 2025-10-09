/**
 * @fileoverview Integration test for pipeline update flow
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useInterview } from '@/stores/interview.store';
import type { InterviewPlan, SessionRun } from '@/types/interview.types';

describe('Pipeline Update Flow Integration', () => {
  beforeEach(() => {
    useInterview.setState({ plans: [], runs: [], stories: [], followups: [] });
  });

  it('should track interview status for pipeline updates', () => {
    const { upsertPlan, upsertRun } = useInterview.getState();

    // Create plan linked to pipeline item
    const plan: InterviewPlan = {
      id: 'plan-1',
      pipelineItemId: 'pipeline-123',
      applicationId: 'app-456',
      company: 'TechCorp',
      role: 'Engineer',
      kind: 'behavioral',
      medium: 'video',
      startISO: new Date().toISOString(),
      endISO: new Date().toISOString(),
      tz: 'UTC',
      quietRespect: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    upsertPlan(plan);

    // Create mock run
    const run: SessionRun = {
      id: 'run-1',
      planId: plan.id,
      questionIds: ['q1'],
      storyIds: ['s1'],
      consent: { audio: true, video: false, transcription: true },
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString()
    };
    upsertRun(run);

    // Verify linkage
    const savedPlan = useInterview.getState().plans[0];
    const savedRun = useInterview.getState().runs[0];

    expect(savedPlan.pipelineItemId).toBe('pipeline-123');
    expect(savedPlan.applicationId).toBe('app-456');
    expect(savedRun.planId).toBe(plan.id);
  });

  it('should list completed interviews for tracker', () => {
    const { upsertPlan, upsertRun } = useInterview.getState();

    // Create multiple interview plans
    const plans: InterviewPlan[] = [
      {
        id: 'plan-1',
        company: 'CompanyA',
        kind: 'behavioral',
        medium: 'video',
        startISO: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endISO: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        tz: 'UTC',
        quietRespect: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'plan-2',
        company: 'CompanyB',
        kind: 'coding',
        medium: 'video',
        startISO: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endISO: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        tz: 'UTC',
        quietRespect: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    plans.forEach(p => upsertPlan(p));

    // Create runs for completed interviews
    const run: SessionRun = {
      id: 'run-1',
      planId: 'plan-1',
      questionIds: ['q1'],
      storyIds: [],
      consent: { audio: true, video: false, transcription: false },
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    upsertRun(run);

    const state = useInterview.getState();
    
    // Filter past vs upcoming
    const pastPlans = state.plans.filter(p => Date.parse(p.startISO) <= Date.now());
    const upcomingPlans = state.plans.filter(p => Date.parse(p.startISO) > Date.now());

    expect(pastPlans).toHaveLength(1);
    expect(upcomingPlans).toHaveLength(1);
  });

  it('should associate rubric scores with interviews', () => {
    const { upsertRun, updateRun } = useInterview.getState();

    const run: SessionRun = {
      id: 'run-1',
      questionIds: [],
      storyIds: [],
      consent: { audio: true, video: false, transcription: false },
      startedAt: new Date().toISOString()
    };
    upsertRun(run);

    // Add rubric score
    const rubricScore = {
      rubricId: 'default-behavioral',
      scores: { clarity: 4, structure: 3, impact: 4, ownership: 3 },
      total: 3.5
    };

    updateRun(run.id, { rubric: rubricScore });

    const updated = useInterview.getState().runs[0];
    expect(updated.rubric?.total).toBe(3.5);
  });

  it('should retrieve run by planId for status updates', () => {
    const { upsertPlan, upsertRun } = useInterview.getState();

    const plan: InterviewPlan = {
      id: 'plan-1',
      kind: 'behavioral',
      medium: 'video',
      startISO: new Date().toISOString(),
      endISO: new Date().toISOString(),
      tz: 'UTC',
      quietRespect: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    upsertPlan(plan);

    const run: SessionRun = {
      id: 'run-1',
      planId: plan.id,
      questionIds: [],
      storyIds: [],
      consent: { audio: true, video: false, transcription: false },
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString()
    };
    upsertRun(run);

    const { runs } = useInterview.getState();
    const matchingRun = runs.find(r => r.planId === plan.id);

    expect(matchingRun).toBeDefined();
    expect(matchingRun?.id).toBe(run.id);
  });
});
