/**
 * @fileoverview A/B testing service
 * Step 48: Networking CRM & Outreach Sequencer
 */

import type { Sequence, VariantKey, AbGoal } from '@/types/outreach.types';
import { useOutreach } from '@/stores/outreach.store';

/** Compute variant winner via simple two-proportion z-test proxy; return winning variant or null if inconclusive. */
export function pickAbWinner(seq: Sequence, goal: AbGoal){
  const logs = useOutreach.getState().logs.filter(l=> seq.steps.some(s=>s.id===l.stepId));
  
  const count = (v:VariantKey) => logs.filter(l=>l.variant===v).length;
  const success = (v:VariantKey) => logs.filter(l=>
    l.variant===v && (
      goal==='open_rate'? (l.opens||0)>0 : 
      goal==='reply_rate'? l.replied : 
      (l.clicks||0)>0
    )
  ).length;
  
  const nA = Math.max(1, count('A'));
  const nB = Math.max(1, count('B'));
  const pA = success('A')/nA;
  const pB = success('B')/nB;
  
  const se = Math.sqrt((pA*(1-pA))/nA + (pB*(1-pB))/nB);
  const z = (pA - pB) / Math.max(1e-6, se);
  const winner = Math.abs(z) >= 1.96 ? (pA > pB ? 'A' : 'B') : null; // ~95% level
  
  return { 
    z: Number(z.toFixed(2)), 
    winner,
    pA: Number(pA.toFixed(3)),
    pB: Number(pB.toFixed(3))
  };
}
