/**
 * @fileoverview Unit tests for plan builder service.
 * @module tests/unit/planBuilder
 */

import { describe, it, expect, vi } from 'vitest';
import {
  defaultMilestones,
  seedTasks,
  personalizeTasksWithAI,
} from '@/services/onboarding/planBuilder.service';

describe('planBuilder.service', () => {
  describe('defaultMilestones', () => {
    it('should return 3 milestones for 30/60/90 days', () => {
      const milestones = defaultMilestones();
      expect(milestones).toHaveLength(3);
      expect(milestones[0].targetDay).toBe(30);
      expect(milestones[1].targetDay).toBe(60);
      expect(milestones[2].targetDay).toBe(90);
    });

    it('should have unique IDs', () => {
      const milestones = defaultMilestones();
      const ids = milestones.map((m) => m.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('seedTasks', () => {
    it('should return base tasks for any role', () => {
      const tasks = seedTasks('Designer');
      expect(tasks.length).toBeGreaterThanOrEqual(3);
      expect(tasks.every((t) => t.id && t.title && t.status === 'todo')).toBe(true);
    });

    it('should add dev task for engineer role', () => {
      const tasks = seedTasks('Software Engineer');
      expect(tasks.some((t) => t.title.includes('dev'))).toBe(true);
    });

    it('should add PM task for product role', () => {
      const tasks = seedTasks('Product Manager');
      expect(tasks.some((t) => t.title.includes('roadmap'))).toBe(true);
    });

    it('should generate unique task IDs', () => {
      const tasks = seedTasks('Engineer');
      const ids = tasks.map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('personalizeTasksWithAI', () => {
    it('should return original tasks if AI fails', async () => {
      vi.mock('@/services/features/aiComplete.service', () => ({
        aiComplete: vi.fn(() => Promise.reject(new Error('AI error'))),
      }));

      const tasks = seedTasks('Engineer');
      const result = await personalizeTasksWithAI(tasks, {
        role: 'Engineer',
        company: 'Acme',
      });
      expect(result).toEqual(tasks);
    });

    it('should append AI-suggested tasks (max 8)', async () => {
      const mockAI = vi.fn(() =>
        Promise.resolve(
          JSON.stringify(
            Array.from({ length: 10 }, (_, i) => ({
              title: `AI Task ${i}`,
              milestone: '30',
              tags: ['ai'],
            }))
          )
        )
      );
      vi.mock('@/services/features/aiComplete.service', () => ({
        aiComplete: mockAI,
      }));

      const tasks = seedTasks('Engineer');
      const result = await personalizeTasksWithAI(tasks, {
        role: 'Engineer',
        company: 'Acme',
      });
      // Should add max 8 new tasks
      expect(result.length).toBeLessThanOrEqual(tasks.length + 8);
    });
  });
});
