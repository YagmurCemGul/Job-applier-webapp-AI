/**
 * @fileoverview Unit tests for feedback anonymization
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { recordFeedbackResponse } from '@/services/review/feedback.service';
import { useFeedback } from '@/stores/feedback.store';
import type { FeedbackRequest } from '@/types/review.types';

// Mock sentiment analysis
vi.mock('@/services/review/sentiment.service', () => ({
  analyzeSentiment: vi.fn().mockResolvedValue('positive'),
}));

describe('feedbackAnonymize', () => {
  beforeEach(() => {
    useFeedback.setState({ requests: [], responses: [] });
  });

  it('stores feedback response with redacted body', async () => {
    const request: FeedbackRequest = {
      id: 'req-1',
      cycleId: 'cycle-1',
      reviewerEmail: 'reviewer@example.com',
      reviewerName: 'Jane Doe',
      status: 'sent',
      anonymous: true,
    };

    const body = 'John Smith did excellent work on the migration project.';

    const response = await recordFeedbackResponse(request, body);

    expect(response.body).toBe(body);
    expect(response.redactedBody).toContain('[redacted-name]');
    expect(response.redactedBody).not.toContain('John Smith');
  });

  it('applies sentiment analysis', async () => {
    const request: FeedbackRequest = {
      id: 'req-1',
      cycleId: 'cycle-1',
      reviewerEmail: 'reviewer@example.com',
      status: 'sent',
    };

    const response = await recordFeedbackResponse(request, 'Great job!');

    expect(response.sentiment).toBe('positive');
  });

  it('stores response in feedback store', async () => {
    const request: FeedbackRequest = {
      id: 'req-1',
      cycleId: 'cycle-1',
      reviewerEmail: 'reviewer@example.com',
      status: 'sent',
    };

    await recordFeedbackResponse(request, 'Test feedback');

    const { responses } = useFeedback.getState().byCycle('cycle-1');
    expect(responses.length).toBe(1);
    expect(responses[0].body).toBe('Test feedback');
  });
});
