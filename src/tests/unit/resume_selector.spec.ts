/**
 * @fileoverview Unit tests for resume variant selector
 */

import { describe, it, expect } from 'vitest';
import { rankVariants } from '@/services/apply/resumeSelector.service';
import type { VariantDoc } from '@/types/apply.types';

describe('resumeSelector', () => {
  const mockVariants: VariantDoc[] = [
    {
      id: '1',
      kind: 'resume',
      title: 'Software_Engineer_Resume.pdf',
      format: 'pdf',
      keywords: ['react', 'typescript', 'node.js']
    },
    {
      id: '2',
      kind: 'resume',
      title: 'Senior_Developer_TechCorp.pdf',
      format: 'pdf',
      keywords: ['python', 'django', 'aws']
    },
    {
      id: '3',
      kind: 'resume',
      title: 'Fullstack_Resume.pdf',
      format: 'pdf',
      keywords: ['react', 'node.js', 'aws', 'typescript']
    }
  ];

  it('ranks by keyword overlap', () => {
    const result = rankVariants(mockVariants, ['react', 'typescript', 'aws'], undefined, undefined);
    expect(result[0].id).toBe('3'); // Has 3 matching keywords
  });

  it('gives bonus for role match in title', () => {
    const result = rankVariants(mockVariants, [], 'Senior Developer', undefined);
    expect(result[0].id).toBe('2'); // Title contains "Senior Developer"
  });

  it('gives bonus for company match in title', () => {
    const result = rankVariants(mockVariants, [], undefined, 'TechCorp');
    expect(result[0].id).toBe('2'); // Title contains "TechCorp"
  });

  it('combines keyword and title bonuses', () => {
    const result = rankVariants(
      mockVariants,
      ['react', 'typescript'],
      'Software Engineer',
      undefined
    );
    expect(result[0].title).toContain('Software_Engineer');
  });

  it('handles empty keywords gracefully', () => {
    const result = rankVariants(mockVariants, [], undefined, undefined);
    expect(result).toHaveLength(3);
  });
});
