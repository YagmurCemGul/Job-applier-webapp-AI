/**
 * @fileoverview Unit tests for impact aggregation service
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { aggregateImpact } from '@/services/review/impactAggregator.service';
import { useReviews } from '@/stores/review.store';
import { useOnboarding } from '@/stores/onboarding.store';
import { useOKRs } from '@/stores/okrs.store';
import type { ReviewCycle } from '@/types/review.types';

describe('impactAggregator', () => {
  beforeEach(() => {
    // Reset stores
    useReviews.setState({ cycles: [], impacts: [], selfReviews: [] });
    useOnboarding.setState({ plans: [], timelines: [], reports: [] });
    useOKRs.setState({ objectives: [] });
  });

  it('returns empty array for non-existent cycle', () => {
    const result = aggregateImpact('non-existent');
    expect(result).toEqual([]);
  });

  it('aggregates evidence from onboarding plan', () => {
    const planId = 'plan-1';
    const cycleId = 'cycle-1';

    useOnboarding.getState().upsertPlan({
      id: planId,
      title: 'Test Plan',
      evidence: [
        { id: 'e1', title: 'Launched feature', text: 'Details', createdAt: '2025-01-01T00:00:00Z' },
        { id: 'e2', title: 'Refactored codebase', text: 'Details', createdAt: '2025-01-02T00:00:00Z' },
      ],
      stakeholders: [],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    } as any);

    const cycle: ReviewCycle = {
      id: cycleId,
      planId,
      title: 'Test Cycle',
      kind: 'mid_year',
      stage: 'draft',
      startISO: '2025-01-01T00:00:00Z',
      endISO: '2025-06-30T00:00:00Z',
      deadlines: [],
      retentionDays: 90,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    };

    useReviews.getState().upsertCycle(cycle);

    const result = aggregateImpact(cycleId);

    expect(result.length).toBe(2);
    expect(result[0].source).toBe('evidence');
    expect(result.some(i => i.title === 'Launched feature')).toBe(true);
    expect(result.some(i => i.title === 'Refactored codebase')).toBe(true);
  });

  it('deduplicates items by title + date + source', () => {
    const planId = 'plan-1';
    const cycleId = 'cycle-1';

    useOnboarding.getState().upsertPlan({
      id: planId,
      title: 'Test Plan',
      evidence: [
        { id: 'e1', title: 'Same Impact', text: 'Details', createdAt: '2025-01-01T00:00:00Z' },
        { id: 'e2', title: 'Same Impact', text: 'Details', createdAt: '2025-01-01T00:00:00Z' },
      ],
      stakeholders: [],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    } as any);

    useReviews.getState().upsertCycle({
      id: cycleId,
      planId,
      title: 'Test',
      kind: 'mid_year',
      stage: 'draft',
      startISO: '2025-01-01T00:00:00Z',
      endISO: '2025-06-30T00:00:00Z',
      deadlines: [],
      retentionDays: 90,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    });

    const result = aggregateImpact(cycleId);

    expect(result.length).toBe(1);
  });

  it('sorts by score in descending order', () => {
    const planId = 'plan-1';
    const cycleId = 'cycle-1';

    useOnboarding.getState().upsertPlan({
      id: planId,
      title: 'Test Plan',
      evidence: [
        { id: 'e1', title: 'Low impact task', text: 'Details', createdAt: '2025-01-01T00:00:00Z' },
        { id: 'e2', title: 'High impact KPI improvement with 50% increase', text: 'Details', createdAt: '2025-01-01T00:00:00Z' },
      ],
      stakeholders: [],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    } as any);

    useReviews.getState().upsertCycle({
      id: cycleId,
      planId,
      title: 'Test',
      kind: 'mid_year',
      stage: 'draft',
      startISO: '2025-01-01T00:00:00Z',
      endISO: '2025-06-30T00:00:00Z',
      deadlines: [],
      retentionDays: 90,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    });

    const result = aggregateImpact(cycleId);

    // Higher scored item should be first
    expect(result[0].title).toContain('KPI');
    expect(result[0].score).toBeGreaterThan(result[1].score ?? 0);
  });
});
