/**
 * @fileoverview Suppression/unsubscribe service
 * Step 48: Networking CRM & Outreach Sequencer
 */

import type { Suppression } from '@/types/outreach.types';
import { useOutreach } from '@/stores/outreach.store';

export function suppress(email: string, reason: Suppression['reason']){
  const s: Suppression = { 
    id: crypto.randomUUID(), 
    email: email.toLowerCase(), 
    reason, 
    addedAt: new Date().toISOString() 
  };
  
  useOutreach.getState().upsertSuppression(s);
  return s;
}
