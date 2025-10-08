/**
 * Google (Gemini) provider implementation
 */
import type { AIModelRef, AIRequest, AIResponse } from '@/types/ai.types';
import { estimateTokens } from '../tokenizers/cl100k';

export async function call(model: AIModelRef, req: AIRequest, signal?: AbortSignal): Promise<AIResponse> {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const provider = 'google';
  
  if (!apiKey) return localFallback(provider, model.model, req);

  try {
    const parts = [
      req.system ? { text: req.system } : null,
      req.prompt ? { text: req.prompt } : null
    ].filter(Boolean);
    
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model.model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: [{ parts }],
        generationConfig: {
          temperature: req.temperature ?? 0,
          maxOutputTokens: req.maxTokens ?? model.maxTokens ?? 2048
        }
      }),
      signal
    });
    
    const j = await r.json();
    const text = j.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
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
  return { ok: true, provider: 'google', model, text, usage: tok(0,0) };
}
