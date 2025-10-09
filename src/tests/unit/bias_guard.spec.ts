/**
 * Bias Guard Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { sanitizeLanguage } from '@/services/perf/biasGuard.service';

describe('Bias Guard', () => {
  it('redacts emails', () => {
    const input = 'Contact me at john.doe@example.com for more info.';
    const output = sanitizeLanguage(input);
    expect(output).toContain('[redacted-email]');
    expect(output).not.toContain('john.doe@example.com');
  });

  it('redacts phone numbers', () => {
    const input = 'My number is +1 (555) 123-4567';
    const output = sanitizeLanguage(input);
    expect(output).toContain('[redacted-phone]');
    expect(output).not.toContain('555');
  });

  it('rewrites biased phrases', () => {
    const input = 'She has low energy and is very aggressive.';
    const output = sanitizeLanguage(input);
    expect(output).toContain('consistent engagement');
    expect(output).toContain('collaboration style');
    expect(output).not.toContain('low energy');
    expect(output).not.toContain('aggressive');
  });

  it('handles native/non-native language bias', () => {
    const input = 'As a non-native speaker, his communication is unclear.';
    const output = sanitizeLanguage(input);
    expect(output).toContain('communication clarity');
    expect(output).not.toContain('non-native');
  });

  it('preserves neutral content', () => {
    const input = 'Delivered the project on time with high quality.';
    const output = sanitizeLanguage(input);
    expect(output).toBe(input);
  });

  it('handles multiple issues in one text', () => {
    const input = 'Contact test@example.com. He is nice but has low energy. Call +1-555-1234.';
    const output = sanitizeLanguage(input);
    expect(output).toContain('[redacted-email]');
    expect(output).toContain('[redacted-phone]');
    expect(output).toContain('collaboration style');
    expect(output).toContain('consistent engagement');
  });
});
