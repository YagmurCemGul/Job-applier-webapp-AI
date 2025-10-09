/**
 * @fileoverview Integration test for plan -> mock -> feedback flow
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useInterview } from '@/stores/interview.store';
import { useQuestionBank } from '@/stores/questionBank.store';
import type { InterviewPlan, SessionRun, Transcript } from '@/types/interview.types';
import { computeScore, DEFAULT_RUBRIC } from '@/services/interview/rubric.service';

describe('Plan -> Mock -> Feedback Integration', () => {
  beforeEach(() => {
    useInterview.setState({ plans: [], runs: [], stories: [], followups: [] });
    useQuestionBank.setState({ items: [] });
  });

  it('should create complete interview flow', async () => {
    const { upsertPlan, upsertRun, updateRun } = useInterview.getState();

    // Step 1: Create plan
    const plan: InterviewPlan = {
      id: 'plan-1',
      company: 'TechCorp',
      role: 'Engineer',
      kind: 'behavioral',
      medium: 'video',
      startISO: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endISO: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
      tz: 'UTC',
      quietRespect: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    upsertPlan(plan);

    expect(useInterview.getState().plans).toHaveLength(1);

    // Step 2: Start mock with consent
    const run: SessionRun = {
      id: 'run-1',
      planId: plan.id,
      questionIds: ['q1', 'q2'],
      storyIds: ['s1'],
      consent: { audio: true, video: false, transcription: true },
      startedAt: new Date().toISOString()
    };
    upsertRun(run);

    expect(useInterview.getState().runs).toHaveLength(1);

    // Step 3: Stop and add transcript
    const transcript: Transcript = {
      lang: 'en',
      text: 'Test interview transcript with clear communication.',
      segments: [{ t0: 0, t1: 300, text: 'Full transcript text' }],
      wordsPerMin: 120,
      fillerCount: 2,
      talkListenRatio: 0.85
    };

    updateRun(run.id, {
      endedAt: new Date().toISOString(),
      transcript
    });

    const updated = useInterview.getState().runs[0];
    expect(updated.transcript).toBeDefined();
    expect(updated.endedAt).toBeDefined();

    // Step 4: Compute rubric score
    const ratings = { clarity: 4, structure: 3, impact: 4, ownership: 3 };
    const rubricScore = computeScore({
      rubric: DEFAULT_RUBRIC,
      ratings,
      notes: 'Good overall performance'
    });

    updateRun(run.id, { rubric: rubricScore });

    const withRubric = useInterview.getState().runs[0];
    expect(withRubric.rubric?.total).toBe(3.5);

    // Step 5: Add AI feedback
    const feedbackHtml = '<h2>Strengths</h2><p>Clear communication</p>';
    updateRun(run.id, { feedbackHtml });

    const final = useInterview.getState().runs[0];
    expect(final.feedbackHtml).toBeTruthy();
  });

  it('should link plan to run correctly', () => {
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
      startedAt: new Date().toISOString()
    };
    upsertRun(run);

    const savedRun = useInterview.getState().runs[0];
    expect(savedRun.planId).toBe(plan.id);
  });
});
