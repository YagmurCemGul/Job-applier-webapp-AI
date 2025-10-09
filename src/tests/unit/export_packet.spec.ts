/**
 * @fileoverview Unit tests for export packet service
 */

import { describe, it, expect, vi } from 'vitest';
import { exportPacket } from '@/services/apply/exportPacket.service';
import type { ApplyRun, JobPosting, VariantDoc, Screener } from '@/types/apply.types';

// Mock export services
vi.mock('@/services/export/pdf.service', () => ({
  exportHTMLToPDF: vi.fn((html: string, filename: string) => {
    return Promise.resolve('blob:mock-pdf-url');
  })
}));

vi.mock('@/services/export/googleDocs.service', () => ({
  exportHTMLToGoogleDoc: vi.fn((html: string, title: string) => {
    return Promise.resolve({ id: 'doc-123', url: 'https://docs.google.com/doc-123', title });
  })
}));

describe('exportPacket', () => {
  const mockRun: ApplyRun = {
    id: 'run-123',
    postingId: 'post-123',
    stage: 'review',
    coverage: { keywordMatchPct: 85, missingKeywords: ['aws'], sectionGaps: [] },
    audit: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockPosting: JobPosting = {
    id: 'post-123',
    source: 'url',
    url: 'https://example.com/job',
    company: 'TechCorp',
    role: 'Senior Engineer',
    questions: [],
    extractedAt: new Date().toISOString()
  };

  const mockVariants: VariantDoc[] = [
    { id: 'v1', kind: 'resume', title: 'Resume.pdf', format: 'pdf' }
  ];

  const mockScreeners: Screener[] = [
    { id: 's1', kind: 'screener', prompt: 'Experience?', answer: '5+ years' }
  ];

  it('exports as PDF', async () => {
    const result = await exportPacket({
      run: mockRun,
      posting: mockPosting,
      variants: mockVariants,
      screeners: mockScreeners,
      kind: 'pdf'
    });
    
    expect(result).toBe('blob:mock-pdf-url');
  });

  it('exports as Google Doc', async () => {
    const result = await exportPacket({
      run: mockRun,
      posting: mockPosting,
      variants: mockVariants,
      screeners: mockScreeners,
      kind: 'gdoc'
    });
    
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('url');
  });

  it('includes all required information in HTML', async () => {
    const { exportHTMLToPDF } = await import('@/services/export/pdf.service');
    
    await exportPacket({
      run: mockRun,
      posting: mockPosting,
      variants: mockVariants,
      screeners: mockScreeners,
      kind: 'pdf'
    });
    
    const callArgs = vi.mocked(exportHTMLToPDF).mock.calls[0];
    const html = callArgs[0];
    
    expect(html).toContain('TechCorp');
    expect(html).toContain('Senior Engineer');
    expect(html).toContain('85%');
  });
});
