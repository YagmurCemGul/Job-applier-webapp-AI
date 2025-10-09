/**
 * @fileoverview Integration test for Q&A to autofill flow
 */

import { describe, it, expect, vi } from 'vitest';
import { rankVariants } from '@/services/apply/resumeSelector.service';
import { coverageFromText } from '@/services/apply/coverage.service';
import { buildPlan } from '@/services/autofill/fieldMapper.service';
import { sendPlanToExtension } from '@/services/autofill/extensionBridge.service';
import { DEFAULT_MAPPINGS } from '@/services/autofill/mappingCatalog.service';
import type { VariantDoc } from '@/types/apply.types';

describe('Q&A to Autofill Flow', () => {
  const mockVariants: VariantDoc[] = [
    {
      id: 'v1',
      kind: 'resume',
      title: 'React_Engineer_Resume.pdf',
      format: 'pdf',
      keywords: ['react', 'typescript', 'node.js']
    },
    {
      id: 'v2',
      kind: 'resume',
      title: 'Python_Developer_Resume.pdf',
      format: 'pdf',
      keywords: ['python', 'django']
    }
  ];

  const mockQuestions = [
    { id: 'q1', kind: 'screener' as const, prompt: 'Experience?', answer: '5+ years with React' }
  ];

  it('selects best variant and calculates coverage', () => {
    const keywords = ['react', 'typescript'];
    const ranked = rankVariants(mockVariants, keywords, 'React Engineer', undefined);
    
    expect(ranked[0].id).toBe('v1');
    
    const resumeText = ranked[0].title + ' ' + ranked[0].keywords?.join(' ');
    const coverage = coverageFromText(resumeText, keywords);
    
    expect(coverage.keywordMatchPct).toBeGreaterThan(50);
  });

  it('builds autofill plan from mapping', () => {
    const mapping = DEFAULT_MAPPINGS[0];
    const data = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      resume: 'https://example.com/resume.pdf'
    };
    
    const plan = buildPlan(mapping, data, 'run-123');
    
    expect(plan.steps.length).toBeGreaterThan(0);
    expect(plan.data).toEqual(data);
  });

  it('sends plan to extension', () => {
    vi.spyOn(window, 'postMessage');
    
    const mapping = DEFAULT_MAPPINGS[0];
    const data = { first_name: 'John', email: 'john@example.com' };
    const plan = buildPlan(mapping, data, 'run-123');
    
    const success = sendPlanToExtension(plan);
    
    expect(success).toBe(true);
    expect(window.postMessage).toHaveBeenCalled();
  });

  it('handles missing coverage gracefully', () => {
    const resumeText = 'Generic resume with no specific keywords';
    const keywords = ['react', 'typescript', 'aws', 'kubernetes'];
    
    const coverage = coverageFromText(resumeText, keywords);
    
    expect(coverage.keywordMatchPct).toBeLessThan(50);
    expect(coverage.missingKeywords.length).toBe(4);
  });
});
