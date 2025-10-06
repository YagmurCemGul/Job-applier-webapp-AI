import { describe, it, expect } from 'vitest'
import { makeOpenPixel, wrapLinksForClick } from '@/services/outreach/tracking.service'

describe('tracking.service', () => {
  it('should create data URI pixel when no trackingId', () => {
    const pixel = makeOpenPixel()

    expect(pixel).toContain('data:image/gif')
    expect(pixel).toContain('base64')
  })

  it('should create tracking URL when trackingId provided', () => {
    const pixel = makeOpenPixel('track123')

    expect(pixel).toContain('/api/trk/o.gif')
    expect(pixel).toContain('id=track123')
  })

  it('should wrap links when trackingId provided', () => {
    const html = '<a href="https://example.com">Link</a>'
    const result = wrapLinksForClick(html, 'track123')

    expect(result).toContain('/api/trk/c?')
    expect(result).toContain('u=https%3A%2F%2Fexample.com')
    expect(result).toContain('id=track123')
  })

  it('should not wrap links when no trackingId', () => {
    const html = '<a href="https://example.com">Link</a>'
    const result = wrapLinksForClick(html)

    expect(result).toBe(html)
  })
})
