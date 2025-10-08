/**
 * @fileoverview Evidence binder service for rendering and exporting evidence.
 * @module services/onboarding/evidenceBinder
 */

import type { EvidenceItem } from '@/types/onboarding.types';

/**
 * Render evidence binder as HTML.
 * @param items - Evidence items
 * @returns HTML string
 */
export function renderBinderHTML(items: EvidenceItem[]): string {
  const item = (e: EvidenceItem) =>
    `<li><b>${e.title}</b> — ${e.text ?? e.url ?? ''} <i style="color:#64748b">${new Date(e.createdAt).toLocaleDateString()}</i></li>`;
  return `<div><h2>Evidence Binder</h2><ul>${items.map(item).join('')}</ul></div>`;
}
