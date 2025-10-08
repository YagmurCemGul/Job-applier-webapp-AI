/**
 * Web app integration bridge
 * This file should be imported in the main web app (Step 33) to communicate with the extension
 */

import { ApplyStartMsg, ApplyResultMsg, ImportJobMsg, PingMsg } from '../messaging/protocol';

export class ExtensionBridge {
  private hmacKey: string;
  private appOrigin: string;

  constructor(config: { hmacKey: string; appOrigin?: string }) {
    this.hmacKey = config.hmacKey;
    this.appOrigin = config.appOrigin || window.location.origin;
  }

  /**
   * Send auto-apply request to extension
   */
  async sendApplyRequest(payload: {
    jobUrl: string;
    platform: 'greenhouse' | 'lever' | 'workday' | 'indeed' | 'linkedin' | 'generic';
    files: Array<{ name: string; url: string; type: 'cv' | 'coverLetter' }>;
    answers?: Record<string, string | boolean | string[]>;
    dryRun?: boolean;
    locale?: 'en' | 'tr';
  }): Promise<ApplyResultMsg> {
    const requestId = this.generateRequestId();
    
    const message: Omit<ApplyStartMsg, 'meta'> & { meta: Partial<ApplyStartMsg['meta']> } = {
      type: 'APPLY_START',
      payload,
      meta: {
        requestId,
        ts: Date.now(),
        origin: this.appOrigin,
      },
    };

    // Sign message
    const signature = await this.signMessage(message);
    message.meta.sign = signature;

    try {
      // @ts-ignore - chrome is available when extension is installed
      const response = await chrome.runtime.sendMessage(message);
      return response as ApplyResultMsg;
    } catch (error: any) {
      // Extension not installed or not responding
      throw new Error(`Extension error: ${error.message}`);
    }
  }

  /**
   * Import job from current page
   */
  async importCurrentJob(): Promise<ImportJobMsg> {
    const requestId = this.generateRequestId();

    // Send parse command to extension content script
    // Content script will parse the page and return job data
    const message = {
      type: 'PARSE_PAGE',
      meta: { requestId, ts: Date.now() },
    };

    try {
      // @ts-ignore
      const response = await chrome.runtime.sendMessage(message);
      return response as ImportJobMsg;
    } catch (error: any) {
      throw new Error(`Failed to import job: ${error.message}`);
    }
  }

  /**
   * Test connection to extension
   */
  async ping(): Promise<boolean> {
    const message: Omit<PingMsg, 'meta'> & { meta: Partial<PingMsg['meta']> } = {
      type: 'PING',
      meta: {
        ts: Date.now(),
        origin: this.appOrigin,
      },
    };

    // Sign message
    const signature = await this.signMessage(message);
    message.meta.sign = signature;

    try {
      // @ts-ignore
      const response = await chrome.runtime.sendMessage(message);
      return response.type === 'PONG';
    } catch {
      return false;
    }
  }

  /**
   * Check if extension is installed
   */
  async isExtensionInstalled(): Promise<boolean> {
    try {
      // @ts-ignore
      return typeof chrome !== 'undefined' && !!chrome.runtime;
    } catch {
      return false;
    }
  }

  /**
   * Generate HMAC signature for message
   */
  private async signMessage(message: any): Promise<string> {
    const messageBody = JSON.stringify(message);
    const encoder = new TextEncoder();
    const data = encoder.encode(messageBody);
    const keyData = encoder.encode(this.hmacKey);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);

    return Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

/**
 * React hook for extension bridge
 */
export function useExtensionBridge(hmacKey: string) {
  const bridge = new ExtensionBridge({ hmacKey });

  return {
    sendApplyRequest: bridge.sendApplyRequest.bind(bridge),
    importCurrentJob: bridge.importCurrentJob.bind(bridge),
    ping: bridge.ping.bind(bridge),
    isExtensionInstalled: bridge.isExtensionInstalled.bind(bridge),
  };
}
