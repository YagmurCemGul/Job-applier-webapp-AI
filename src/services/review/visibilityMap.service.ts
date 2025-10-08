/**
 * @fileoverview Visibility mapping service
 * Computes stakeholder coverage gaps and generates visibility suggestions
 */

import { useOnboarding } from '@/stores/onboarding.store';

export interface VisibilityGap {
  email: string;
  name: string;
  suggestion: string;
}

/**
 * Compute coverage vs stakeholders by cadence: returns gaps list
 */
export function computeVisibilityGaps(planId?: string): VisibilityGap[] {
  if (!planId) return [];
  
  const plan = useOnboarding.getState().getById(planId);
  const needs = (plan?.stakeholders ?? []).filter(
    s => s.influence === 'high' || s.interest === 'high'
  );
  
  const gaps = needs.filter(s => !s.cadence || s.cadence === 'ad_hoc');
  
  return gaps.map(g => ({
    email: g.email,
    name: g.name,
    suggestion: 'Set up biweekly 1:1 to increase visibility'
  }));
}
