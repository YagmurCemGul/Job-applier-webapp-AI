/**
 * @fileoverview Email template service
 * Step 48: Networking CRM & Outreach Sequencer
 */

import type { Template } from '@/types/outreach.types';
import { useOutreach } from '@/stores/outreach.store';

/** Seed default compliant templates (idempotent). */
export function seedTemplates(){
  if (useOutreach.getState().templates.length) return;
  
  const baseFooter = '<p style="color:#6b7280;font-size:12px">You are receiving this because we believe this is relevant to your role. <a href="{{unsubscribeUrl}}">Unsubscribe</a> • {{postalAddress}}</p>';
  
  const mk = (name:string, subject:string, html:string, variables:string[]): Template =>
    ({ 
      id: crypto.randomUUID(), 
      name, 
      subject, 
      html, 
      footer: baseFooter, 
      variables, 
      snippets: { intro: 'Hope your week is going well!' } 
    });
  
  useOutreach.getState().upsertTemplate(mk(
    'Warm Intro Request',
    'Could you introduce me to {{targetName}} at {{company}}?',
    '<p>Hi {{introducerFirstName}},</p><p>Would you be open to introducing me to {{targetName}} ({{role}}) at {{company}}? I wrote a short blurb below you can forward.</p><p>{{forwardBlurb}}</p><p>Thanks so much!</p>',
    ['introducerFirstName','targetName','role','company','forwardBlurb']
  ));
  
  useOutreach.getState().upsertTemplate(mk(
    'Direct Outreach — Problem/Solution',
    '{{firstName}}, quick question about {{problem}}',
    '<p>Hi {{firstName}},</p><p>{{snippet:intro}}</p><p>I noticed {{problemObservation}}. I built {{solution}} that {{benefit}}.</p><p>Open to a quick {{duration}} chat? {{schedulerLink}}</p>',
    ['firstName','problem','problemObservation','solution','benefit','duration','schedulerLink']
  ));
}

/** Render template HTML with variables and snippets. */
export function renderTemplate(tpl: Template, vars: Record<string,string>){
  let html = tpl.html + (tpl.footer ? ('\n' + tpl.footer) : '');
  
  // snippets
  html = html.replace(/\{\{snippet:([\w-]+)\}\}/g, (_, key) => tpl.snippets?.[key] ?? '');
  
  // variables
  html = html.replace(/\{\{([\w]+)\}\}/g, (_, k) => vars[k] ?? '');
  
  const subject = tpl.subject.replace(/\{\{([\w]+)\}\}/g, (_, k) => vars[k] ?? '');
  
  return { subject, html };
}
