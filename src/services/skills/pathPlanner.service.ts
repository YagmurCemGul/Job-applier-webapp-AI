/**
 * Path Planner Service (Step 47)
 * Generate personalized learning paths from current to target level.
 */

import type { LearningPath, PathStep, LevelKey } from '@/types/skills.types';
import { useSkills } from '@/stores/skills.store';

/**
 * Greedy path planner: pick resources by difficulty ascending, cover prereqs first, cap daily minutes.
 */
export function planPath(target: LevelKey, dailyCapMin = 45): LearningPath {
  const fw = useSkills.getState().frameworks[0];
  if (!fw) throw new Error('No framework');
  
  const steps: PathStep[] = [];
  let total = 0;
  
  for (const c of fw.competencies) {
    const current = useSkills.getState().inventory.find(i => i.competencyKey === c.key)?.selfLevel ?? 0;
    const targetBar = c.expectedByLevel[target] ?? 0;
    
    if (current >= targetBar) continue;
    
    const pool = useSkills.getState().resources
      .filter(r => r.competencyKeys.includes(c.key))
      .sort((a, b) => a.difficulty - b.difficulty);
    
    let need = targetBar - current;
    
    for (const r of pool) {
      const minutes = r.estMinutes ?? 20;
      steps.push({
        id: crypto.randomUUID(),
        competencyKey: c.key,
        resourceId: r.id,
        estMinutes: minutes
      });
      total += minutes;
      if (--need <= 0) break;
      if (minutes > dailyCapMin) break;
    }
  }
  
  return {
    id: crypto.randomUUID(),
    targetLevel: target,
    steps,
    totalMinutes: total,
    createdAt: new Date().toISOString()
  };
}
