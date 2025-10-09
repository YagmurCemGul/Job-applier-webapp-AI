/**
 * @fileoverview Gmail outreach integration service
 * Step 48: Networking CRM & Outreach Sequencer
 */

import type { Prospect, SendLog } from '@/types/outreach.types';
import { useOutreach } from '@/stores/outreach.store';
import { getBearer } from '@/services/integrations/google.oauth.service';
import { buildMime } from '@/services/integrations/gmail.real.service';

/** Send an outreach email via Gmail with consent. */
export async function sendOutreachEmail(opts:{
  accountId:string;
  clientId:string;
  passphrase:string;
  prospect: Prospect;
  subject: string;
  html: string;
  campaignId: string;
  stepId: string;
  variant?: 'A'|'B';
}){
  if (useOutreach.getState().isSuppressed(opts.prospect.email)) {
    throw new Error('Suppressed recipient');
  }
  
  const bearer = await getBearer(opts.accountId, opts.passphrase, opts.clientId);
  const raw = buildMime({ 
    to:[opts.prospect.email!], 
    subject: opts.subject, 
    html: opts.html 
  });
  
  const resp = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', { 
    method:'POST', 
    headers:{ 
      Authorization:`Bearer ${bearer}`, 
      'Content-Type':'application/json' 
    }, 
    body: JSON.stringify({ raw }) 
  });
  
  if (!resp.ok) throw new Error('Gmail send failed');
  
  const msg = await resp.json();
  
  const log: SendLog = { 
    id: crypto.randomUUID(), 
    campaignId: opts.campaignId, 
    prospectId: opts.prospect.id, 
    stepId: opts.stepId, 
    variant: opts.variant, 
    gmailMsgId: msg.id, 
    sentAt: new Date().toISOString(), 
    status:'sent', 
    opens:0, 
    clicks:0, 
    replied:false 
  };
  
  useOutreach.getState().upsertLog(log);
  return log;
}
