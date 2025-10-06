import { aiRoute } from '@/services/ai/router.service'

/**
 * General AI text generation service
 */
export async function aiGenerateText(
  system: string,
  prompt: string,
  maxTokens = 800
): Promise<string> {
  const { text } = await aiRoute(
    {
      task: 'generate',
      system,
      prompt,
      maxTokens,
    },
    { allowCache: true }
  )

  return text ?? ''
}
