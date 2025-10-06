import { aiRoute } from '@/services/ai/router.service'

/**
 * Extract action items from text using AI
 */
export async function extractActions(
  text: string
): Promise<Array<{ text: string; owner?: string; dueISO?: string }>> {
  const prompt = `Extract action items as JSON [{text, owner?, dueISO?}] from notes:\n${text}`

  try {
    const result = await aiRoute(
      {
        task: 'generate',
        prompt,
        temperature: 0.3,
        maxTokens: 500,
      },
      { allowCache: true }
    )

    if (!result.ok || !result.text) {
      return []
    }

    const parsed = typeof result.text === 'string' ? JSON.parse(result.text) : result.text

    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
