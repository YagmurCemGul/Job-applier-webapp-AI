import type { SourceConfig } from '@/types/jobs.types'

/**
 * Compliance service for job scraping with legal mode gates
 */
export const compliance = {
  /**
   * Check if we can fetch from this source
   * HTML sources require explicit legalMode=true
   */
  canFetch(source: SourceConfig): { ok: boolean; reason?: string } {
    if (source.kind === 'html' && !source.legalMode) {
      return { ok: false, reason: 'legalModeOff' }
    }
    return { ok: true }
  },

  /**
   * Minimal robots.txt check
   * Non-blocking for RSS/API sources
   */
  async robotsAllows(domain: string, path: string): Promise<boolean> {
    try {
      const url = `https://${domain}/robots.txt`
      const txt = await fetch(url, { method: 'GET' }).then((r) => (r.ok ? r.text() : ''))
      if (!txt) return true

      const lines = txt.split('\n').map((l) => l.trim())
      const disallows = lines
        .filter((l) => l.toLowerCase().startsWith('disallow:'))
        .map((l) => l.split(':')[1]?.trim())

      return !disallows.some((rule) => rule && path.startsWith(rule))
    } catch {
      return true
    }
  },
}
