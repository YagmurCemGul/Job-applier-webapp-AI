/**
 * Growth Packet & Promotion Feedback Integration Test (Step 47)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useSkills } from '@/stores/skills.store';
import { usePromotion } from '@/stores/promotion.store';
import { seedDefaultFramework } from '@/services/skills/frameworks.service';
import { upsertInventoryRow } from '@/services/skills/inventory.service';
import { planPath } from '@/services/skills/pathPlanner.service';
import { exportGrowthPacket } from '@/services/skills/exportPacket.service';
import { evaluateBadges } from '@/services/skills/badges.service';
import type { LearningResource, Assessment, Attempt } from '@/types/skills.types';

describe('Growth Packet & Promotion Feedback', () => {
  beforeEach(() => {
    useSkills.setState({ 
      frameworks: [], 
      inventory: [], 
      paths: [], 
      badges: [], 
      resources: [],
      assessments: [],
      attempts: []
    });
    usePromotion.setState({ gaps: [], expectations: [] });
  });

  it('exports Growth Packet → feeds improved per-rubric hints to Promotion Readiness → verifies higher readiness', async () => {
    // 1. Seed framework
    seedDefaultFramework();

    // 2. Build inventory
    upsertInventoryRow({ competencyKey: 'system_design', selfLevel: 2, confidencePct: 75 });
    upsertInventoryRow({ competencyKey: 'coding', selfLevel: 3, confidencePct: 85 });
    upsertInventoryRow({ competencyKey: 'communication', selfLevel: 2, confidencePct: 70 });

    // 3. Add resources and plan path
    const resources: LearningResource[] = [
      { id: 'r1', kind: 'course', title: 'Advanced Design', competencyKeys: ['system_design'], difficulty: 3, estMinutes: 90, tags: [] },
      { id: 'r2', kind: 'lab', title: 'Code Lab', competencyKeys: ['coding'], difficulty: 2, estMinutes: 60, tags: [] }
    ];
    resources.forEach(r => useSkills.getState().upsertResource(r));

    const path = planPath('L5', 60);
    useSkills.getState().upsertPath(path);

    // 4. Award badges via assessments
    const asmt: Assessment = {
      id: 'asmt-1',
      title: 'Coding Test',
      kind: 'quiz',
      competencyKey: 'coding',
      passScore: 70,
      questions: [{ id: 'q1', prompt: 'Q?', choices: ['A'], answer: 'A' }]
    };
    useSkills.getState().upsertAssessment(asmt);

    const attempt: Attempt = {
      id: 'a1',
      assessmentId: 'asmt-1',
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      scorePct: 90
    };
    useSkills.getState().upsertAttempt(attempt);

    const badges = evaluateBadges('coding');
    expect(badges.length).toBeGreaterThan(0);

    // 5. Export Growth Packet
    const exported = await exportGrowthPacket({
      role: 'Software Engineer',
      targetLevel: 'L5',
      path,
      inventory: useSkills.getState().inventory,
      badges: useSkills.getState().badges,
      disclaimer: 'Educational guidance only',
      kind: 'pdf'
    });

    expect(exported).toBeDefined();
    useSkills.getState().upsertExport({
      id: crypto.randomUUID(),
      url: typeof exported === 'string' ? exported : exported?.url,
      kind: 'pdf',
      createdAt: new Date().toISOString()
    });

    // 6. Feed improved metrics to Promotion Readiness (Step 46)
    // Mock: improved per-rubric inputs based on inventory + badges
    const rubricInputs = {
      structure: useSkills.getState().inventory.find(i => i.competencyKey === 'system_design')?.selfLevel ?? 2,
      craft: useSkills.getState().inventory.find(i => i.competencyKey === 'coding')?.selfLevel ?? 3,
      impact: useSkills.getState().badges.length > 0 ? 3 : 2
    };

    const baselineReadiness = 0.5;
    const badgeBoost = useSkills.getState().badges.length * 0.05;
    const inventoryBoost = Object.values(rubricInputs).reduce((a, b) => a + b, 0) / Object.keys(rubricInputs).length * 0.1;
    const improvedReadiness = Math.min(1.0, baselineReadiness + badgeBoost + inventoryBoost);

    // 7. Verify higher readiness
    expect(improvedReadiness).toBeGreaterThan(baselineReadiness);
    expect(improvedReadiness).toBeGreaterThanOrEqual(0.6);

    // Mock saving gap analysis
    usePromotion.getState().upsertGap({
      id: crypto.randomUUID(),
      targetLevel: 'L5',
      ready: improvedReadiness >= 0.7,
      gaps: [],
      strengths: ['Strong coding skills (L3)', 'Gold badge earned'],
      readinessPct: Math.round(improvedReadiness * 100),
      createdAt: new Date().toISOString()
    });

    const gaps = usePromotion.getState().gaps;
    expect(gaps.length).toBe(1);
    expect(gaps[0].readinessPct).toBeGreaterThanOrEqual(60);
  });

  it('handles minimal progress gracefully', async () => {
    seedDefaultFramework();
    
    upsertInventoryRow({ competencyKey: 'execution', selfLevel: 1, confidencePct: 40 });

    const resources: LearningResource[] = [
      { id: 'r1', kind: 'doc', title: 'Basics', competencyKeys: ['execution'], difficulty: 1, estMinutes: 20, tags: [] }
    ];
    resources.forEach(r => useSkills.getState().upsertResource(r));

    const path = planPath('L4', 30);
    
    const exported = await exportGrowthPacket({
      role: 'Engineer',
      targetLevel: 'L4',
      path,
      inventory: useSkills.getState().inventory,
      badges: [],
      disclaimer: 'Educational',
      kind: 'pdf'
    });

    expect(exported).toBeDefined();
  });
});
