import type { PipelineItem } from '@/stores/pipeline.store';

/** Simple score: stage weight + recency decay. */
export function score(item: PipelineItem) {
  const weights = { 
    prospect:0.2, 
    intro_requested:0.35, 
    referred:0.6, 
    screening:0.7, 
    in_process:0.85, 
    offer:1, 
    closed:0 
  };
  const stage = weights[item.stage] ?? 0;
  const days = item.lastActionISO ? (Date.now()-Date.parse(item.lastActionISO))/(86400000) : 30;
  const recency = Math.max(0, 1 - (days/60));
  return Number((0.6*stage + 0.4*recency).toFixed(3));
}
