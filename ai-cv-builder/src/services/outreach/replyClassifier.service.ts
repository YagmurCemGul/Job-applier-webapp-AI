/**
 * AI-powered email reply classifier service
 * Uses Step 31 AI orchestrator to classify reply intent
 */

/**
 * Classify email reply intent using AI
 * Returns label (POSITIVE, NEUTRAL, NEGATIVE, SCHEDULING, OUT_OF_OFFICE) and confidence
 */
export async function classifyReply(text: string): Promise<{
  label: string;
  confidence: number;
}> {
  const prompt = `Classify the email reply into one of: POSITIVE, NEUTRAL, NEGATIVE, SCHEDULING, OUT_OF_OFFICE. Return JSON {label, confidence}. Text:\n${text}`;

  try {
    // Try to import aiComplete service (Step 31)
    const { aiComplete } = await import('@/services/features/aiComplete.service');
    
    const out = await aiComplete(prompt, { json: true });
    const obj = typeof out === 'string' ? JSON.parse(out) : out;
    
    const label = String(obj.label ?? 'NEUTRAL');
    const confidence = Number(obj.confidence ?? 0.6);
    
    return { label, confidence };
  } catch (error) {
    // Fallback if AI service not available
    console.warn('AI classifier unavailable, using fallback:', error);
    return { label: 'NEUTRAL', confidence: 0.5 };
  }
}

/**
 * Simple rule-based fallback classifier
 * Used when AI service is unavailable
 */
export function classifyReplyFallback(text: string): {
  label: string;
  confidence: number;
} {
  const lower = text.toLowerCase();

  // Out of office patterns
  if (
    lower.includes('out of office') ||
    lower.includes('automatic reply') ||
    lower.includes('away from')
  ) {
    return { label: 'OUT_OF_OFFICE', confidence: 0.9 };
  }

  // Scheduling patterns
  if (
    lower.includes('schedule') ||
    lower.includes('meeting') ||
    lower.includes('available') ||
    lower.includes('calendar')
  ) {
    return { label: 'SCHEDULING', confidence: 0.7 };
  }

  // Positive patterns
  if (
    lower.includes('interested') ||
    lower.includes('yes') ||
    lower.includes('sounds good') ||
    lower.includes('thank you')
  ) {
    return { label: 'POSITIVE', confidence: 0.7 };
  }

  // Negative patterns
  if (
    lower.includes('not interested') ||
    lower.includes('no thank') ||
    lower.includes('unsubscribe')
  ) {
    return { label: 'NEGATIVE', confidence: 0.8 };
  }

  return { label: 'NEUTRAL', confidence: 0.5 };
}
