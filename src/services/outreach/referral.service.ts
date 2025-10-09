/**
 * @fileoverview Warm intro/referral service
 * Step 48: Networking CRM & Outreach Sequencer
 */

import type { Referral } from '@/types/outreach.types';
import { useOutreach } from '@/stores/outreach.store';
import { getBearer } from '@/services/integrations/google.oauth.service';
import { buildMime } from '@/services/integrations/gmail.real.service';

/** Request a warm intro from an introducer via Gmail. */
export async function requestIntro(opts:{
  accountId:string;
  clientId:string;
  passphrase:string;
  introducerEmail:string;
  subject:string;
  html:string;
  prospectId:string;
}){
  const bearer = await getBearer(opts.accountId, opts.passphrase, opts.clientId);
  const raw = buildMime({ 
    to:[opts.introducerEmail], 
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
  
  if (!resp.ok) throw new Error('Intro request send failed');
  
  const ref: Referral = { 
    id: crypto.randomUUID(), 
    prospectId: opts.prospectId, 
    introducerEmail: opts.introducerEmail, 
    introState:'requested' 
  };
  
  useOutreach.getState().upsertReferral(ref);
  return ref;
}
