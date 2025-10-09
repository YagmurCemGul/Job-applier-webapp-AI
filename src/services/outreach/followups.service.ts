import { calendarCreate } from '@/services/integrations/calendar.real.service';
import { getBearer } from '@/services/integrations/google.oauth.service';

export async function scheduleFollowUp(
  accountId: string, 
  clientId: string, 
  passphrase: string, 
  label: string, 
  whenISO: string, 
  attendees?: string[]
) {
  const bearer = await getBearer(accountId, passphrase, clientId);
  return await calendarCreate(bearer, { 
    title: label, 
    whenISO, 
    durationMin: 15, 
    attendees: attendees ?? [] 
  });
}
