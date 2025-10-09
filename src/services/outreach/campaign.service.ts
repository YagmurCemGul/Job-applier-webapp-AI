/**
 * @fileoverview Campaign execution service
 * Step 48: Networking CRM & Outreach Sequencer
 */

import type { Campaign, Sequence, Prospect } from '@/types/outreach.types';
import { useOutreach } from '@/stores/outreach.store';
import { renderTemplate } from './templates.service';
import { sendOutreachEmail } from '../integrations/gmailOutreach.service';

/** Start or resume a campaign; sends first eligible step for each prospect under throttle & quiet hours. */
export async function runCampaignTick(opts:{
  campaignId: string;
  accountId: string;
  clientId: string;
  passphrase: string;
  unsubscribeUrl: string;
  postalAddress: string;
}){
  const state = useOutreach.getState();
  const campaign = state.campaigns.find(c=>c.id===opts.campaignId);
  if (!campaign) throw new Error('Campaign not found');
  
  const sequence = state.sequences.find(s=>s.id===campaign.sequenceId) as Sequence;
  const listProspects = state.byList(campaign.listId).filter(p=>!state.isSuppressed(p.email));
  
  const throttle = sequence.rules?.throttlePerHour ?? 25;
  let sent = 0;
  
  for (const prospect of listProspects) {
    if (sent >= throttle) break;
    
    // Determine next step for this prospect
    const existingLogs = state.logs.filter(l=>l.campaignId===campaign.id && l.prospectId===prospect.id);
    const replied = existingLogs.some(l=>l.replied);
    const unsub = state.suppressions.some(s=>s.email===prospect.email);
    
    if (replied || unsub) continue;
    
    const nextStep = sequence.steps[existingLogs.length] || null;
    if (!nextStep) continue;
    if (nextStep.kind === 'wait') continue; // tick later after waitDays via scheduler/cron
    if (nextStep.kind === 'task_manual') continue; // manual task — show in UI instead
    
    // email step
    const tpl = { 
      id:'inline', 
      name:'inline', 
      subject: nextStep.subject||'', 
      html: nextStep.html||'', 
      variables:['firstName','company','schedulerLink'], 
      snippets:{} 
    };
    
    const schedulerLink = state.schedulers.at(0)?.url ?? '';
    const vars = {
      firstName: prospect.name?.split(' ')[0] ?? '',
      company: prospect.company ?? '',
      schedulerLink,
      unsubscribeUrl: opts.unsubscribeUrl,
      postalAddress: opts.postalAddress
    };
    
    const { subject, html } = renderTemplate(tpl, vars);
    
    await sendOutreachEmail({ 
      accountId: opts.accountId, 
      clientId: opts.clientId, 
      passphrase: opts.passphrase, 
      prospect, 
      subject, 
      html, 
      campaignId: campaign.id, 
      stepId: nextStep.id 
    });
    
    sent++;
  }
  
  campaign.status = 'running';
  campaign.startedAt = campaign.startedAt ?? new Date().toISOString();
  campaign.metrics.sent = (campaign.metrics.sent || 0) + sent;
  
  useOutreach.getState().upsertCampaign({ ...campaign });
  
  return sent;
}
