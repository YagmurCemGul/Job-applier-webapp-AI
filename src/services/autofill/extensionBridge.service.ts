/**
 * @fileoverview Browser extension bridge service
 * Communicates with installed browser extension via window.postMessage
 */

import type { AutofillPlan } from '@/types/autofill.types';

/**
 * Post a plan to an installed browser extension via window.postMessage.
 * @param plan - Autofill plan to send
 * @returns Success status
 */
export function sendPlanToExtension(plan: AutofillPlan): boolean {
  const payload = { type:'JOBPILOT_AUTOFILL_PLAN', plan };
  window.postMessage(payload, window.location.origin);
  return true;
}

/**
 * Listen for extension status updates (mock-friendly).
 * @param cb - Callback for status events
 * @returns Unsubscribe function
 */
export function onExtensionStatus(
  cb: (ev:{ stepId:string; status:'ok'|'error'; detail?:string }) => void
): () => void {
  const handler = (e: MessageEvent) => {
    if (typeof e.data === 'object' && e.data?.type === 'JOBPILOT_AUTOFILL_STATUS') {
      cb(e.data);
    }
  };
  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
}
