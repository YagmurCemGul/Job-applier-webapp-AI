import type { Contact } from '@/types/contacts.types';

export function dedupeByEmail(a: Contact[], b: Contact[]) {
  const existing = new Map(a.map(x => [String(x.email||'').toLowerCase(), x]));
  const merged: Contact[] = [...a];
  for (const c of b) {
    const key = String(c.email||'').toLowerCase();
    if (key && existing.has(key)) {
      const base = existing.get(key)!;
      Object.assign(base, { name: base.name || c.name, company: base.company || c.company, title: base.title || c.title, city: base.city || c.city });
    } else merged.push(c);
  }
  return merged;
}
