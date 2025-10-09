/**
 * @fileoverview Campaign report export service
 * Step 48: Networking CRM & Outreach Sequencer
 */

import type { Campaign, CampaignReportExport } from '@/types/outreach.types';
import { exportHTMLToPDF } from '@/services/export/pdf.service';
import { exportHTMLToGoogleDoc } from '@/services/export/googleDocs.service';
import { useOutreach } from '@/stores/outreach.store';

/** Export campaign performance report. */
export async function exportCampaignReport(campaignId: string, kind:'pdf'|'gdoc'){
  const camp = useOutreach.getState().campaigns.find(c=>c.id===campaignId) as Campaign;
  
  const html = [
    `<h1>Campaign Report — ${camp.name}</h1>`,
    `<p>Status: ${camp.status}</p>`,
    `<ul>`,
    ...Object.entries(camp.metrics).map(([k,v])=> `<li>${k}: ${v}</li>`),
    `</ul>`
  ].join('\n');
  
  const res = kind==='pdf' 
    ? await exportHTMLToPDF(html, 'Campaign_Report.pdf', 'en', { returnUrl: true } as any)
    : await exportHTMLToGoogleDoc(html, 'Campaign Report');
  
  const exp: CampaignReportExport = { 
    id: crypto.randomUUID(), 
    url: (res as any)?.url, 
    kind, 
    createdAt: new Date().toISOString() 
  };
  
  useOutreach.getState().upsertExport(exp);
  return exp;
}
