/**
 * Assessment Scoring Unit Tests (Step 47)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useSkills } from '@/stores/skills.store';
import { startAttempt, submitAttempt } from '@/services/skills/assessments.service';
import type { Assessment } from '@/types/skills.types';

describe('Assessment Scoring', () => {
  beforeEach(() => {
    useSkills.setState({ assessments: [], attempts: [] });
  });

  it('scores quiz questions correctly', () => {
    const asmt: Assessment = {
      id: 'asmt-1',
      title: 'Quiz Test',
      kind: 'quiz',
      competencyKey: 'coding',
      passScore: 70,
      questions: [
        { id: 'q1', prompt: 'Q1?', choices: ['A', 'B'], answer: 'A' },
        { id: 'q2', prompt: 'Q2?', choices: ['X', 'Y'], answer: 'Y' }
      ]
    };
    useSkills.getState().upsertAssessment(asmt);

    const attempt = startAttempt('asmt-1');
    const finished = submitAttempt(attempt.id, { q1: 'A', q2: 'X' }); // 1/2 correct

    expect(finished.scorePct).toBe(30); // 50% quiz * 0.6 = 30
  });

  it('combines quiz and rubric with 60/40 weights', () => {
    const asmt: Assessment = {
      id: 'asmt-2',
      title: 'Mixed',
      kind: 'code',
      competencyKey: 'system_design',
      passScore: 70,
      questions: [
        { id: 'q1', prompt: 'Quiz Q', choices: ['A', 'B'], answer: 'A' },
        { id: 'q2', prompt: 'Code Q', rubric: [{ criterion: 'quality', max: 10 }] }
      ]
    };
    useSkills.getState().upsertAssessment(asmt);

    const attempt = startAttempt('asmt-2');
    const finished = submitAttempt(
      attempt.id,
      { q1: 'A' },
      { quality: 8 } // 8/10 = 80%
    );

    // quiz: 100%, rubric: 80% => 100*0.6 + 80*0.4 = 60 + 32 = 92
    expect(finished.scorePct).toBe(92);
  });

  it('includes explainable feedback HTML', () => {
    const asmt: Assessment = {
      id: 'asmt-3',
      title: 'Test',
      kind: 'quiz',
      competencyKey: 'domain',
      passScore: 70,
      questions: [{ id: 'q1', prompt: 'Q?', choices: ['A'], answer: 'A' }]
    };
    useSkills.getState().upsertAssessment(asmt);

    const attempt = startAttempt('asmt-3');
    const finished = submitAttempt(attempt.id, { q1: 'A' });

    expect(finished.feedbackHtml).toContain('Assessment Results');
    expect(finished.feedbackHtml).toContain('Quiz 60% / Rubric 40%');
    expect(finished.feedbackHtml).toContain('educational guidance');
  });

  it('handles no answers gracefully', () => {
    const asmt: Assessment = {
      id: 'asmt-4',
      title: 'Empty',
      kind: 'quiz',
      competencyKey: 'execution',
      passScore: 70,
      questions: [{ id: 'q1', prompt: 'Q?', choices: ['A'], answer: 'A' }]
    };
    useSkills.getState().upsertAssessment(asmt);

    const attempt = startAttempt('asmt-4');
    const finished = submitAttempt(attempt.id, {});

    expect(finished.scorePct).toBe(0);
  });
});
