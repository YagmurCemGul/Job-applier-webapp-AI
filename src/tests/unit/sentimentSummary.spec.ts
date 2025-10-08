/**
 * @fileoverview Unit tests for sentiment analysis
 */

import { describe, it, expect, vi } from 'vitest';
import { analyzeSentiment } from '@/services/review/sentiment.service';

// Mock AI complete
vi.mock('@/services/features/aiComplete.service', () => ({
  aiComplete: vi.fn((prompt: string) => {
    if (prompt.includes('Great job')) return Promise.resolve('POSITIVE');
    if (prompt.includes('needs improvement')) return Promise.resolve('NEGATIVE');
    return Promise.resolve('NEUTRAL');
  }),
}));

describe('sentimentSummary', () => {
  it('identifies positive sentiment', async () => {
    const result = await analyzeSentiment('Great job on the project!');
    expect(result).toBe('positive');
  });

  it('identifies negative sentiment', async () => {
    const result = await analyzeSentiment('This needs improvement.');
    expect(result).toBe('negative');
  });

  it('identifies neutral sentiment', async () => {
    const result = await analyzeSentiment('The project was completed on time.');
    expect(result).toBe('neutral');
  });

  it('falls back to neutral on error', async () => {
    vi.mocked(await import('@/services/features/aiComplete.service')).aiComplete.mockRejectedValueOnce(
      new Error('AI error')
    );
    const result = await analyzeSentiment('Test text');
    expect(result).toBe('neutral');
  });
});
