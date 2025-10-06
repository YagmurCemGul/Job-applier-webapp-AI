import { describe, it, expect } from 'vitest'
import { buildWeeklyHTML } from '@/services/onboarding/weeklyReport.service'
import type { OnboardingPlan } from '@/types/onboarding.types'

describe('weeklyReport.service', () => {
  it('should build HTML with all sections', () => {
    const plan: OnboardingPlan = {
      id: 'plan1',
      applicationId: 'app1',
      role: 'Engineer',
      company: 'Acme',
      stage: 'active',
      lang: 'en',
      milestones: [],
      tasks: [],
      checklists: [],
      stakeholders: [],
      evidence: [],
      retentionDays: 90,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const html = buildWeeklyHTML(plan, {
      highlights: ['Completed onboarding', 'Met team'],
      risks: ['Timeline tight'],
      asks: ['Need access to prod'],
      okrProgress: [{ title: 'Launch Feature', pct: 0.5 }],
    })

    expect(html).toContain('Acme')
    expect(html).toContain('Engineer')
    expect(html).toContain('Highlights')
    expect(html).toContain('Completed onboarding')
    expect(html).toContain('Risks')
    expect(html).toContain('Timeline tight')
    expect(html).toContain('Asks')
    expect(html).toContain('OKRs')
    expect(html).toContain('50%')
  })

  it('should handle empty sections', () => {
    const plan: OnboardingPlan = {
      id: 'plan1',
      applicationId: 'app1',
      role: 'Engineer',
      company: 'Acme',
      stage: 'active',
      lang: 'en',
      milestones: [],
      tasks: [],
      checklists: [],
      stakeholders: [],
      evidence: [],
      retentionDays: 90,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const html = buildWeeklyHTML(plan, {
      highlights: [],
      risks: [],
      asks: [],
    })

    expect(html).toContain('Acme')
    expect(html).not.toContain('<h3>Highlights</h3>')
    expect(html).not.toContain('<h3>Risks</h3>')
  })

  it('should handle Unicode characters', () => {
    const plan: OnboardingPlan = {
      id: 'plan1',
      applicationId: 'app1',
      role: 'Mühendis',
      company: 'Şirket',
      stage: 'active',
      lang: 'tr',
      milestones: [],
      tasks: [],
      checklists: [],
      stakeholders: [],
      evidence: [],
      retentionDays: 90,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const html = buildWeeklyHTML(plan, {
      highlights: ['Türkçe karakter testi'],
      risks: [],
      asks: [],
    })

    expect(html).toContain('Şirket')
    expect(html).toContain('Mühendis')
    expect(html).toContain('Türkçe')
  })
})
