export interface EventItem {
  id: string;
  title: string;
  dateISO: string;
  location?: string;
  url?: string;
  attendees: string[];    // contact ids
  notes?: string;
  rsvp?: 'yes'|'no'|'maybe';
}
