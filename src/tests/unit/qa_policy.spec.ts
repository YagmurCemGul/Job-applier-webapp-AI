/**
 * @fileoverview Unit tests for Q&A policy scanner
 */

import { describe, it, expect } from 'vitest';
import { policyScan } from '@/services/apply/qaPolicy.service';
import type { Screener } from '@/types/apply.types';

describe('qaPolicy', () => {
  it('flags salary-related questions', () => {
    const questions: Screener[] = [{
      id: '1',
      kind: 'legal',
      prompt: 'What are your salary expectations?',
      answer: '$120,000 - $150,000'
    }];
    
    const result = policyScan(questions);
    expect(result[0].flags).toContain('salary');
  });

  it('flags visa-related questions', () => {
    const questions: Screener[] = [{
      id: '1',
      kind: 'legal',
      prompt: 'Do you require visa sponsorship?',
      answer: 'Yes, I require H1B sponsorship'
    }];
    
    const result = policyScan(questions);
    expect(result[0].flags).toContain('visa');
  });

  it('flags location-related questions', () => {
    const questions: Screener[] = [{
      id: '1',
      kind: 'screener',
      prompt: 'Are you willing to relocate?',
      answer: 'Yes, I can relocate to San Francisco'
    }];
    
    const result = policyScan(questions);
    expect(result[0].flags).toContain('location');
  });

  it('redacts email addresses', () => {
    const questions: Screener[] = [{
      id: '1',
      kind: 'screener',
      prompt: 'Contact information',
      answer: 'You can reach me at john.doe@example.com'
    }];
    
    const result = policyScan(questions);
    expect(result[0].redactedAnswer).toContain('[redacted-email]');
    expect(result[0].redactedAnswer).not.toContain('john.doe@example.com');
  });

  it('redacts phone numbers', () => {
    const questions: Screener[] = [{
      id: '1',
      kind: 'screener',
      prompt: 'Contact information',
      answer: 'My phone is +1-555-123-4567'
    }];
    
    const result = policyScan(questions);
    expect(result[0].redactedAnswer).toContain('[redacted-phone]');
  });
});
