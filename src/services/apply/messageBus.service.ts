/**
 * Browser Extension Message Bus (spec)
 * Window <-> Extension content script communication (future)
 * For now: no-op send/receive for app runtime
 */

export type BusMessage =
  | { type: 'APPLY_START'; payload: any }
  | { type: 'APPLY_RESULT'; payload: { ok: boolean; message?: string } }

export function sendBusMessage(msg: BusMessage): void {
  window.postMessage({ __cvbus: true, ...msg }, '*')
}

export function onBusMessage(cb: (msg: BusMessage) => void): () => void {
  function handler(ev: MessageEvent) {
    if (ev?.data?.__cvbus) {
      cb(ev.data as BusMessage)
    }
  }

  window.addEventListener('message', handler)
  return () => window.removeEventListener('message', handler)
}
