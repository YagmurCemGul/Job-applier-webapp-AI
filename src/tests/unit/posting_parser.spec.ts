/**
 * @fileoverview Unit tests for job posting parser
 */

import { describe, it, expect } from 'vitest';
import { parsePosting } from '@/services/apply/postingParser.service';
import type { JobPosting } from '@/types/apply.types';

describe('postingParser', () => {
  it('extracts role from job posting text', () => {
    const base: JobPosting = {
      id: '1',
      source: 'text',
      rawText: 'Role: Senior Software Engineer\nCompany: TechCorp',
      questions: [],
      extractedAt: new Date().toISOString()
    };
    
    const result = parsePosting(base);
    expect(result.role).toBe('Senior Software Engineer');
  });

  it('extracts company and location', () => {
    const base: JobPosting = {
      id: '1',
      source: 'text',
      rawText: 'Company: TechCorp\nLocation: Remote',
      questions: [],
      extractedAt: new Date().toISOString()
    };
    
    const result = parsePosting(base);
    expect(result.company).toBe('TechCorp');
    expect(result.location).toBe('Remote');
  });

  it('extracts requirements list', () => {
    const base: JobPosting = {
      id: '1',
      source: 'text',
      rawText: 'Requirements:\n- 5+ years experience\n- TypeScript expertise\n- AWS knowledge',
      questions: [],
      extractedAt: new Date().toISOString()
    };
    
    const result = parsePosting(base);
    expect(result.requirements).toHaveLength(3);
    expect(result.requirements?.[0]).toBe('5+ years experience');
  });

  it('detects questions from Q: prefix', () => {
    const base: JobPosting = {
      id: '1',
      source: 'text',
      rawText: 'Q: Are you authorized to work?\nQ: What are your salary expectations?',
      questions: [],
      extractedAt: new Date().toISOString()
    };
    
    const result = parsePosting(base);
    expect(result.questions).toHaveLength(2);
    expect(result.questions[0].prompt).toBe('Are you authorized to work?');
  });

  it('classifies legal questions correctly', () => {
    const base: JobPosting = {
      id: '1',
      source: 'text',
      rawText: 'Q: Do you require visa sponsorship?\nQ: What is your preferred start date?',
      questions: [],
      extractedAt: new Date().toISOString()
    };
    
    const result = parsePosting(base);
    expect(result.questions[0].kind).toBe('legal');
    expect(result.questions[1].kind).toBe('screener');
  });
});
