/**
 * @fileoverview Unit tests for plan drafting (Step 45)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { draftPlan } from '@/services/onboarding/planDraft.service';

// Mock AI service
vi.mock('@/services/features/aiComplete.service', () => ({
  aiComplete: vi.fn().mockResolvedValue(JSON.stringify({
    summary: 'Focus on learning and building relationships',
    goals: [
      { title: 'Learn codebase', description: 'Understand core systems', metric: 'PRs reviewed', target: '> 10', priority: 'P1', milestone: 'd30', tags: ['technical'] },
      { title: 'Meet team', description: 'Connect with all team members', metric: 'Meetings', target: '15+', priority: 'P1', milestone: 'd30', tags: ['relationships'] },
      { title: 'First feature', description: 'Ship first feature', metric: 'Features', target: '1', priority: 'P0', milestone: 'd60', tags: ['delivery'] }
    ],
    dependencies: ['VPN access', 'IDE setup', 'Code review rights']
  }))
}));

// Mock stores
vi.mock('@/stores/offers.store', () => ({
  useOffers: {
    getState: () => ({
      items: [{ company: 'TechCorp', role: 'Senior Engineer', startDateISO: '2025-03-01T00:00:00Z' }]
    })
  }
}));

vi.mock('@/stores/interview.store', () => ({
  useInterview: {
    getState: () => ({
      runs: [{ transcript: { text: 'Discussed system architecture and team dynamics' } }]
    })
  }
}));

vi.mock('@/stores/review.store', () => ({
  useReviews: {
    getState: () => ({
      selfReviews: [{ highlights: ['Led cross-functional project', 'Improved performance by 40%'] }]
    })
  }
}));

describe('Plan Drafting Service', () => {
  it('produces summary and goals', async () => {
    const plan = await draftPlan('TechCorp', 'Senior Engineer');
    
    expect(plan).toBeDefined();
    expect(plan.summary).toBeTruthy();
    expect(plan.goals.length).toBeGreaterThan(0);
  });
  
  it('assigns priority to goals', async () => {
    const plan = await draftPlan('TechCorp', 'Senior Engineer');
    
    plan.goals.forEach(goal => {
      expect(['P0', 'P1', 'P2']).toContain(goal.priority);
    });
  });
  
  it('distributes goals across milestones', async () => {
    const plan = await draftPlan('TechCorp', 'Senior Engineer');
    
    const milestones = new Set(plan.goals.map(g => g.milestone));
    expect(milestones.size).toBeGreaterThan(0);
  });
  
  it('includes dependencies', async () => {
    const plan = await draftPlan('TechCorp', 'Senior Engineer');
    
    expect(plan.dependencies).toBeDefined();
    expect(Array.isArray(plan.dependencies)).toBe(true);
  });
  
  it('assigns tags to goals', async () => {
    const plan = await draftPlan('TechCorp', 'Senior Engineer');
    
    const hasTaggedGoal = plan.goals.some(g => g.tags && g.tags.length > 0);
    expect(hasTaggedGoal).toBe(true);
  });
});
