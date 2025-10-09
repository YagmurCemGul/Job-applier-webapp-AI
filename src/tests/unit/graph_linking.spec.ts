/**
 * Skill Graph Linking Unit Tests (Step 47)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useSkills } from '@/stores/skills.store';
import { linkSkillEvidence, competencyProgress } from '@/services/skills/skillGraph.service';

describe('Graph Linking', () => {
  beforeEach(() => {
    useSkills.setState({ evidence: [] });
  });

  it('links competency to evidence', () => {
    linkSkillEvidence({
      competencyKey: 'system_design',
      evidenceRefId: 'doc-1',
      title: 'Architecture RFC'
    });

    const evidence = useSkills.getState().evidence;
    expect(evidence.length).toBe(1);
    expect(evidence[0].competencyKey).toBe('system_design');
  });

  it('aggregates progress delta and count', () => {
    linkSkillEvidence({
      competencyKey: 'coding',
      evidenceRefId: 'pr-1',
      title: 'PR 1',
      delta: 10
    });
    linkSkillEvidence({
      competencyKey: 'coding',
      evidenceRefId: 'pr-2',
      title: 'PR 2',
      delta: 15
    });

    const prog = competencyProgress('coding');
    expect(prog.count).toBe(2);
    expect(prog.delta).toBe(25);
  });

  it('handles missing delta gracefully', () => {
    linkSkillEvidence({
      competencyKey: 'domain',
      evidenceRefId: 'note-1',
      title: 'Domain note'
    });

    const prog = competencyProgress('domain');
    expect(prog.count).toBe(1);
    expect(prog.delta).toBe(0);
  });

  it('includes goal link if provided', () => {
    linkSkillEvidence({
      competencyKey: 'execution',
      goalId: 'goal-1',
      evidenceRefId: 'task-1',
      title: 'Task completed',
      delta: 5
    });

    const evidence = useSkills.getState().evidence;
    expect(evidence[0].goalId).toBe('goal-1');
  });
});
