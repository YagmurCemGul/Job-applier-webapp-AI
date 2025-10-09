import type { Template } from '@/types/outreach.types';

export const DEFAULT_VARS = [
  { key:'FirstName', label:'Recipient First Name', sample:'Alex' },
  { key:'YourRole', label:'Your Role', sample:'Senior Frontend Engineer' },
  { key:'YourLink', label:'Portfolio/Case Link', sample:'https://your.site/cases/project-alpha' },
  { key:'Mutual', label:'Mutual Contact', sample:'Jordan' }
];

export function personalize(tpl: Template, vars: Record<string,string>) {
  const sub = tpl.subject.replace(/\{\{(\w+)\}\}/g, (_,k)=> vars[k] ?? '');
  const html = tpl.bodyHtml.replace(/\{\{(\w+)\}\}/g, (_,k)=> vars[k] ?? '');
  return { subject: sub, html };
}
