/**
 * Security validation: origin allow-list and HMAC verification
 */

import { HMACValidator } from './hmac';
import { SettingsManager } from '../storage/settings';
import { ExtensionMessage } from '../messaging/protocol';

export class SecurityValidator {
  private hmac = new HMACValidator();
  private settings = SettingsManager.getInstance();

  async validateMessage(message: ExtensionMessage): Promise<{ valid: boolean; error?: string }> {
    // Check if message has meta with origin
    if (!('meta' in message) || !message.meta.origin) {
      return { valid: false, error: 'Missing origin in message metadata' };
    }

    // Validate origin against allow-list
    const settings = await this.settings.get();
    const allowedOrigins = settings.appOrigins;

    if (allowedOrigins.length === 0) {
      return { valid: false, error: 'No allowed origins configured' };
    }

    const originAllowed = allowedOrigins.some((allowed) => {
      try {
        const allowedUrl = new URL(allowed);
        const messageUrl = new URL(message.meta.origin);
        return allowedUrl.origin === messageUrl.origin;
      } catch {
        return false;
      }
    });

    if (!originAllowed) {
      return { valid: false, error: `Origin ${message.meta.origin} not in allow-list` };
    }

    // Verify HMAC signature if present
    if ('sign' in message.meta && message.meta.sign) {
      const hmacKey = settings.hmacKey;
      if (!hmacKey) {
        return { valid: false, error: 'HMAC key not configured' };
      }

      // Create message body for verification (exclude signature)
      const { sign, ...metaWithoutSign } = message.meta;
      const messageBody = JSON.stringify({ ...message, meta: metaWithoutSign });

      const isValid = await this.hmac.verify(messageBody, message.meta.sign, hmacKey);
      if (!isValid) {
        return { valid: false, error: 'Invalid HMAC signature' };
      }
    }

    return { valid: true };
  }

  async signMessage(message: any): Promise<string> {
    const settings = await this.settings.get();
    const hmacKey = settings.hmacKey;
    if (!hmacKey) {
      throw new Error('HMAC key not configured');
    }

    const messageBody = JSON.stringify(message);
    return this.hmac.sign(messageBody, hmacKey);
  }
}
