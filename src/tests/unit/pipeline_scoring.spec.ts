/**
 * @fileoverview Unit tests for pipeline scoring
 */

import { describe, it, expect } from 'vitest';
import { score } from '@/services/pipeline/recruiterPipeline.service';
import type { PipelineItem } from '@/stores/pipeline.store';

describe('Pipeline Scoring', () => {
  it('calculates score based on stage', () => {
    const item: PipelineItem = {
      id: '1',
      contactId: 'c1',
      stage: 'offer',
      lastActionISO: new Date().toISOString()
    };

    const s = score(item);
    expect(s).toBeGreaterThan(0.8); // offer stage has high weight
  });

  it('applies recency decay', () => {
    const recentItem: PipelineItem = {
      id: '1',
      contactId: 'c1',
      stage: 'screening',
      lastActionISO: new Date().toISOString()
    };

    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 60); // 60 days ago
    const oldItem: PipelineItem = {
      id: '2',
      contactId: 'c2',
      stage: 'screening',
      lastActionISO: oldDate.toISOString()
    };

    expect(score(recentItem)).toBeGreaterThan(score(oldItem));
  });

  it('returns lower score for prospect stage', () => {
    const prospect: PipelineItem = {
      id: '1',
      contactId: 'c1',
      stage: 'prospect',
      lastActionISO: new Date().toISOString()
    };

    const s = score(prospect);
    expect(s).toBeLessThan(0.5);
  });

  it('produces monotonic scores across stages', () => {
    const stages: Array<PipelineItem['stage']> = ['prospect', 'intro_requested', 'referred', 'screening', 'in_process', 'offer'];
    const now = new Date().toISOString();
    
    const scores = stages.map(stage => score({
      id: '1',
      contactId: 'c1',
      stage,
      lastActionISO: now
    }));

    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeGreaterThanOrEqual(scores[i - 1]);
    }
  });
});
