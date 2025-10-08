/**
 * @fileoverview Integration test: compose weekly report → send via Gmail → log to timeline.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnboarding } from '@/stores/onboarding.store';
import { useOKRs } from '@/stores/okrs.store';
import type { OnboardingPlan } from '@/types/onboarding.types';
import type { Objective } from '@/types/okr.types';
import { buildWeeklyHTML, progressForPlan } from '@/services/onboarding/weeklyReport.service';

describe('Weekly Report Flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should compose report with OKR progress and build HTML', () => {
    // 1. Create plan
    const { result: onboardingResult } = renderHook(() => useOnboarding());
    const plan: OnboardingPlan = {
      id: 'p1',
      applicationId: 'app1',
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

    act(() => {
      onboardingResult.current.upsert(plan);
    });

    // 2. Add OKR
    const { result: okrResult } = renderHook(() => useOKRs());
    const okr: Objective = {
      id: 'o1',
      planId: plan.id,
      title: 'Ship feature X',
      owner: 'me',
      krs: [
        { id: 'kr1', label: 'Complete design', target: 100, current: 100 },
        { id: 'kr2', label: 'Complete dev', target: 100, current: 50 },
      ],
      confidence: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    act(() => {
      okrResult.current.upsert(okr);
    });

    // 3. Build report
    const okrProgress = progressForPlan(plan, okrResult.current.items);
    expect(okrProgress).toHaveLength(1);
    expect(okrProgress[0].pct).toBe(0.75); // (100 + 50) / 200

    const html = buildWeeklyHTML(plan, {
      highlights: ['Completed design phase', 'Started implementation'],
      risks: ['Waiting on API approval'],
      asks: ['Need design review'],
      okrProgress,
    });

    expect(html).toContain('ACME');
    expect(html).toContain('Completed design phase');
    expect(html).toContain('Ship feature X: 75%');
  });
});
