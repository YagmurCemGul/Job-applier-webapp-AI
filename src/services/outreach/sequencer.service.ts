import type { Sequence, SequenceRun } from '@/types/outreach.types';
import { useOutreach } from '@/stores/outreach.store';
import { useContacts } from '@/stores/contacts.store';
import { getBearer } from '@/services/integrations/google.oauth.service';
import { buildMime } from '@/services/integrations/gmail.real.service';
import { personalize } from './templates.service';

/** Queue/send an email step respecting rate limits & quiet hours; returns updated run. */
export async function processSequenceStep(
  run: SequenceRun, 
  seq: Sequence, 
  stepId: string, 
  accountId: string, 
  passphrase: string, 
  clientId: string
) {
  const step = seq.steps.find(s=>s.id===stepId)!;
  const contact = useContacts.getState().getById(run.contactId)!;
  const now = new Date(); const hh = now.getHours();
  
  if (seq.quiet && (hh >= (seq.quiet.endHH) || hh < (seq.quiet.startHH))) {
    append(run, stepId, 'skipped', 'quiet-hours'); 
    return run;
  }
  
  if (step.channel !== 'email') { 
    append(run, stepId, 'queued'); 
    return run; 
  }

  const tpl = useOutreach.getState().templates.find(t=>t.id===step.templateId);
  if (!tpl) { 
    append(run, stepId, 'error', 'template-missing'); 
    return run; 
  }

  const vars = {
    FirstName: contact.name.split(' ')[0] || 'there',
    YourRole: '',
    YourLink: '',
    Mutual: ''
  };
  
  const { subject, html } = personalize(tpl, vars);
  const bearer = await getBearer(accountId, passphrase, clientId);
  const body = {
    id: crypto.randomUUID(), 
    accountId, 
    to:[contact.email||''], 
    subject,
    html: html + (seq.unsubscribeFooter ? `<p style="color:#94a3b8;font-size:12px">If you prefer not to hear from me, reply "unsubscribe".</p>`:'')
  };
  
  const raw = buildMime(body);
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', { 
    method:'POST', 
    headers:{ Authorization:`Bearer ${bearer}`,'Content-Type':'application/json' }, 
    body: JSON.stringify({ raw }) 
  });
  
  append(run, stepId, res.ok ? 'sent' : 'error');
  useOutreach.getState().updateRun(run.id, { history: run.history });
  return run;
}

function append(run: SequenceRun, stepId: string, status: 'queued'|'sent'|'skipped'|'error', note?: string){
  run.history = [{ at:new Date().toISOString(), stepId, status, note }, ...run.history];
}
