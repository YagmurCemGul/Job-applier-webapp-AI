/**
 * AI-powered embedding service
 */
import { aiRoute } from '@/services/ai/router.service';

export async function aiEmbed(texts: string[]) {
  const r = await aiRoute({ 
    task: 'embed', 
    texts 
  }, { allowCache: true });
  
  return r.embeddings ?? [];
}
