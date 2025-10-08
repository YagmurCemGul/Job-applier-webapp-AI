export type AIProviderId = 'openai' | 'anthropic' | 'google' | 'deepseek' | 'llama-local';
export type AITask = 'parse' | 'generate' | 'match' | 'coverLetter' | 'suggest' | 'embed' | 'moderate';
export type AIModelKind = 'chat' | 'embed' | 'moderate';

export interface AIModelRef {
  provider: AIProviderId;
  model: string;           // e.g., "gpt-4o-mini", "claude-3-5-sonnet", "gemini-1.5-pro", etc.
  kind: AIModelKind;
  maxTokens?: number;
  cost?: {                 // USD per 1K tokens
    input?: number;
    output?: number;
  }
}

export interface AIRequest {
  task: AITask;
  prompt?: string;         // for generate/suggest/coverLetter
  system?: string;
  input?: unknown;         // structured input (e.g., parsed CV blocks)
  temperature?: number;
  maxTokens?: number;
  stop?: string[];
  // embeddings:
  texts?: string[];
  // moderation:
  contentToCheck?: string;
  // caching:
  cacheKeyHint?: string;
}

export interface AIResponse {
  ok: boolean;
  provider: AIProviderId;
  model: string;
  text?: string;
  json?: unknown;
  embeddings?: number[][];
  moderated?: { allowed: boolean; flags?: string[] };
  usage?: { inputTokens: number; outputTokens: number; totalTokens: number; costUSD: number };
  cached?: boolean;
}

export interface AIRouterOptions {
  allowCache?: boolean;
  forceProvider?: AIProviderId;
  timeoutMs?: number;
  retry?: { attempts: number; backoffMs: number };
}

export interface AISettings {
  // Per-task model selection
  perTask: Partial<Record<AITask, AIModelRef>>;
  // Defaults
  defaults: { temperature: number; timeoutMs: number; retryAttempts: number; backoffMs: number };
  // Feature toggles
  enableSafety: boolean;
  enableCache: boolean;
  cacheTTLms: number;
  // Accounting
  showMeters: boolean;
}
