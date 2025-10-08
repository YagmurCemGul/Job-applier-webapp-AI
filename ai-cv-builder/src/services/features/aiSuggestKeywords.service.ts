/**
 * AI-powered keyword suggestion service
 */
import { aiRoute } from '@/services/ai/router.service';

export async function aiSuggestKeywords(jobText: string, currentKeywords: string[], limit = 15): Promise<string[]> {
  const system = 'Given a job posting text and an existing list of keywords, propose additional, closely-related, ATS-friendly keywords. Return a JSON array of short strings, no explanations.';
  const prompt = `JOB:\n${jobText}\n\nCURRENT:\n${currentKeywords.join(', ')}`;
  
  const { ok, text } = await aiRoute({ 
    task: 'suggest', 
    system, 
    prompt, 
    maxTokens: 250 
  }, { allowCache: true });
  
  try { 
    const arr = JSON.parse(text || '[]'); 
    return Array.isArray(arr) ? arr.slice(0, limit) : []; 
  } catch { 
    return []; 
  }
}
