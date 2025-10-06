import { useOnboardingStore } from '@/store/onboardingStore'

/**
 * Compute coverage vs stakeholders by cadence
 * Returns gaps list
 */
export function computeVisibilityGaps(planId?: string): Array<{
  email: string
  name: string
  suggestion: string
}> {
  if (!planId) return []

  const plan = useOnboardingStore.getState().getById(planId)
  const needs = (plan?.stakeholders ?? []).filter(
    (s) => s.influence === 'high' || s.interest === 'high'
  )

  const gaps = needs.filter((s) => !s.cadence || s.cadence === 'ad_hoc')

  return gaps.map((g) => ({
    email: g.email,
    name: g.name,
    suggestion: 'Set up biweekly 1:1'
  }))
}
