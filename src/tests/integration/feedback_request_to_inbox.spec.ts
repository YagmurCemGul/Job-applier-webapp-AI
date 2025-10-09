/**
 * Feedback Request to Inbox Integration Test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { usePerf } from '@/stores/perf.store';
import { submitFeedbackResponse } from '@/services/perf/feedbackInbox.service';
import type { FeedbackRequest } from '@/types/perf.types';

describe('Feedback Request to Inbox Flow', () => {
  beforeEach(() => {
    usePerf.setState({ requests: [], responses: [] });
  });

  it('completes full feedback loop', () => {
    // 1. Create request
    const request: FeedbackRequest = {
      id: 'req-1',
      toEmail: 'peer@example.com',
      toName: 'Jane Doe',
      role: 'peer',
      subject: '360 Feedback Request',
      messageHtml: '<p>Please provide feedback on my recent work.</p>',
      status: 'sent',
      token: 'token-123',
      dueISO: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    usePerf.getState().upsertRequest(request);

    // 2. Verify request is stored
    const storedRequests = usePerf.getState().requests;
    expect(storedRequests.length).toBe(1);
    expect(storedRequests[0].status).toBe('sent');

    // 3. Submit feedback response
    submitFeedbackResponse({
      requestId: 'req-1',
      answers: {
        strengths: 'Excellent technical leadership',
        improve: 'Could improve documentation',
        evidence: 'Led the DB migration project successfully',
      },
      rubric: {
        clarity: 3.5,
        structure: 3.0,
        impact: 4.0,
        ownership: 3.5,
        collaboration: 3.5,
        craft: 3.0,
      },
      quotes: ['Great collaboration skills', 'Very responsive to feedback'],
    });

    // 4. Verify response is stored
    const responses = usePerf.getState().responses;
    expect(responses.length).toBe(1);
    expect(responses[0].requestId).toBe('req-1');
    expect(responses[0].answers.strengths).toBe('Excellent technical leadership');
    expect(responses[0].rubric?.impact).toBe(4.0);
    expect(responses[0].quotes).toContain('Great collaboration skills');

    // 5. Verify request status updated
    const updatedRequest = usePerf.getState().requests.find((r) => r.id === 'req-1');
    expect(updatedRequest?.status).toBe('returned');
  });

  it('handles multiple feedback responses', () => {
    // Create multiple requests
    const requests: FeedbackRequest[] = [
      {
        id: 'req-1',
        toEmail: 'peer1@example.com',
        role: 'peer',
        subject: 'Feedback',
        messageHtml: '<p>Feedback</p>',
        status: 'sent',
        token: 'token-1',
      },
      {
        id: 'req-2',
        toEmail: 'manager@example.com',
        role: 'manager',
        subject: 'Feedback',
        messageHtml: '<p>Feedback</p>',
        status: 'sent',
        token: 'token-2',
      },
    ];
    requests.forEach((req) => usePerf.getState().upsertRequest(req));

    // Submit responses
    submitFeedbackResponse({
      requestId: 'req-1',
      answers: { feedback: 'Good work on project A' },
      rubric: { clarity: 3, structure: 3, impact: 3, ownership: 3, collaboration: 3, craft: 3 },
    });
    submitFeedbackResponse({
      requestId: 'req-2',
      answers: { feedback: 'Strong leadership shown' },
      rubric: { clarity: 4, structure: 3, impact: 4, ownership: 4, collaboration: 3, craft: 3 },
    });

    // Verify all responses stored
    const responses = usePerf.getState().responses;
    expect(responses.length).toBe(2);
    expect(responses.map((r) => r.requestId)).toContain('req-1');
    expect(responses.map((r) => r.requestId)).toContain('req-2');

    // Verify both requests marked as returned
    const allRequests = usePerf.getState().requests;
    expect(allRequests.every((r) => r.status === 'returned')).toBe(true);
  });
});
