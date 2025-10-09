/**
 * Narrative Writer Service
 * 
 * Generates bias-aware, evidence-backed self-review narratives.
 */

import type { NarrativeDoc } from '@/types/perf.types';
import { sanitizeLanguage } from './biasGuard.service';
import { aiComplete } from '@/services/features/aiComplete.service';
import { goalProgress } from './evidenceGraph.service';

/**
 * Compose a structured, bias-aware self-review narrative.
 */
export async function writeNarrative(input: {
  cycleId?: string;
  title: string;
  bullets: string[];
  quotes?: string[];
  goalIds?: string[];
}): Promise<NarrativeDoc> {
  const progress = (input.goalIds ?? []).map((id) => {
    const p = goalProgress(id);
    return `Goal ${id}: ${p.delta >= 0 ? '+' : ''}${p.delta} metric across ${p.count} artifact(s)`;
  });
  const prompt = [
    'Write a concise self-review with sections: Scope, Results, Collaboration, Growth, Next Half. Use neutral, bias-aware phrasing.',
    'Include 3–7 bullets under Results with metrics. Lace in quotes as evidence.',
    'Return HTML with <h2> sections and <ul> lists.',
    'Bullets:\n' + input.bullets.join('\n'),
    input.quotes?.length ? 'Quotes:\n' + input.quotes.join('\n') : '',
    progress.length ? 'Progress:\n' + progress.join('\n') : '',
  ].join('\n');
  const html = sanitizeLanguage(String((await aiComplete(prompt)) || '<p>—</p>'));
  const doc: NarrativeDoc = {
    id: crypto.randomUUID(),
    cycleId: input.cycleId,
    title: input.title,
    html,
    lastEditedISO: new Date().toISOString(),
  };
  return doc;
}
