/**
 * Unit tests for Lever mapper
 */

import { describe, it, expect } from 'vitest';
import { mapLever } from '@/services/apply/forms/lever.mapper';

describe('Lever Mapper', () => {
  it('should map basic application data', () => {
    const result = mapLever({
      jobUrl: 'https://jobs.lever.co/company/job-id',
      cvFile: 'cv.pdf',
      answers: { question1: 'answer1' }
    });

    expect(result.platform).toBe('lever');
    expect(result.jobUrl).toBe('https://jobs.lever.co/company/job-id');
    expect(result.files).toHaveLength(1);
    expect(result.files[0].name).toBe('resume.pdf');
  });

  it('should include cover letter when provided', () => {
    const result = mapLever({
      jobUrl: 'https://jobs.lever.co/company/job-id',
      cvFile: 'cv.pdf',
      clFile: 'cl.pdf'
    });

    expect(result.files).toHaveLength(2);
    expect(result.files[1].type).toBe('coverLetter');
  });
});
