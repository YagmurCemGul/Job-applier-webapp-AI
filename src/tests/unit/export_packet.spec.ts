/**
 * @fileoverview Unit tests for onboarding packet export (Step 45)
 */

import { describe, it, expect, vi } from 'vitest';
import { exportOnboardingPacket } from '@/services/onboarding/exportPacket.service';
import type { Plan, Stakeholder, WeeklyReport, RiskItem, LearningItem } from '@/types/onboarding.types';

// Mock export services
vi.mock('@/services/export/pdf.service', () => ({
  exportHTMLToPDF: vi.fn().mockResolvedValue('https://example.com/packet.pdf')
}));

vi.mock('@/services/export/googleDocs.service', () => ({
  exportHTMLToGoogleDoc: vi.fn().mockResolvedValue({
    id: 'doc-123',
    url: 'https://docs.google.com/document/d/doc-123',
    title: 'Onboarding 30-60-90'
  })
}));

describe('Export Packet Service', () => {
  const plan: Plan = {
    id: '1',
    company: 'TechCorp',
    role: 'Senior Engineer',
    summary: 'Focus on learning and delivery',
    goals: [
      {
        id: 'g1',
        title: 'Learn codebase',
        description: 'Understand architecture',
        milestone: 'd30',
        priority: 'P1',
        status: 'in_progress',
        tags: []
      }
    ],
    dependencies: ['VPN', 'IDE'],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  };
  
  const stakeholders: Stakeholder[] = [
    { id: '1', name: 'Jane Doe', role: 'Manager', power: 5, interest: 5 }
  ];
  
  const reports: WeeklyReport[] = [
    {
      id: '1',
      weekStartISO: '2025-01-01T00:00:00Z',
      accomplishments: ['Completed training'],
      risks: [],
      asks: [],
      nextWeek: [],
      html: '<p>Report content</p>'
    }
  ];
  
  const risks: RiskItem[] = [
    {
      id: '1',
      title: 'VPN access delay',
      probability: 3,
      impact: 3,
      level: 'medium',
      mitigation: 'Follow up with IT',
      status: 'open'
    }
  ];
  
  const learning: LearningItem[] = [
    { id: '1', kind: 'doc', title: 'System design', status: 'planned' }
  ];
  
  it('exports as PDF', async () => {
    const result = await exportOnboardingPacket({
      plan,
      stakeholders,
      reports,
      risks,
      learning,
      kind: 'pdf'
    });
    
    expect(result).toBe('https://example.com/packet.pdf');
  });
  
  it('exports as Google Doc', async () => {
    const result = await exportOnboardingPacket({
      plan,
      stakeholders,
      reports,
      risks,
      learning,
      kind: 'gdoc'
    });
    
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('url');
  });
  
  it('includes goals in export', async () => {
    const { exportHTMLToPDF } = await import('@/services/export/pdf.service');
    
    await exportOnboardingPacket({
      plan,
      stakeholders,
      reports,
      risks,
      learning,
      kind: 'pdf'
    });
    
    const call = (exportHTMLToPDF as any).mock.calls[0];
    const html = call[0];
    
    expect(html).toContain('Learn codebase');
  });
  
  it('includes stakeholders in export', async () => {
    const { exportHTMLToPDF } = await import('@/services/export/pdf.service');
    
    await exportOnboardingPacket({
      plan,
      stakeholders,
      reports,
      risks,
      learning,
      kind: 'pdf'
    });
    
    const call = (exportHTMLToPDF as any).mock.calls[0];
    const html = call[0];
    
    expect(html).toContain('Jane Doe');
  });
  
  it('includes risks and learning in export', async () => {
    const { exportHTMLToPDF } = await import('@/services/export/pdf.service');
    
    await exportOnboardingPacket({
      plan,
      stakeholders,
      reports,
      risks,
      learning,
      kind: 'pdf'
    });
    
    const call = (exportHTMLToPDF as any).mock.calls[0];
    const html = call[0];
    
    expect(html).toContain('VPN access delay');
    expect(html).toContain('System design');
  });
  
  it('includes latest weekly report', async () => {
    const { exportHTMLToPDF } = await import('@/services/export/pdf.service');
    
    await exportOnboardingPacket({
      plan,
      stakeholders,
      reports,
      risks,
      learning,
      kind: 'pdf'
    });
    
    const call = (exportHTMLToPDF as any).mock.calls[0];
    const html = call[0];
    
    expect(html).toContain('Report content');
  });
});
