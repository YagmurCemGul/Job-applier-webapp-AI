/**
 * Badges Service (Step 47)
 * Award badges based on attempts and inventory thresholds.
 */

import type { Badge } from '@/types/skills.types';
import { useSkills } from '@/stores/skills.store';

/**
 * Award badges based on attempts and inventory thresholds.
 */
export function evaluateBadges(competencyKey: string) {
  const inv = useSkills.getState().inventory.find(i => i.competencyKey === competencyKey);
  const attempts = useSkills.getState().attempts.filter(a => {
    const asmt = useSkills.getState().assessments.find(x => x.id === a.assessmentId);
    return asmt?.competencyKey === competencyKey && (a.scorePct ?? 0) >= (asmt?.passScore ?? 70);
  });
  
  const tier = inv && inv.selfLevel >= 3 ? 'gold' : attempts.length >= 2 ? 'silver' : attempts.length >= 1 ? 'bronze' : undefined;
  if (!tier) return [];
  
  const b: Badge = {
    id: crypto.randomUUID(),
    tier,
    title: `${competencyKey.toUpperCase()} ${tier}`,
    description: 'Milestone achieved',
    awardedAt: new Date().toISOString(),
    competencyKey
  };
  
  useSkills.getState().upsertBadge(b);
  return [b];
}
