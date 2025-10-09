import type { IntroEdge } from '@/types/graph.types';
import type { Contact } from '@/types/contacts.types';

/** Suggest introducers who connect user -> target company; naive by company match + strength. */
export function suggestIntroducers(contacts: Contact[], edges: IntroEdge[], targetCompany: string) {
  const pool = contacts.filter(c => (c.company||'').toLowerCase().includes(targetCompany.toLowerCase()));
  return pool.map(c => ({ contactId: c.id, weight: 1 + (c.relationship==='strong'?0.3:c.relationship==='close'?0.5:0) }))
             .sort((a,b)=>b.weight-a.weight).slice(0,5);
}
