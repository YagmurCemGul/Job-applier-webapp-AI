/**
 * @fileoverview Promotion packet assembly service
 * Generates confidential HTML packet with evidence, quotes, and impact
 */

import type { SelfReview, ImpactEntry } from '@/types/review.types';

/**
 * Build a confidential packet HTML including self-review summary,
 * top impacts, quotes, and OKR snapshot
 */
export function buildPromotionPacketHTML(opts: {
  cycleTitle: string;
  targetLevel: string;
  self: SelfReview;
  impacts: ImpactEntry[];
  quotes: string[];
}): string {
  const topImpacts = opts.impacts
    .slice(0, 8)
    .map(i => `<li><b>${i.title}</b>${i.detail ? `: ${i.detail}` : ''}</li>`)
    .join('');
  
  const quotesHTML = opts.quotes
    .slice(0, 6)
    .map(x => `<blockquote style="border-left:3px solid #e5e7eb;padding-left:8px;margin:8px 0">${x}</blockquote>`)
    .join('');
  
  return `<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
    <div style="font-size:12px;color:#ef4444;border:1px dashed #ef4444;padding:6px 8px;margin-bottom:16px;background:#fef2f2">
      🔒 CONFIDENTIAL — for calibration use only
    </div>
    
    <h2 style="margin-bottom: 8px;">Promotion Packet — ${opts.cycleTitle}</h2>
    <p style="color:#64748b;margin-bottom:24px">Target Level: <b>${opts.targetLevel}</b></p>
    
    <h3 style="margin-top:24px">Overview</h3>
    <p>${opts.self.overview}</p>
    
    <h3 style="margin-top:24px">Highlights</h3>
    <ul>
      ${opts.self.highlights.map(h => `<li>${h}</li>`).join('')}
    </ul>
    
    <h3 style="margin-top:24px">Top Impacts</h3>
    <ul>${topImpacts}</ul>
    
    <h3 style="margin-top:24px">Supporting Feedback</h3>
    ${quotesHTML || '<p style="color:#64748b">No quotes selected.</p>'}
    
    <p style="color:#64748b;font-size:12px;margin-top:32px;border-top:1px solid #e5e7eb;padding-top:12px">
      Generated with JobPilot — user-provided data only.
    </p>
  </div>`;
}
