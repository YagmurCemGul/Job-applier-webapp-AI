/**
 * @fileoverview Negotiation strategy service for Step 44
 * @module services/negotiation/strategy
 */

/**
 * Compute anchor and ask amounts based on benchmarks
 * @param input - Benchmark data
 * @returns Anchor and ask amounts
 */
export function computeAnchors(input: {
  baseP50?: number;
  baseP75?: number;
  currentBase?: number;
}): { anchor: number; ask: number } {
  const p50 = input.baseP50 ?? input.currentBase ?? 0;
  const p75 = input.baseP75 ?? p50 * 1.1;
  const anchor = Math.round((p75 * 1.06) / 1000) * 1000; // modest high anchor
  const ask = Math.round((p75 * 1.02) / 1000) * 1000; // target ask
  return { anchor, ask };
}

/**
 * Render bullets as HTML list items
 * @param points - Talking points
 * @returns HTML list items
 */
export function bulletsHtml(points: string[]): string {
  return points.map(p => `<li>${escape(p)}</li>`).join('');
}

/**
 * Escape HTML special characters
 */
function escape(s: string): string {
  return s.replace(/[&<>"]/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }[m]!));
}
