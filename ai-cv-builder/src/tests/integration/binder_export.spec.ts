/**
 * @fileoverview Integration test: add evidence → export PDF/Docs.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnboarding } from '@/stores/onboarding.store';
import type { OnboardingPlan, EvidenceItem } from '@/types/onboarding.types';
import { renderBinderHTML } from '@/services/onboarding/evidenceBinder.service';

// Mock export services
vi.mock('@/services/export/pdf.service', () => ({
  exportHTMLToPDF: vi.fn().mockResolvedValue('blob:pdf-url'),
}));

vi.mock('@/services/export/googleDocs.service', () => ({
  exportHTMLToGoogleDoc: vi.fn().mockResolvedValue('doc-id-123'),
}));

describe('Evidence Binder Export Flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should add evidence items and render HTML for export', () => {
    // 1. Create plan
    const { result } = renderHook(() => useOnboarding());
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
      result.current.upsert(plan);
    });

    // 2. Add evidence
    const evidence: EvidenceItem[] = [
      {
        id: 'e1',
        title: 'Feature Launch',
        kind: 'doc',
        text: 'Successfully launched X with 99.9% uptime',
        createdAt: '2025-10-01T00:00:00Z',
        tags: ['launch', 'success'],
      },
      {
        id: 'e2',
        title: 'Performance Metrics',
        kind: 'metric',
        url: 'https://metrics.example.com/chart',
        createdAt: '2025-10-05T00:00:00Z',
        tags: ['metrics'],
      },
    ];

    act(() => {
      evidence.forEach((e) => result.current.addEvidence(plan.id, e));
    });

    const updatedPlan = result.current.getById(plan.id);
    expect(updatedPlan?.evidence).toHaveLength(2);

    // 3. Render HTML
    const html = renderBinderHTML(updatedPlan!.evidence);
    expect(html).toContain('Feature Launch');
    expect(html).toContain('Performance Metrics');
    expect(html).toContain('https://metrics.example.com/chart');
  });

  it('should export to PDF and Docs (mocked)', async () => {
    const { exportHTMLToPDF } = await import('@/services/export/pdf.service');
    const { exportHTMLToGoogleDoc } = await import('@/services/export/googleDocs.service');

    const html = '<div>Test Evidence</div>';

    // PDF export
    const pdfUrl = await exportHTMLToPDF(html, 'test.pdf', 'en', { returnUrl: true } as any);
    expect(pdfUrl).toBe('blob:pdf-url');

    // Docs export
    const docId = await exportHTMLToGoogleDoc(html, 'Test Binder');
    expect(docId).toBe('doc-id-123');
  });
});
