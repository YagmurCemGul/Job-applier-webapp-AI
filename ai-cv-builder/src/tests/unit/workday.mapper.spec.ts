/**
 * Unit tests for Workday mapper
 */

import { describe, it, expect } from 'vitest';
import { mapWorkday } from '@/services/apply/forms/workday.mapper';

describe('Workday Mapper', () => {
  it('should map basic application data with locale', () => {
    const result = mapWorkday({
      jobUrl: 'https://company.wd1.myworkdayjobs.com/job',
      cvFile: 'cv.pdf',
      locale: 'en-GB'
    });

    expect(result.platform).toBe('workday');
    expect(result.extra?.workdayLocale).toBe('en-GB');
  });

  it('should use default locale when not provided', () => {
    const result = mapWorkday({
      jobUrl: 'https://company.wd1.myworkdayjobs.com/job',
      cvFile: 'cv.pdf'
    });

    expect(result.extra?.workdayLocale).toBe('en-US');
  });

  it('should include cover letter when provided', () => {
    const result = mapWorkday({
      jobUrl: 'https://company.wd1.myworkdayjobs.com/job',
      cvFile: 'cv.pdf',
      clFile: 'cl.pdf'
    });

    expect(result.files).toHaveLength(2);
    expect(result.files[0].name).toBe('Resume.pdf');
    expect(result.files[1].name).toBe('CoverLetter.pdf');
  });
});
