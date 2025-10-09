/**
 * Skill Graph Service (Step 47)
 * Link competencies to evidence and track progress.
 */

import type { SkillEvidenceLink } from '@/types/skills.types';
import { useSkills } from '@/stores/skills.store';

/**
 * Link competency → evidence (goal/evidence) with optional delta.
 */
export function linkSkillEvidence(e: Omit<SkillEvidenceLink, 'id' | 'createdAt'>) {
  const link: SkillEvidenceLink = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...e
  };
  useSkills.getState().upsertEvidence(link);
  return link;
}

/**
 * Aggregate competency progress from evidence deltas.
 */
export function competencyProgress(competencyKey: string) {
  const rows = useSkills.getState().evidence.filter(e => e.competencyKey === competencyKey);
  const delta = rows.reduce((a, b) => a + (b.delta || 0), 0);
  return { count: rows.length, delta };
}
