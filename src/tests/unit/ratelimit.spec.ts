/**
 * @fileoverview Unit tests for rate limiter
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { allowAction } from '@/services/autofill/ratelimit.service';

describe('ratelimit', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('allows action within limit', () => {
    const result = allowAction('test', 5, 60);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('blocks action when limit exceeded', () => {
    // Use up all 3 allowed actions
    allowAction('test', 3, 60);
    allowAction('test', 3, 60);
    allowAction('test', 3, 60);
    
    // 4th should be blocked
    const result = allowAction('test', 3, 60);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('returns correct remaining count', () => {
    const r1 = allowAction('test', 5, 60);
    expect(r1.remaining).toBe(4);
    
    const r2 = allowAction('test', 5, 60);
    expect(r2.remaining).toBe(3);
  });

  it('uses rolling window', () => {
    // Mock time
    const now = Date.now();
    vi.useFakeTimers();
    vi.setSystemTime(now);
    
    allowAction('test', 2, 1); // 1 minute window
    allowAction('test', 2, 1);
    
    // Advance time by 61 seconds
    vi.setSystemTime(now + 61000);
    
    const result = allowAction('test', 2, 1);
    expect(result.allowed).toBe(true);
    
    vi.useRealTimers();
  });

  it('isolates different keys', () => {
    allowAction('key1', 1, 60);
    const result = allowAction('key2', 1, 60);
    expect(result.allowed).toBe(true);
  });
});
