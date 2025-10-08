/**
 * Unit tests for Greenhouse mapper
 */

import { describe, it, expect } from 'vitest';
import { mapGreenhouse } from '@/services/apply/forms/greenhouse.mapper';

describe('Greenhouse Mapper', () => {
  it('should map basic application data', () => {
    const result = mapGreenhouse({
      jobUrl: 'https://boards.greenhouse.io/company/jobs/123',
      cvFile: 'cv.pdf',
      answers: { question1: 'answer1' }
    });

    expect(result.platform).toBe('greenhouse');
    expect(result.jobUrl).toBe('https://boards.greenhouse.io/company/jobs/123');
    expect(result.files).toHaveLength(1);
    expect(result.files[0].type).toBe('cv');
    expect(result.answers).toEqual({ question1: 'answer1' });
  });

  it('should include cover letter when provided', () => {
    const result = mapGreenhouse({
      jobUrl: 'https://boards.greenhouse.io/company/jobs/123',
      cvFile: 'cv.pdf',
      clFile: 'cl.pdf'
    });

    expect(result.files).toHaveLength(2);
    expect(result.files[1].type).toBe('coverLetter');
  });

  it('should use empty answers when not provided', () => {
    const result = mapGreenhouse({
      jobUrl: 'https://boards.greenhouse.io/company/jobs/123',
      cvFile: 'cv.pdf'
    });

    expect(result.answers).toEqual({});
  });
});
