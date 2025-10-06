/**
 * Greenhouse content script
 */

import { fillField } from './shared/autofill'
import { findById, findByLabel, findSubmitButton, waitForElement, waitForIdle } from './shared/dom'
import { showGuidedOverlay } from './shared/overlay'
import { parsePage, createImportMessage } from './shared/parse'
import { t } from './shared/i18n'
import type { ApplyStartMsg, ApplyResultMsg } from '../messaging/protocol'

// Listen for messages from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'APPLY_START') {
    handleApplyStart(message as ApplyStartMsg)
      .then(sendResponse)
      .catch((error) => {
        sendResponse({
          type: 'APPLY_RESULT',
          payload: {
            ok: false,
            message: error.message
          },
          meta: {
            requestId: message.meta.requestId,
            ts: Date.now()
          }
        })
      })
    return true
  }

  if (message.type === 'PARSE_PAGE') {
    const job = parsePage('greenhouse')
    sendResponse(createImportMessage(job))
    return false
  }

  return false
})

async function handleApplyStart(msg: ApplyStartMsg): Promise<ApplyResultMsg> {
  const { payload, meta } = msg
  const locale = payload.locale || 'en'
  const dryRun = payload.dryRun !== false // Default to true

  try {
    // Wait for page to be ready
    await waitForIdle()
    await waitForElement('form', 5000)

    const logs: string[] = []

    // Fill standard fields
    const fields = [
      { id: 'first_name', value: payload.answers?.firstName },
      { id: 'last_name', value: payload.answers?.lastName },
      { id: 'email', value: payload.answers?.email },
      { id: 'phone', value: payload.answers?.phone }
    ]

    for (const field of fields) {
      if (field.value) {
        const element = findById(field.id)
        if (element) {
          const result = fillField(element, String(field.value), !dryRun)
          logs.push(`${field.id}: ${result.filled ? 'filled' : 'skipped'}`)
        }
      }
    }

    // Handle custom questions
    if (payload.answers) {
      for (const [key, value] of Object.entries(payload.answers)) {
        if (!['firstName', 'lastName', 'email', 'phone'].includes(key)) {
          const element = findByLabel(key)
          if (element) {
            fillField(element, String(value), !dryRun)
            logs.push(`${key}: filled`)
          }
        }
      }
    }

    // Handle file upload
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
      showBanner(t('dry_run', locale), 'info')
      return {
        type: 'APPLY_RESULT',
        payload: {
          ok: true,
          message: 'Dry run completed',
          reviewNeeded: true,
          hints: logs
        },
        meta: { requestId: meta.requestId, ts: Date.now() }
      }
    }

    // Submit form
    const submitBtn = findSubmitButton()
    if (submitBtn) {
      showBanner(t('submitting', locale), 'info')
      submitBtn.click()

      // Wait for submission
      await new Promise((resolve) => setTimeout(resolve, 2000))

      return {
        type: 'APPLY_RESULT',
        payload: {
          ok: true,
          message: 'Application submitted',
          submitted: true,
          url: window.location.href
        },
        meta: { requestId: meta.requestId, ts: Date.now() }
      }
    }

    return {
      type: 'APPLY_RESULT',
      payload: {
        ok: false,
        message: 'Submit button not found',
        reviewNeeded: true
      },
      meta: { requestId: meta.requestId, ts: Date.now() }
    }
  } catch (error: any) {
    return {
      type: 'APPLY_RESULT',
      payload: {
        ok: false,
        message: error.message
      },
      meta: { requestId: meta.requestId, ts: Date.now() }
    }
  }
}

function showBanner(message: string, type: 'info' | 'success' | 'error') {
  const banner = document.createElement('div')
  banner.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px;
    background: ${type === 'error' ? '#f56565' : type === 'success' ? '#48bb78' : '#4299e1'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 999999;
    max-width: 400px;
  `
  banner.textContent = message
  document.body.appendChild(banner)

  setTimeout(() => {
    banner.remove()
  }, 5000)
}

console.log('JobPilot: Greenhouse handler loaded')
