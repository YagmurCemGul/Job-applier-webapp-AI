export type ContactKind = 'recruiter'|'hiring_manager'|'engineer'|'designer'|'product'|'alumni'|'mentor'|'other';
export type Relationship = 'weak'|'casual'|'strong'|'close';

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  city?: string;
  tags: string[];
  kind: ContactKind;
  relationship: Relationship;
  lastTouchedISO?: string;
  introducedById?: string;
  notes?: string;
  avatarUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  createdAt: string;
  updatedAt: string;
}
