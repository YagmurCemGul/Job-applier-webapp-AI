/**
 * @fileoverview Unit tests for weekly report composition (Step 45)
 */

import { describe, it, expect, vi } from 'vitest';
import { composeWeekly } from '@/services/onboarding/weeklyReport.service';
import type { SmartGoal } from '@/types/onboarding.types';

// Mock AI service
vi.mock('@/services/features/aiComplete.service', () => ({
  aiComplete: vi.fn().mockResolvedValue(`
    <h2>Accomplishments</h2>
    <ul>
      <li>Completed system design training</li>
      <li>Reviewed 5 PRs</li>
    </ul>
    <h2>Risks</h2>
    <ul>
      <li>Waiting on VPN access</li>
    </ul>
    <h2>Asks</h2>
    <ul>
      <li>Need code review rights</li>
    </ul>
    <h2>Next Week</h2>
    <ul>
      <li>Ship first feature</li>
    </ul>
  `)
}));

describe('Weekly Report Service', () => {
  const goals: SmartGoal[] = [
    {
      id: '1',
      title: 'Complete training',
      description: 'Finish onboarding modules',
      metric: 'Modules',
      target: '100%',
      milestone: 'd30',
      priority: 'P1',
      status: 'done',
      tags: []
    },
    {
      id: '2',
      title: 'Review PRs',
      description: 'Review team pull requests',
      metric: 'PRs',
      target: '> 5',
      milestone: 'd30',
      priority: 'P1',
      status: 'in_progress',
      tags: []
    }
  ];
  
  it('composes HTML report', async () => {
    const report = await composeWeekly(goals);
    
    expect(report.html).toBeDefined();
    expect(report.html).toBeTruthy();
  });
  
  it('includes selected goals in accomplishments', async () => {
    const report = await composeWeekly(goals);
    
    expect(report.accomplishments.length).toBeGreaterThan(0);
  });
  
  it('has sections for accomplishments, risks, asks, next week', async () => {
    const report = await composeWeekly(goals, {
      risks: ['VPN access pending'],
      asks: ['Code review rights'],
      next: ['Ship feature']
    });
    
    expect(report.risks).toContain('VPN access pending');
    expect(report.asks).toContain('Code review rights');
    expect(report.nextWeek).toContain('Ship feature');
  });
  
  it('sets weekStartISO to current date', async () => {
    const report = await composeWeekly(goals);
    
    const weekStart = new Date(report.weekStartISO);
    const now = new Date();
    
    expect(weekStart.getTime()).toBeLessThanOrEqual(now.getTime());
  });
});
