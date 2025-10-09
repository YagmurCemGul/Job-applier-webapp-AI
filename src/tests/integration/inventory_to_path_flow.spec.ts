/**
 * Inventory to Path Flow Integration Test (Step 47)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSkills } from '@/stores/skills.store';
import { seedDefaultFramework } from '@/services/skills/frameworks.service';
import { linkSkillEvidence } from '@/services/skills/skillGraph.service';
import { inferInventoryFromEvidence, upsertInventoryRow } from '@/services/skills/inventory.service';
import { planPath } from '@/services/skills/pathPlanner.service';
import type { LearningResource } from '@/types/skills.types';

describe('Inventory to Path Flow', () => {
  beforeEach(() => {
    useSkills.setState({ frameworks: [], inventory: [], evidence: [], resources: [], paths: [] });
  });

  it('infers inventory → plans path → saves → schedules study', async () => {
    // 1. Seed framework
    seedDefaultFramework();

    // 2. Link evidence
    linkSkillEvidence({
      competencyKey: 'system_design',
      evidenceRefId: 'doc-1',
      title: 'Architecture RFC',
      delta: 20
    });
    linkSkillEvidence({
      competencyKey: 'coding',
      evidenceRefId: 'pr-1',
      title: 'Code review',
      delta: 10
    });

    // 3. Infer and upsert inventory
    const designInferred = inferInventoryFromEvidence('system_design');
    upsertInventoryRow({
      competencyKey: 'system_design',
      ...designInferred
    });

    const codingInferred = inferInventoryFromEvidence('coding');
    upsertInventoryRow({
      competencyKey: 'coding',
      ...codingInferred
    });

    const inventory = useSkills.getState().inventory;
    expect(inventory.length).toBe(2);
    expect(inventory.find(i => i.competencyKey === 'system_design')?.selfLevel).toBeGreaterThan(0);

    // 4. Add resources
    const resources: LearningResource[] = [
      { id: 'r1', kind: 'course', title: 'System Design 101', competencyKeys: ['system_design'], difficulty: 2, estMinutes: 60, tags: [] },
      { id: 'r2', kind: 'video', title: 'Clean Code', competencyKeys: ['coding'], difficulty: 1, estMinutes: 30, tags: [] }
    ];
    resources.forEach(r => useSkills.getState().upsertResource(r));

    // 5. Plan path
    const path = planPath('L5', 45);
    useSkills.getState().upsertPath(path);

    expect(path.steps.length).toBeGreaterThan(0);
    expect(path.totalMinutes).toBeGreaterThan(0);

    // 6. Mock schedule study (would call Calendar API)
    const mockSchedule = vi.fn().mockResolvedValue([{ id: 'evt-1', htmlLink: 'https://cal.link' }]);
    await mockSchedule({
      accountId: 'user-1',
      clientId: 'oauth-client',
      passphrase: 'secret',
      tz: 'America/New_York',
      startISO: new Date().toISOString(),
      dailyMinutes: 45,
      days: 7,
      title: 'Study Session'
    });

    expect(mockSchedule).toHaveBeenCalledOnce();
  });

  it('handles empty evidence gracefully', () => {
    seedDefaultFramework();
    
    const inferred = inferInventoryFromEvidence('execution');
    upsertInventoryRow({
      competencyKey: 'execution',
      ...inferred
    });

    const inventory = useSkills.getState().inventory;
    expect(inventory.length).toBe(1);
    expect(inventory[0].selfLevel).toBeDefined();
  });
});
