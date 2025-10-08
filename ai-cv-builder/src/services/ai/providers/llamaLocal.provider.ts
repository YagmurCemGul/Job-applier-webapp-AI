/**
 * Local Llama provider implementation
 * Connects to local Ollama or similar HTTP endpoint
 */
import type { AIModelRef, AIRequest, AIResponse } from '@/types/ai.types';
import { estimateTokens } from '../tokenizers/cl100k';

export async function call(model: AIModelRef, req: AIRequest, signal?: AbortSignal): Promise<AIResponse> {
  const baseUrl = import.meta.env.VITE_LLAMA_BASE_URL ?? 'http://localhost:11434';
  const provider = 'llama-local';
  
  if (!baseUrl) return localFallback(provider, model.model, req);

  try {
    const prompt = [req.system, req.prompt].filter(Boolean).join('\n\n');
    
    const r = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        model: model.model,
        prompt,
        stream: false,
        options: {
          temperature: req.temperature ?? 0,
          num_predict: req.maxTokens ?? model.maxTokens ?? 2048
        }
      }),
      signal
    });
    
    const j = await r.json();
    const text = j.response ?? '';
    const inTok = estimateTokens(prompt);
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
  return { ok: true, provider: 'llama-local', model, text, usage: tok(0,0) };
}
