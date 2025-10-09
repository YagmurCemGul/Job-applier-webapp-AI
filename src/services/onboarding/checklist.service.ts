/**
 * @fileoverview Pre-start checklist service (Step 45)
 * @module services/onboarding/checklist
 */

import type { ChecklistItem } from '@/types/onboarding.types';

/**
 * Generate default pre-start checklist items.
 * @returns Array of default checklist items
 */
export function defaultChecklist(): ChecklistItem[] {
  const mk = (label: string): ChecklistItem => ({
    id: crypto.randomUUID(),
    label,
    done: false
  });
  
  return [
    mk('Sign and return employment documents'),
    mk('Complete background check'),
    mk('Provide payroll details'),
    mk('Request laptop/equipment'),
    mk('Set up corporate email and 2FA'),
    mk('Read employee handbook'),
    mk('Review team roadmap / OKRs'),
    mk('Travel or remote setup confirmed')
  ];
}
