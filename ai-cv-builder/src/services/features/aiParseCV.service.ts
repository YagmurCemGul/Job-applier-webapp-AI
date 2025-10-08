/**
 * AI-powered CV parsing service
 */
import { aiRoute } from '@/services/ai/router.service';
import type { CVData } from '@/types';

export async function aiParseCV(text: string): Promise<Partial<CVData>> {
  const system = 'Extract a structured resume JSON with fields: name, email, phone, summary, skills[], experience[], education[], certifications[], projects[]. Return strict JSON.';
  const { ok, text: out } = await aiRoute({ 
    task: 'parse', 
    system, 
    prompt: text, 
    maxTokens: 1500 
  }, { allowCache: true });
  
  try { 
    return ok && out ? JSON.parse(out) : {}; 
  } catch { 
    return {}; 
  }
}
