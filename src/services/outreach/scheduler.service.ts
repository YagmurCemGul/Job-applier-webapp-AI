/**
 * @fileoverview Scheduler link service
 * Step 48: Networking CRM & Outreach Sequencer
 */

import type { SchedulerLink } from '@/types/outreach.types';
import { useOutreach } from '@/stores/outreach.store';
import { getBearer } from '@/services/integrations/google.oauth.service';
import { calendarCreate } from '@/services/integrations/calendar.real.service';

/** Create a simple bookable slot generator: returns a static link that proposes user's preferred window. */
export async function createSchedulerLink(opts:{
  accountId:string;
  clientId:string;
  passphrase:string;
  tz:string;
  durationMin:number;
  title:string;
}){
  // For v1 we generate a "suggested time" calendar event template and return a pseudo URL (local route) the prospect can reply to.
  const bearer = await getBearer(opts.accountId, opts.passphrase, opts.clientId);
  const whenISO = new Date().toISOString();
  
  // Create a hold event
  await calendarCreate(bearer, { 
    title: `${opts.title} (Hold)`, 
    whenISO, 
    durationMin: opts.durationMin 
  });
  
  const url = `${location.origin}/schedule/${crypto.randomUUID()}`; // local route for acknowledgement
  
  const link: SchedulerLink = { 
    id: crypto.randomUUID(), 
    title: opts.title, 
    tz: opts.tz, 
    durationMin: opts.durationMin, 
    url, 
    availabilityHint: 'Mon–Thu 10:00–16:00' 
  };
  
  useOutreach.getState().upsertScheduler(link);
  return link;
}
