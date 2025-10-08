/**
 * AI-powered content moderation service
 */
import { aiRoute } from '@/services/ai/router.service';

export async function aiModerate(text: string) {
  const r = await aiRoute({ 
    task: 'moderate', 
    contentToCheck: text 
  }, { allowCache: false });
  
  return r.moderated ?? { allowed: true, flags: [] };
}
