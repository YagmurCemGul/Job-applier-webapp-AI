/**
 * @fileoverview Integration test for cycle feedback flow
 * Creates cycle → sends feedback → records responses → AI summary → export redacted
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useReviews } from '@/stores/review.store';
import { useFeedback } from '@/stores/feedback.store';
import { recordFeedbackResponse } from '@/services/review/feedback.service';
import { summarizeFeedback } from '@/services/review/sentiment.service';
import type { ReviewCycle, FeedbackRequest } from '@/types/review.types';

// Mock AI services
vi.mock('@/services/features/aiComplete.service', () => ({
  aiComplete: vi.fn((prompt: string) => {
    if (prompt.includes('Label as')) return Promise.resolve('POSITIVE');
    if (prompt.includes('Summarize')) return Promise.resolve('Strong execution skills. Good collaboration.');
    return Promise.resolve('');
  }),
}));

vi.mock('@/services/review/sentiment.service', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    analyzeSentiment: vi.fn().mockResolvedValue('positive'),
  };
});

describe('cycle_feedback_flow', () => {
  beforeEach(() => {
    useReviews.setState({ cycles: [], impacts: [], selfReviews: [] });
    useFeedback.setState({ requests: [], responses: [] });
  });

  it('completes full feedback cycle workflow', async () => {
    // 1. Create cycle
    const cycle: ReviewCycle = {
      id: 'cycle-1',
      title: 'H1 2025 Review',
      kind: 'mid_year',
      stage: 'collecting',
      startISO: '2025-01-01T00:00:00Z',
      endISO: '2025-06-30T00:00:00Z',
      deadlines: [],
      retentionDays: 90,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    };

    useReviews.getState().upsertCycle(cycle);

    // 2. Create feedback requests
    const request1: FeedbackRequest = {
      id: 'req-1',
      cycleId: 'cycle-1',
      reviewerEmail: 'reviewer1@example.com',
      reviewerName: 'Alice Smith',
      relationship: 'peer',
      status: 'sent',
      sentAt: '2025-02-01T00:00:00Z',
    };

    const request2: FeedbackRequest = {
      id: 'req-2',
      cycleId: 'cycle-1',
      reviewerEmail: 'reviewer2@example.com',
      reviewerName: 'Bob Jones',
      relationship: 'manager',
      status: 'sent',
      sentAt: '2025-02-01T00:00:00Z',
    };

    useFeedback.getState().upsertRequest(request1);
    useFeedback.getState().upsertRequest(request2);

    // 3. Record responses
    const response1 = await recordFeedbackResponse(
      request1,
      'Great work on the migration project. Alice Smith showed strong technical skills.'
    );

    const response2 = await recordFeedbackResponse(
      request2,
      'Excellent collaboration and leadership. Bob Jones appreciates the mentorship.'
    );

    // 4. Verify responses stored
    const { responses } = useFeedback.getState().byCycle('cycle-1');
    expect(responses.length).toBe(2);

    // 5. Verify redaction applied
    expect(response1.redactedBody).toContain('[redacted-name]');
    expect(response1.redactedBody).not.toContain('Alice Smith');

    // 6. Generate AI summary
    const summary = await summarizeFeedback(responses.map(r => r.body));
    expect(summary).toBeTruthy();
    expect(summary.length).toBeGreaterThan(0);

    // 7. Verify sentiment
    expect(response1.sentiment).toBe('positive');
    expect(response2.sentiment).toBe('positive');
  });

  it('handles anonymous feedback correctly', async () => {
    const cycle: ReviewCycle = {
      id: 'cycle-2',
      title: 'Anonymous Review',
      kind: 'mid_year',
      stage: 'collecting',
      startISO: '2025-01-01T00:00:00Z',
      endISO: '2025-06-30T00:00:00Z',
      deadlines: [],
      retentionDays: 90,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    };

    useReviews.getState().upsertCycle(cycle);

    const anonymousRequest: FeedbackRequest = {
      id: 'req-anon',
      cycleId: 'cycle-2',
      reviewerEmail: 'anonymous@example.com',
      anonymous: true,
      status: 'sent',
    };

    useFeedback.getState().upsertRequest(anonymousRequest);

    const response = await recordFeedbackResponse(
      anonymousRequest,
      'John Doe needs to improve documentation. Contact john.doe@example.com for details.'
    );

    expect(response.redactedBody).toContain('[redacted-name]');
    expect(response.redactedBody).toContain('[redacted-email]');
    expect(response.redactedBody).not.toContain('John Doe');
    expect(response.redactedBody).not.toContain('john.doe@example.com');
  });
});
