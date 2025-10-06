/**
 * Bridge between web app and extension
 * This code runs in both contexts to enable communication
 */

import { hmacSHA256 } from '../background/hmac'
import type { ExtensionMessage } from './protocol'

/**
 * Send message from web app to extension
 */
export async function sendToExtension(
  message: ExtensionMessage,
  hmacKey: string
): Promise<any> {
  // Add signature
  const body = JSON.stringify({
    type: message.type,
    payload: message.payload,
    meta: {
      ...message.meta,
      origin: window.location.origin
    }
  })

  const signature = await hmacSHA256(body, hmacKey)

  const signedMessage = {
    ...message,
    meta: {
      ...message.meta,
      origin: window.location.origin,
      sign: signature
    }
  }

  // Send via chrome.runtime (if extension is installed)
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(signedMessage, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
        } else {
          resolve(response)
        }
      })
    })
  }

  throw new Error('Extension not installed or not accessible')
}

/**
 * Listen for messages from extension
 */
export function listenFromExtension(
  callback: (message: ExtensionMessage) => void
): () => void {
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    const listener = (message: any) => {
      callback(message)
    }

    chrome.runtime.onMessage.addListener(listener)
    return () => chrome.runtime.onMessage.removeListener(listener)
  }

  return () => {}
}
