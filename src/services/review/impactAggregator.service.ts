/**
 * @fileoverview Impact aggregation service
 * Pulls evidence from Step 38 (Evidence Binder, OKRs, Weekly Reports, 1:1s)
 * and synthesizes into scored, deduplicated impact entries
 */

import type { ImpactEntry } from '@/types/review.types';
import { useOnboarding } from '@/stores/onboarding.store';
import { useOKRs } from '@/stores/okrs.store';
import { objectiveProgress } from '@/services/onboarding/okr.service';
import { useReviews } from '@/stores/review.store';

/**
 * Aggregate evidence, OKR progress, weekly report bullets into ImpactEntries
 * with normalized scores for ranking
 */
export function aggregateImpact(cycleId: string): ImpactEntry[] {
  const review = useReviews.getState().byId(cycleId);
  if (!review) return [];

  const planId = review.planId;
  const items: ImpactEntry[] = [];

  if (planId) {
    // Evidence binder → impact
    const plan = useOnboarding.getState().getById(planId);
    for (const e of (plan?.evidence ?? [])) {
      items.push({
        id: crypto.randomUUID(),
        cycleId,
        source: 'evidence',
        title: e.title,
        detail: e.text,
        dateISO: e.createdAt,
        competency: inferCompetency(e.title),
        links: e.url ? [e.url] : [],
        confidence: 4
      });
    }
    
    // OKR progress → impact
    const okrs = useOKRs.getState().byPlan(planId);
    for (const o of okrs) {
      const progress = objectiveProgress(o);
      items.push({
        id: crypto.randomUUID(),
        cycleId,
        source: 'okr',
        title: `OKR: ${o.title}`,
        detail: `${Math.round(progress * 100)}% progress`,
        metrics: o.krs.map(kr => ({
          label: kr.label,
          value: kr.current,
          unit: kr.unit
        })),
        competency: 'impact',
        confidence: 5
      });
    }
  }

  // Normalize score
  for (const it of items) {
    it.score = computeScore(it);
  }
  
  // Deduplicate by title + date (simple)
  const unique: ImpactEntry[] = [];
  const sig = (x: ImpactEntry) => `${x.title}|${x.dateISO || ''}|${x.source}`;
  const seen = new Set<string>();
  
  for (const it of items) {
    const s = sig(it);
    if (!seen.has(s)) {
      unique.push(it);
      seen.add(s);
    }
  }

  return unique.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

/**
 * Infer competency from impact title text
 */
function inferCompetency(title: string): ImpactEntry['competency'] {
  const t = title.toLowerCase();
  
  if (t.includes('refactor') || t.includes('design') || t.includes('architecture')) {
    return 'craft';
  }
  if (t.includes('migration') || t.includes('launch') || t.includes('ship')) {
    return 'execution';
  }
  if (t.includes('kpi') || t.includes('revenue') || t.includes('%') || t.includes('metric')) {
    return 'impact';
  }
  if (t.includes('mentor') || t.includes('led') || t.includes('initiative') || t.includes('team')) {
    return 'leadership';
  }
  if (t.includes('collab') || t.includes('review') || t.includes('partnership')) {
    return 'collaboration';
  }
  
  return 'communication';
}

/**
 * Compute normalized score for impact entry based on metrics, confidence, and competency
 */
function computeScore(e: ImpactEntry): number {
  const compWeights: Record<NonNullable<ImpactEntry['competency']>, number> = {
    execution: 1,
    craft: 0.9,
    leadership: 1.1,
    collaboration: 0.8,
    communication: 0.7,
    impact: 1.2
  };
  
  const hasMetrics = (e.metrics?.reduce((a, m) => a + Math.abs(m.value), 0) ?? 0) > 0;
  const base = (hasMetrics ? 1 : 0.7) + (e.confidence ?? 3) / 5;
  
  return base * (compWeights[e.competency ?? 'impact']);
}
