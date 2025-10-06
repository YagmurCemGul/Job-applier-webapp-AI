import { aiRoute } from '@/services/ai/router.service'

/**
 * AI content moderation service
 */
export async function aiModerate(text: string): Promise<{ allowed: boolean; flags?: string[] }> {
  const r = await aiRoute(
    {
      task: 'moderate',
      contentToCheck: text,
    },
    { allowCache: false }
  )

  return r.moderated ?? { allowed: true, flags: [] }
}
