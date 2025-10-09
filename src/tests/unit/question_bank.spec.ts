/**
 * @fileoverview Unit tests for question bank service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { seedDefaultQuestions, generateFromJD, filterQuestions } from '@/services/interview/questionBank.service';
import { useQuestionBank } from '@/stores/questionBank.store';
import type { QuestionItem } from '@/types/interview.types';

describe('QuestionBank Service', () => {
  beforeEach(() => {
    useQuestionBank.setState({ items: [] });
  });

  describe('seedDefaultQuestions', () => {
    it('should seed default questions when bank is empty', () => {
      seedDefaultQuestions();
      const { items } = useQuestionBank.getState();
      expect(items.length).toBeGreaterThan(0);
    });

    it('should be idempotent', () => {
      seedDefaultQuestions();
      const count1 = useQuestionBank.getState().items.length;
      seedDefaultQuestions();
      const count2 = useQuestionBank.getState().items.length;
      expect(count1).toBe(count2);
    });

    it('should include multiple question kinds', () => {
      seedDefaultQuestions();
      const { items } = useQuestionBank.getState();
      const kinds = new Set(items.map(q => q.kind));
      expect(kinds.has('behavioral')).toBe(true);
      expect(kinds.has('system_design')).toBe(true);
      expect(kinds.has('coding')).toBe(true);
    });

    it('should set all questions to source:bank', () => {
      seedDefaultQuestions();
      const { items } = useQuestionBank.getState();
      expect(items.every(q => q.source === 'bank')).toBe(true);
    });

    it('should enforce difficulty bounds 1-5', () => {
      seedDefaultQuestions();
      const { items } = useQuestionBank.getState();
      expect(items.every(q => q.difficulty >= 1 && q.difficulty <= 5)).toBe(true);
    });
  });

  describe('generateFromJD', () => {
    it('should return array of typed items', async () => {
      vi.mock('@/services/features/aiComplete.service', () => ({
        aiComplete: vi.fn().mockResolvedValue('[{"prompt":"Test","kind":"behavioral","tags":["test"],"difficulty":3}]')
      }));

      const questions = await generateFromJD('test jd', 'Engineer');
      expect(Array.isArray(questions)).toBe(true);
      if (questions.length > 0) {
        expect(questions[0]).toHaveProperty('id');
        expect(questions[0]).toHaveProperty('prompt');
        expect(questions[0].source).toBe('jd');
      }
    });

    it('should handle invalid JSON gracefully', async () => {
      vi.mock('@/services/features/aiComplete.service', () => ({
        aiComplete: vi.fn().mockResolvedValue('invalid json')
      }));

      const questions = await generateFromJD('test', 'role');
      expect(questions).toEqual([]);
    });
  });

  describe('filterQuestions', () => {
    const mockItems: QuestionItem[] = [
      { id: '1', prompt: 'behavioral q', kind: 'behavioral', tags: ['leadership'], difficulty: 3, source: 'bank' },
      { id: '2', prompt: 'coding q', kind: 'coding', tags: ['arrays'], difficulty: 2, source: 'bank' },
      { id: '3', prompt: 'design q', kind: 'system_design', tags: ['scalability'], difficulty: 5, source: 'bank' }
    ];

    it('should filter by kind', () => {
      const filtered = filterQuestions(mockItems, { kind: 'behavioral' });
      expect(filtered.length).toBe(1);
      expect(filtered[0].kind).toBe('behavioral');
    });

    it('should filter by tag', () => {
      const filtered = filterQuestions(mockItems, { tags: ['arrays'] });
      expect(filtered.length).toBe(1);
      expect(filtered[0].tags).toContain('arrays');
    });

    it('should filter by difficulty range', () => {
      const filtered = filterQuestions(mockItems, { minDifficulty: 3, maxDifficulty: 5 });
      expect(filtered.length).toBe(2);
      expect(filtered.every(q => q.difficulty >= 3 && q.difficulty <= 5)).toBe(true);
    });

    it('should filter by search text', () => {
      const filtered = filterQuestions(mockItems, { search: 'coding' });
      expect(filtered.length).toBe(1);
      expect(filtered[0].prompt).toContain('coding');
    });
  });
});
