/**
 * @fileoverview Prospect enrichment service
 * Step 48: Networking CRM & Outreach Sequencer
 */

import type { Prospect } from '@/types/outreach.types';
import { useOutreach } from '@/stores/outreach.store';

/** Mock enrichment: infer company domain and role seniority from role text. */
export function enrichProspect(id: string){
  const p = useOutreach.getState().prospects.find(x=>x.id===id);
  if (!p) throw new Error('Prospect not found');
  
  const senior = (p.role||'').match(/\b(senior|lead|principal|head)\b/i) ? 'senior' : 'ic';
  const domain = (p.company||'').toLowerCase().replace(/\s+/g,'') + '.com';
  
  const merged: Prospect = { 
    ...p, 
    notes: [p.notes, `enriched:${senior}`, `domain:${domain}`].filter(Boolean).join(' | ') 
  };
  
  useOutreach.getState().upsertProspect(merged);
  return merged;
}
