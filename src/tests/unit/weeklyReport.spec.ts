/**
 * @fileoverview Unit tests for weekly report builder.
 * @module tests/unit/weeklyReport
 */

import { describe, it, expect } from 'vitest';
import {
  buildWeeklyHTML,
  progressForPlan,
} from '@/services/onboarding/weeklyReport.service';
import type { OnboardingPlan } from '@/types/onboarding.types';
import type { Objective } from '@/types/okr.types';

describe('weeklyReport.service', () => {
  const mockPlan: OnboardingPlan = {
    id: 'p1',
    applicationId: 'a1',
    role: 'Engineer',
    company: 'Acme',
    stage: 'active',
    lang: 'en',
    milestones: [],
    tasks: [],
    checklists: [],
    stakeholders: [],
    evidence: [],
    retentionDays: 90,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('buildWeeklyHTML', () => {
    it('should include company and role in header', () => {
      const html = buildWeeklyHTML(mockPlan, {
        highlights: [],
        risks: [],
        asks: [],
      });
      expect(html).toContain('Acme');
      expect(html).toContain('Engineer');
    });

    it('should render highlights section', () => {
      const html = buildWeeklyHTML(mockPlan, {
        highlights: ['Completed X', 'Started Y'],
        risks: [],
        asks: [],
      });
      expect(html).toContain('Highlights');
      expect(html).toContain('Completed X');
      expect(html).toContain('Started Y');
    });

    it('should render risks section', () => {
      const html = buildWeeklyHTML(mockPlan, {
        highlights: [],
        risks: ['Blocker on Z'],
        asks: [],
      });
      expect(html).toContain('Risks');
      expect(html).toContain('Blocker on Z');
    });

    it('should render OKR progress', () => {
      const html = buildWeeklyHTML(mockPlan, {
        highlights: [],
        risks: [],
        asks: [],
        okrProgress: [
          { title: 'Objective 1', pct: 0.75 },
          { title: 'Objective 2', pct: 0.5 },
        ],
      });
      expect(html).toContain('OKRs');
      expect(html).toContain('Objective 1');
      expect(html).toContain('75%');
    });

    it('should handle Unicode characters safely', () => {
      const html = buildWeeklyHTML(mockPlan, {
        highlights: ['✅ Completed', '🚀 Launched'],
        risks: [],
        asks: [],
      });
      expect(html).toContain('✅');
      expect(html).toContain('🚀');
    });
  });

  describe('progressForPlan', () => {
    it('should filter OKRs by plan ID', () => {
      const okrs: Objective[] = [
        {
          id: 'o1',
          planId: 'p1',
          title: 'Obj 1',
          owner: 'me',
          krs: [{ id: 'kr1', label: 'KR1', target: 100, current: 50 }],
          confidence: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'o2',
          planId: 'p2',
          title: 'Obj 2',
          owner: 'me',
          krs: [],
          confidence: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      const result = progressForPlan(mockPlan, okrs);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Obj 1');
      expect(result[0].pct).toBe(0.5);
    });
  });
});
