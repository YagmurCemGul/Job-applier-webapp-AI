/**
 * Calibration Outliers Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { usePerf } from '@/stores/perf.store';
import { calibrate } from '@/services/perf/calibration.service';
import type { FeedbackRequest, FeedbackResponse } from '@/types/perf.types';

describe('Calibration Outliers', () => {
  beforeEach(() => {
    usePerf.setState({ requests: [], responses: [], calibrations: [] });
  });

  it('detects outliers with >1.0 delta', () => {
    const cycleId = 'cycle-1';
    const request: FeedbackRequest = {
      id: 'req-1',
      toEmail: 'test@example.com',
      role: 'peer',
      subject: 'Feedback',
      messageHtml: '<p>Test</p>',
      status: 'returned',
      token: 'token-1',
      cycleId,
    };
    usePerf.getState().upsertRequest(request);

    const response1: FeedbackResponse = {
      id: 'resp-1',
      requestId: 'req-1',
      receivedAt: new Date().toISOString(),
      answers: {},
      rubric: { clarity: 2, structure: 2, impact: 2, ownership: 2, collaboration: 2, craft: 2 },
    };
    const response2: FeedbackResponse = {
      id: 'resp-2',
      requestId: 'req-1',
      receivedAt: new Date().toISOString(),
      answers: {},
      rubric: { clarity: 4, structure: 2, impact: 2, ownership: 2, collaboration: 2, craft: 2 },
    };
    usePerf.getState().upsertResponse(response1);
    usePerf.getState().upsertResponse(response2);

    const summary = calibrate(cycleId);
    expect(summary.outliers.length).toBeGreaterThan(0);
    const clarityOutlier = summary.outliers.find((o) => o.key === 'clarity');
    expect(clarityOutlier).toBeDefined();
    expect(Math.abs(clarityOutlier!.delta)).toBeGreaterThan(1);
  });

  it('computes overall and means correctly', () => {
    const cycleId = 'cycle-2';
    const request: FeedbackRequest = {
      id: 'req-2',
      toEmail: 'test@example.com',
      role: 'manager',
      subject: 'Feedback',
      messageHtml: '<p>Test</p>',
      status: 'returned',
      token: 'token-2',
      cycleId,
    };
    usePerf.getState().upsertRequest(request);

    const response: FeedbackResponse = {
      id: 'resp-3',
      requestId: 'req-2',
      receivedAt: new Date().toISOString(),
      answers: {},
      rubric: { clarity: 3, structure: 3, impact: 3, ownership: 3, collaboration: 3, craft: 3 },
    };
    usePerf.getState().upsertResponse(response);

    const summary = calibrate(cycleId);
    expect(summary.aggScores.clarity).toBe(3);
    expect(summary.overall).toBe(3);
  });

  it('handles missing rubric data', () => {
    const cycleId = 'cycle-3';
    const request: FeedbackRequest = {
      id: 'req-3',
      toEmail: 'test@example.com',
      role: 'peer',
      subject: 'Feedback',
      messageHtml: '<p>Test</p>',
      status: 'returned',
      token: 'token-3',
      cycleId,
    };
    usePerf.getState().upsertRequest(request);

    const response: FeedbackResponse = {
      id: 'resp-4',
      requestId: 'req-3',
      receivedAt: new Date().toISOString(),
      answers: { feedback: 'Good' },
    };
    usePerf.getState().upsertResponse(response);

    const summary = calibrate(cycleId);
    expect(summary.overall).toBe(0);
  });
});
