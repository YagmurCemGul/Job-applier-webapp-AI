/**
 * @fileoverview Prospect management service
 * Step 48: Networking CRM & Outreach Sequencer
 */

import type { Prospect, ProspectList } from '@/types/outreach.types';
import { useOutreach } from '@/stores/outreach.store';

/** Create or update a prospect; dedupe by email+company. */
export function upsertProspect(p: Omit<Prospect,'id'|'tags'|'status'> & Partial<Pick<Prospect,'tags'|'status'>>){
  const existing = p.email ? useOutreach.getState().prospects.find(x=>x.email?.toLowerCase()===p.email!.toLowerCase() && x.company===p.company) : undefined;
  const merged: Prospect = { 
    id: existing?.id ?? crypto.randomUUID(), 
    tags: existing?.tags ?? [], 
    status: existing?.status ?? 'new', 
    ...existing, 
    ...p 
  };
  useOutreach.getState().upsertProspect(merged);
  return merged;
}

/** Create a list with optional seed prospects. */
export function createList(name: string, items?: Prospect[]){
  const list: ProspectList = { 
    id: crypto.randomUUID(), 
    name, 
    description: '', 
    count: items?.length || 0 
  };
  useOutreach.getState().upsertList(list);
  if (items?.length) {
    items.forEach(p => {
      useOutreach.getState().upsertProspect({ 
        ...p, 
        listIds: [...(p.listIds||[]), list.id] 
      });
    });
  }
  return list;
}
