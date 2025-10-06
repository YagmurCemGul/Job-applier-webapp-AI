/**
 * Browser Extension Message Bus
 * Real implementation that communicates with MV3 extension (Step 34)
 */

import type { ApplyPayload } from '@/types/apply.types'

export type BusMessage =
  | { type: 'APPLY_START'; payload: ApplyPayload; meta: { requestId: string; ts: number; origin: string; sign?: string } }
  | { type: 'APPLY_RESULT'; payload: { ok: boolean; message?: string; submitted?: boolean; reviewNeeded?: boolean; hints?: string[] }; meta: { requestId: string; ts: number } }
  | { type: 'IMPORT_JOB'; payload: any; meta: { ts: number } }

/**
 * Send message to extension
 * Uses chrome.runtime.sendMessage for real extension communication
 */
export async function sendToExtension(
  type: 'APPLY_START' | 'IMPORT_JOB',
  payload: any,
  hmacKey?: string
): Promise<BusMessage> {
  const requestId = crypto.randomUUID()
  const ts = Date.now()
  const origin = window.location.origin

  // Build message
  const message: BusMessage = {
    type,
    payload,
    meta: { requestId, ts, origin }
  }

  // Add HMAC signature if key provided
  if (hmacKey && type === 'APPLY_START') {
    const body = JSON.stringify({
      type,
      payload,
      meta: { requestId, ts, origin }
    })
    const signature = await hmacSHA256(body, hmacKey)
    ;(message as any).meta.sign = signature
  }

  // Check if extension is installed
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error('Extension not installed or not responding'))
        } else {
          resolve(response)
        }
      })
    })
  }

  // Fallback: extension not installed
  throw new Error('JobPilot extension not installed. Please install from Chrome Web Store.')
}

/**
 * Listen for messages from extension
 */
export function onBusMessage(cb: (msg: BusMessage) => void): () => void {
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    const listener = (message: any) => {
      if (message.type === 'APPLY_RESULT' || message.type === 'IMPORT_JOB') {
        cb(message)
      }
    }
    chrome.runtime.onMessage.addListener(listener)
    return () => chrome.runtime.onMessage.removeListener(listener)
  }

  // Fallback: window.postMessage for local dev
  function handler(ev: MessageEvent) {
    if (ev?.data?.__cvbus) {
      cb(ev.data as BusMessage)
    }
  }
  window.addEventListener('message', handler)
  return () => window.removeEventListener('message', handler)
}

/**
 * HMAC-SHA256 signature (browser-compatible)
 */
async function hmacSHA256(message: string, key: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(key)
  const messageData = encoder.encode(message)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
  const hashArray = Array.from(new Uint8Array(signature))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}
