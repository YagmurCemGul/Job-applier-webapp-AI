/**
 * Inventory Service (Step 47)
 * Manage skill inventory and infer from evidence/goals.
 */

import type { SkillInventoryRow } from '@/types/skills.types';
import { useSkills } from '@/stores/skills.store';
import { goalProgress } from '@/services/perf/evidenceGraph.service'; // Step 46
import { usePerf } from '@/stores/perf.store';

/**
 * Infer inventory hints from linked evidence & goals (local heuristics).
 */
export function inferInventoryFromEvidence(competencyKey: string): Partial<SkillInventoryRow> {
  const links = useSkills.getState().evidence.filter(e => e.competencyKey === competencyKey);
  const delta = links.reduce((a, b) => a + (b.delta || 0), 0);
  
  const goalIds = Array.from(new Set(links.map(l => l.goalId).filter(Boolean) as string[]));
  const goalBoost = goalIds.reduce((a, id) => a + (goalProgress(id).delta > 0 ? 0.25 : 0), 0);
  
  const lastResp = usePerf.getState().responses.at(0);
  const confBump = lastResp?.rubric ? 5 : 0;
  
  return {
    selfLevel: Math.min(4, Math.max(0, (delta > 10 ? 2 : 1) + goalBoost)),
    confidencePct: Math.min(100, 50 + delta + confBump),
    lastEvidenceAt: links.at(0)?.createdAt
  };
}

/**
 * Upsert or initialize an inventory row.
 */
export function upsertInventoryRow(row: Omit<SkillInventoryRow, 'id'>) {
  const existing = useSkills.getState().inventory.find(x => x.competencyKey === row.competencyKey);
  const r: SkillInventoryRow = { 
    id: existing?.id ?? crypto.randomUUID(), 
    ...existing, 
    ...row 
  };
  useSkills.getState().upsertInventory(r);
  return r;
}
