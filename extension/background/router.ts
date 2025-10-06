import type { ApplyStartMsg, ApplyResultMsg, DomainKey } from '../messaging/protocol'
import { getSettings } from '../storage/settings'
import { verifyMessage } from './security'
import { checkRateLimit } from './rateLimit'

/**
 * Router: validates, rate-limits, and routes apply requests
 */

export async function routeApplyRequest(
  msg: ApplyStartMsg
): Promise<ApplyResultMsg> {
  const requestId = msg.meta.requestId
  const platform = msg.payload.platform
  const settings = await getSettings()

  // Check if paused
  if (settings.paused) {
    return {
      type: 'APPLY_RESULT',
      payload: {
        ok: false,
        message: 'Extension is paused. Unpause in popup.'
      },
      meta: { requestId, ts: Date.now() }
    }
  }

  // Check if platform enabled
  if (!settings.enabled[platform]) {
    return {
      type: 'APPLY_RESULT',
      payload: {
        ok: false,
        message: `Platform ${platform} is disabled. Enable in Options.`
      },
      meta: { requestId, ts: Date.now() }
    }
  }

  // Check legal mode
  if (!settings.legal[platform]) {
    return {
      type: 'APPLY_RESULT',
      payload: {
        ok: false,
        message: `Legal Mode is OFF for ${platform}. Enable in Options.`
      },
      meta: { requestId, ts: Date.now() }
    }
  }

  // Verify security
  const security = await verifyMessage(msg)
  if (!security.ok) {
    return {
      type: 'APPLY_RESULT',
      payload: {
        ok: false,
        message: `Security check failed: ${security.reason}`
      },
      meta: { requestId, ts: Date.now() }
    }
  }

  // Check rate limit
  const rateLimit = await checkRateLimit(
    platform,
    settings.rateLimit[platform] || 10
  )
  if (!rateLimit.ok) {
    return {
      type: 'APPLY_RESULT',
      payload: {
        ok: false,
        message: rateLimit.reason
      },
      meta: { requestId, ts: Date.now() }
    }
  }

  // Open tab and inject handler
  try {
    const tab = await openJobTab(msg.payload.jobUrl)
    if (!tab.id) {
      throw new Error('Failed to open tab')
    }

    // Wait for tab to load
    await waitForTabReady(tab.id)

    // Send message to content script
    const response = await chrome.tabs.sendMessage(tab.id, msg)
    return response as ApplyResultMsg
  } catch (error: any) {
    return {
      type: 'APPLY_RESULT',
      payload: {
        ok: false,
        message: `Failed to execute: ${error.message}`
      },
      meta: { requestId, ts: Date.now() }
    }
  }
}

async function openJobTab(url: string): Promise<chrome.tabs.Tab> {
  // Try to find existing tab
  const tabs = await chrome.tabs.query({ url })
  if (tabs.length > 0 && tabs[0].id) {
    await chrome.tabs.update(tabs[0].id, { active: true })
    return tabs[0]
  }

  // Create new tab
  return await chrome.tabs.create({ url, active: true })
}

async function waitForTabReady(tabId: number, maxWait: number = 10000): Promise<void> {
  const start = Date.now()
  
  return new Promise((resolve, reject) => {
    const checkReady = () => {
      chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
          return
        }

        if (tab.status === 'complete') {
          resolve()
        } else if (Date.now() - start > maxWait) {
          reject(new Error('Tab load timeout'))
        } else {
          setTimeout(checkReady, 200)
        }
      })
    }

    checkReady()
  })
}
