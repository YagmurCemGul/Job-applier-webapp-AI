/**
 * Lever content script
 */

import { fillField } from './shared/autofill'
import { findByLabel, findSubmitButton, waitForElement, waitForIdle } from './shared/dom'
import { showGuidedOverlay } from './shared/overlay'
import { parsePage } from './shared/parse'
import { t } from './shared/i18n'
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
  const locale = payload.locale || 'en'
  const dryRun = payload.dryRun !== false

  try {
    await waitForIdle()
    await waitForElement('form', 5000)

    // Fill fields by label
    const fieldMappings: Record<string, string> = {
      'Full name': 'fullName',
      'Email': 'email',
      'Phone': 'phone',
      'Resume': 'resume'
    }

    for (const [label, key] of Object.entries(fieldMappings)) {
      const value = payload.answers?.[key]
      if (value) {
        const element = findByLabel(label)
        if (element) {
          fillField(element, String(value), !dryRun)
        }
      }
    }

    // File upload
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]')
    if (fileInput && payload.files.length > 0 && !dryRun) {
      await new Promise<void>((resolve) => {
        showGuidedOverlay({
          targetElement: fileInput,
          locale,
          onContinue: () => resolve(),
          onSkip: () => resolve()
        })
      })
    }

    if (dryRun) {
      return {
        type: 'APPLY_RESULT',
        payload: { ok: true, message: 'Dry run completed', reviewNeeded: true },
        meta: { requestId: meta.requestId, ts: Date.now() }
      }
    }

    // Submit
    const submitBtn = findSubmitButton()
    if (submitBtn) {
      submitBtn.click()
      await new Promise((resolve) => setTimeout(resolve, 2000))
      return {
        type: 'APPLY_RESULT',
        payload: { ok: true, message: 'Submitted', submitted: true },
        meta: { requestId: meta.requestId, ts: Date.now() }
      }
    }

    return {
      type: 'APPLY_RESULT',
      payload: { ok: false, message: 'Submit button not found', reviewNeeded: true },
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

console.log('JobPilot: Lever handler loaded')
