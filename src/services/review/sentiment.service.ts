import { aiRoute } from '@/services/ai/router.service'

/**
 * Return 'positive'|'neutral'|'negative' for a block of feedback text
 */
export async function analyzeSentiment(text: string): Promise<'positive' | 'neutral' | 'negative'> {
  try {
    const result = await aiRoute(
      {
        task: 'generate',
        prompt: `Label as POSITIVE, NEUTRAL, or NEGATIVE. Return only the label.\nText:\n${text}`,
        temperature: 0.1,
        maxTokens: 10,
      },
      { allowCache: true }
    )

    if (!result.ok || !result.text) {
      return 'neutral'
    }

    const t = String(result.text || '').toUpperCase()
    return t.includes('POS') ? 'positive' : t.includes('NEG') ? 'negative' : 'neutral'
  } catch {
    return 'neutral'
  }
}
