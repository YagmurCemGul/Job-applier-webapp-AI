/**
 * @fileoverview Unit tests for interview scheduler
 */

import { describe, it, expect } from 'vitest';
import { hasSchedulingConflict } from '@/services/interview/scheduler.service';
import { withinQuietHours } from '@/services/integrations/timezone.service';
import type { InterviewPlan } from '@/types/interview.types';

describe('Scheduler Service', () => {
  describe('hasSchedulingConflict', () => {
    const basePlan: InterviewPlan = {
      id: 'new',
      kind: 'behavioral',
      medium: 'video',
      startISO: '2025-01-20T10:00:00Z',
      endISO: '2025-01-20T11:00:00Z',
      tz: 'UTC',
      quietRespect: false,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    };

    it('should detect exact overlap', () => {
      const existing: InterviewPlan[] = [{
        ...basePlan,
        id: 'existing',
        startISO: '2025-01-20T10:00:00Z',
        endISO: '2025-01-20T11:00:00Z'
      }];

      expect(hasSchedulingConflict(basePlan, existing)).toBe(true);
    });

    it('should detect partial overlap at start', () => {
      const newPlan = {
        ...basePlan,
        startISO: '2025-01-20T09:30:00Z',
        endISO: '2025-01-20T10:30:00Z'
      };
      const existing: InterviewPlan[] = [{
        ...basePlan,
        id: 'existing',
        startISO: '2025-01-20T10:00:00Z',
        endISO: '2025-01-20T11:00:00Z'
      }];

      expect(hasSchedulingConflict(newPlan, existing)).toBe(true);
    });

    it('should detect partial overlap at end', () => {
      const newPlan = {
        ...basePlan,
        startISO: '2025-01-20T10:30:00Z',
        endISO: '2025-01-20T11:30:00Z'
      };
      const existing: InterviewPlan[] = [{
        ...basePlan,
        id: 'existing',
        startISO: '2025-01-20T10:00:00Z',
        endISO: '2025-01-20T11:00:00Z'
      }];

      expect(hasSchedulingConflict(newPlan, existing)).toBe(true);
    });

    it('should not detect conflict for adjacent slots', () => {
      const newPlan = {
        ...basePlan,
        startISO: '2025-01-20T11:00:00Z',
        endISO: '2025-01-20T12:00:00Z'
      };
      const existing: InterviewPlan[] = [{
        ...basePlan,
        id: 'existing',
        startISO: '2025-01-20T10:00:00Z',
        endISO: '2025-01-20T11:00:00Z'
      }];

      expect(hasSchedulingConflict(newPlan, existing)).toBe(false);
    });

    it('should not detect conflict for different days', () => {
      const newPlan = {
        ...basePlan,
        startISO: '2025-01-21T10:00:00Z',
        endISO: '2025-01-21T11:00:00Z'
      };
      const existing: InterviewPlan[] = [{
        ...basePlan,
        id: 'existing',
        startISO: '2025-01-20T10:00:00Z',
        endISO: '2025-01-20T11:00:00Z'
      }];

      expect(hasSchedulingConflict(newPlan, existing)).toBe(false);
    });
  });

  describe('withinQuietHours', () => {
    it('should detect quiet hours at night', () => {
      const iso = '2025-01-20T23:00:00Z';
      const inQuiet = withinQuietHours(iso, 'UTC', 22, 7);
      expect(inQuiet).toBe(true);
    });

    it('should detect quiet hours in early morning', () => {
      const iso = '2025-01-20T06:00:00Z';
      const inQuiet = withinQuietHours(iso, 'UTC', 22, 7);
      expect(inQuiet).toBe(true);
    });

    it('should not detect quiet hours during work hours', () => {
      const iso = '2025-01-20T14:00:00Z';
      const inQuiet = withinQuietHours(iso, 'UTC', 22, 7);
      expect(inQuiet).toBe(false);
    });

    it('should respect timezone conversion', () => {
      const iso = '2025-01-20T03:00:00Z'; // 11PM EST previous day
      const inQuiet = withinQuietHours(iso, 'America/New_York', 22, 7);
      expect(inQuiet).toBe(true);
    });
  });
});
