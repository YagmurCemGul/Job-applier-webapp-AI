/**
 * Narrative Writer Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePerf } from '@/stores/perf.store';
import { writeNarrative } from '@/services/perf/narrative.service';
import * as aiService from '@/services/features/aiComplete.service';

vi.mock('@/services/features/aiComplete.service', () => ({
  aiComplete: vi.fn().mockResolvedValue('<h2>Scope</h2><p>Delivered key features.</p>'),
}));

describe('Narrative Writer', () => {
  beforeEach(() => {
    usePerf.setState({ narratives: [], graph: [] });
    vi.clearAllMocks();
  });

  it('generates HTML with sections', async () => {
    const doc = await writeNarrative({
      title: 'H2 Review',
      bullets: ['Reduced latency by 30%', 'Led migration'],
    });

    expect(doc.html).toContain('<h2>');
    expect(doc.title).toBe('H2 Review');
  });

  it('sanitizes text', async () => {
    vi.mocked(aiService.aiComplete).mockResolvedValueOnce(
      '<p>Contact me@example.com for feedback.</p>'
    );

    const doc = await writeNarrative({
      title: 'Test',
      bullets: ['Test'],
    });

    expect(doc.html).toContain('[redacted-email]');
    expect(doc.html).not.toContain('me@example.com');
  });

  it('includes progress from linked goals', async () => {
    usePerf.setState({
      graph: [
        {
          id: '1',
          goalId: 'goal-1',
          source: 'evidence',
          refId: 'ref-1',
          title: 'Task 1',
          metricDelta: 25,
        },
      ],
    });

    const doc = await writeNarrative({
      title: 'Review',
      bullets: ['Test'],
      goalIds: ['goal-1'],
    });

    expect(aiService.aiComplete).toHaveBeenCalled();
    const callArg = vi.mocked(aiService.aiComplete).mock.calls[0][0];
    expect(callArg).toContain('Progress:');
    expect(callArg).toContain('goal-1');
  });

  it('handles empty quotes gracefully', async () => {
    const doc = await writeNarrative({
      title: 'Test',
      bullets: ['Bullet 1'],
      quotes: [],
    });

    expect(doc).toBeDefined();
    expect(doc.html).toBeTruthy();
  });
});
