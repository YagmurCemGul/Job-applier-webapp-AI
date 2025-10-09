/**
 * @fileoverview Unit tests for clipboard bundle
 */

import { describe, it, expect } from 'vitest';
import { buildClipboardBundle } from '@/services/autofill/clipboardBundle.service';

describe('clipboardBundle', () => {
  it('includes name and email', () => {
    const bundle = buildClipboardBundle({
      name: 'John Doe',
      email: 'john@example.com',
      answers: []
    });
    
    expect(bundle).toContain('John Doe');
    expect(bundle).toContain('john@example.com');
  });

  it('includes phone when provided', () => {
    const bundle = buildClipboardBundle({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1-555-1234',
      answers: []
    });
    
    expect(bundle).toContain('+1-555-1234');
  });

  it('formats Q&A pairs correctly', () => {
    const bundle = buildClipboardBundle({
      name: 'John Doe',
      email: 'john@example.com',
      answers: [
        { q: 'What is your experience?', a: '5+ years in software development' },
        { q: 'When can you start?', a: 'Within 2 weeks' }
      ]
    });
    
    expect(bundle).toContain('1) What is your experience?');
    expect(bundle).toContain('5+ years in software development');
    expect(bundle).toContain('2) When can you start?');
    expect(bundle).toContain('Within 2 weeks');
  });

  it('produces deterministic output', () => {
    const opts = {
      name: 'John Doe',
      email: 'john@example.com',
      answers: [{ q: 'Test?', a: 'Answer' }]
    };
    
    const bundle1 = buildClipboardBundle(opts);
    const bundle2 = buildClipboardBundle(opts);
    
    expect(bundle1).toBe(bundle2);
  });

  it('handles empty answers array', () => {
    const bundle = buildClipboardBundle({
      name: 'John Doe',
      email: 'john@example.com',
      answers: []
    });
    
    expect(bundle).toBeTruthy();
    expect(bundle).toContain('John Doe');
  });
});
