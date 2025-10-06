import { describe, it, expect, beforeEach, vi } from 'vitest'
import { initGIS } from '@/services/integrations/google.oauth.service'

describe('google.oauth.service', () => {
  beforeEach(() => {
    // Clear global state
    delete (window as any).__gisLoaded
    delete (window as any).google
  })

  it('should load GIS script only once', async () => {
    // Mock script loading
    const originalAppendChild = document.head.appendChild
    let scriptLoaded = false

    document.head.appendChild = vi.fn((node: any) => {
      if (node.tagName === 'SCRIPT' && node.src.includes('gsi/client')) {
        scriptLoaded = true
        setTimeout(() => {
          ;(window as any).__gisLoaded = true
          node.onload()
        }, 0)
      }
      return originalAppendChild.call(document.head, node)
    })

    await initGIS('test-client-id')
    expect(scriptLoaded).toBe(true)
    expect((window as any).__gisLoaded).toBe(true)

    // Second call should not reload
    scriptLoaded = false
    await initGIS('test-client-id')
    expect(scriptLoaded).toBe(false)

    document.head.appendChild = originalAppendChild
  })
})
