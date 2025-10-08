/**
 * @fileoverview Unit tests for bias-safe phrasing service.
 * @module tests/unit/biasPhrasing
 */

import { describe, it, expect } from 'vitest';
import { suggestBiasSafe } from '@/services/onboarding/biasPhrasing.service';

describe('biasPhrasing.service', () => {
  describe('suggestBiasSafe', () => {
    it('should return empty array for safe text', () => {
      const suggestions = suggestBiasSafe('Great work on the project!');
      expect(suggestions).toEqual([]);
    });

    it('should flag "culture fit"', () => {
      const suggestions = suggestBiasSafe(
        'They are a great culture fit for the team.'
      );
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toContain('culture add');
    });

    it('should flag "aggressive"', () => {
      const suggestions = suggestBiasSafe('She was very aggressive in the meeting.');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toContain('specific behaviors');
    });

    it('should flag "bossy"', () => {
      const suggestions = suggestBiasSafe('He can be bossy at times.');
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should flag "rockstar" or "ninja"', () => {
      const suggestions1 = suggestBiasSafe('We need a rockstar developer.');
      expect(suggestions1.length).toBeGreaterThan(0);

      const suggestions2 = suggestBiasSafe('Looking for a ninja coder.');
      expect(suggestions2.length).toBeGreaterThan(0);
    });

    it('should be case-insensitive', () => {
      const suggestions = suggestBiasSafe('They are a CULTURE FIT.');
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should return multiple suggestions for multiple issues', () => {
      const suggestions = suggestBiasSafe(
        'They are a culture fit and a rockstar.'
      );
      expect(suggestions.length).toBeGreaterThanOrEqual(2);
    });
  });
});
