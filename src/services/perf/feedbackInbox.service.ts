/**
 * Feedback Inbox Service
 * 
 * Handles storage and processing of feedback responses.
 */

import type { FeedbackResponse } from '@/types/perf.types';
import { usePerf } from '@/stores/perf.store';

/**
 * Store a feedback response (from local form).
 */
export function submitFeedbackResponse(resp: Omit<FeedbackResponse, 'id' | 'receivedAt'>) {
  const r: FeedbackResponse = {
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
    ...resp,
  };
  usePerf.getState().upsertResponse(r);
  // Mark request returned
  const req = usePerf.getState().requests.find((x) => x.id === resp.requestId);
  if (req) usePerf.getState().upsertRequest({ ...req, status: 'returned' });
  return r;
}
