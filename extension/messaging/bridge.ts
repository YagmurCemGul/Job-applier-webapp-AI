/**
 * Message bridge utilities for web app communication
 */

import { ExtensionMessage } from './protocol';

export class MessageBridge {
  /**
   * Send message to extension from web app
   */
  static async sendToExtension(message: ExtensionMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Listen for messages from extension
   */
  static onMessage(callback: (message: any) => void): () => void {
    const listener = (event: MessageEvent) => {
      // Validate origin if needed
      if (event.source === window && event.data.source === 'jobpilot-extension') {
        callback(event.data.message);
      }
    };

    window.addEventListener('message', listener);

    return () => {
      window.removeEventListener('message', listener);
    };
  }

  /**
   * Post message to web app from content script
   */
  static postToWebApp(message: any, origin: string): void {
    window.postMessage(
      {
        source: 'jobpilot-extension',
        message,
      },
      origin
    );
  }
}
