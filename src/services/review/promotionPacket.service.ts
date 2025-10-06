import type { SelfReview, ImpactEntry } from '@/types/review.types'

/**
 * Build a confidential packet HTML including self-review summary,
 * top impacts, quotes, and OKR snapshot
 */
export function buildPromotionPacketHTML(opts: {
  cycleTitle: string
  targetLevel: string
  self: SelfReview
  impacts: ImpactEntry[]
  quotes: string[]
}): string {
  const top = opts.impacts
    .slice(0, 8)
    .map(
      (i) =>
        `<li><b>${i.title}</b>${i.detail ? `: ${i.detail}` : ''}</li>`
    )
    .join('')

  const q = opts.quotes
    .slice(0, 6)
    .map(
      (x) =>
        `<blockquote style="border-left:3px solid #e5e7eb;padding-left:8px;margin:8px 0">${x}</blockquote>`
    )
    .join('')

  return `<div>
    <div style="font-size:12px;color:#ef4444;border:1px dashed #ef4444;padding:6px 8px;margin-bottom:8px">CONFIDENTIAL — for calibration use only</div>
    <h2>Promotion Packet — ${opts.cycleTitle} (Target: ${opts.targetLevel})</h2>
    <h3>Overview</h3><p>${opts.self.overview}</p>
    <h3>Highlights</h3><ul>${opts.self.highlights.map((h) => `<li>${h}</li>`).join('')}</ul>
    <h3>Top Impacts</h3><ul>${top}</ul>
    <h3>Quotes</h3>${q}
    <p style="color:#64748b;font-size:12px">Generated with JobPilot — user-provided data only.</p>
  </div>`
}
