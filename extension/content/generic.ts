/**
 * Generic content script for any job board
 * Uses pure heuristics
 */

import { fillField } from './shared/autofill'
import { findByLabel, findByName, waitForIdle } from './shared/dom'
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
    await waitForIdle()

    // Try common field mappings
    const commonFields = [
      { names: ['name', 'fullname', 'full_name'], key: 'fullName' },
      { names: ['email', 'e-mail'], key: 'email' },
      { names: ['phone', 'telephone', 'mobile'], key: 'phone' }
    ]

    for (const field of commonFields) {
      const value = payload.answers?.[field.key]
      if (value) {
        // Try by name
        for (const name of field.names) {
          const element = findByName(name)
          if (element) {
            fillField(element, String(value), !dryRun)
            break
          }
        }

        // Try by label
        for (const name of field.names) {
          const element = findByLabel(name)
          if (element) {
            fillField(element, String(value), !dryRun)
            break
          }
        }
      }
    }

    // Fill other fields
    if (payload.answers) {
      for (const [key, value] of Object.entries(payload.answers)) {
        if (!['fullName', 'email', 'phone'].includes(key)) {
          const element = findByLabel(key) || findByName(key)
          if (element) {
            fillField(element, String(value), !dryRun)
          }
        }
      }
    }

    return {
      type: 'APPLY_RESULT',
      payload: {
        ok: true,
        message: 'Generic handler completed. Please review.',
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

console.log('JobPilot: Generic handler loaded')
