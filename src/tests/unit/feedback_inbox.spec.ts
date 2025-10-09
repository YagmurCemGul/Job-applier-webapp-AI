/**
 * Feedback Inbox Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { usePerf } from '@/stores/perf.store';
import { submitFeedbackResponse } from '@/services/perf/feedbackInbox.service';
import type { FeedbackRequest } from '@/types/perf.types';

describe('Feedback Inbox', () => {
  beforeEach(() => {
    usePerf.setState({ requests: [], responses: [] });
  });

  it('submits response and updates request status', () => {
    const request: FeedbackRequest = {
      id: 'req-1',
      toEmail: 'test@example.com',
      role: 'peer',
      subject: 'Feedback',
      messageHtml: '<p>Test</p>',
      status: 'sent',
      token: 'token-123',
    };
    usePerf.getState().upsertRequest(request);

    submitFeedbackResponse({
      requestId: 'req-1',
      answers: { strengths: 'Great work!' },
    });

    const responses = usePerf.getState().responses;
    expect(responses.length).toBe(1);
    expect(responses[0].requestId).toBe('req-1');

    const updatedRequest = usePerf.getState().requests.find((r) => r.id === 'req-1');
    expect(updatedRequest?.status).toBe('returned');
  });

  it('stores quotes', () => {
    const request: FeedbackRequest = {
      id: 'req-2',
      toEmail: 'test@example.com',
      role: 'manager',
      subject: 'Feedback',
      messageHtml: '<p>Test</p>',
      status: 'sent',
      token: 'token-456',
    };
    usePerf.getState().upsertRequest(request);

    submitFeedbackResponse({
      requestId: 'req-2',
      answers: {},
      quotes: ['Excellent collaboration', 'Strong technical skills'],
    });

    const response = usePerf.getState().responses[0];
    expect(response.quotes).toEqual(['Excellent collaboration', 'Strong technical skills']);
  });

  it('handles empty rubric', () => {
    const request: FeedbackRequest = {
      id: 'req-3',
      toEmail: 'test@example.com',
      role: 'peer',
      subject: 'Feedback',
      messageHtml: '<p>Test</p>',
      status: 'sent',
      token: 'token-789',
    };
    usePerf.getState().upsertRequest(request);

    submitFeedbackResponse({
      requestId: 'req-3',
      answers: { feedback: 'Good' },
    });

    const response = usePerf.getState().responses[0];
    expect(response.rubric).toBeUndefined();
  });
});
