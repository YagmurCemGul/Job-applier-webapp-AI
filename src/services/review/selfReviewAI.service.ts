/**
 * @fileoverview AI-powered self-review generation
 * Uses STAR methodology and strong action verbs
 */

import type { SelfReview, ImpactEntry } from '@/types/review.types';
import { aiComplete } from '@/services/features/aiComplete.service';

/**
 * Generate a self-review grounded in impact entries using STAR and strong verbs
 */
export async function generateSelfReview(
  cycleId: string,
  lang: 'en' | 'tr',
  impacts: ImpactEntry[]
): Promise<SelfReview> {
  const prompt = [
    `Write a concise ${lang === 'tr' ? 'Türkçe' : 'English'} self-review using STAR methodology.`,
    ``,
    `Sections:`,
    `- Overview (3-5 sentences summarizing key contributions)`,
    `- Highlights (4-7 bullet points with metrics and impact)`,
    `- Growth Areas (2-4 bullets on areas for improvement)`,
    `- Next Objectives (3-5 bullets on future goals)`,
    ``,
    `Use strong action verbs (e.g., led, architected, delivered, optimized). Avoid filler. Keep total under 600 words.`,
    ``,
    `Ground strictly in these impact items (JSON):`,
    `${JSON.stringify(impacts.slice(0, 20), null, 2)}`
  ].join('\n');
  
  const out = await aiComplete(prompt, { json: false });
  const text = String(out || '');
  
  return materializeSelfReview(cycleId, lang, text);
}

/**
 * Parse AI-generated text into structured self-review
 */
export function materializeSelfReview(
  cycleId: string,
  lang: 'en' | 'tr',
  text: string
): SelfReview {
  const parts = sectionize(text);
  const wc = text.trim().split(/\s+/).length;
  const clarity = Math.max(0.1, Math.min(1, 1 - (wc / 900))); // shorter → clearer (rough heuristic)
  
  return {
    id: crypto.randomUUID(),
    cycleId,
    lang,
    overview: parts.overview,
    highlights: parts.highlights,
    growthAreas: parts.growth,
    nextObjectives: parts.objectives,
    wordCount: wc,
    clarityScore: clarity,
    generatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Extract sections from AI-generated text
 */
function sectionize(t: string) {
  const get = (h: string) =>
    (t.split(new RegExp(`${h}\\s*:?`, 'i'))[1] || '').split(/\n\n|^\s*$/m)[0] || '';
  
  const bullets = (s: string) =>
    s.split(/\n/)
      .map(x => x.replace(/^[-*•]\s*/, '').trim())
      .filter(Boolean);
  
  const ov = /overview/i.test(t) ? get('overview') : t.split('\n')[0];
  const hi = bullets(/highlights/i.test(t) ? get('highlights') : t);
  const gr = bullets(/growth/i.test(t) ? get('growth') : '');
  const no = bullets(/objectives|next steps/i.test(t) ? get('objectives|next steps') : '');
  
  return {
    overview: ov.trim(),
    highlights: hi.slice(0, 7),
    growth: gr.slice(0, 5),
    objectives: no.slice(0, 5)
  };
}
