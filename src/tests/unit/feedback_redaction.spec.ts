/**
 * @fileoverview Unit tests for feedback redaction
 */

import { describe, it, expect } from 'vitest';
import { redactSensitiveInfo } from '@/services/interview/feedback.service';

describe('Feedback Redaction Service', () => {
  describe('redactSensitiveInfo', () => {
    it('should redact email addresses', () => {
      const text = 'Contact me at john@example.com for details.';
      const redacted = redactSensitiveInfo(text);
      
      expect(redacted).not.toContain('john@example.com');
      expect(redacted).toContain('[redacted-email]');
    });

    it('should redact multiple emails', () => {
      const text = 'Emails: alice@test.com and bob@test.org';
      const redacted = redactSensitiveInfo(text);
      
      expect(redacted).not.toContain('@');
      expect(redacted.match(/\[redacted-email\]/g)?.length).toBe(2);
    });

    it('should redact phone numbers', () => {
      const text = 'Call me at +1-555-123-4567 tomorrow.';
      const redacted = redactSensitiveInfo(text);
      
      expect(redacted).not.toContain('555-123-4567');
      expect(redacted).toContain('[redacted-phone]');
    });

    it('should redact various phone formats', () => {
      const formats = [
        '+1 (555) 123-4567',
        '555.123.4567',
        '555 123 4567',
        '+44 20 1234 5678'
      ];

      formats.forEach(phone => {
        const text = `Phone: ${phone}`;
        const redacted = redactSensitiveInfo(text);
        expect(redacted).toContain('[redacted-phone]');
      });
    });

    it('should preserve non-sensitive content', () => {
      const text = 'Great communication skills demonstrated.';
      const redacted = redactSensitiveInfo(text);
      
      expect(redacted).toBe(text);
    });

    it('should handle mixed sensitive and normal text', () => {
      const text = 'Reach out at john@example.com or call 555-1234. Great follow-up!';
      const redacted = redactSensitiveInfo(text);
      
      expect(redacted).toContain('[redacted-email]');
      expect(redacted).toContain('[redacted-phone]');
      expect(redacted).toContain('Great follow-up!');
    });

    it('should be case insensitive for emails', () => {
      const text = 'CONTACT@EXAMPLE.COM';
      const redacted = redactSensitiveInfo(text);
      
      expect(redacted).toContain('[redacted-email]');
    });

    it('should handle empty string', () => {
      const redacted = redactSensitiveInfo('');
      expect(redacted).toBe('');
    });

    it('should not redact incomplete email patterns', () => {
      const text = 'at symbol @ but not email';
      const redacted = redactSensitiveInfo(text);
      
      expect(redacted).toBe(text);
    });
  });
});
