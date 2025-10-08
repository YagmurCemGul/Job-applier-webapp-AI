/**
 * @fileoverview Integration test: plan → stakeholder → 1:1 series → entry → AI actions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnboarding } from '@/stores/onboarding.store';
import { useOneOnOnes } from '@/stores/oneonones.store';
import type { OnboardingPlan, Stakeholder } from '@/types/onboarding.types';
import type { OneOnOneSeries, OneOnOneEntry } from '@/types/oneonone.types';
import { extractActions } from '@/services/onboarding/aiActionItems.service';
import * as aiService from '@/services/features/aiComplete.service';

describe('Plan → Stakeholder → 1:1 Flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should create plan, add stakeholder, create 1:1 series, add entry, extract actions', async () => {
    // 1. Create plan
    const { result: onboardingResult } = renderHook(() => useOnboarding());
    const plan: OnboardingPlan = {
      id: crypto.randomUUID(),
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

    expect(onboardingResult.current.plans).toHaveLength(1);

    // 2. Add stakeholder
    const stakeholder: Stakeholder = {
      id: 'mgr@acme.com',
      name: 'Manager',
      email: 'mgr@acme.com',
      influence: 'high',
      interest: 'high',
      cadence: 'weekly',
    };

    act(() => {
      onboardingResult.current.addStakeholder(plan.id, stakeholder);
    });

    const updatedPlan = onboardingResult.current.getById(plan.id);
    expect(updatedPlan?.stakeholders).toHaveLength(1);

    // 3. Create 1:1 series
    const { result: oneOnOneResult } = renderHook(() => useOneOnOnes());
    const series: OneOnOneSeries = {
      id: crypto.randomUUID(),
      planId: plan.id,
      counterpartEmail: stakeholder.email,
      counterpartName: stakeholder.name,
      cadence: 'weekly',
      weekday: 1,
      timeHHMM: '10:00',
      durationMin: 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    act(() => {
      oneOnOneResult.current.upsertSeries(series);
    });

    expect(oneOnOneResult.current.series).toHaveLength(1);

    // 4. Add entry with notes
    const entry: OneOnOneEntry = {
      id: crypto.randomUUID(),
      seriesId: series.id,
      dateISO: new Date().toISOString(),
      agendaQueue: ['Q1 goals', 'Feedback'],
      notes: 'Discussed Q1 roadmap. Need to follow up with design team by Friday.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    act(() => {
      oneOnOneResult.current.upsertEntry(entry);
    });

    expect(oneOnOneResult.current.entries).toHaveLength(1);

    // 5. Extract actions with AI
    vi.spyOn(aiService, 'aiComplete').mockResolvedValue([
      { text: 'Follow up with design team', owner: 'me', dueISO: '2025-10-12T00:00:00Z' },
    ]);

    const actions = await extractActions(entry.notes || '');
    expect(actions).toHaveLength(1);
    expect(actions[0].text).toContain('design team');
  });
});
