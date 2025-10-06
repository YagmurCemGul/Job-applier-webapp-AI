import { routeApplyRequest } from './router'
import type { ApplyStartMsg, ExtensionMessage, RunLog } from '../messaging/protocol'

/**
 * Background service worker entry point
 */

const runHistory: RunLog[] = []
const MAX_HISTORY = 50

// Handle messages from web app or content scripts
chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
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
    return true // Keep channel open for async response
  }

  if (message.type === 'GET_HISTORY') {
    sendResponse(runHistory.slice(0, 10))
    return false
  }

  if (message.type === 'CLEAR_HISTORY') {
    runHistory.length = 0
    sendResponse({ ok: true })
    return false
  }

  return false
})

async function handleApplyStart(msg: ApplyStartMsg) {
  const result = await routeApplyRequest(msg)

  // Log to history
  const log: RunLog = {
    id: msg.meta.requestId,
    ts: Date.now(),
    domain: msg.payload.platform,
    status: result.payload.ok ? 'success' : 'error',
    message: result.payload.message || 'No message',
    url: msg.payload.jobUrl
  }

  runHistory.unshift(log)
  if (runHistory.length > MAX_HISTORY) {
    runHistory.pop()
  }

  return result
}

// Handle extension install/update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: 'ui/options.html' })
  }
})

console.log('JobPilot extension background service worker started')
