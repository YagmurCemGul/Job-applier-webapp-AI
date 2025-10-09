/**
 * @fileoverview Weekly report composition service (Step 45)
 * @module services/onboarding/weeklyReport
 */

import type { WeeklyReport, SmartGoal } from '@/types/onboarding.types';
import { aiComplete } from '@/services/features/aiComplete.service';
import { smartBullet } from './smartGoal.service';

/**
 * Compose a weekly report (HTML) from goals and notes.
 * @param goals - SMART goals to include
 * @param notes - Optional notes for risks, asks, next week
 * @returns Weekly report
 */
export async function composeWeekly(
  goals: SmartGoal[],
  notes?: { risks?: string[]; asks?: string[]; next?: string[] }
): Promise<WeeklyReport> {
  const bullets = goals
    .filter(g => g.status === 'in_progress' || g.status === 'done')
    .slice(0, 6)
    .map(smartBullet);
  
  const prompt = `Create a concise weekly status with sections: Accomplishments (bulleted), Risks (bulleted), Asks (bulleted), Next Week (bulleted). Use these bullets:\n${bullets.join('\n')}`;
  const html = String(await aiComplete(prompt) || '');
  
  return {
    id: crypto.randomUUID(),
    weekStartISO: new Date().toISOString(),
    accomplishments: bullets,
    risks: notes?.risks || [],
    asks: notes?.asks || [],
    nextWeek: notes?.next || [],
    html
  };
}

/**
 * Send weekly email via Gmail (stub).
 * @param bearer - OAuth bearer token
 * @param from - Sender email
 * @param recipients - Recipient emails
 * @param subject - Email subject
 * @param html - Email HTML body
 */
export async function sendWeeklyEmail(
  bearer: string,
  from: string,
  recipients: string[],
  subject: string,
  html: string
): Promise<{ id: string }> {
  // Stub: In production, this would use Gmail API
  console.log('Sending weekly email:', { from, recipients, subject });
  return { id: `gmail_${Date.now()}` };
}
