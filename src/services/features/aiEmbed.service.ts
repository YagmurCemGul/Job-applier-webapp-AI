import { aiRoute } from '@/services/ai/router.service'

/**
 * AI embedding service
 */
export async function aiEmbed(texts: string[]): Promise<number[][]> {
  const r = await aiRoute(
    {
      task: 'embed',
      texts,
    },
    { allowCache: true }
  )

  return r.embeddings ?? []
}
