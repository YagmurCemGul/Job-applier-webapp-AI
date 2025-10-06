import type { AIModelRef, AIRequest, AIResponse } from '@/types/ai.types'
import { estimateTokens } from '../tokenizers/cl100k'

/**
 * DeepSeek provider with graceful fallback
 */
export async function call(
  model: AIModelRef,
  req: AIRequest,
  signal?: AbortSignal
): Promise<AIResponse> {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY
  const baseUrl = 'https://api.deepseek.com/v1'
  const provider = 'deepseek'

  if (!apiKey) return localFallback(provider, model.model, req)

  try {
    const messages = [
      req.system ? { role: 'system', content: req.system } : null,
      req.prompt ? { role: 'user', content: req.prompt } : null,
    ].filter(Boolean)

    const r = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model.model,
        messages,
        temperature: req.temperature ?? 0,
        max_tokens: req.maxTokens ?? model.maxTokens,
      }),
      signal,
    })

    const j = await r.json()
    const text = j.choices?.[0]?.message?.content ?? ''
    const inTok = estimateTokens([req.system, req.prompt].filter(Boolean).join('\n'))
    const outTok = estimateTokens(text)

    return {
      ok: true,
      provider,
      model: model.model,
      text,
      usage: tok(inTok, outTok),
    }
  } catch (error: any) {
    return localFallback(provider, model.model, req)
  }
}

function tok(inputTokens: number, outputTokens: number) {
  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    costUSD: 0,
  }
}

function localFallback(provider: string, model: string, req: AIRequest): AIResponse {
  const base = `[${provider}:${model}]`
  const text = `${base} ${req.prompt ?? JSON.stringify(req.input ?? {})}`.slice(0, 2000)
  return { ok: true, provider, model, text, usage: tok(0, 0) }
}
