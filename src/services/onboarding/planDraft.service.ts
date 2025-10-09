/**
 * @fileoverview 30/60/90 plan drafting service (Step 45)
 * @module services/onboarding/planDraft
 */

import type { Plan, SmartGoal } from '@/types/onboarding.types';
import { aiComplete } from '@/services/features/aiComplete.service';
import { useOffers } from '@/stores/offers.store';
import { useInterview } from '@/stores/interview.store';
import { useReviews } from '@/stores/review.store';

/**
 * Create a first 30/60/90 draft using offer/company, interview notes, and highlights.
 * @param company - Company name
 * @param role - Role title
 * @returns Drafted plan with SMART goals
 */
export async function draftPlan(company?: string, role?: string): Promise<Plan> {
  const offer = useOffers.getState().items.find(o => o.company === company);
  const highlights = useReviews.getState().selfReviews?.[0]?.highlights ?? [];
  const transcript = useInterview.getState().runs?.[0]?.transcript?.text?.slice(0, 1200) ?? '';
  
  const sys = [
    'Draft a concise 30/60/90 plan (3-5 SMART goals per phase).',
    'Return JSON: {summary:string, goals:[{title,description,metric,target,priority,milestone,tags[]}], dependencies:[string]}',
    `Role: ${role || offer?.role || ''} at ${company || offer?.company || ''}.`,
    `Highlights: ${highlights.join('; ')}`,
    `Interview notes: ${transcript}`
  ].join('\n');
  
  let goals: SmartGoal[] = [];
  let deps: string[] = [];
  let summary = '';
  
  try {
    const out = JSON.parse(String(await aiComplete(sys) || '{}'));
    summary = out.summary || '';
    goals = (out.goals || []).map((g: any) => ({
      id: crypto.randomUUID(),
      title: g.title,
      description: g.description,
      metric: g.metric,
      target: g.target,
      dueISO: undefined,
      priority: (g.priority || 'P1'),
      milestone: (g.milestone || 'd30'),
      status: 'not_started',
      tags: g.tags || []
    }));
    deps = out.dependencies || [];
  } catch {
    // Return basic plan if parsing fails
  }
  
  return {
    id: crypto.randomUUID(),
    company: company || offer?.company,
    role: role || offer?.role,
    startISO: offer?.startDateISO,
    summary,
    goals,
    dependencies: deps,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
