/**
 * @fileoverview Talking points unit tests for Step 44
 */

import { describe, it, expect } from 'vitest';
import { buildTalkingPoints } from '@/services/negotiation/talkingPoints.service';

describe('Talking Points', () => {
  it('should build points when data available', () => {
    const points = buildTalkingPoints('TestCo');
    expect(points).toBeInstanceOf(Array);
    expect(points.length).toBeGreaterThan(0);
  });

  it('should fall back gracefully when data missing', () => {
    const points = buildTalkingPoints();
    expect(points).toBeInstanceOf(Array);
  });
});
