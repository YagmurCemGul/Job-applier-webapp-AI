/**
 * @fileoverview Unit tests for self-review AI service
 */

import { describe, it, expect, vi } from 'vitest';
import { materializeSelfReview } from '@/services/review/selfReviewAI.service';

describe('selfReviewAI', () => {
  it('parses overview section', () => {
    const text = `
Overview: I led the migration project and improved system performance.

Highlights:
- Reduced latency by 40%
- Mentored 3 junior engineers

Growth Areas:
- Better documentation

Next Objectives:
- Lead architecture redesign
    `.trim();

    const result = materializeSelfReview('cycle-1', 'en', text);

    expect(result.overview).toContain('migration project');
    expect(result.highlights.length).toBeGreaterThan(0);
    expect(result.highlights.some(h => h.includes('40%'))).toBe(true);
  });

  it('computes word count correctly', () => {
    const text = 'One two three four five.';
    const result = materializeSelfReview('cycle-1', 'en', text);
    expect(result.wordCount).toBe(5);
  });

  it('computes clarity score inversely with word count', () => {
    const shortText = 'Brief overview.';
    const longText = 'This is a very long overview that goes on and on with lots of words and details and explanations that make it less clear and harder to understand because of excessive verbosity and redundancy.';

    const short = materializeSelfReview('cycle-1', 'en', shortText);
    const long = materializeSelfReview('cycle-1', 'en', longText);

    expect(short.clarityScore).toBeGreaterThan(long.clarityScore);
  });

  it('handles Turkish language', () => {
    const text = 'Genel Bakış: Proje liderliği yaptım.';
    const result = materializeSelfReview('cycle-1', 'tr', text);
    expect(result.lang).toBe('tr');
  });

  it('resilient to free-form text without sections', () => {
    const text = 'Just some random text without any structured sections.';
    const result = materializeSelfReview('cycle-1', 'en', text);
    expect(result.overview).toBeTruthy();
    expect(result.highlights).toBeDefined();
    expect(result.growthAreas).toBeDefined();
    expect(result.nextObjectives).toBeDefined();
  });
});
