/**
 * Calendar Skills Integration Service (Step 47)
 * Schedule study sessions from learning paths.
 */

import { getBearer } from '@/services/integrations/google.oauth.service';
import { calendarCreate } from '@/services/integrations/calendar.real.service';
import { withinQuietHours } from '@/services/integrations/timezone.service';

/**
 * Schedule study sessions from a path (consent-first).
 */
export async function scheduleStudySessions(opts: {
  accountId: string;
  clientId: string;
  passphrase: string;
  tz: string;
  startISO: string;
  dailyMinutes: number;
  days: number;
  title?: string;
}) {
  const bearer = await getBearer(opts.accountId, opts.passphrase, opts.clientId);
  const out = [];
  const start = new Date(opts.startISO);
  
  for (let d = 0; d < opts.days; d++) {
    const when = new Date(start);
    when.setDate(start.getDate() + d);
    when.setHours(9, 0, 0, 0);
    
    let whenISO = when.toISOString();
    
    if (withinQuietHours(whenISO, opts.tz)) {
      const t = new Date(whenISO);
      t.setHours(10);
      whenISO = t.toISOString();
    }
    
    out.push(await calendarCreate(bearer, {
      title: opts.title ?? 'Study Session',
      whenISO,
      durationMin: opts.dailyMinutes
    }));
  }
  
  return out;
}
