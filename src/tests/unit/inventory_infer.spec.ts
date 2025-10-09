/**
 * Inventory Inference Unit Tests (Step 47)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useSkills } from '@/stores/skills.store';
import { usePerf } from '@/stores/perf.store';
import { inferInventoryFromEvidence } from '@/services/skills/inventory.service';
import { linkSkillEvidence } from '@/services/skills/skillGraph.service';

describe('Inventory Inference', () => {
  beforeEach(() => {
    useSkills.setState({ evidence: [], inventory: [] });
    usePerf.setState({ responses: [] });
  });

  it('infers level and confidence from evidence deltas', () => {
    linkSkillEvidence({
      competencyKey: 'system_design',
      evidenceRefId: 'artifact-1',
      title: 'Design doc',
      delta: 15
    });

    const inferred = inferInventoryFromEvidence('system_design');
    expect(inferred.selfLevel).toBeGreaterThan(0);
    expect(inferred.confidencePct).toBeGreaterThan(50);
  });

  it('populates lastEvidenceAt from most recent link', () => {
    linkSkillEvidence({
      competencyKey: 'coding',
      evidenceRefId: 'pr-1',
      title: 'PR merged',
      delta: 5
    });

    const inferred = inferInventoryFromEvidence('coding');
    expect(inferred.lastEvidenceAt).toBeDefined();
  });

  it('boosts confidence when rubric feedback exists', () => {
    usePerf.setState({ responses: [{ id: '1', rubric: { clarity: 4, impact: 3 } } as any] });
    
    linkSkillEvidence({
      competencyKey: 'communication',
      evidenceRefId: 'artifact-1',
      title: 'Presentation',
      delta: 0
    });

    const inferred = inferInventoryFromEvidence('communication');
    expect(inferred.confidencePct).toBeGreaterThanOrEqual(55); // 50 base + 5 bump
  });

  it('returns defaults when no evidence', () => {
    const inferred = inferInventoryFromEvidence('nonexistent');
    expect(inferred.selfLevel).toBeDefined();
    expect(inferred.confidencePct).toBeDefined();
  });
});
