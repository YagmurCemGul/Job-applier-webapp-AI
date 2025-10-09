/**
 * @fileoverview Unit tests for SMART goal validation (Step 45)
 */

import { describe, it, expect } from 'vitest';
import { validateSmart, smartBullet } from '@/services/onboarding/smartGoal.service';
import type { SmartGoal } from '@/types/onboarding.types';

describe('SMART Goal Service', () => {
  describe('validateSmart', () => {
    it('rejects goals without metric/target', () => {
      const goal: SmartGoal = {
        id: '1',
        title: 'Complete onboarding',
        description: 'Finish onboarding tasks',
        priority: 'P1',
        milestone: 'd30',
        status: 'not_started',
        tags: []
      };
      
      const result = validateSmart(goal);
      expect(result.ok).toBe(false);
      expect(result.msg).toContain('metric/target');
    });
    
    it('accepts valid SMART goals', () => {
      const goal: SmartGoal = {
        id: '1',
        title: 'Improve response time',
        description: 'Reduce API response time',
        metric: 'Response time',
        target: '< 200ms',
        dueISO: new Date().toISOString(),
        priority: 'P0',
        milestone: 'd30',
        status: 'not_started',
        tags: ['performance']
      };
      
      const result = validateSmart(goal);
      expect(result.ok).toBe(true);
      expect(result.msg).toBe('OK');
    });
    
    it('accepts goals with milestone instead of dueISO', () => {
      const goal: SmartGoal = {
        id: '1',
        title: 'Learn codebase',
        description: 'Understand core architecture',
        metric: 'Code reviews completed',
        target: '> 5',
        milestone: 'd60',
        priority: 'P1',
        status: 'not_started',
        tags: []
      };
      
      const result = validateSmart(goal);
      expect(result.ok).toBe(true);
    });
  });
  
  describe('smartBullet', () => {
    it('formats goal with dueISO', () => {
      const goal: SmartGoal = {
        id: '1',
        title: 'Improve performance',
        description: 'Reduce latency',
        metric: 'Latency',
        target: '< 100ms',
        dueISO: '2025-02-01T00:00:00Z',
        priority: 'P0',
        milestone: 'd30',
        status: 'in_progress',
        tags: []
      };
      
      const bullet = smartBullet(goal);
      expect(bullet).toContain('Improve performance');
      expect(bullet).toContain('Reduce latency');
      expect(bullet).toContain('Latency');
      expect(bullet).toContain('< 100ms');
    });
    
    it('formats goal with milestone', () => {
      const goal: SmartGoal = {
        id: '1',
        title: 'Complete training',
        description: 'Finish security training',
        metric: 'Modules',
        target: '100%',
        milestone: 'd90',
        priority: 'P2',
        status: 'not_started',
        tags: []
      };
      
      const bullet = smartBullet(goal);
      expect(bullet).toContain('D90');
    });
  });
});
