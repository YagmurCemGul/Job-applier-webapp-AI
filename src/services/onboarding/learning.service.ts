/**
 * @fileoverview Learning plan service (Step 45)
 * @module services/onboarding/learning
 */

import type { LearningItem } from '@/types/onboarding.types';

/**
 * Seed a learning plan from role strings.
 * @param role - Job role
 * @returns Array of learning items
 */
export function seedLearning(role?: string): LearningItem[] {
  const base = (title: string): LearningItem => ({
    id: crypto.randomUUID(),
    kind: 'doc',
    title,
    status: 'planned'
  });
  
  const r = (role || '').toLowerCase();
  
  if (r.includes('engineer')) {
    return [
      base('System design primer'),
      base('Codebase architecture overview'),
      { ...base('Oncall & runbooks'), kind: 'repo' }
    ];
  }
  
  if (r.includes('product')) {
    return [
      base('Product strategy & metrics'),
      base('User research backlog'),
      base('Experimentation playbook')
    ];
  }
  
  return [
    base('Company handbook'),
    base('Team OKRs'),
    base('Security & compliance')
  ];
}
