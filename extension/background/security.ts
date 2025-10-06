import { verifyHMAC } from './hmac'
import { getSettings } from '../storage/settings'
import type { ApplyStartMsg } from '../messaging/protocol'

/**
 * Security layer: origin allow-list and HMAC verification
 */

export async function verifyMessage(msg: ApplyStartMsg): Promise<{
  ok: boolean
  reason?: string
}> {
  const settings = await getSettings()

  // Check origin allow-list
  const origin = msg.meta.origin
  if (!settings.appOrigins.includes(origin)) {
    return {
      ok: false,
      reason: 'Origin not in allow-list. Add it in Options.'
    }
  }

  // Verify HMAC signature
  const signature = msg.meta.sign
  if (!signature) {
    return {
      ok: false,
      reason: 'Missing signature'
    }
  }

  const body = JSON.stringify({
    type: msg.type,
    payload: msg.payload,
    meta: {
      requestId: msg.meta.requestId,
      ts: msg.meta.ts,
      origin: msg.meta.origin
    }
  })

  const valid = await verifyHMAC(body, signature, settings.hmacKey)
  if (!valid) {
    return {
      ok: false,
      reason: 'Invalid signature'
    }
  }

  return { ok: true }
}
