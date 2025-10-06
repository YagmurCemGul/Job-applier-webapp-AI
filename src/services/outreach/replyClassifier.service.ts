import { aiRoute } from '@/services/ai/router.service'

/**
 * Classify reply intent with Step 31 AI
 * Returns label + confidence
 */
export async function classifyReply(text: string): Promise<{
  label: string
  confidence: number
}> {
  const prompt = `Classify the email reply into one of: POSITIVE, NEUTRAL, NEGATIVE, SCHEDULING, OUT_OF_OFFICE. Return JSON {label, confidence}. Text:\n${text}`

  try {
    const result = await aiRoute(
      {
        task: 'generate',
        prompt,
        temperature: 0.2,
        maxTokens: 100,
      },
      { allowCache: true }
    )

    if (!result.ok || !result.text) {
      return { label: 'NEUTRAL', confidence: 0.5 }
    }

    const obj = typeof result.text === 'string' ? JSON.parse(result.text) : result.text
    const label = String(obj.label ?? 'NEUTRAL')
    const confidence = Number(obj.confidence ?? 0.6)

    return { label, confidence }
  } catch {
    return { label: 'NEUTRAL', confidence: 0.5 }
  }
}
