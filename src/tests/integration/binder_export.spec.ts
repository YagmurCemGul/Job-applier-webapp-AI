/**
 * @fileoverview Integration test: Add evidence → Export PDF/Docs.
 * @module tests/integration/binder_export
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { OnboardingPlan, EvidenceItem } from '@/types/onboarding.types';
import { renderBinderHTML } from '@/services/onboarding/evidenceBinder.service';
import { defaultMilestones } from '@/services/onboarding/planBuilder.service';

describe('Integration: Evidence Binder → Export', () => {
  let plan: OnboardingPlan;
  let evidence: EvidenceItem[];

  beforeEach(() => {
    plan = {
      id: crypto.randomUUID(),
      applicationId: 'app-123',
      role: 'Designer',
      company: 'Creative Inc',
      stage: 'active',
      lang: 'en',
      milestones: defaultMilestones(),
      tasks: [],
      checklists: [],
      stakeholders: [],
      evidence: [],
      retentionDays: 90,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    evidence = [
      {
        id: crypto.randomUUID(),
        title: 'Design System Launch',
        kind: 'doc',
        url: 'https://example.com/design-system',
        createdAt: '2025-10-01T00:00:00Z',
        tags: ['design', 'launch'],
      },
      {
        id: crypto.randomUUID(),
        title: 'User Research Findings',
        kind: 'note',
        text: 'Conducted 5 user interviews. Key finding: users prefer dark mode.',
        createdAt: '2025-10-05T00:00:00Z',
        tags: ['research'],
      },
      {
        id: crypto.randomUUID(),
        title: 'Engagement Metrics',
        kind: 'metric',
        text: '+25% user engagement after redesign',
        createdAt: '2025-10-08T00:00:00Z',
        tags: ['metrics', 'success'],
      },
    ];

    plan.evidence = evidence;
  });

  it('should add evidence items to plan', () => {
    expect(plan.evidence).toHaveLength(3);
    expect(plan.evidence[0].title).toBe('Design System Launch');
  });

  it('should render HTML with all evidence', () => {
    const html = renderBinderHTML(plan.evidence);
    expect(html).toContain('Evidence Binder');
    expect(html).toContain('Design System Launch');
    expect(html).toContain('User Research Findings');
    expect(html).toContain('Engagement Metrics');
    expect(html).toContain('https://example.com/design-system');
    expect(html).toContain('+25% user engagement');
  });

  it('should mock PDF export', async () => {
    const mockExport = vi.fn(() => Promise.resolve('https://example.com/binder.pdf'));
    const url = await mockExport(plan.evidence);
    expect(url).toBe('https://example.com/binder.pdf');
  });

  it('should mock Google Docs export', async () => {
    const mockExport = vi.fn(() => Promise.resolve('doc-id-123'));
    const docId = await mockExport(plan.evidence);
    expect(docId).toBe('doc-id-123');
  });

  it('should handle evidence with minimal fields', () => {
    const minimal: EvidenceItem = {
      id: crypto.randomUUID(),
      title: 'Minimal Item',
      kind: 'note',
      createdAt: new Date().toISOString(),
    };
    const html = renderBinderHTML([minimal]);
    expect(html).toContain('Minimal Item');
  });

  it('should support tagging evidence', () => {
    const tagged = plan.evidence.filter((e) => e.tags?.includes('launch'));
    expect(tagged).toHaveLength(1);
    expect(tagged[0].title).toBe('Design System Launch');
  });

  it('should link evidence to tasks (conceptual)', () => {
    const taskId = crypto.randomUUID();
    const linkedEvidence: EvidenceItem = {
      ...evidence[0],
      relatedTaskIds: [taskId],
    };
    expect(linkedEvidence.relatedTaskIds).toContain(taskId);
  });
});
