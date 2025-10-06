export type AIProviderId = 'openai' | 'anthropic' | 'google' | 'deepseek' | 'llama-local'
export type AITask =
  | 'parse'
  | 'generate'
  | 'match'
  | 'coverLetter'
  | 'suggest'
  | 'embed'
  | 'moderate'
export type AIModelKind = 'chat' | 'embed' | 'moderate'

export interface AIModelRef {
  provider: AIProviderId
  model: string
  kind: AIModelKind
  maxTokens?: number
  cost?: {
    input?: number
    output?: number
  }
}

export interface AIRequest {
  task: AITask
  prompt?: string
  system?: string
  input?: unknown
  temperature?: number
  maxTokens?: number
  stop?: string[]
  texts?: string[]
  contentToCheck?: string
  cacheKeyHint?: string
}

export interface AIResponse {
  ok: boolean
  provider: AIProviderId
  model: string
  text?: string
  json?: unknown
  embeddings?: number[][]
  moderated?: { allowed: boolean; flags?: string[] }
  usage?: { inputTokens: number; outputTokens: number; totalTokens: number; costUSD: number }
  cached?: boolean
}

export interface AIRouterOptions {
  allowCache?: boolean
  forceProvider?: AIProviderId
  timeoutMs?: number
  retry?: { attempts: number; backoffMs: number }
}

export interface AISettings {
  perTask: Partial<Record<AITask, AIModelRef>>
  defaults: { temperature: number; timeoutMs: number; retryAttempts: number; backoffMs: number }
  enableSafety: boolean
  enableCache: boolean
  cacheTTLms: number
  showMeters: boolean
}
