/**
 * @fileoverview Unit tests for weekly report service.
 */

import { describe, it, expect } from 'vitest';
import {
  buildWeeklyHTML,
  progressForPlan,
} from '@/services/onboarding/weeklyReport.service';
import type { OnboardingPlan } from '@/types/onboarding.types';
import type { Objective } from '@/types/okr.types';

describe('weeklyReport.service', () => {
  describe('buildWeeklyHTML', () => {
    const plan: OnboardingPlan = {
      id: 'p1',
      applicationId: 'a1',
      role: 'Engineer',
      company: 'ACME',
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

    it('should build HTML with all sections', () => {
      const html = buildWeeklyHTML(plan, {
        highlights: ['Shipped feature X', 'Met with team'],
        risks: ['Blocked on API'],
        asks: ['Need design review'],
      });
      expect(html).toContain('ACME');
      expect(html).toContain('Engineer');
      expect(html).toContain('Shipped feature X');
      expect(html).toContain('Blocked on API');
      expect(html).toContain('Need design review');
    });

    it('should handle empty sections', () => {
      const html = buildWeeklyHTML(plan, {
        highlights: [],
        risks: [],
        asks: [],
      });
      expect(html).toContain('ACME');
      expect(html).not.toContain('<h3>Highlights</h3>');
    });

    it('should include OKR progress if provided', () => {
      const html = buildWeeklyHTML(plan, {
        highlights: [],
        risks: [],
        asks: [],
        okrProgress: [
          { title: 'Objective 1', pct: 0.75 },
          { title: 'Objective 2', pct: 0.5 },
        ],
      });
      expect(html).toContain('Objective 1: 75%');
      expect(html).toContain('Objective 2: 50%');
    });

    it('should handle Unicode characters safely', () => {
      const html = buildWeeklyHTML(plan, {
        highlights: ['Completed feature 你好'],
        risks: ['Türkçe karakter'],
        asks: [],
      });
      expect(html).toContain('你好');
      expect(html).toContain('Türkçe');
    });
  });

  describe('progressForPlan', () => {
    const plan: OnboardingPlan = {
      id: 'p1',
      applicationId: 'a1',
      role: 'Engineer',
      company: 'ACME',
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

    it('should filter OKRs by plan ID', () => {
      const okrs: Objective[] = [
        {
          id: 'o1',
          planId: 'p1',
          title: 'OKR 1',
          owner: 'me',
          krs: [{ id: 'kr1', label: 'KR1', target: 100, current: 50 }],
          confidence: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'o2',
          planId: 'p2',
          title: 'OKR 2',
          owner: 'me',
          krs: [],
          confidence: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      const result = progressForPlan(plan, okrs);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('OKR 1');
      expect(result[0].pct).toBe(0.5);
    });
  });
});
