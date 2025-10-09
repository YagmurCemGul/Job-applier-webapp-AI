/**
 * @fileoverview Counter email unit tests for Step 44
 */

import { describe, it, expect } from 'vitest';
import { COUNTER_TEMPLATES } from '@/services/negotiation/emailTemplates.service';
import { bulletsHtml } from '@/services/negotiation/strategy.service';

describe('Counter Email Templates', () => {
  it('should render placeholders', () => {
    const template = COUNTER_TEMPLATES.baseRaise;
    const body = template.body
      .replace(/\{\{Name\}\}/g, 'Alice')
      .replace(/\{\{Role\}\}/g, 'Engineer');

    expect(body).toContain('Alice');
    expect(body).toContain('Engineer');
  });

  it('should escape bullets HTML', () => {
    const points = ['<script>alert("xss")</script>', 'Safe point'];
    const html = bulletsHtml(points);

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('should have subject present', () => {
    expect(COUNTER_TEMPLATES.baseRaise.subject).toBeTruthy();
    expect(COUNTER_TEMPLATES.signOn.subject).toBeTruthy();
  });
});
