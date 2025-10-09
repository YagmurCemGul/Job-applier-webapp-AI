/**
 * @fileoverview Integration test: offer acceptance to plan creation (Step 45)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useOnboarding } from '@/stores/onboarding.store';
import { draftPlan } from '@/services/onboarding/planDraft.service';
import { defaultChecklist } from '@/services/onboarding/checklist.service';

// Mock AI service
vi.mock('@/services/features/aiComplete.service', () => ({
  aiComplete: vi.fn().mockResolvedValue(JSON.stringify({
    summary: 'Test plan summary',
    goals: [
      { title: 'Goal 1', description: 'Desc 1', metric: 'M1', target: 'T1', priority: 'P1', milestone: 'd30', tags: [] }
    ],
    dependencies: ['Dep1']
  }))
}));

describe('Accept to Plan Flow Integration', () => {
  beforeEach(() => {
    // Reset store
    useOnboarding.setState({
      plan: undefined,
      checklist: [],
      cadences: [],
      reports: [],
      risks: [],
      learning: []
    });
  });
  
  it('creates plan from accepted offer', async () => {
    const plan = await draftPlan('TechCorp', 'Engineer');
    
    expect(plan).toBeDefined();
    expect(plan.company).toBe('TechCorp');
    expect(plan.role).toBe('Engineer');
  });
  
  it('loads default checklist', () => {
    const checklist = defaultChecklist();
    
    expect(checklist.length).toBeGreaterThan(0);
    checklist.forEach(item => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('label');
      expect(item).toHaveProperty('done');
      expect(item.done).toBe(false);
    });
  });
  
  it('saves plan to store', async () => {
    const plan = await draftPlan('TechCorp', 'Engineer');
    useOnboarding.getState().setPlan(plan);
    
    const stored = useOnboarding.getState().plan;
    expect(stored).toBeDefined();
    expect(stored?.id).toBe(plan.id);
  });
  
  it('saves checklist items to store', () => {
    const checklist = defaultChecklist();
    
    checklist.forEach(item => {
      useOnboarding.getState().upsertChecklist(item);
    });
    
    const stored = useOnboarding.getState().checklist;
    expect(stored.length).toBe(checklist.length);
  });
  
  it('persists goals in plan', async () => {
    const plan = await draftPlan('TechCorp', 'Engineer');
    useOnboarding.getState().setPlan(plan);
    
    const stored = useOnboarding.getState().plan;
    expect(stored?.goals.length).toBeGreaterThan(0);
  });
});
