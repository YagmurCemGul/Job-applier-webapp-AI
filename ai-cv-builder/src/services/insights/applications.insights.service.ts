/**
 * Applications Insights Service
 * Analytics and funnel metrics for application tracking
 */

import { useApplicationsStore } from '@/stores/applications.store';
import type { AppStage } from '@/types/applications.types';

export interface FunnelMetrics {
  applied: number;
  viewed: number;
  interview: number;
  offer: number;
  rejected: number;
  hold: number;
}

/**
 * Get application funnel metrics
 */
export function funnel(): FunnelMetrics {
  const list = useApplicationsStore.getState().items;
  
  const countByStage = (stage: AppStage) =>
    list.filter(x => x.stage === stage).length;
  
  return {
    applied: countByStage('applied'),
    viewed: countByStage('viewed'),
    interview: countByStage('interview'),
    offer: countByStage('offer'),
    rejected: countByStage('rejected'),
    hold: countByStage('hold')
  };
}

/**
 * Get conversion rates between stages
 */
export function conversionRates() {
  const metrics = funnel();
  const total = Object.values(metrics).reduce((sum, val) => sum + val, 0);
  
  if (total === 0) return null;
  
  return {
    appliedToViewed: metrics.applied > 0 ? metrics.viewed / metrics.applied : 0,
    viewedToInterview: metrics.viewed > 0 ? metrics.interview / metrics.viewed : 0,
    interviewToOffer: metrics.interview > 0 ? metrics.offer / metrics.interview : 0
  };
}

/**
 * Get average time in each stage (stub - requires historical tracking)
 */
export function averageTimeInStage(): Record<AppStage, number> {
  // TODO: Implement when we have stage change history
  return {
    applied: 0,
    viewed: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    hold: 0
  };
}
