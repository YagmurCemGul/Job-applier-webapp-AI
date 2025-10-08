/**
 * @fileoverview Unit tests for OKR progress calculation.
 * @module tests/unit/okr.progress
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

    it('should calculate simple progress correctly', () => {
      const obj: Objective = {
        id: '1',
        planId: 'p1',
        title: 'Test',
        owner: 'me',
        krs: [
          { id: 'kr1', label: 'KR1', target: 100, current: 50 },
          { id: 'kr2', label: 'KR2', target: 100, current: 50 },
        ],
        confidence: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(objectiveProgress(obj)).toBe(0.5);
    });

    it('should handle weighted KRs', () => {
      const obj: Objective = {
        id: '1',
        planId: 'p1',
        title: 'Test',
        owner: 'me',
        krs: [
          { id: 'kr1', label: 'KR1', target: 100, current: 100, weight: 3 },
          { id: 'kr2', label: 'KR2', target: 100, current: 0, weight: 1 },
        ],
        confidence: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      // (1*3 + 0*1) / (3+1) = 0.75
      expect(objectiveProgress(obj)).toBe(0.75);
    });

    it('should cap progress at 1.0', () => {
      const obj: Objective = {
        id: '1',
        planId: 'p1',
        title: 'Test',
        owner: 'me',
        krs: [{ id: 'kr1', label: 'KR1', target: 100, current: 150 }],
        confidence: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(objectiveProgress(obj)).toBe(1);
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
  });
});
