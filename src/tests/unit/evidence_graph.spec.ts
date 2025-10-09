/**
 * Evidence Graph Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { usePerf } from '@/stores/perf.store';
import { linkEvidence, goalProgress } from '@/services/perf/evidenceGraph.service';

describe('Evidence Graph', () => {
  beforeEach(() => {
    usePerf.setState({ graph: [] });
  });

  it('links evidence to goal', () => {
    linkEvidence({
      goalId: 'goal-1',
      source: 'evidence',
      refId: 'artifact-1',
      title: 'Reduced latency',
      metricDelta: 30,
    });

    const graph = usePerf.getState().graph;
    expect(graph.length).toBe(1);
    expect(graph[0].goalId).toBe('goal-1');
    expect(graph[0].metricDelta).toBe(30);
  });

  it('computes progress with metric totals', () => {
    linkEvidence({
      goalId: 'goal-1',
      source: 'evidence',
      refId: 'artifact-1',
      title: 'Task 1',
      metricDelta: 25,
    });
    linkEvidence({
      goalId: 'goal-1',
      source: 'portfolio',
      refId: 'artifact-2',
      title: 'Task 2',
      metricDelta: 15,
    });

    const progress = goalProgress('goal-1');
    expect(progress.count).toBe(2);
    expect(progress.delta).toBe(40);
  });

  it('handles missing metric delta', () => {
    linkEvidence({
      goalId: 'goal-2',
      source: 'evidence',
      refId: 'artifact-3',
      title: 'Task 3',
    });

    const progress = goalProgress('goal-2');
    expect(progress.count).toBe(1);
    expect(progress.delta).toBe(0);
  });

  it('aggregates correctly across multiple goals', () => {
    linkEvidence({
      goalId: 'goal-1',
      source: 'evidence',
      refId: 'a1',
      title: 'T1',
      metricDelta: 10,
    });
    linkEvidence({
      goalId: 'goal-2',
      source: 'evidence',
      refId: 'a2',
      title: 'T2',
      metricDelta: 20,
    });

    expect(goalProgress('goal-1').delta).toBe(10);
    expect(goalProgress('goal-2').delta).toBe(20);
  });
});
