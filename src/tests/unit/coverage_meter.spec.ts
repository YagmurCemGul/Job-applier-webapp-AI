/**
 * @fileoverview Unit tests for coverage meter
 */

import { describe, it, expect } from 'vitest';
import { coverageFromText } from '@/services/apply/coverage.service';

describe('coverageMeter', () => {
  it('calculates keyword match percentage', () => {
    const text = 'I have experience with React, TypeScript, and Node.js';
    const keywords = ['react', 'typescript', 'node.js'];
    
    const result = coverageFromText(text, keywords);
    expect(result.keywordMatchPct).toBe(100);
  });

  it('identifies missing keywords', () => {
    const text = 'I have experience with React and TypeScript';
    const keywords = ['react', 'typescript', 'node.js', 'aws'];
    
    const result = coverageFromText(text, keywords);
    expect(result.keywordMatchPct).toBe(50);
    expect(result.missingKeywords).toContain('node.js');
    expect(result.missingKeywords).toContain('aws');
  });

  it('is case-insensitive', () => {
    const text = 'I have experience with REACT and TypeScript';
    const keywords = ['react', 'typescript'];
    
    const result = coverageFromText(text, keywords);
    expect(result.keywordMatchPct).toBe(100);
  });

  it('detects missing Education section', () => {
    const text = 'I have work experience in software development';
    
    const result = coverageFromText(text, []);
    expect(result.sectionGaps).toContain('Education');
  });

  it('detects missing Experience section', () => {
    const text = 'I have a degree in Computer Science';
    
    const result = coverageFromText(text, []);
    expect(result.sectionGaps).toContain('Experience');
  });

  it('detects missing Projects section', () => {
    const text = 'I have education and experience';
    
    const result = coverageFromText(text, []);
    expect(result.sectionGaps).toContain('Projects');
  });

  it('caps percentage at 100%', () => {
    const text = 'React TypeScript Node.js AWS';
    const keywords = ['react'];
    
    const result = coverageFromText(text, keywords);
    expect(result.keywordMatchPct).toBeLessThanOrEqual(100);
  });
});
