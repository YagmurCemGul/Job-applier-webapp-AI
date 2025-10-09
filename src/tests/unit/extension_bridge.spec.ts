/**
 * @fileoverview Unit tests for extension bridge
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendPlanToExtension, onExtensionStatus } from '@/services/autofill/extensionBridge.service';
import type { AutofillPlan } from '@/types/autofill.types';

describe('extensionBridge', () => {
  const mockPlan: AutofillPlan = {
    id: 'plan-123',
    runId: 'run-123',
    mappingId: 'mapping-123',
    steps: [],
    data: {}
  };

  beforeEach(() => {
    vi.spyOn(window, 'postMessage');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends plan via postMessage', () => {
    sendPlanToExtension(mockPlan);
    expect(window.postMessage).toHaveBeenCalledWith(
      { type: 'JOBPILOT_AUTOFILL_PLAN', plan: mockPlan },
      window.location.origin
    );
  });

  it('returns true on successful send', () => {
    const result = sendPlanToExtension(mockPlan);
    expect(result).toBe(true);
  });

  it('listens for extension status events', (done) => {
    const callback = vi.fn();
    const unsub = onExtensionStatus(callback);
    
    // Simulate extension response
    window.dispatchEvent(new MessageEvent('message', {
      data: { type: 'JOBPILOT_AUTOFILL_STATUS', stepId: 'step-1', status: 'ok' }
    }));
    
    setTimeout(() => {
      expect(callback).toHaveBeenCalledWith({
        type: 'JOBPILOT_AUTOFILL_STATUS',
        stepId: 'step-1',
        status: 'ok'
      });
      unsub();
      done();
    }, 10);
  });

  it('unsubscribes correctly', () => {
    const callback = vi.fn();
    const unsub = onExtensionStatus(callback);
    unsub();
    
    window.dispatchEvent(new MessageEvent('message', {
      data: { type: 'JOBPILOT_AUTOFILL_STATUS', stepId: 'step-1', status: 'ok' }
    }));
    
    expect(callback).not.toHaveBeenCalled();
  });

  it('ignores non-autofill messages', () => {
    const callback = vi.fn();
    onExtensionStatus(callback);
    
    window.dispatchEvent(new MessageEvent('message', {
      data: { type: 'OTHER_MESSAGE' }
    }));
    
    expect(callback).not.toHaveBeenCalled();
  });
});
