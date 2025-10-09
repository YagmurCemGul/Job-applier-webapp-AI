import type { Contact } from '@/types/contacts.types';

/** Parse minimal CSV (name,email,company,title,city,tags) into contacts. */
export function parseCSV(csv: string): Contact[] {
  const lines = csv.trim().split(/\r?\n/);
  const hdr = lines.shift()?.split(',').map(h=>h.trim().toLowerCase()) ?? [];
  const idx = (k:string)=> hdr.indexOf(k);
  return lines.map(l => {
    const c = l.split(',').map(x=>x.trim());
    const name = c[idx('name')] ?? '';
    return {
      id: crypto.randomUUID(), name,
      email: c[idx('email')] || undefined,
      company: c[idx('company')] || undefined,
      title: c[idx('title')] || undefined,
      city: c[idx('city')] || undefined,
      tags: (c[idx('tags')] || '').split(/;|\|/).map(s=>s.trim()).filter(Boolean),
      kind: 'other', relationship: 'weak',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    } as Contact;
  });
}

/** Parse minimal VCF (vCard 3.0/4.0) for FN, EMAIL, ORG, TITLE, TEL. */
export function parseVCF(vcf: string): Contact[] {
  const blocks = vcf.split(/END:VCARD/i).map(b=>b.trim()).filter(Boolean);
  return blocks.map(b => {
    const get = (k:RegExp)=> b.match(new RegExp(`${k.source}.*?:(.+)`, 'i'))?.[1]?.trim();
    const name = get(/FN/i) ?? 'Unknown';
    const email = get(/EMAIL/i);
    const tel = get(/TEL/i);
    const org = get(/ORG/i);
    const title = get(/TITLE/i);
    return { id: crypto.randomUUID(), name, email, phone: tel, company: org, title, tags: [], kind:'other', relationship:'weak', createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() } as Contact;
  });
}
