/**
 * Path Planner Unit Tests (Step 47)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useSkills } from '@/stores/skills.store';
import { seedDefaultFramework } from '@/services/skills/frameworks.service';
import { planPath } from '@/services/skills/pathPlanner.service';
import { upsertInventoryRow } from '@/services/skills/inventory.service';
import type { LearningResource } from '@/types/skills.types';

describe('Path Planner', () => {
  beforeEach(() => {
    useSkills.setState({ frameworks: [], inventory: [], resources: [], paths: [] });
  });

  it('generates steps respecting difficulty ascending', () => {
    seedDefaultFramework();
    
    const resources: LearningResource[] = [
      { id: '1', kind: 'course', title: 'Advanced', competencyKeys: ['system_design'], difficulty: 5, estMinutes: 120, tags: [] },
      { id: '2', kind: 'video', title: 'Basics', competencyKeys: ['system_design'], difficulty: 1, estMinutes: 30, tags: [] }
    ];
    resources.forEach(r => useSkills.getState().upsertResource(r));

    upsertInventoryRow({ competencyKey: 'system_design', selfLevel: 0, confidencePct: 50 });

    const path = planPath('L5', 60);
    expect(path.steps.length).toBeGreaterThan(0);
    expect(path.steps[0].resourceId).toBe('2'); // easier first
  });

  it('computes total minutes', () => {
    seedDefaultFramework();
    
    const resources: LearningResource[] = [
      { id: '1', kind: 'doc', title: 'R1', competencyKeys: ['coding'], difficulty: 2, estMinutes: 40, tags: [] },
      { id: '2', kind: 'lab', title: 'R2', competencyKeys: ['coding'], difficulty: 3, estMinutes: 60, tags: [] }
    ];
    resources.forEach(r => useSkills.getState().upsertResource(r));

    upsertInventoryRow({ competencyKey: 'coding', selfLevel: 1, confidencePct: 60 });

    const path = planPath('L4', 50);
    expect(path.totalMinutes).toBeGreaterThan(0);
    expect(path.totalMinutes).toBe(path.steps.reduce((a, s) => a + s.estMinutes, 0));
  });

  it('skips competencies already at target bar', () => {
    seedDefaultFramework();
    
    const resources: LearningResource[] = [
      { id: '1', kind: 'quiz', title: 'Q1', competencyKeys: ['execution'], difficulty: 2, estMinutes: 20, tags: [] }
    ];
    resources.forEach(r => useSkills.getState().upsertResource(r));

    upsertInventoryRow({ competencyKey: 'execution', selfLevel: 4, confidencePct: 90 }); // already max

    const path = planPath('L4', 45);
    const execSteps = path.steps.filter(s => s.competencyKey === 'execution');
    expect(execSteps.length).toBe(0);
  });

  it('respects daily time cap', () => {
    seedDefaultFramework();
    
    const resources: LearningResource[] = [
      { id: '1', kind: 'course', title: 'Long', competencyKeys: ['domain'], difficulty: 3, estMinutes: 200, tags: [] }
    ];
    resources.forEach(r => useSkills.getState().upsertResource(r));

    upsertInventoryRow({ competencyKey: 'domain', selfLevel: 0, confidencePct: 40 });

    const path = planPath('L4', 30); // cap at 30 min
    const longSteps = path.steps.filter(s => s.estMinutes > 30);
    expect(longSteps.length).toBe(0); // should skip resources > cap
  });
});
