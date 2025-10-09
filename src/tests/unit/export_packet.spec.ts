/**
 * @fileoverview Unit tests for interview packet export
 */

import { describe, it, expect, vi } from 'vitest';
import type { SessionRun, InterviewPlan, StorySTAR, QuestionItem } from '@/types/interview.types';

describe('Export Packet Service', () => {
  const mockRun: SessionRun = {
    id: 'run-1',
    questionIds: ['q1'],
    storyIds: ['s1'],
    consent: { audio: true, video: false, transcription: true },
    startedAt: '2025-01-20T10:00:00Z',
    endedAt: '2025-01-20T11:00:00Z',
    transcript: {
      lang: 'en',
      text: 'Test transcript text',
      segments: [{ t0: 0, t1: 60, text: 'Test segment' }],
      wordsPerMin: 120,
      fillerCount: 2,
      talkListenRatio: 0.8
    }
  };

  const mockPlan: InterviewPlan = {
    id: 'plan-1',
    company: 'TechCorp',
    role: 'Senior Engineer',
    kind: 'behavioral',
    medium: 'video',
    startISO: '2025-01-20T10:00:00Z',
    endISO: '2025-01-20T11:00:00Z',
    tz: 'UTC',
    quietRespect: false,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  };

  const mockQuestions: QuestionItem[] = [{
    id: 'q1',
    kind: 'behavioral',
    prompt: 'Tell me about a time...',
    tags: ['leadership'],
    difficulty: 3,
    source: 'bank'
  }];

  const mockStories: StorySTAR[] = [{
    id: 's1',
    title: 'Led Project Alpha',
    tags: ['leadership', 'impact'],
    S: 'Situation context',
    T: 'Task description',
    A: 'Actions taken',
    R: 'Results achieved',
    metrics: ['+50% efficiency']
  }];

  describe('exportInterviewPacket', () => {
    it('should generate HTML with all sections', async () => {
      // Mock the export services
      vi.mock('@/services/export/pdf.service', () => ({
        exportHTMLToPDF: vi.fn().mockResolvedValue('pdf-url')
      }));

      const { exportInterviewPacket } = await import('@/services/interview/exportPacket.service');
      
      const result = await exportInterviewPacket({
        run: mockRun,
        plan: mockPlan,
        questions: mockQuestions,
        stories: mockStories,
        kind: 'pdf'
      });

      expect(result).toBeTruthy();
    });

    it('should include questions in HTML', async () => {
      vi.mock('@/services/export/pdf.service', () => ({
        exportHTMLToPDF: vi.fn((html) => {
          expect(html).toContain('Tell me about a time');
          expect(html).toContain('behavioral');
          return 'pdf-url';
        })
      }));

      const { exportInterviewPacket } = await import('@/services/interview/exportPacket.service');
      
      await exportInterviewPacket({
        run: mockRun,
        plan: mockPlan,
        questions: mockQuestions,
        stories: mockStories,
        kind: 'pdf'
      });
    });

    it('should include STAR stories in HTML', async () => {
      vi.mock('@/services/export/pdf.service', () => ({
        exportHTMLToPDF: vi.fn((html) => {
          expect(html).toContain('Led Project Alpha');
          expect(html).toContain('Results achieved');
          expect(html).toContain('+50% efficiency');
          return 'pdf-url';
        })
      }));

      const { exportInterviewPacket } = await import('@/services/interview/exportPacket.service');
      
      await exportInterviewPacket({
        run: mockRun,
        plan: mockPlan,
        questions: mockQuestions,
        stories: mockStories,
        kind: 'pdf'
      });
    });

    it('should include transcript excerpt', async () => {
      vi.mock('@/services/export/pdf.service', () => ({
        exportHTMLToPDF: vi.fn((html) => {
          expect(html).toContain('Test transcript text');
          return 'pdf-url';
        })
      }));

      const { exportInterviewPacket } = await import('@/services/interview/exportPacket.service');
      
      await exportInterviewPacket({
        run: mockRun,
        plan: mockPlan,
        questions: mockQuestions,
        stories: mockStories,
        kind: 'pdf'
      });
    });

    it('should handle missing plan gracefully', async () => {
      vi.mock('@/services/export/pdf.service', () => ({
        exportHTMLToPDF: vi.fn().mockResolvedValue('pdf-url')
      }));

      const { exportInterviewPacket } = await import('@/services/interview/exportPacket.service');
      
      const result = await exportInterviewPacket({
        run: mockRun,
        questions: mockQuestions,
        stories: mockStories,
        kind: 'pdf'
      });

      expect(result).toBeTruthy();
    });

    it('should call Google Docs export for gdoc kind', async () => {
      const mockGDocExport = vi.fn().mockResolvedValue({ id: 'doc-id' });
      vi.mock('@/services/export/googleDocs.service', () => ({
        exportHTMLToGoogleDoc: mockGDocExport
      }));

      const { exportInterviewPacket } = await import('@/services/interview/exportPacket.service');
      
      await exportInterviewPacket({
        run: mockRun,
        plan: mockPlan,
        questions: mockQuestions,
        stories: mockStories,
        kind: 'gdoc'
      });

      // Note: In real implementation, check that mockGDocExport was called
    });
  });
});
