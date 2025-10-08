/**
 * @fileoverview Unit tests for planBuilder service.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  defaultMilestones,
  seedTasks,
  personalizeTasksWithAI,
} from '@/services/onboarding/planBuilder.service';
import * as aiService from '@/services/features/aiComplete.service';

describe('planBuilder.service', () => {
  describe('defaultMilestones', () => {
    it('should return 3 default milestones', () => {
      const milestones = defaultMilestones();
      expect(milestones).toHaveLength(3);
      expect(milestones.map((m) => m.id)).toEqual(['m30', 'm60', 'm90']);
    });
  });

  describe('seedTasks', () => {
    it('should return base tasks for any role', () => {
      const tasks = seedTasks('Designer');
      expect(tasks.length).toBeGreaterThanOrEqual(3);
      expect(tasks.every((t) => t.id)).toBe(true);
      expect(tasks.every((t) => t.status === 'todo')).toBe(true);
    });

    it('should add dev task for engineer role', () => {
      const tasks = seedTasks('Software Engineer');
      const devTask = tasks.find((t) => t.title.includes('local dev'));
      expect(devTask).toBeDefined();
    });

    it('should add PM task for product role', () => {
      const tasks = seedTasks('Product Manager');
      const pmTask = tasks.find((t) => t.title.includes('roadmap'));
      expect(pmTask).toBeDefined();
    });
  });

  describe('personalizeTasksWithAI', () => {
    it('should return original tasks if AI fails', async () => {
      vi.spyOn(aiService, 'aiComplete').mockRejectedValue(new Error('AI error'));
      const tasks = seedTasks('Engineer');
      const result = await personalizeTasksWithAI(tasks, {
        role: 'Engineer',
        company: 'ACME',
      });
      expect(result).toEqual(tasks);
    });

    it('should append AI-generated tasks', async () => {
      vi.spyOn(aiService, 'aiComplete').mockResolvedValue([
        { title: 'AI task 1', milestone: '30', tags: ['ai'] },
        { title: 'AI task 2', milestone: '60', tags: ['ai'] },
      ]);
      const tasks = seedTasks('Engineer');
      const result = await personalizeTasksWithAI(tasks, {
        role: 'Engineer',
        company: 'ACME',
      });
      expect(result.length).toBeGreaterThan(tasks.length);
      expect(result.some((t) => t.title === 'AI task 1')).toBe(true);
    });

    it('should limit AI tasks to 8', async () => {
      const manyTasks = Array.from({ length: 20 }, (_, i) => ({
        title: `Task ${i}`,
        milestone: '30',
      }));
      vi.spyOn(aiService, 'aiComplete').mockResolvedValue(manyTasks);
      const tasks = seedTasks('Engineer');
      const result = await personalizeTasksWithAI(tasks, {
        role: 'Engineer',
        company: 'ACME',
      });
      expect(result.length).toBeLessThanOrEqual(tasks.length + 8);
    });
  });
});
