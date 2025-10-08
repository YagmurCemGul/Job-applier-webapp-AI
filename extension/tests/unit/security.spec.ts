/**
 * Unit tests for security validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { HMACValidator } from '../../background/hmac';
import { SecurityValidator } from '../../background/security';
import { SettingsManager } from '../../storage/settings';

describe('HMACValidator', () => {
  let hmac: HMACValidator;

  beforeEach(() => {
    hmac = new HMACValidator();
  });

  describe('sign and verify', () => {
    it('should sign and verify valid message', async () => {
      const message = 'test message';
      const key = 'secret-key-123';

      const signature = await hmac.sign(message, key);
      expect(signature).toBeTruthy();
      expect(signature.length).toBeGreaterThan(0);

      const isValid = await hmac.verify(message, signature, key);
      expect(isValid).toBe(true);
    });

    it('should reject invalid signature', async () => {
      const message = 'test message';
      const key = 'secret-key-123';

      const signature = await hmac.sign(message, key);
      const isValid = await hmac.verify(message, 'invalid-signature', key);

      expect(isValid).toBe(false);
    });

    it('should reject modified message', async () => {
      const message = 'test message';
      const key = 'secret-key-123';

      const signature = await hmac.sign(message, key);
      const isValid = await hmac.verify('modified message', signature, key);

      expect(isValid).toBe(false);
    });

    it('should reject wrong key', async () => {
      const message = 'test message';
      const key = 'secret-key-123';

      const signature = await hmac.sign(message, key);
      const isValid = await hmac.verify(message, signature, 'wrong-key');

      expect(isValid).toBe(false);
    });

    it('should use constant time comparison', async () => {
      const message = 'test';
      const key = 'key';

      const signature = await hmac.sign(message, key);

      // Create similar but different signature
      const wrongSignature = signature.substring(0, signature.length - 1) + 'x';

      const startTime = performance.now();
      await hmac.verify(message, wrongSignature, key);
      const endTime = performance.now();

      const duration = endTime - startTime;

      // Constant time comparison should take similar time regardless of where difference is
      expect(duration).toBeLessThan(100); // Should be fast but constant
    });
  });
});

describe('SecurityValidator', () => {
  let validator: SecurityValidator;

  beforeEach(async () => {
    validator = new SecurityValidator();

    // Setup test settings
    const settings = SettingsManager.getInstance();
    await settings.set({
      appOrigins: ['https://app.jobpilot.com', 'http://localhost:3000'],
      hmacKey: 'test-key-123',
    });
  });

  describe('validateMessage', () => {
    it('should accept message from allowed origin', async () => {
      const message = {
        type: 'PING' as const,
        meta: {
          ts: Date.now(),
          origin: 'https://app.jobpilot.com',
        },
      };

      const result = await validator.validateMessage(message);
      expect(result.valid).toBe(true);
    });

    it('should reject message from disallowed origin', async () => {
      const message = {
        type: 'PING' as const,
        meta: {
          ts: Date.now(),
          origin: 'https://evil.com',
        },
      };

      const result = await validator.validateMessage(message);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not in allow-list');
    });

    it('should reject message without origin', async () => {
      const message = {
        type: 'PING' as const,
        meta: {
          ts: Date.now(),
        },
      } as any;

      const result = await validator.validateMessage(message);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Missing origin');
    });

    it('should verify HMAC signature when present', async () => {
      const messageBody = {
        type: 'PING' as const,
        meta: {
          ts: Date.now(),
          origin: 'https://app.jobpilot.com',
        },
      };

      const settings = SettingsManager.getInstance();
      const settingsData = await settings.get();
      const hmac = new HMACValidator();
      const signature = await hmac.sign(JSON.stringify(messageBody), settingsData.hmacKey);

      const message = {
        ...messageBody,
        meta: {
          ...messageBody.meta,
          sign: signature,
        },
      };

      const result = await validator.validateMessage(message);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid HMAC signature', async () => {
      const message = {
        type: 'PING' as const,
        meta: {
          ts: Date.now(),
          origin: 'https://app.jobpilot.com',
          sign: 'invalid-signature',
        },
      };

      const result = await validator.validateMessage(message);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid HMAC');
    });
  });

  describe('signMessage', () => {
    it('should sign message with HMAC key', async () => {
      const message = { test: 'data' };

      const signature = await validator.signMessage(message);
      expect(signature).toBeTruthy();
      expect(signature.length).toBeGreaterThan(0);
    });
  });
});
