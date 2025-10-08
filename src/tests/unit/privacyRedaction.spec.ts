/**
 * @fileoverview Unit tests for privacy redaction service
 */

import { describe, it, expect } from 'vitest';
import { redactPII } from '@/services/review/privacy.service';

describe('privacyRedaction', () => {
  it('redacts full names', () => {
    const input = 'John Smith did a great job on the project.';
    const result = redactPII(input);
    expect(result).toContain('[redacted-name]');
    expect(result).not.toContain('John Smith');
  });

  it('redacts email addresses', () => {
    const input = 'Contact me at john.doe@example.com for details.';
    const result = redactPII(input);
    expect(result).toContain('[redacted-email]');
    expect(result).not.toContain('john.doe@example.com');
  });

  it('redacts phone numbers', () => {
    const input = 'Call me at 123-456-7890 or 123.456.7890.';
    const result = redactPII(input);
    expect(result).toContain('[redacted-phone]');
    expect(result).not.toContain('123-456-7890');
    expect(result).not.toContain('123.456.7890');
  });

  it('redacts URLs', () => {
    const input = 'See https://example.com/user/profile for more.';
    const result = redactPII(input);
    expect(result).toContain('[redacted-url]');
    expect(result).not.toContain('https://example.com');
  });

  it('preserves non-PII content', () => {
    const input = 'Great work on improving system performance by 30%.';
    const result = redactPII(input);
    expect(result).toContain('Great work');
    expect(result).toContain('30%');
  });

  it('handles multiple redactions in same text', () => {
    const input = 'John Smith (john@example.com) achieved 50% improvement. Contact at 555-1234.';
    const result = redactPII(input);
    expect(result).toContain('[redacted-name]');
    expect(result).toContain('[redacted-email]');
    expect(result).toContain('[redacted-phone]');
    expect(result).toContain('50%');
  });
});
