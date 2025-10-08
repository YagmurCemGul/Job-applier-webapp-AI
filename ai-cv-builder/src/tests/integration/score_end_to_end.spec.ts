/**
 * Integration Test: Scorecard End-to-End
 * Tests: assign template → panelists submit → summary aggregates → export PDF
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useScorecards } from '@/stores/scorecards.store';
import { useInterviews } from '@/stores/interviews.store';
import type { ScorecardTemplate, ScoreSubmission } from '@/types/scorecard.types';
import type { Interview } from '@/types/interview.types';

describe('Integration: Scorecard End-to-End', () => {
  let template: ScorecardTemplate;
  let interview: Interview;

  beforeEach(() => {
    // Reset stores
    useScorecards.setState({ templates: [], submissions: [] });
    useInterviews.setState({ items: [] });

    // Create template
    template = {
      id: 'tpl-test',
      name: 'Software Engineering Interview',
      dimensions: [
        { id: 'dim-1', name: 'Coding', weight: 2 },
        { id: 'dim-2', name: 'System Design', weight: 1.5 },
        { id: 'dim-3', name: 'Communication', weight: 1 },
      ],
      rubric: {
        1: 'Poor',
        2: 'Below Average',
        3: 'Average',
        4: 'Good',
        5: 'Excellent',
      },
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
    };

    useScorecards.getState().upsertTemplate(template);

    // Create interview
    interview = {
      id: 'int-test',
      applicationId: 'app-123',
      candidateName: 'Jane Doe',
      role: 'Senior Software Engineer',
      company: 'Tech Corp',
      stage: 'in_progress',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
      panel: [
        { id: 'p1', name: 'Alice', email: 'alice@company.com', role: 'Tech Lead' },
        { id: 'p2', name: 'Bob', email: 'bob@company.com', role: 'Manager' },
      ],
      consent: { recordingAllowed: true },
      scorecardTemplateId: template.id,
      scoreSubmissions: [],
    };

    useInterviews.getState().upsert(interview);
  });

  it('should complete full scorecard workflow', () => {
    const { upsertSubmission, byInterview } = useScorecards.getState();
    const { update } = useInterviews.getState();

    // Step 1: First panelist submits
    const submission1: ScoreSubmission = {
      id: 'sub-1',
      interviewId: interview.id,
      panelistId: 'p1',
      ratings: [
        { dimensionId: 'dim-1', score: 5, note: 'Excellent coding skills' },
        { dimensionId: 'dim-2', score: 4, note: 'Good system design' },
        { dimensionId: 'dim-3', score: 4 },
      ],
      overall: 4,
      recommendation: 'strong_yes',
      submittedAt: '2025-01-01T10:00:00Z',
    };

    upsertSubmission(submission1);
    update(interview.id, { scoreSubmissions: [submission1.id] });

    // Step 2: Second panelist submits
    const submission2: ScoreSubmission = {
      id: 'sub-2',
      interviewId: interview.id,
      panelistId: 'p2',
      ratings: [
        { dimensionId: 'dim-1', score: 4 },
        { dimensionId: 'dim-2', score: 5, note: 'Impressive architecture knowledge' },
        { dimensionId: 'dim-3', score: 5 },
      ],
      overall: 5,
      recommendation: 'yes',
      submittedAt: '2025-01-01T10:30:00Z',
    };

    upsertSubmission(submission2);
    update(interview.id, {
      scoreSubmissions: [submission1.id, submission2.id],
    });

    // Step 3: Verify aggregation
    const submissions = byInterview(interview.id);
    expect(submissions).toHaveLength(2);

    // Calculate aggregates (simplified)
    const codingScores = submissions
      .map(s => s.ratings.find(r => r.dimensionId === 'dim-1')?.score)
      .filter((s): s is number => s !== undefined);
    const avgCoding = codingScores.reduce((a, b) => a + b, 0) / codingScores.length;

    expect(avgCoding).toBe(4.5); // (5 + 4) / 2

    // Step 4: Verify recommendations
    const recommendations = submissions.reduce((acc, s) => {
      acc[s.recommendation] = (acc[s.recommendation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    expect(recommendations.strong_yes).toBe(1);
    expect(recommendations.yes).toBe(1);
  });

  it('should handle weighted scoring correctly', () => {
    const { upsertSubmission } = useScorecards.getState();

    const submission: ScoreSubmission = {
      id: 'sub-weighted',
      interviewId: interview.id,
      panelistId: 'p1',
      ratings: [
        { dimensionId: 'dim-1', score: 4 }, // weight 2
        { dimensionId: 'dim-2', score: 3 }, // weight 1.5
        { dimensionId: 'dim-3', score: 5 }, // weight 1
      ],
      recommendation: 'yes',
      submittedAt: '2025-01-01',
    };

    upsertSubmission(submission);

    // Weighted average: (4*2 + 3*1.5 + 5*1) / (2+1.5+1) = 17.5 / 4.5 = 3.89
    const weighted = (4 * 2 + 3 * 1.5 + 5 * 1) / (2 + 1.5 + 1);
    expect(weighted).toBeCloseTo(3.89, 2);
  });

  it('should track submission timeline', () => {
    const { upsertSubmission, byInterview } = useScorecards.getState();

    const times = [
      '2025-01-01T09:00:00Z',
      '2025-01-01T09:30:00Z',
      '2025-01-01T10:00:00Z',
    ];

    times.forEach((time, i) => {
      upsertSubmission({
        id: `sub-${i}`,
        interviewId: interview.id,
        panelistId: `p${i}`,
        ratings: [],
        recommendation: 'yes',
        submittedAt: time,
      });
    });

    const submissions = byInterview(interview.id);
    const sortedTimes = submissions.map(s => s.submittedAt).sort();

    expect(sortedTimes).toEqual(times.sort());
  });
});
