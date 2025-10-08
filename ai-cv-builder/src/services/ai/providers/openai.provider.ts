/**
 * OpenAI provider implementation
 * Supports chat, embeddings, and moderation
 */
import type { AIModelRef, AIRequest, AIResponse } from '@/types/ai.types';
import { estimateTokens } from '../tokenizers/cl100k';

export async function call(model: AIModelRef, req: AIRequest, signal?: AbortSignal): Promise<AIResponse> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const baseUrl = import.meta.env.VITE_OPENAI_BASE_URL ?? 'https://api.openai.com/v1';
  const provider = 'openai';
  
  if (!apiKey) return localFallback(provider, model.model, req);

  try {
    if (req.task === 'embed' && req.texts?.length) {
      const r = await fetch(`${baseUrl}/embeddings`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: model.model, input: req.texts }),
        signal
      });
      const j = await r.json();
      const emb = j.data?.map((d: any) => d.embedding) ?? [];
      const inTok = estimateTokens(req.texts.join(' '));
      return { ok: true, provider, model: model.model, embeddings: emb, usage: tok(inTok, 0) };
    }

    if (req.task === 'moderate' && req.contentToCheck) {
      const r = await fetch(`${baseUrl}/moderations`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'omni-moderation-latest', input: req.contentToCheck }),
        signal
      });
      const j = await r.json();
      const allowed = !j.results?.[0]?.flagged;
      return { 
        ok: true, 
        provider, 
        model: 'omni-moderation-latest', 
        moderated: { allowed, flags: allowed ? [] : ['flagged'] }, 
        usage: tok(estimateTokens(req.contentToCheck), 0) 
      };
    }

    // Chat/generation
    const messages = [
      req.system ? { role: 'system', content: req.system } : null,
      req.prompt ? { role: 'user', content: req.prompt } : null
    ].filter(Boolean);
    
    const r = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        model: model.model, 
        messages, 
        temperature: req.temperature ?? 0, 
        max_tokens: req.maxTokens ?? model.maxTokens 
      }),
      signal
    });
    
    const j = await r.json();
    const text = j.choices?.[0]?.message?.content ?? '';
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
  
  if (req.task === 'embed' && req.texts) {
    const embeddings = req.texts.map(t => fakeEmbed(t));
    return { ok: true, provider: 'openai', model, embeddings, usage: tok(0,0) };
  }
  
  if (req.task === 'moderate' && req.contentToCheck) {
    const bad = /violent|hate|illegal|sex|nsfw/i.test(req.contentToCheck);
    return { ok: true, provider: 'openai', model, moderated: { allowed: !bad, flags: bad ? ['heuristic'] : [] }, usage: tok(0,0) };
  }
  
  const text = `${base} ${req.prompt ?? JSON.stringify(req.input ?? {})}`.slice(0, 2000);
  return { ok: true, provider: 'openai', model, text, usage: tok(0,0) };
}

function fakeEmbed(t: string) { 
  const out = new Array(256).fill(0).map((_,i)=>((t.charCodeAt(i%t.length)||0)%97)/97); 
  return out; 
}
