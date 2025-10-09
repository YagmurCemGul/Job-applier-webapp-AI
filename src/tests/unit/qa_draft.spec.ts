/**
 * @fileoverview Unit tests for Q&A draft service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { draftAnswers } from '@/services/apply/qaDraft.service';
import type { Screener } from '@/types/apply.types';

// Mock AI complete
vi.mock('@/services/features/aiComplete.service', () => ({
  aiComplete: vi.fn((prompt: string) => {
    return Promise.resolve('1. I have 5+ years of experience in software development.\n2. Yes, I am authorized to work.\n3. I can start within 2 weeks.');
  }),
}));

// Mock stores
vi.mock('@/stores/site.store', () => ({
  useSite: {
    getState: () => ({
      profile: {
        headline: 'Senior Software Engineer',
        skills: ['React', 'TypeScript', 'Node.js']
      }
    })
  }
}));

vi.mock('@/stores/review.store', () => ({
  useReviews: {
    getState: () => ({
      selfReviews: [{
        highlights: ['Led team of 5 engineers', 'Improved performance by 40%']
      }]
    })
  }
}));

describe('qaDraft', () => {
  const mockQuestions: Screener[] = [
    { id: '1', kind: 'screener', prompt: 'Tell us about your experience' },
    { id: '2', kind: 'legal', prompt: 'Are you authorized to work?' },
    { id: '3', kind: 'screener', prompt: 'When can you start?' }
  ];

  it('drafts answers for all questions', async () => {
    const result = await draftAnswers(mockQuestions, 'en');
    expect(result).toHaveLength(3);
    expect(result[0].answer).toBeTruthy();
  });

  it('respects character limit', async () => {
    const result = await draftAnswers(mockQuestions, 'en');
    result.forEach(q => {
      expect(q.answer?.length || 0).toBeLessThanOrEqual(900);
    });
  });

  it('handles Turkish language', async () => {
    const result = await draftAnswers(mockQuestions, 'tr');
    expect(result).toHaveLength(3);
  });
});
