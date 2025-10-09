/**
 * @fileoverview Export onboarding packet service (Step 45)
 * @module services/onboarding/exportPacket
 */

import type { Plan, Stakeholder, WeeklyReport, RiskItem, LearningItem } from '@/types/onboarding.types';
import { exportHTMLToPDF } from '@/services/export/pdf.service';
import { exportHTMLToGoogleDoc } from '@/services/export/googleDocs.service';

/**
 * Export 30/60/90 packet (PDF or Google Doc).
 * @param opts - Export options
 * @returns PDF URL or Google Doc metadata
 */
export async function exportOnboardingPacket(opts: {
  plan: Plan;
  stakeholders: Stakeholder[];
  reports: WeeklyReport[];
  risks: RiskItem[];
  learning: LearningItem[];
  kind: 'pdf' | 'gdoc';
}): Promise<string | { id: string; url: string; title: string }> {
  const html = [
    `<h1>30/60/90 Plan — ${opts.plan.company ?? ''} — ${opts.plan.role ?? ''}</h1>`,
    `<p>${opts.plan.summary ?? ''}</p>`,
    `<h2>Goals</h2><ul>${opts.plan.goals.map(g => `<li><b>${g.milestone.toUpperCase()}</b> — ${g.title} (${g.priority})</li>`).join('')}</ul>`,
    `<h2>Stakeholders</h2><ul>${opts.stakeholders.map(s => `<li>${s.name} — ${s.role} (P:${s.power ?? '?'}/I:${s.interest ?? '?'})</li>`).join('')}</ul>`,
    `<h2>Risks</h2><ul>${opts.risks.map(r => `<li>${r.title} — ${r.level}</li>`).join('')}</ul>`,
    `<h2>Learning</h2><ul>${opts.learning.map(l => `<li>${l.title} [${l.kind}]</li>`).join('')}</ul>`,
    `<h2>Recent Weekly Report</h2>${opts.reports[0]?.html ?? '<p>—</p>'}`
  ].join('\n');
  
  if (opts.kind === 'pdf') {
    return exportHTMLToPDF(html, 'Onboarding_Packet.pdf', 'en', { returnUrl: true } as any) as Promise<string>;
  } else {
    return exportHTMLToGoogleDoc(html, 'Onboarding 30-60-90');
  }
}
