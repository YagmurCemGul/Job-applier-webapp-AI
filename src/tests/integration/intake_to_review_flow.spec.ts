/**
 * @fileoverview Integration test for intake to review flow
 */

import { describe, it, expect, vi } from 'vitest';
import { intakePosting } from '@/services/apply/intake.service';
import { draftAnswers } from '@/services/apply/qaDraft.service';
import { policyScan } from '@/services/apply/qaPolicy.service';
import { buildReviewHtml } from '@/services/apply/review.service';

// Mock dependencies
vi.mock('@/services/integrations/pdfText.client', () => ({
  extractTextFromPdf: vi.fn(() => Promise.resolve('Mock PDF content'))
}));

vi.mock('@/services/features/aiComplete.service', () => ({
  aiComplete: vi.fn(() => Promise.resolve('AI generated answer'))
}));

vi.mock('@/stores/site.store', () => ({
  useSite: {
    getState: () => ({ profile: { headline: 'Engineer', skills: ['React'] } })
  }
}));

vi.mock('@/stores/review.store', () => ({
  useReviews: {
    getState: () => ({ selfReviews: [{ highlights: ['Led project'] }] })
  }
}));

describe('Intake to Review Flow', () => {
  it('completes full flow from text intake to review', async () => {
    // 1. Intake
    const posting = await intakePosting({
      text: `Role: Senior Engineer
Company: TechCorp
Location: Remote
Q: What is your experience?
Q: Are you authorized to work?`
    });
    
    expect(posting.role).toBe('Senior Engineer');
    expect(posting.questions).toHaveLength(2);
    
    // 2. Draft answers
    const drafted = await draftAnswers(posting.questions, 'en');
    expect(drafted[0].answer).toBeTruthy();
    
    // 3. Policy scan
    const scanned = policyScan(drafted);
    expect(scanned[1].flags).toContain('visa');
    
    // 4. Build review
    const html = buildReviewHtml(
      {
        id: 'run-1',
        postingId: posting.id,
        stage: 'review',
        coverage: { keywordMatchPct: 80, missingKeywords: [], sectionGaps: [] },
        audit: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      posting.company,
      posting.role,
      scanned
    );
    
    expect(html).toContain('TechCorp');
    expect(html).toContain('80%');
  });

  it('handles PDF intake', async () => {
    const mockFile = new File(['mock'], 'job.pdf', { type: 'application/pdf' });
    const posting = await intakePosting({ pdf: mockFile });
    
    expect(posting.source).toBe('pdf');
    expect(posting.rawText).toContain('Mock PDF');
  });

  it('redacts PII in policy scan', async () => {
    const posting = await intakePosting({
      text: 'Q: Contact info?'
    });
    
    posting.questions[0].answer = 'john@example.com and +1-555-1234';
    const scanned = policyScan(posting.questions);
    
    expect(scanned[0].redactedAnswer).not.toContain('john@example.com');
    expect(scanned[0].redactedAnswer).toContain('[redacted-email]');
  });
});
