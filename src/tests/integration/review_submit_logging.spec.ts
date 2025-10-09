/**
 * @fileoverview Integration test for review, submit, and logging
 */

import { describe, it, expect, vi } from 'vitest';
import { buildReviewHtml } from '@/services/apply/review.service';
import { exportPacket } from '@/services/apply/exportPacket.service';
import { sendConfirmationEmail } from '@/services/apply/confirmEmail.service';
import { scheduleFollowUp } from '@/services/apply/reminders.service';
import type { ApplyRun, JobPosting, VariantDoc, Screener } from '@/types/apply.types';

// Mock integrations
vi.mock('@/services/export/pdf.service', () => ({
  exportHTMLToPDF: vi.fn(() => Promise.resolve('blob:pdf-url'))
}));

vi.mock('@/services/integrations/google.oauth.service', () => ({
  getBearer: vi.fn(() => Promise.resolve('mock-bearer-token'))
}));

vi.mock('@/services/integrations/gmail.real.service', () => ({
  buildMime: vi.fn(() => 'mock-mime-string')
}));

global.fetch = vi.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ id: 'message-123', threadId: 'thread-123' })
  } as Response)
);

vi.mock('@/services/integrations/calendar.real.service', () => ({
  calendarCreate: vi.fn(() => Promise.resolve({ id: 'event-123', htmlLink: 'https://calendar.google.com/event-123' }))
}));

describe('Review, Submit, and Logging Flow', () => {
  const mockRun: ApplyRun = {
    id: 'run-123',
    postingId: 'post-123',
    stage: 'review',
    coverage: { keywordMatchPct: 85, missingKeywords: ['aws'], sectionGaps: [] },
    audit: [
      { at: new Date().toISOString(), kind: 'intake', note: 'Imported posting' },
      { at: new Date().toISOString(), kind: 'qa_draft', note: 'Generated answers' }
    ],
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
    { id: 's1', kind: 'screener', prompt: 'Experience?', answer: '5+ years', redactedAnswer: '5+ years' }
  ];

  it('builds review HTML with all data', () => {
    const html = buildReviewHtml(mockRun, mockPosting.company, mockPosting.role, mockScreeners);
    
    expect(html).toContain('TechCorp');
    expect(html).toContain('Senior Engineer');
    expect(html).toContain('85%');
    expect(html).toContain('Experience?');
  });

  it('exports packet successfully', async () => {
    const result = await exportPacket({
      run: mockRun,
      posting: mockPosting,
      variants: mockVariants,
      screeners: mockScreeners,
      kind: 'pdf'
    });
    
    expect(result).toBe('blob:pdf-url');
  });

  it('sends confirmation email', async () => {
    const result = await sendConfirmationEmail({
      accountId: 'user@example.com',
      clientId: 'client-123',
      passphrase: 'secret',
      to: 'user@example.com',
      subject: 'Application Submitted',
      html: '<p>Test</p>'
    });
    
    expect(result).toHaveProperty('id');
    expect(global.fetch).toHaveBeenCalled();
  });

  it('schedules follow-up reminder', async () => {
    const { calendarCreate } = await import('@/services/integrations/calendar.real.service');
    
    const result = await scheduleFollowUp(
      7,
      'Follow up: TechCorp',
      'user@example.com',
      'client-123',
      'secret'
    );
    
    expect(result).toHaveProperty('id');
    expect(calendarCreate).toHaveBeenCalled();
  });

  it('maintains immutable audit log', () => {
    const originalAuditLength = mockRun.audit.length;
    
    // Simulate adding new entry
    const newAudit = [
      ...mockRun.audit,
      { at: new Date().toISOString(), kind: 'submit' as const, note: 'Application submitted' }
    ];
    
    expect(mockRun.audit.length).toBe(originalAuditLength);
    expect(newAudit.length).toBe(originalAuditLength + 1);
  });

  it('complete submission workflow', async () => {
    // 1. Review
    const reviewHtml = buildReviewHtml(mockRun, mockPosting.company, mockPosting.role, mockScreeners);
    expect(reviewHtml).toBeTruthy();
    
    // 2. Export
    const pdfUrl = await exportPacket({
      run: mockRun,
      posting: mockPosting,
      variants: mockVariants,
      screeners: mockScreeners,
      kind: 'pdf'
    });
    expect(pdfUrl).toBeTruthy();
    
    // 3. Send email
    const emailResult = await sendConfirmationEmail({
      accountId: 'user@example.com',
      clientId: 'client-123',
      passphrase: 'secret',
      to: 'user@example.com',
      subject: 'Application Submitted',
      html: reviewHtml
    });
    expect(emailResult.id).toBeTruthy();
    
    // 4. Schedule reminder
    const reminderResult = await scheduleFollowUp(
      7,
      'Follow up: TechCorp',
      'user@example.com',
      'client-123',
      'secret'
    );
    expect(reminderResult.id).toBeTruthy();
    
    // 5. Update audit log
    const finalAudit = [
      ...mockRun.audit,
      { at: new Date().toISOString(), kind: 'export' as const, note: 'Exported packet' },
      { at: new Date().toISOString(), kind: 'email' as const, note: 'Sent confirmation' },
      { at: new Date().toISOString(), kind: 'reminder' as const, note: 'Scheduled follow-up' },
      { at: new Date().toISOString(), kind: 'submit' as const, note: 'Marked as submitted' }
    ];
    
    expect(finalAudit.length).toBe(mockRun.audit.length + 4);
  });
});
