/**
 * Export Packet Service (Step 47)
 * Export Growth Packet to PDF or Google Doc.
 */

import type { LearningPath, Badge, SkillInventoryRow } from '@/types/skills.types';
import { exportHTMLToPDF } from '@/services/export/pdf.service';
import { exportHTMLToGoogleDoc } from '@/services/export/googleDocs.service';

/**
 * Export Growth Packet (PDF or Google Doc).
 */
export async function exportGrowthPacket(opts: {
  role: string;
  targetLevel: string;
  path: LearningPath;
  inventory: SkillInventoryRow[];
  badges: Badge[];
  disclaimer: string;
  kind: 'pdf' | 'gdoc';
}) {
  const html = [
    `<h1>Growth Plan — ${opts.role} → ${opts.targetLevel}</h1>`,
    `<p style="color:#ef4444">${opts.disclaimer}</p>`,
    `<h2>Inventory</h2><ul>${opts.inventory.map(i => `<li>${i.competencyKey}: level ${i.selfLevel} (${i.confidencePct}% conf.)</li>`).join('')}</ul>`,
    `<h2>Learning Path</h2><p>Total: ${Math.round(opts.path.totalMinutes / 60)}h ${opts.path.totalMinutes % 60}m</p>`,
    `<ol>${opts.path.steps.map(s => `<li>${s.competencyKey} via resource ${s.resourceId} — ${s.estMinutes}m</li>`).join('')}</ol>`,
    `<h2>Badges</h2><ul>${opts.badges.map(b => `<li>${b.title} — ${b.tier}</li>`).join('') || '<li>—</li>'}</ul>`
  ].join('\n');
  
  return opts.kind === 'pdf'
    ? exportHTMLToPDF(html, 'Growth_Packet.pdf', 'en', { returnUrl: true })
    : exportHTMLToGoogleDoc(html, 'Career Growth Packet');
}
