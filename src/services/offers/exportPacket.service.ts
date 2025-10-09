/**
 * @fileoverview Negotiation packet export service for Step 44
 * @module services/offers/exportPacket
 */

import type { Offer, ComparisonRow } from '@/types/offer.types.step44';
import { exportHTMLToPDF } from '@/services/export/pdf.service';
import { exportHTMLToGoogleDoc } from '@/services/export/googleDocs.service';

/**
 * Export negotiation packet as PDF or Google Doc with redaction note
 * @param opts - Export options
 * @returns URL or void
 */
export async function exportNegotiationPacket(opts: {
  offers: Offer[];
  comps: ComparisonRow[];
  disclaimer: string;
  kind: 'pdf' | 'gdoc';
}) {
  const html = [
    `<h1>Negotiation Packet</h1>`,
    `<p style="color:#ef4444">${opts.disclaimer}</p>`,
    `<h2>Offers</h2>`,
    ...opts.offers.map(o => `<div>
      <h3>${o.company} — ${o.role}</h3>
      <ul>
        <li>Base: ${o.currency} ${o.baseAnnual.toLocaleString()}</li>
        <li>Bonus Target: ${(o.bonusTargetPct || 0)}%</li>
        <li>Sign-on: ${o.currency} ${(o.signOnYr1 || 0).toLocaleString()}</li>
        <li>Equity: ${o.equity ? 
          `${o.equity.kind.toUpperCase()} ${o.equity.grantShares || o.equity.grantValue || 0}` : 
          '—'}</li>
      </ul>
    </div>`),
    `<h2>Comparison</h2>`,
    `<table>
      <thead>
        <tr>
          <th>Company</th>
          <th>Y1</th>
          <th>Y2</th>
          <th>Y4</th>
          <th>NPV</th>
        </tr>
      </thead>
      <tbody>
        ${opts.comps.map(c => `<tr>
          <td>${c.company}</td>
          <td>${c.currency} ${c.y1Total.toLocaleString()}</td>
          <td>${c.currency} ${c.y2Total.toLocaleString()}</td>
          <td>${c.currency} ${c.y4Total.toLocaleString()}</td>
          <td>${c.currency} ${c.npv.toLocaleString()}</td>
        </tr>`).join('')}
      </tbody>
    </table>`
  ].join('\n');

  return opts.kind === 'pdf'
    ? exportHTMLToPDF(html, 'Negotiation_Packet.pdf', 'en', { returnUrl: true } as any)
    : exportHTMLToGoogleDoc(html, 'Negotiation Packet');
}
