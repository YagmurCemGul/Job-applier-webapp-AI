/**
 * Frameworks Service (Step 47)
 * Seed and manage role frameworks and competency ladders.
 */

import type { RoleFramework, Competency, LevelKey } from '@/types/skills.types';
import { useSkills } from '@/stores/skills.store';

/**
 * Seed a default IC framework (idempotent).
 */
export function seedDefaultFramework() {
  if (useSkills.getState().frameworks.length) return;
  
  const ladder: LevelKey[] = ['L3', 'L4', 'L5', 'L6'];
  
  const mk = (
    key: string, 
    title: string, 
    kind: Competency['kind'], 
    map: Partial<Record<LevelKey, number>>
  ): Competency => ({
    id: crypto.randomUUID(),
    key,
    title,
    kind,
    expectedByLevel: map,
    rubricKey: key === 'system_design' ? 'structure' : key === 'execution' ? 'ownership' : 'impact'
  });
  
  const competencies: Competency[] = [
    mk('system_design', 'System Design', 'technical', { L3: 1, L4: 2, L5: 3, L6: 4 }),
    mk('coding', 'Coding & Quality', 'technical', { L3: 1, L4: 2, L5: 3, L6: 4 }),
    mk('execution', 'Execution & Delivery', 'process', { L3: 1, L4: 2, L5: 3, L6: 4 }),
    mk('communication', 'Communication', 'people', { L3: 1, L4: 2, L5: 3, L6: 4 }),
    mk('domain', 'Domain Expertise', 'domain', { L3: 1, L4: 2, L5: 3, L6: 4 })
  ];
  
  const framework: RoleFramework = {
    id: crypto.randomUUID(),
    role: 'Software Engineer',
    ladder,
    competencies
  };
  
  useSkills.getState().upsertFramework(framework);
  return framework;
}
