/**
 * @fileoverview Unit tests for OKR progress calculation.
 */

import { describe, it, expect } from 'vitest';
import { objectiveProgress } from '@/services/onboarding/okr.service';
import type { Objective } from '@/types/okr.types';

describe('okr.service', () => {
  describe('objectiveProgress', () => {
    it('should return 0 for objective with no KRs', () => {
      const obj: Objective = {
        id: '1',
        planId: 'p1',
        title: 'Test',
        owner: 'me',
        krs: [],
        confidence: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(objectiveProgress(obj)).toBe(0);
    });

    it('should calculate simple progress for single KR', () => {
      const obj: Objective = {
        id: '1',
        planId: 'p1',
        title: 'Test',
        owner: 'me',
        krs: [{ id: 'kr1', label: 'KR1', target: 100, current: 50, weight: 1 }],
        confidence: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(objectiveProgress(obj)).toBe(0.5);
    });

    it('should calculate weighted average for multiple KRs', () => {
      const obj: Objective = {
        id: '1',
        planId: 'p1',
        title: 'Test',
        owner: 'me',
        krs: [
          { id: 'kr1', label: 'KR1', target: 100, current: 100, weight: 2 },
          { id: 'kr2', label: 'KR2', target: 100, current: 0, weight: 1 },
        ],
        confidence: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      // (100/100 * 2 + 0/100 * 1) / 3 = 2/3
      expect(objectiveProgress(obj)).toBeCloseTo(2 / 3, 2);
    });

    it('should handle zero target gracefully', () => {
      const obj: Objective = {
        id: '1',
        planId: 'p1',
        title: 'Test',
        owner: 'me',
        krs: [{ id: 'kr1', label: 'KR1', target: 0, current: 50 }],
        confidence: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(objectiveProgress(obj)).toBe(0);
    });

    it('should cap progress at 1.0', () => {
      const obj: Objective = {
        id: '1',
        planId: 'p1',
        title: 'Test',
        owner: 'me',
        krs: [{ id: 'kr1', label: 'KR1', target: 100, current: 200 }],
        confidence: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(objectiveProgress(obj)).toBe(1);
    });
  });
});
