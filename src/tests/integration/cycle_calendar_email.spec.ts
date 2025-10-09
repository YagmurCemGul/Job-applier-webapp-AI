/**
 * Cycle Calendar Email Integration Test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePerf } from '@/stores/perf.store';
import { createCycle } from '@/services/perf/reviewCycle.service';

describe('Cycle Calendar Email Flow', () => {
  beforeEach(() => {
    usePerf.setState({ cycles: [] });
  });

  it('creates cycle with tasks and reviewers', () => {
    // 1. Create review cycle
    const cycle = createCycle({
      kind: 'year_end',
      title: '2025 Year-End Review',
      startISO: '2025-11-01T00:00:00Z',
      dueISO: '2025-12-15T00:00:00Z',
      tz: 'America/Los_Angeles',
      reviewers: [
        { toEmail: 'manager@company.com', toName: 'Sarah Manager', role: 'manager' },
        { toEmail: 'peer1@company.com', toName: 'John Peer', role: 'peer' },
        { toEmail: 'peer2@company.com', role: 'peer' },
        { toEmail: 'skip@company.com', role: 'skip_level' },
      ],
    });

    // 2. Verify cycle created
    expect(cycle.id).toBeDefined();
    expect(cycle.title).toBe('2025 Year-End Review');
    expect(cycle.kind).toBe('year_end');

    // 3. Verify tasks created
    expect(cycle.tasks.length).toBeGreaterThan(0);
    expect(cycle.tasks.some((t) => t.owner === 'self')).toBe(true);
    expect(cycle.tasks.some((t) => t.owner === 'manager')).toBe(true);

    // 4. Verify reviewers assigned
    expect(cycle.reviewers.length).toBe(4);
    expect(cycle.reviewers[0].toEmail).toBe('manager@company.com');
    expect(cycle.reviewers[0].role).toBe('manager');
    expect(cycle.reviewers[0].status).toBe('draft');

    // 5. Verify stored in state
    const cycles = usePerf.getState().cycles;
    expect(cycles.length).toBe(1);
    expect(cycles[0].id).toBe(cycle.id);
  });

  it('allows task completion tracking', () => {
    const cycle = createCycle({
      kind: 'mid_year',
      startISO: '2025-05-01T00:00:00Z',
      dueISO: '2025-06-15T00:00:00Z',
      tz: 'UTC',
    });

    // Mark a task as done
    const taskId = cycle.tasks[0].id;
    const updatedCycle = {
      ...cycle,
      tasks: cycle.tasks.map((t) => (t.id === taskId ? { ...t, done: true } : t)),
    };
    usePerf.getState().upsertCycle(updatedCycle);

    const storedCycle = usePerf.getState().cycles.find((c) => c.id === cycle.id);
    const completedTask = storedCycle?.tasks.find((t) => t.id === taskId);
    expect(completedTask?.done).toBe(true);
  });

  it('handles multiple concurrent cycles', () => {
    createCycle({
      kind: 'mid_year',
      title: 'H1 2025',
      startISO: '2025-05-01T00:00:00Z',
      dueISO: '2025-06-30T00:00:00Z',
      tz: 'UTC',
    });
    createCycle({
      kind: 'year_end',
      title: 'EOY 2025',
      startISO: '2025-11-01T00:00:00Z',
      dueISO: '2025-12-31T00:00:00Z',
      tz: 'UTC',
    });

    const cycles = usePerf.getState().cycles;
    expect(cycles.length).toBe(2);
    expect(cycles.map((c) => c.title)).toContain('H1 2025');
    expect(cycles.map((c) => c.title)).toContain('EOY 2025');
  });
});
