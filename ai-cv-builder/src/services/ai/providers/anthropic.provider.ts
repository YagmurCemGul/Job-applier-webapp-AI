/**
 * Anthropic (Claude) provider implementation
 */
import type { AIModelRef, AIRequest, AIResponse } from '@/types/ai.types';
import { estimateTokens } from '../tokenizers/cl100k';

export async function call(model: AIModelRef, req: AIRequest, signal?: AbortSignal): Promise<AIResponse> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  const baseUrl = import.meta.env.VITE_ANTHROPIC_BASE_URL ?? 'https://api.anthropic.com/v1';
  const provider = 'anthropic';
  
  if (!apiKey) return localFallback(provider, model.model, req);

  try {
    const messages = [
      req.prompt ? { role: 'user', content: req.prompt } : null
    ].filter(Boolean);
    
    const r = await fetch(`${baseUrl}/messages`, {
      method: 'POST',
      headers: { 
        'x-api-key': apiKey, 
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        model: model.model, 
        messages,
        system: req.system,
        temperature: req.temperature ?? 0, 
        max_tokens: req.maxTokens ?? model.maxTokens ?? 4096
      }),
      signal
    });
    
    const j = await r.json();
    const text = j.content?.[0]?.text ?? '';
    const inTok = estimateTokens([req.system, req.prompt].filter(Boolean).join('\n'));
    const outTok = estimateTokens(text);
    
    return { ok: true, provider, model: model.model, text, usage: tok(inTok, outTok) };
  } catch (e: any) {
    if (e.name === 'AbortError') throw e;
    return localFallback(provider, model.model, req);
  }
}

function tok(inputTokens: number, outputTokens: number) { 
  return { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens, costUSD: 0 }; 
}

function localFallback(provider: string, model: string, req: AIRequest): AIResponse {
  const base = `[${provider}:${model}]`;
  const text = `${base} ${req.prompt ?? JSON.stringify(req.input ?? {})}`.slice(0, 2000);
  return { ok: true, provider: 'anthropic', model, text, usage: tok(0,0) };
}
