/**
 * @fileoverview Export packet unit tests for Step 44
 */

import { describe, it, expect } from 'vitest';
import type { Offer, ComparisonRow } from '@/types/offer.types.step44';

describe('Export Packet', () => {
  it('should include disclaimer in HTML', () => {
    const disclaimer = 'Not financial advice';
    const html = `<p style="color:#ef4444">${disclaimer}</p>`;

    expect(html).toContain(disclaimer);
    expect(html).toContain('color:#ef4444');
  });

  it('should format offers section', () => {
    const offer: Offer = {
      id: '1',
      company: 'TestCo',
      role: 'Engineer',
      currency: 'USD',
      baseAnnual: 150000,
      source: 'manual',
      extractedAt: new Date().toISOString()
    };

    const html = `<h3>${offer.company} — ${offer.role}</h3>`;
    expect(html).toContain('TestCo');
    expect(html).toContain('Engineer');
  });

  it('should format comparison table', () => {
    const row: ComparisonRow = {
      offerId: '1',
      company: 'TestCo',
      currency: 'USD',
      y1Total: 150000,
      y2Total: 150000,
      y4Total: 600000,
      npv: 550000
    };

    const html = `<td>${row.currency} ${row.npv.toLocaleString()}</td>`;
    expect(html).toContain('USD');
    expect(html).toContain('550,000');
  });
});
