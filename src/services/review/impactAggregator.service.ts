import type { ImpactEntry } from '@/types/review.types'
import { useOnboardingStore } from '@/store/onboardingStore'
import { useOKRsStore } from '@/store/okrsStore'
import { objectiveProgress } from '@/services/onboarding/okr.service'
import { useReviewsStore } from '@/store/reviewStore'

/**
 * Aggregate evidence, OKR progress, weekly report bullets into ImpactEntries
 * with normalized score
 */
export function aggregateImpact(cycleId: string): ImpactEntry[] {
  const review = useReviewsStore.getState().byId(cycleId)
  if (!review) return []

  const planId = review.planId
  const items: ImpactEntry[] = []

  if (planId) {
    // Evidence binder → impact
    const plan = useOnboardingStore.getState().getById(planId)
    for (const e of plan?.evidence ?? []) {
      items.push({
        id:
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : String(Math.random()),
        cycleId,
        source: 'evidence',
        title: e.title,
        detail: e.text,
        dateISO: e.createdAt,
        competency: inferCompetency(e.title),
        links: e.url ? [e.url] : [],
        confidence: 4,
      })
    }

    // OKR progress → impact
    const okrs = useOKRsStore.getState().byPlan(planId)
    for (const o of okrs) {
      items.push({
        id:
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : String(Math.random()),
        cycleId,
        source: 'okr',
        title: `OKR: ${o.title}`,
        detail: `${Math.round(objectiveProgress(o) * 100)}% progress`,
        metrics: o.krs.map((kr) => ({
          label: kr.label,
          value: kr.current,
          unit: kr.unit,
        })),
        competency: 'impact',
        confidence: 5,
      })
    }
  }

  // Normalize score
  for (const it of items) {
    it.score = score(it)
  }

  // Deduplicate by title + date
  const unique: ImpactEntry[] = []
  const sig = (x: ImpactEntry) => `${x.title}|${x.dateISO || ''}|${x.source}`
  const seen = new Set<string>()
  for (const it of items) {
    const s = sig(it)
    if (!seen.has(s)) {
      unique.push(it)
      seen.add(s)
    }
  }

  return unique.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
}

/**
 * Infer competency from title
 */
function inferCompetency(title: string): ImpactEntry['competency'] {
  const t = title.toLowerCase()
  if (t.includes('refactor') || t.includes('design')) return 'craft'
  if (t.includes('migration') || t.includes('launch')) return 'execution'
  if (t.includes('kpi') || t.includes('revenue') || t.includes('%')) return 'impact'
  if (t.includes('mentoring') || t.includes('led') || t.includes('initiative')) return 'leadership'
  if (t.includes('collab') || t.includes('review')) return 'collaboration'
  return 'communication'
}

/**
 * Calculate impact score
 */
function score(e: ImpactEntry): number {
  const compW: Record<NonNullable<ImpactEntry['competency']>, number> = {
    execution: 1,
    craft: 0.9,
    leadership: 1.1,
    collaboration: 0.8,
    communication: 0.7,
    impact: 1.2,
  }

  const hasMetrics = e.metrics?.reduce((a, m) => a + Math.abs(m.value), 0)
  const base = (hasMetrics ? 1 : 0.7) + (e.confidence ?? 3) / 5

  return base * (compW[e.competency ?? 'impact'] ?? 1)
}
