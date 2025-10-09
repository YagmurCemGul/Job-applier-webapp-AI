/**
 * @fileoverview Integration test: weekly report email and doc export (Step 45)
 */

import { describe, it, expect, vi } from 'vitest';
import { composeWeekly, sendWeeklyEmail } from '@/services/onboarding/weeklyReport.service';
import { exportHTMLToGoogleDoc } from '@/services/export/googleDocs.service';
import type { SmartGoal } from '@/types/onboarding.types';

// Mock services
vi.mock('@/services/features/aiComplete.service', () => ({
  aiComplete: vi.fn().mockResolvedValue('<h2>Accomplishments</h2><ul><li>Test</li></ul>')
}));

vi.mock('@/services/export/googleDocs.service', () => ({
  exportHTMLToGoogleDoc: vi.fn().mockResolvedValue({
    id: 'doc-123',
    url: 'https://docs.google.com/document/d/doc-123',
    title: 'Weekly Status Report'
  })
}));

describe('Weekly Email and Doc Integration', () => {
  const goals: SmartGoal[] = [
    {
      id: '1',
      title: 'Complete training',
      description: 'Finish modules',
      metric: 'Modules',
      target: '100%',
      milestone: 'd30',
      priority: 'P1',
      status: 'done',
      tags: []
    }
  ];
  
  it('composes weekly report', async () => {
    const report = await composeWeekly(goals);
    
    expect(report).toBeDefined();
    expect(report.html).toBeTruthy();
  });
  
  it('sends email via Gmail stub', async () => {
    const result = await sendWeeklyEmail(
      'mock-bearer',
      'user@example.com',
      ['manager@example.com'],
      'Weekly Update',
      '<p>Content</p>'
    );
    
    expect(result).toHaveProperty('id');
  });
  
  it('exports to Google Doc', async () => {
    const report = await composeWeekly(goals);
    const doc = await exportHTMLToGoogleDoc(report.html || '', 'Weekly Status');
    
    expect(doc).toHaveProperty('id');
    expect(doc).toHaveProperty('url');
    expect(doc.title).toBe('Weekly Status');
  });
  
  it('includes user inputs in report', async () => {
    const report = await composeWeekly(goals, {
      risks: ['Risk 1', 'Risk 2'],
      asks: ['Ask 1'],
      next: ['Plan 1', 'Plan 2']
    });
    
    expect(report.risks).toContain('Risk 1');
    expect(report.asks).toContain('Ask 1');
    expect(report.nextWeek).toContain('Plan 1');
  });
});
