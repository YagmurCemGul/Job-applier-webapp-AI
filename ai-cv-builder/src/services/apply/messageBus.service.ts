/**
 * Browser Extension Message Bus
 * Communication protocol between web app and browser extension
 * (Future: content script integration for actual form submission)
 */

export type BusMessage =
  | { type: 'APPLY_START'; payload: any }
  | { type: 'APPLY_RESULT'; payload: { ok: boolean; message?: string } };

/**
 * Send message to browser extension via window.postMessage
 */
export function sendBusMessage(msg: BusMessage) {
  window.postMessage({ __cvbus: true, ...msg }, '*');
}

/**
 * Listen for messages from browser extension
 * @returns Cleanup function to remove listener
 */
export function onBusMessage(cb: (msg: BusMessage) => void) {
  function handler(ev: MessageEvent) {
    if (ev?.data?.__cvbus) {
      cb(ev.data as BusMessage);
    }
  }
  
  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
}
