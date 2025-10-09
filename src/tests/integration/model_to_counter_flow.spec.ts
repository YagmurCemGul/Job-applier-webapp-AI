/**
 * @fileoverview Model to counter flow integration test for Step 44
 */

import { describe, it, expect } from 'vitest';
import { runScenarios } from '@/services/equity/scenarios.service';
import { computeAnchors } from '@/services/negotiation/strategy.service';
import { COUNTER_TEMPLATES } from '@/services/negotiation/emailTemplates.service';
import { bulletsHtml } from '@/services/negotiation/strategy.service';

describe('Model to Counter Flow', () => {
  it('should flow from equity model to counter email', () => {
    // Step 1: Model equity scenarios
    const scenarios = runScenarios({
      shares: 10000,
      price: 50,
      growthBasePct: 10,
      years: 4,
      cliffMonths: 12,
      schedule: 'monthly'
    });

    expect(scenarios.base.totalGross).toBeGreaterThan(0);

    // Step 2: Compute anchors from benchmarks
    const anchors = computeAnchors({
      baseP50: 150000,
      baseP75: 180000
    });

    expect(anchors.ask).toBeGreaterThan(anchors.anchor * 0.9);

    // Step 3: Generate counter email
    const template = COUNTER_TEMPLATES.baseRaise;
    const bullets = bulletsHtml(['Strong portfolio', 'Market rate alignment']);
    
    const email = template.body
      .replace(/\{\{AskBase\}\}/g, anchors.ask.toLocaleString())
      .replace(/\{\{Bullets\}\}/g, bullets);

    expect(email).toContain(anchors.ask.toLocaleString());
    expect(email).toContain('<li>');
  });
});
