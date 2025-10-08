/**
 * @fileoverview Sentiment analysis service using AI orchestrator
 */

import { aiComplete } from '@/services/features/aiComplete.service';

/**
 * Analyze sentiment of feedback text
 * Returns 'positive', 'neutral', or 'negative'
 */
export async function analyzeSentiment(
  text: string
): Promise<'positive' | 'neutral' | 'negative'> {
  try {
    const prompt = `Label the sentiment of the following text as POSITIVE, NEUTRAL, or NEGATIVE. Return only the label.

Text:
${text}`;

    const out = await aiComplete(prompt, { json: false });
    const result = String(out || '').toUpperCase();
    
    if (result.includes('POS')) return 'positive';
    if (result.includes('NEG')) return 'negative';
    return 'neutral';
  } catch {
    return 'neutral';
  }
}

/**
 * Generate AI summary of all feedback responses
 */
export async function summarizeFeedback(feedbacks: string[]): Promise<string> {
  if (feedbacks.length === 0) return 'No feedback to summarize.';
  
  try {
    const prompt = `Summarize the following feedback responses into key themes (strengths, growth areas, patterns). Be concise (3-5 bullet points).

Feedback:
${feedbacks.map((f, i) => `${i + 1}. ${f}`).join('\n\n')}`;

    const out = await aiComplete(prompt, { json: false });
    return String(out || 'Unable to generate summary.');
  } catch {
    return 'Error generating summary.';
  }
}
