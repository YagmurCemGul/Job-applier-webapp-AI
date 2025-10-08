/**
 * AI Router Service
 * Main entry point for AI operations with retries, caching, safety, and metering
 */
import { estimateTokens } from './tokenizers/cl100k';
import { getAISettings } from '@/stores/ai.store';
import { aiRateLimit } from './rateLimit.service';
import { aiCache } from './cache.service';
import { costMeter } from './cost.service';
import { safetyGate } from './safety.service';
import type { AIRequest, AIResponse, AIRouterOptions, AIModelRef, AITask } from '@/types/ai.types';

/** Main entry point: route a task to the configured model with retries, safety, cache, and metering. */
export async function aiRoute(req: AIRequest, opts: AIRouterOptions = {}): Promise<AIResponse> {
  const settings = getAISettings();
  const model = pickModel(req.task, settings.perTask);
  const temperature = req.temperature ?? settings.defaults.temperature;
  const timeoutMs = opts.timeoutMs ?? settings.defaults.timeoutMs;
  const retryAttempts = opts.retry?.attempts ?? settings.defaults.retryAttempts;
  const backoffMs = opts.retry?.backoffMs ?? settings.defaults.backoffMs;

  // Safety (pre)
  if (settings.enableSafety && (req.prompt || req.contentToCheck)) {
    const safe = await safetyGate.preCheck(req);
    if (!safe.allowed) {
      return { 
        ok: false, 
        provider: model.provider, 
        model: model.model, 
        moderated: safe, 
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0, costUSD: 0 } 
      };
    }
  }

  // Cache key
  const key = opts.allowCache !== false && settings.enableCache ? makeCacheKey(req, model) : undefined;
  if (key) {
    const cached = await aiCache.get(key);
    if (cached) return { ...cached, cached: true };
  }

  await aiRateLimit.consume(model.provider); // simple provider-level limiter

  // Retry loop
  let lastErr: any;
  for (let attempt = 0; attempt <= retryAttempts; attempt++) {
    try {
      const resp = await executeProvider(model, { ...req, temperature, maxTokens: req.maxTokens ?? model.maxTokens }, timeoutMs);
      
      // Safety (post)
      if (settings.enableSafety && resp.text) {
        const safe = await safetyGate.postCheck(resp.text);
        if (!safe.allowed) {
          return { 
            ok: false, 
            provider: model.provider, 
            model: model.model, 
            moderated: safe, 
            usage: resp.usage, 
            text: '' 
          };
        }
      }
      
      // Meter & cache
      const usage = costMeter.measure(model, req, resp);
      const final: AIResponse = { ...resp, usage };
      if (key) await aiCache.set(key, final, settings.cacheTTLms);
      return final;
    } catch (e: any) {
      lastErr = e;
      if (attempt < retryAttempts) await sleep(backoffMs * (attempt + 1));
    }
  }
  
  return { 
    ok: false, 
    provider: model.provider, 
    model: model.model, 
    text: String(lastErr?.message || 'AI error'), 
    usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0, costUSD: 0 } 
  };
}

function pickModel(task: AITask, perTask: any): AIModelRef {
  const ref = perTask?.[task] ?? perTask?.generate ?? perTask?.coverLetter;
  if (!ref) {
    return { 
      provider: 'openai', 
      model: 'gpt-4o-mini', 
      kind: 'chat', 
      maxTokens: 8000, 
      cost: { input: 0.005, output: 0.015 } 
    };
  }
  return ref;
}

async function executeProvider(model: AIModelRef, req: AIRequest, timeoutMs: number) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const mod = await providerModule(model.provider);
    return await mod.call(model, req, ctrl.signal);
  } finally {
    clearTimeout(t);
  }
}

async function providerModule(p: string) {
  switch (p) {
    case 'openai': return await import('./providers/openai.provider');
    case 'anthropic': return await import('./providers/anthropic.provider');
    case 'google': return await import('./providers/google.provider');
    case 'deepseek': return await import('./providers/deepseek.provider');
    case 'llama-local': return await import('./providers/llamaLocal.provider');
    default: throw new Error('Unknown provider');
  }
}

function makeCacheKey(req: AIRequest, model: AIModelRef) {
  const core = JSON.stringify({
    task: req.task,
    system: req.system?.trim(),
    prompt: req.prompt?.trim(),
    input: req.input,
    texts: req.texts,
    model: model.model,
    temperature: req.temperature ?? 0,
    stop: req.stop
  });
  return `ai:${model.provider}:${hash(core)}`;
}

function hash(s: string) { 
  let h = 2166136261; 
  for (let i=0;i<s.length;i++){ 
    h^=s.charCodeAt(i); 
    h+= (h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24);
  } 
  return (h>>>0).toString(36); 
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
