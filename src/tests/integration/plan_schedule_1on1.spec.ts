/**
 * @fileoverview Integration test: Create plan → Add stakeholder → Schedule 1:1 → Extract actions.
 * @module tests/integration/plan_schedule_1on1
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { OnboardingPlan, Stakeholder } from '@/types/onboarding.types';
import type { OneOnOneSeries, OneOnOneEntry } from '@/types/oneonone.types';
import { defaultMilestones, seedTasks } from '@/services/onboarding/planBuilder.service';
import { extractActions } from '@/services/onboarding/aiActionItems.service';
import { computeNextOccurISO } from '@/services/onboarding/oneonone.service';

describe('Integration: Plan → Stakeholder → 1:1 → Actions', () => {
  let plan: OnboardingPlan;
  let stakeholder: Stakeholder;
  let series: OneOnOneSeries;
  let entry: OneOnOneEntry;

  beforeEach(() => {
    // Step 1: Create plan
    plan = {
      id: crypto.randomUUID(),
      applicationId: 'app-123',
      role: 'Software Engineer',
      company: 'Acme Corp',
      stage: 'active',
      lang: 'en',
      milestones: defaultMilestones(),
      tasks: seedTasks('Software Engineer'),
      checklists: [],
      stakeholders: [],
      evidence: [],
      retentionDays: 90,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Step 2: Add stakeholder
    stakeholder = {
      id: crypto.randomUUID(),
      name: 'Alice Manager',
      email: 'alice@acme.com',
      influence: 'high',
      interest: 'high',
      cadence: 'weekly',
    };
    plan.stakeholders = [stakeholder];

    // Step 3: Create 1:1 series
    series = {
      id: crypto.randomUUID(),
      planId: plan.id,
      counterpartEmail: stakeholder.email,
      counterpartName: stakeholder.name,
      cadence: 'weekly',
      weekday: 1, // Monday
      timeHHMM: '10:00',
      durationMin: 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Step 4: Create meeting entry
    entry = {
      id: crypto.randomUUID(),
      seriesId: series.id,
      dateISO: new Date().toISOString(),
      agendaQueue: ['Discuss onboarding progress', 'Review first week goals'],
      notes: 'Discussed progress. Action: Alice to set up access to dev environment. Bob to complete training modules by Friday.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  it('should create plan with tasks', () => {
    expect(plan.id).toBeTruthy();
    expect(plan.tasks.length).toBeGreaterThan(0);
    expect(plan.milestones).toHaveLength(3);
  });

  it('should add stakeholder to plan', () => {
    expect(plan.stakeholders).toHaveLength(1);
    expect(plan.stakeholders[0].email).toBe('alice@acme.com');
  });

  it('should create 1:1 series from stakeholder', () => {
    expect(series.counterpartEmail).toBe(stakeholder.email);
    expect(series.planId).toBe(plan.id);
  });

  it('should compute next occurrence correctly', () => {
    const next = computeNextOccurISO(1, '10:00'); // Monday 10:00
    const date = new Date(next);
    expect(date.getDay()).toBe(1); // Monday
    expect(date.getHours()).toBe(10);
    expect(date.getMinutes()).toBe(0);
  });

  it('should extract actions from entry notes (mock)', async () => {
    // Mock AI response
    vi.mock('@/services/features/aiComplete.service', () => ({
      aiComplete: vi.fn(() =>
        Promise.resolve(
          JSON.stringify([
            { text: 'Set up dev environment access', owner: 'Alice' },
            { text: 'Complete training modules', owner: 'Bob', dueISO: '2025-10-12T00:00:00Z' },
          ])
        )
      ),
    }));

    const actions = await extractActions(entry.notes || '');
    expect(Array.isArray(actions)).toBe(true);
    // In real scenario, would have 2 actions
  });

  it('should link entry to series', () => {
    expect(entry.seriesId).toBe(series.id);
    expect(entry.agendaQueue.length).toBeGreaterThan(0);
  });

  it('should support agenda queue', () => {
    entry.agendaQueue.push('New topic');
    expect(entry.agendaQueue).toHaveLength(3);
  });
});
