/**
 * @fileoverview Unit tests for bias-safe phrasing service.
 */

import { describe, it, expect } from 'vitest';
import { suggestBiasSafe } from '@/services/onboarding/biasPhrasing.service';

describe('biasPhrasing.service', () => {
  describe('suggestBiasSafe', () => {
    it('should return empty array for bias-free text', () => {
      const suggestions = suggestBiasSafe('Great communicator, delivers results.');
      expect(suggestions).toEqual([]);
    });

    it('should suggest for "culture fit"', () => {
      const suggestions = suggestBiasSafe('They are a great culture fit.');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toContain('culture add');
    });

    it('should suggest for "aggressive" or "bossy"', () => {
      const aggressive = suggestBiasSafe('She is very aggressive in meetings.');
      expect(aggressive.length).toBeGreaterThan(0);
      expect(aggressive[0]).toContain('specific behaviors');

      const bossy = suggestBiasSafe('He can be bossy sometimes.');
      expect(bossy.length).toBeGreaterThan(0);
    });

    it('should suggest for "rockstar" or "ninja"', () => {
      const rockstar = suggestBiasSafe('Looking for a rockstar engineer.');
      expect(rockstar.length).toBeGreaterThan(0);
      expect(rockstar[0]).toContain('job-relevant');

      const ninja = suggestBiasSafe('Seeking a React ninja.');
      expect(ninja.length).toBeGreaterThan(0);
    });

    it('should be case-insensitive', () => {
      const upper = suggestBiasSafe('CULTURE FIT');
      expect(upper.length).toBeGreaterThan(0);
    });
  });
});
