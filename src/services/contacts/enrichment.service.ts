import type { ContactKind } from '@/types/contacts.types';

/** Tiny, safe enrichment helpers (no external calls). */
export function logoFromCompany(company?: string) {
  if (!company) return undefined;
  const slug = company.toLowerCase().replace(/[^a-z0-9]+/g,'');
  return `https://logo.clearbit.com/${slug}.com`; // purely illustrative; do not fetch automatically
}

export function inferKind(title?: string): ContactKind {
  if (!title) return 'other';
  const t = title.toLowerCase();
  if (t.includes('recruit') || t.includes('talent')) return 'recruiter';
  if (t.includes('manager') || t.includes('lead') || t.includes('head')) return 'hiring_manager';
  if (t.includes('engineer') || t.includes('developer')) return 'engineer';
  if (t.includes('product')) return 'product';
  if (t.includes('design')) return 'designer';
  return 'other';
}
