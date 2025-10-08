/**
 * Compliance Service
 * Step 32 - Validates legal/ethical fetching permissions
 */

import type { SourceConfig } from '@/types/jobs.types';

export const compliance = {
  /** 
   * Check if source can be fetched
   * HTML sources require explicit legalMode consent
   */
  canFetch(source: SourceConfig) {
    if (source.kind === 'html' && !source.legalMode) {
      return { ok: false, reason: 'legalModeOff' };
    }
    return { ok: true };
  },

  /** 
   * Minimal robots.txt check
   * Returns true if path is allowed or if robots.txt unavailable
   * Non-blocking for RSS/API sources
   */
  async robotsAllows(domain: string, path: string): Promise<boolean> {
    try {
      const url = `https://${domain}/robots.txt`;
      const txt = await fetch(url, { method: 'GET' }).then(r => r.ok ? r.text() : '');
      if (!txt) return true;
      
      const lines = txt.split('\n').map(l => l.trim());
      const disallowed = lines
        .filter(l => l.toLowerCase().startsWith('disallow:'))
        .map(l => l.split(':')[1]?.trim());
      
      return !disallowed.some(rule => rule && path.startsWith(rule));
    } catch {
      return true; // Allow on error (non-blocking)
    }
  }
};
