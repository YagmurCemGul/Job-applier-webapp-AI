/**
 * Workday content script
 * Note: Workday uses dynamic React components; this is a simplified handler
 */

import { fillField } from './shared/autofill'
import { findByLabel, waitForElement, waitForIdle } from './shared/dom'
import { showGuidedOverlay } from './shared/overlay'
import type { ApplyStartMsg, ApplyResultMsg } from '../messaging/protocol'

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'APPLY_START') {
    handleApplyStart(message as ApplyStartMsg)
      .then(sendResponse)
      .catch((error) => {
        sendResponse({
          type: 'APPLY_RESULT',
          payload: { ok: false, message: error.message },
          meta: { requestId: message.meta.requestId, ts: Date.now() }
        })
      })
    return true
  }
  return false
})

async function handleApplyStart(msg: ApplyStartMsg): Promise<ApplyResultMsg> {
  const { payload, meta } = msg
  const dryRun = payload.dryRun !== false

  try {
    await waitForIdle(3000)
    await waitForElement('[data-automation-id]', 5000)

    // Workday uses data-automation-id attributes
    // This is a generic approach using label matching
    if (payload.answers) {
      for (const [key, value] of Object.entries(payload.answers)) {
        const element = findByLabel(key)
        if (element) {
          fillField(element, String(value), !dryRun)
        }
      }
    }

    if (dryRun) {
      return {
        type: 'APPLY_RESULT',
        payload: { ok: true, message: 'Dry run completed', reviewNeeded: true },
        meta: { requestId: meta.requestId, ts: Date.now() }
      }
    }

    return {
      type: 'APPLY_RESULT',
      payload: {
        ok: true,
        message: 'Workday requires manual review',
        reviewNeeded: true
      },
      meta: { requestId: meta.requestId, ts: Date.now() }
    }
  } catch (error: any) {
    return {
      type: 'APPLY_RESULT',
      payload: { ok: false, message: error.message },
      meta: { requestId: meta.requestId, ts: Date.now() }
    }
  }
}

console.log('JobPilot: Workday handler loaded')
