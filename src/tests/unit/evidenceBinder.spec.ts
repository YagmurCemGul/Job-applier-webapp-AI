import { describe, it, expect } from 'vitest'
import { renderBinderHTML } from '@/services/onboarding/evidenceBinder.service'
import type { EvidenceItem } from '@/types/onboarding.types'

describe('evidenceBinder.service', () => {
  it('should render evidence items as HTML', () => {
    const items: EvidenceItem[] = [
      {
        id: 'ev1',
        title: 'Shipped Feature X',
        kind: 'doc',
        text: 'Delivered ahead of schedule',
        createdAt: '2025-10-01T00:00:00Z',
        tags: ['achievement']
      },
      {
        id: 'ev2',
        title: 'Metric Dashboard',
        kind: 'link',
        url: 'https://example.com/dashboard',
        createdAt: '2025-10-05T00:00:00Z'
      }
    ]

    const html = renderBinderHTML(items)

    expect(html).toContain('Evidence Binder')
    expect(html).toContain('Shipped Feature X')
    expect(html).toContain('Delivered ahead of schedule')
    expect(html).toContain('Metric Dashboard')
    expect(html).toContain('https://example.com/dashboard')
  })

  it('should include dates in output', () => {
    const items: EvidenceItem[] = [
      {
        id: 'ev1',
        title: 'Test',
        kind: 'note',
        createdAt: '2025-10-15T00:00:00Z'
      }
    ]

    const html = renderBinderHTML(items)

    expect(html).toContain('10/15/2025')
  })

  it('should handle empty evidence', () => {
    const html = renderBinderHTML([])

    expect(html).toContain('Evidence Binder')
    expect(html).not.toContain('<li>')
  })
})
