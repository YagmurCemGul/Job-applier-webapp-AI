/**
 * @fileoverview Unit tests for rubric scoring service
 */

import { describe, it, expect } from 'vitest';
import { DEFAULT_RUBRIC, computeScore, validateRubric, getAllRubrics } from '@/services/interview/rubric.service';

describe('Rubric Service', () => {
  describe('DEFAULT_RUBRIC', () => {
    it('should have 4 competencies', () => {
      expect(DEFAULT_RUBRIC.competencies).toHaveLength(4);
    });

    it('should have weights that sum to 1', () => {
      const sum = DEFAULT_RUBRIC.competencies.reduce((acc, c) => acc + c.weight, 0);
      expect(Math.abs(sum - 1)).toBeLessThan(0.01);
    });

    it('should have unique competency keys', () => {
      const keys = DEFAULT_RUBRIC.competencies.map(c => c.key);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });
  });

  describe('computeScore', () => {
    it('should compute weighted total correctly', () => {
      const ratings = {
        clarity: 4,
        structure: 3,
        impact: 4,
        ownership: 3
      };
      const score = computeScore({ rubric: DEFAULT_RUBRIC, ratings });
      
      expect(score.total).toBe(3.5); // (4+3+4+3)/4 * equal weights
    });

    it('should handle zero scores', () => {
      const ratings = {
        clarity: 0,
        structure: 0,
        impact: 0,
        ownership: 0
      };
      const score = computeScore({ rubric: DEFAULT_RUBRIC, ratings });
      
      expect(score.total).toBe(0);
    });

    it('should handle perfect scores', () => {
      const ratings = {
        clarity: 4,
        structure: 4,
        impact: 4,
        ownership: 4
      };
      const score = computeScore({ rubric: DEFAULT_RUBRIC, ratings });
      
      expect(score.total).toBe(4);
    });

    it('should include notes in result', () => {
      const ratings = { clarity: 3, structure: 3, impact: 3, ownership: 3 };
      const notes = 'Test notes';
      const score = computeScore({ rubric: DEFAULT_RUBRIC, ratings, notes });
      
      expect(score.notes).toBe(notes);
    });

    it('should store rubricId', () => {
      const ratings = { clarity: 3, structure: 3, impact: 3, ownership: 3 };
      const score = computeScore({ rubric: DEFAULT_RUBRIC, ratings });
      
      expect(score.rubricId).toBe(DEFAULT_RUBRIC.id);
    });

    it('should handle missing competency scores as 0', () => {
      const ratings = { clarity: 4 };
      const score = computeScore({ rubric: DEFAULT_RUBRIC, ratings });
      
      expect(score.total).toBeLessThan(4);
    });
  });

  describe('validateRubric', () => {
    it('should validate rubric with weights summing to 1', () => {
      const valid = validateRubric(DEFAULT_RUBRIC);
      expect(valid).toBe(true);
    });

    it('should reject rubric with weights not summing to 1', () => {
      const invalidRubric = {
        ...DEFAULT_RUBRIC,
        competencies: [
          { key: 'a', label: 'A', weight: 0.5 },
          { key: 'b', label: 'B', weight: 0.3 }
        ]
      };
      const valid = validateRubric(invalidRubric);
      expect(valid).toBe(false);
    });

    it('should allow small floating point errors', () => {
      const rubric = {
        ...DEFAULT_RUBRIC,
        competencies: [
          { key: 'a', label: 'A', weight: 0.333 },
          { key: 'b', label: 'B', weight: 0.333 },
          { key: 'c', label: 'C', weight: 0.334 }
        ]
      };
      const valid = validateRubric(rubric);
      expect(valid).toBe(true);
    });
  });

  describe('getAllRubrics', () => {
    it('should return array of rubrics', () => {
      const rubrics = getAllRubrics();
      expect(Array.isArray(rubrics)).toBe(true);
      expect(rubrics.length).toBeGreaterThan(0);
    });

    it('should include DEFAULT_RUBRIC', () => {
      const rubrics = getAllRubrics();
      expect(rubrics).toContain(DEFAULT_RUBRIC);
    });
  });
});
