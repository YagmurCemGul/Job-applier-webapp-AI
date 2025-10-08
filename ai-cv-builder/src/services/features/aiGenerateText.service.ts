/**
 * AI-powered text generation service
 */
import { aiRoute } from '@/services/ai/router.service';

export async function aiGenerateText(system: string, prompt: string, maxTokens = 800) {
  const { text } = await aiRoute({ 
    task: 'generate', 
    system, 
    prompt, 
    maxTokens 
  }, { allowCache: true });
  
  return text ?? '';
}
