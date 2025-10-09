/**
 * Review Cycle Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { usePerf } from '@/stores/perf.store';
import { createCycle } from '@/services/perf/reviewCycle.service';

describe('Review Cycle', () => {
  beforeEach(() => {
    usePerf.setState({ cycles: [] });
  });

  it('creates cycle with default tasks', () => {
    const cycle = createCycle({
      kind: 'mid_year',
      startISO: '2025-01-01T00:00:00Z',
      dueISO: '2025-06-30T00:00:00Z',
      tz: 'UTC',
    });

    expect(cycle.kind).toBe('mid_year');
    expect(cycle.tasks.length).toBeGreaterThan(0);
    expect(cycle.tasks[0]).toHaveProperty('title');
    expect(cycle.tasks[0]).toHaveProperty('done');
    expect(cycle.tasks[0]).toHaveProperty('owner');
  });

  it('includes reviewers', () => {
    const cycle = createCycle({
      kind: 'year_end',
      startISO: '2025-01-01T00:00:00Z',
      dueISO: '2025-12-31T00:00:00Z',
      tz: 'UTC',
      reviewers: [
        { toEmail: 'peer@example.com', toName: 'Jane', role: 'peer' },
        { toEmail: 'manager@example.com', role: 'manager' },
      ],
    });

    expect(cycle.reviewers.length).toBe(2);
    expect(cycle.reviewers[0].toEmail).toBe('peer@example.com');
    expect(cycle.reviewers[0].role).toBe('peer');
    expect(cycle.reviewers[1].toEmail).toBe('manager@example.com');
  });

  it('uses custom title if provided', () => {
    const cycle = createCycle({
      kind: 'custom',
      title: 'Q1 Check-in',
      startISO: '2025-01-01T00:00:00Z',
      dueISO: '2025-03-31T00:00:00Z',
      tz: 'UTC',
    });

    expect(cycle.title).toBe('Q1 Check-in');
  });

  it('stores cycle in state', () => {
    createCycle({
      kind: 'probation',
      startISO: '2025-01-01T00:00:00Z',
      dueISO: '2025-03-01T00:00:00Z',
      tz: 'America/New_York',
    });

    const cycles = usePerf.getState().cycles;
    expect(cycles.length).toBe(1);
    expect(cycles[0].kind).toBe('probation');
  });
});
