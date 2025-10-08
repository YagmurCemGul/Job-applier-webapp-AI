/**
 * @fileoverview AI action item extraction service.
 * @module services/onboarding/aiActionItems
 */

import { aiComplete } from '@/services/features/aiComplete.service';

/**
 * Extract action items from meeting notes using AI.
 * @param text - Meeting notes
 * @returns Action items array
 */
export async function extractActions(
  text: string
): Promise<Array<{ text: string; owner?: string; dueISO?: string }>> {
  const prompt = `Extract action items as JSON [{text, owner?, dueISO?}] from notes:\n${text}`;
  try {
    const out = await aiComplete(prompt, { json: true });
    return typeof out === 'string' ? JSON.parse(out) : out;
  } catch {
    return [];
  }
}
