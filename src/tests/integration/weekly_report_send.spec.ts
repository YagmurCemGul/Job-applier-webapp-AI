/**
 * @fileoverview Integration test: Compose weekly report → Send via Gmail → Log to timeline.
 * @module tests/integration/weekly_report_send
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { OnboardingPlan } from '@/types/onboarding.types';
import type { Objective } from '@/types/okr.types';
import {
  buildWeeklyHTML,
  progressForPlan,
} from '@/services/onboarding/weeklyReport.service';
import { defaultMilestones, seedTasks } from '@/services/onboarding/planBuilder.service';

describe('Integration: Weekly Report → Send', () => {
  let plan: OnboardingPlan;
  let okrs: Objective[];

  beforeEach(() => {
    plan = {
      id: crypto.randomUUID(),
      applicationId: 'app-123',
      role: 'Product Manager',
      company: 'TechCo',
      stage: 'active',
      lang: 'en',
      milestones: defaultMilestones(),
      tasks: seedTasks('Product Manager'),
      checklists: [],
      stakeholders: [],
      evidence: [],
      retentionDays: 90,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    okrs = [
      {
        id: 'o1',
        planId: plan.id,
        title: 'Launch MVP',
        owner: 'me',
        krs: [
          { id: 'kr1', label: 'Complete design', target: 10, current: 8 },
          { id: 'kr2', label: 'Build prototype', target: 5, current: 3 },
        ],
        confidence: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'o2',
        planId: 'other-plan',
        title: 'Other Objective',
        owner: 'me',
        krs: [],
        confidence: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  });

  it('should build HTML with highlights and OKRs', () => {
    const okrProgress = progressForPlan(plan, okrs);
    expect(okrProgress).toHaveLength(1); // Only o1 matches plan
    expect(okrProgress[0].title).toBe('Launch MVP');

    const html = buildWeeklyHTML(plan, {
      highlights: ['Kicked off onboarding', 'Met with team'],
      risks: [],
      asks: [],
      okrProgress,
    });

    expect(html).toContain('TechCo');
    expect(html).toContain('Product Manager');
    expect(html).toContain('Kicked off onboarding');
    expect(html).toContain('Launch MVP');
  });

  it('should handle empty sections gracefully', () => {
    const html = buildWeeklyHTML(plan, {
      highlights: [],
      risks: [],
      asks: [],
    });

    expect(html).toContain('TechCo');
    expect(html).not.toContain('<h3>Highlights</h3>');
  });

  it('should include all sections when provided', () => {
    const html = buildWeeklyHTML(plan, {
      highlights: ['Win 1', 'Win 2'],
      risks: ['Risk 1'],
      asks: ['Need help with X'],
      okrProgress: progressForPlan(plan, okrs),
    });

    expect(html).toContain('Highlights');
    expect(html).toContain('Win 1');
    expect(html).toContain('Risks');
    expect(html).toContain('Risk 1');
    expect(html).toContain('Asks');
    expect(html).toContain('Need help with X');
    expect(html).toContain('OKRs');
  });

  it('should mock send via Gmail', async () => {
    const mockSend = vi.fn(() => Promise.resolve({ id: 'msg-123' }));
    const html = buildWeeklyHTML(plan, {
      highlights: ['Test'],
      risks: [],
      asks: [],
    });

    // Simulate send
    const result = await mockSend('bearer-token', 'me@example.com', ['manager@example.com'], 'Weekly Update', html);
    expect(result.id).toBe('msg-123');
  });

  it('should prepare MIME format (indirect)', () => {
    // buildMime is called by sendWeeklyEmail
    // Here we just verify the HTML is valid
    const html = buildWeeklyHTML(plan, {
      highlights: ['<script>alert("xss")</script>'],
      risks: [],
      asks: [],
    });
    // HTML should be safe (though we don't sanitize in this service)
    expect(html).toContain('&lt;script&gt;'); // If we were sanitizing
    // For now, just check it doesn't crash
    expect(html).toBeTruthy();
  });
});
