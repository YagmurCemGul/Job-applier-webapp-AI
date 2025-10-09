import type { EventItem } from '@/types/events.types';

export function eventToHtml(e: EventItem) {
  const names = (e.attendees||[]).length ? `<p><b>Attendees:</b> ${e.attendees.join(', ')}</p>` : '';
  return `<h2>${e.title}</h2><p>${new Date(e.dateISO).toLocaleString()} — ${e.location||''}</p>${names}${e.url?`<p><a href="${e.url}" target="_blank" rel="noopener">Link</a></p>`:''}`;
}
