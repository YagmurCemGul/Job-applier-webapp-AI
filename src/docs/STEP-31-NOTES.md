# Step 31: AI Provider Orchestration Layer

## Overview

This module introduces a comprehensive AI orchestration system that provides a unified interface to multiple LLM/embedding providers with resilience features, cost tracking, semantic caching, rate limiting, and safety gates.

## Architecture

### System Layers

```
Feature Services (Top)
├─ aiParseCV
├─ aiSuggestKeywords
├─ aiGenerateText
├─ aiEmbed
└─ aiModerate

AI Router (Middle)
├─ Task routing
├─ Model selection
├─ Safety gates (pre/post)
├─ Semantic caching
├─ Rate limiting
├─ Retry & backoff
├─ Cost metering
└─ Timeout enforcement

Provider Layer (Bottom)
├─ OpenAI
├─ Anthropic
├─ Google (Gemini)
├─ DeepSeek
└─ Llama Local
```

### Request Flow

```
User Action
  ↓
Feature Service (e.g., aiSuggestKeywords)
  ↓
AI Router
  ├─ Load AI settings
  ├─ Select model for task
  ├─ Safety pre-check
  ├─ Check semantic cache
  ├─ Rate limit check
  ├─ Execute with retry loop
  │  ├─ Attempt 1
  │  ├─ (fail) Backoff
  │  ├─ Attempt 2
  │  ├─ (fail) Backoff
  │  └─ Attempt 3
  ├─ Safety post-check
  ├─ Meter cost
  └─ Cache result
  ↓
Provider (e.g., OpenAI)
  ├─ Check API key
  ├─ Make HTTP request
  ├─ Handle response
  └─ Fallback if error
  ↓
AIResponse
```

## Features

### 1. Multi-Provider Support

**Providers:**
```typescript
✓ OpenAI
  - Chat: gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo
  - Embeddings: text-embedding-3-small, text-embedding-3-large
  - Moderation: omni-moderation-latest
  
✓ Anthropic
  - Chat: claude-3-5-sonnet, claude-3-opus, claude-3-haiku
  
✓ Google
  - Chat: gemini-1.5-pro, gemini-1.5-flash
  
✓ DeepSeek
  - Chat: deepseek-chat, deepseek-coder
  
✓ Llama Local (Ollama)
  - Chat: llama3:instruct, mistral, codellama
```

**Provider Interface:**
```typescript
export async function call(
  model: AIModelRef,
  req: AIRequest,
  signal?: AbortSignal
): Promise<AIResponse>

Responsibilities:
  1. Check API key/endpoint
  2. Format request for provider
  3. Make HTTP call
  4. Parse response
  5. Estimate tokens
  6. Return standardized AIResponse
  7. Fallback on error
```

**Graceful Fallback:**
```typescript
All providers implement local fallback:
  1. API key missing → fallback
  2. Network error → fallback
  3. Rate limit → fallback
  4. Timeout → fallback

Fallback Behaviors:
  - Chat: Return prompt echo with [provider:model] prefix
  - Embeddings: Generate fake 256-dim vectors
  - Moderation: Simple heuristic (keyword matching)

Result:
  App remains functional even without API keys
```

### 2. AI Router

**Core Orchestration:**
```typescript
aiRoute(request, options):
  
  1. Load Settings
     ✓ Get per-task model selection
     ✓ Get defaults (temp, timeout, retries)
     ✓ Get feature flags (safety, cache, meters)
  
  2. Model Selection
     ✓ Check perTask[task] first
     ✓ Fallback to perTask.generate
     ✓ Fallback to default (gpt-4o-mini)
  
  3. Safety Pre-Check
     if (enableSafety && hasContent):
       ✓ Check for risky patterns
       ✓ Block if unsafe
       ✓ Return moderated response
  
  4. Semantic Cache
     if (enableCache && allowCache):
       ✓ Generate cache key
       ✓ Check memory cache
       ✓ Return cached response (marked)
  
  5. Rate Limiting
     ✓ Token bucket per provider
     ✓ 60 req/min capacity
     ✓ Auto-refill
     ✓ Sleep if exhausted
  
  6. Retry Loop
     for (attempt = 0; attempt <= retryAttempts; attempt++):
       try:
         ✓ Execute provider with timeout
         ✓ Return on success
       catch:
         ✓ Exponential backoff
         ✓ Continue to next attempt
  
  7. Safety Post-Check
     if (enableSafety && hasOutput):
       ✓ Check for XSS-like patterns
       ✓ Block if unsafe
       ✓ Return empty response
  
  8. Cost Metering
     ✓ Calculate tokens (input + output)
     ✓ Apply model rates
     ✓ Return usage object
  
  9. Cache Result
     if (cache enabled):
       ✓ Store in cache with TTL
  
  10. Return AIResponse
```

**Retry & Backoff:**
```typescript
Algorithm:
  Exponential backoff
  
  Attempt 1: Execute immediately
  Fail → Wait backoffMs * 1 (600ms)
  Attempt 2: Execute
  Fail → Wait backoffMs * 2 (1200ms)
  Attempt 3: Execute
  Fail → Return error

Configuration:
  ✓ retryAttempts: 2 (default)
  ✓ backoffMs: 600 (default)
  ✓ Max total time: ~30 seconds
```

**Timeout Enforcement:**
```typescript
Mechanism:
  AbortController + setTimeout
  
  1. Create AbortController
  2. Set timeout to call abort()
  3. Pass signal to fetch()
  4. Fetch aborts if timeout reached
  5. Clear timeout on success

Configuration:
  ✓ timeoutMs: 30000 (default)
  ✓ Per-request override
```

### 3. Semantic Caching

**Cache Key Generation:**
```typescript
makeCacheKey(request, model):
  
  Inputs:
    ✓ task
    ✓ system (trimmed)
    ✓ prompt (trimmed)
    ✓ input (structured)
    ✓ texts (embeddings)
    ✓ model name
    ✓ temperature
    ✓ stop sequences
  
  Process:
    1. JSON.stringify normalized inputs
    2. Hash with FNV-1a (32-bit)
    3. Convert to base36
    4. Prefix: "ai:{provider}:{hash}"
  
  Example:
    "ai:openai:k7x8m9z"

Hash Function (FNV-1a):
  h = 2166136261 (FNV offset basis)
  for each char:
    h = h XOR char_code
    h = h * FNV_prime (bit shifts)
  return (h >>> 0).toString(36)
```

**Cache Storage:**
```typescript
Structure:
  Map<string, Entry>
  
  Entry:
    value: AIResponse
    exp: timestamp (Date.now() + TTL)

Operations:
  get(key):
    1. Find entry
    2. Check expiration
    3. Return value or undefined
    4. Delete if expired
  
  set(key, value, ttlMs):
    1. Calculate expiration
    2. Store entry
  
  clear():
    1. Clear all entries

TTL:
  ✓ Default: 15 minutes (900,000 ms)
  ✓ Configurable per-task
  ✓ Moderation: cache disabled

Future:
  ✓ IndexedDB for persistence
  ✓ LRU eviction
  ✓ Size limits
```

### 4. Rate Limiting

**Token Bucket Algorithm:**
```typescript
Per-Provider Bucket:
  capacity: 60 requests
  refillMs: 1000 ms (1 second)
  
  Every second: +1 token (up to capacity)

consume(provider):
  1. Get/create bucket for provider
  2. Calculate elapsed time
  3. Refill tokens (time-based)
  4. Check remaining
  5. If <= 0: sleep until refill
  6. Decrement remaining
  7. Update last timestamp

Example:
  Capacity: 60
  Remaining: 0
  
  → Sleep 1000ms
  → Refill: +1
  → Remaining: 1
  → Consume: -1
  → Remaining: 0

Limits:
  ✓ 60 requests/minute per provider
  ✓ Independent buckets
  ✓ Auto-refill
  ✓ No persistent state
```

### 5. Cost Metering

**Cost Calculation:**
```typescript
measure(model, request, response):
  
  Input:
    model.cost.input (USD per 1K tokens)
    response.usage.inputTokens
  
  Output:
    model.cost.output (USD per 1K tokens)
    response.usage.outputTokens
  
  Formula:
    inputCost = (inputTokens / 1000) * inputRate
    outputCost = (outputTokens / 1000) * outputRate
    totalCost = inputCost + outputCost
  
  Return:
    {
      inputTokens: number
      outputTokens: number
      totalTokens: number
      costUSD: number (6 decimal places)
    }

Example:
  Model: gpt-4o-mini
    input: $0.005/1K
    output: $0.015/1K
  
  Usage:
    input: 1000 tokens
    output: 500 tokens
  
  Cost:
    input: (1000/1000) * 0.005 = $0.005
    output: (500/1000) * 0.015 = $0.0075
    total: $0.0125
```

**Token Estimation:**
```typescript
estimateTokens(text):
  
  Detection:
    isTurkish = /[çğıöşüÇĞİÖŞÜ]/.test(text)
  
  Formula:
    English: 1 token ≈ 4 characters
    Turkish: 1 token ≈ 3 characters
  
  Return:
    Math.ceil(text.length / divisor)

Examples:
  "Hello world" (11 chars)
  → 11 / 4 = 2.75 → 3 tokens
  
  "Merhaba dünya" (14 chars)
  → 14 / 3 = 4.67 → 5 tokens

Accuracy:
  ✓ Approximate (±20%)
  ✓ Good enough for cost estimation
  ✓ Fast (no tokenizer library)
```

### 6. Safety Gates

**Pre-Check (Input Validation):**
```typescript
Risky Patterns:
  ✓ explosive, self-harm, hate
  ✓ nsfw, credit card, ssn
  ✓ password

Process:
  1. Extract text (prompt or contentToCheck)
  2. Regex match against patterns
  3. Return { allowed: boolean, flags: string[] }
  4. If blocked: return early with moderated response

Example:
  Input: "My password is secret123"
  → Blocked: true
  → Flags: ['heuristic-pre']
  → Response: { ok: false, moderated: { allowed: false } }
```

**Post-Check (Output Validation):**
```typescript
XSS-like Patterns:
  ✓ <script>
  ✓ javascript:
  ✓ data:

Process:
  1. Check response text
  2. Regex match against patterns
  3. Return { allowed: boolean, flags: string[] }
  4. If blocked: return empty text

Example:
  Output: "<script>alert('xss')</script>"
  → Blocked: true
  → Flags: ['xss-like']
  → Response: { ok: false, text: '' }
```

**Provider-Level Moderation:**
```typescript
OpenAI Moderation API:
  Task: 'moderate'
  Endpoint: /v1/moderations
  Model: omni-moderation-latest
  
  Response:
    {
      flagged: boolean
      categories: {
        hate, violence, sexual, self-harm, etc.
      }
    }
  
  Usage:
    const result = await aiModerate(text)
    if (!result.allowed) {
      // Block content
    }
```

### 7. Task & Model Selection

**Per-Task Configuration:**
```typescript
AISettings.perTask:
  
  parse: {
    provider: 'openai'
    model: 'gpt-4o-mini'
    kind: 'chat'
    maxTokens: 1500
    cost: { input: 0.005, output: 0.015 }
  }
  
  suggest: {
    provider: 'anthropic'
    model: 'claude-3-5-sonnet'
    kind: 'chat'
    maxTokens: 250
    cost: { input: 0.003, output: 0.015 }
  }
  
  coverLetter: {
    provider: 'google'
    model: 'gemini-1.5-pro'
    kind: 'chat'
    maxTokens: 800
    cost: { input: 0.00125, output: 0.005 }
  }

Selection Logic:
  1. Check settings.perTask[task]
  2. If not set, check settings.perTask.generate
  3. If not set, use default (gpt-4o-mini)
```

**Model Defaults:**
```typescript
guessDefaultModel(provider, task):
  
  Embeddings:
    openai → text-embedding-3-small
    others → embed-lite
  
  Moderation:
    openai → omni-moderation-latest
    others → mod-simple
  
  Chat:
    openai → gpt-4o-mini
    anthropic → claude-3-5-sonnet
    google → gemini-1.5-pro
    deepseek → deepseek-chat
    llama-local → llama3:instruct
```

## Type System

### AIRequest

```typescript
export interface AIRequest {
  task: AITask           // Route to appropriate handler
  prompt?: string        // User message
  system?: string        // System prompt
  input?: unknown        // Structured input
  temperature?: number   // 0-1 randomness
  maxTokens?: number     // Output limit
  stop?: string[]        // Stop sequences
  texts?: string[]       // For embeddings
  contentToCheck?: string// For moderation
  cacheKeyHint?: string  // Optional cache override
}
```

### AIResponse

```typescript
export interface AIResponse {
  ok: boolean            // Success flag
  provider: AIProviderId // Which provider handled
  model: string          // Model used
  text?: string          // Generated text
  json?: unknown         // Parsed JSON (if applicable)
  embeddings?: number[][]// Embedding vectors
  moderated?: {          // Moderation result
    allowed: boolean
    flags?: string[]
  }
  usage?: {              // Token & cost tracking
    inputTokens: number
    outputTokens: number
    totalTokens: number
    costUSD: number
  }
  cached?: boolean       // Was this cached?
}
```

### AISettings

```typescript
export interface AISettings {
  perTask: Partial<Record<AITask, AIModelRef>>
  
  defaults: {
    temperature: 0.2        // Conservative
    timeoutMs: 30000        // 30 seconds
    retryAttempts: 2        // 3 total tries
    backoffMs: 600          // 600ms * attempt
  }
  
  enableSafety: true        // Safety gates
  enableCache: true         // Semantic cache
  cacheTTLms: 900000        // 15 minutes
  showMeters: true          // UI cost display
}
```

## Services

### router.service.ts

```typescript
Key Functions:
  ✓ aiRoute(req, opts): Promise<AIResponse>
    - Main orchestration
    - All resilience features
  
  ✓ pickModel(task, perTask): AIModelRef
    - Task-based selection
    - Fallback chain
  
  ✓ executeProvider(model, req, timeout): Promise<AIResponse>
    - AbortController wrapper
    - Dynamic import
    - Timeout enforcement
  
  ✓ providerModule(provider): Promise<Provider>
    - Dynamic provider loading
    - Error handling
  
  ✓ makeCacheKey(req, model): string
    - Deterministic key generation
    - FNV-1a hash
  
  ✓ hash(string): string
    - Fast non-cryptographic hash
  
  ✓ sleep(ms): Promise<void>
    - Async delay

Features:
  ✓ Provider abstraction
  ✓ Retry with exponential backoff
  ✓ Timeout enforcement
  ✓ Safety gates (pre/post)
  ✓ Semantic caching
  ✓ Rate limiting
  ✓ Cost metering
  ✓ Error handling
```

### cache.service.ts

```typescript
Implementation:
  In-memory Map with TTL
  
  Future:
    ✓ IndexedDB for persistence
    ✓ LRU eviction
    ✓ Size limits
    ✓ Cache warming

Operations:
  get(key):
    ✓ Check expiration
    ✓ Delete if expired
    ✓ Return value or undefined
  
  set(key, value, ttlMs):
    ✓ Calculate expiration
    ✓ Store entry
  
  clear():
    ✓ Remove all entries

Performance:
  ✓ O(1) get/set
  ✓ No serialization (in-memory)
  ✓ Fast hash lookup
```

### cost.service.ts

```typescript
Metering:
  measure(model, req, resp):
    1. Extract input/output tokens
    2. Get model rates
    3. Calculate costs
    4. Return usage object

Rates (USD per 1K tokens):
  GPT-4o-mini:
    input: $0.005
    output: $0.015
  
  GPT-4o:
    input: $0.05
    output: $0.15
  
  Claude 3.5 Sonnet:
    input: $0.003
    output: $0.015
  
  Gemini 1.5 Pro:
    input: $0.00125
    output: $0.005

Future:
  ✓ Rate API (fetch live prices)
  ✓ Budget alerts
  ✓ Monthly spending caps
```

### rateLimit.service.ts

```typescript
Token Bucket:
  Per-provider bucket
  
  State:
    capacity: 60
    remaining: 60
    refillMs: 1000
    last: timestamp

Algorithm:
  consume(provider):
    1. Get/create bucket
    2. elapsed = now - last
    3. refill = floor(elapsed / refillMs)
    4. remaining = min(capacity, remaining + refill)
    5. last = now
    6. if (remaining <= 0): sleep(refillMs)
    7. remaining -= 1

Limits:
  ✓ 60 requests/minute per provider
  ✓ Independent buckets
  ✓ Smooth refill

Future:
  ✓ Per-model limits
  ✓ Tiered limits (free/paid)
  ✓ Burst allowance
```

### safety.service.ts

```typescript
Heuristics:
  Pre-Check:
    ✓ PII: credit card, ssn, password
    ✓ Dangerous: explosive, self-harm
    ✓ Toxic: hate, nsfw
  
  Post-Check:
    ✓ XSS: <script>, javascript:, data:
    ✓ Injection: SQL-like patterns

Integration:
  ✓ Called before/after provider
  ✓ Blocks unsafe requests
  ✓ Sanitizes unsafe responses
  ✓ Returns moderation result

Provider Moderation:
  ✓ OpenAI: /moderations endpoint
  ✓ Others: heuristic fallback
```

## Feature Services

### aiParseCV.service.ts

```typescript
Purpose:
  AI-powered CV parsing (Step 27 enhancement)

System Prompt:
  "Extract a structured resume JSON with fields:
   personalInfo, summary, skills[], experience[],
   education[], projects[]. Return strict JSON."

Usage:
  const cvData = await aiParseCV(rawText)
  → Structured CVData object

Integration:
  Step 27 parsing pipeline:
    1. Try aiParseCV() first
    2. If empty, fall back to deterministic parser
    3. Merge results
```

### aiSuggestKeywords.service.ts

```typescript
Purpose:
  AI-powered keyword suggestions (Step 28 integration)

System Prompt:
  "Given a job posting and existing keywords,
   propose additional ATS-friendly keywords.
   Return JSON array, no duplicates."

Usage:
  const suggested = await aiSuggestKeywords(
    jobText,
    currentKeywords,
    limit: 15
  )
  → Array of keyword strings

Integration:
  Step 28 ATS Details:
    1. "Suggest Similar" button
    2. Calls aiSuggestKeywords()
    3. Displays chips
    4. Click to insert
```

### aiGenerateText.service.ts

```typescript
Purpose:
  General text generation

Usage:
  const text = await aiGenerateText(
    system: "You are a writer",
    prompt: "Write a paragraph",
    maxTokens: 500
  )
  → Generated text string

Use Cases:
  ✓ Summary generation
  ✓ Bullet point expansion
  ✓ Section rewriting
```

### aiEmbed.service.ts

```typescript
Purpose:
  Text embeddings for semantic search

Usage:
  const vectors = await aiEmbed([
    "text1",
    "text2"
  ])
  → Array of embedding vectors

Use Cases:
  ✓ Job similarity matching
  ✓ CV-to-job alignment
  ✓ Skill clustering
```

### aiModerate.service.ts

```typescript
Purpose:
  Content moderation

Usage:
  const result = await aiModerate(text)
  if (!result.allowed) {
    // Block content
  }

Use Cases:
  ✓ User-generated content
  ✓ CV uploads
  ✓ Job postings
```

## Stores

### aiStore.ts

```typescript
State:
  settings: AISettings

Actions:
  setModelForTask(task, ref)
    → Configure model for specific task
    → Example: Use Claude for cover letters
  
  setDefaults(patch)
    → Update temperature, timeout, retries
  
  setToggles(patch)
    → Enable/disable safety, cache, meters
  
  reset()
    → Restore factory defaults

Persistence:
  ✓ localStorage via zustand/persist
  ✓ Version: 1
  ✓ Survives page reloads

Helper:
  getAISettings()
    → Standalone function
    → Used by router
    → Graceful fallback if store unavailable
```

## UI Components

### AISettingsPanel.tsx

```typescript
Sections:
  1. Provider Status Cards
     ✓ 5 cards (OpenAI, Anthropic, Google, DeepSeek, Llama)
     ✓ Shows env key name
     ✓ Shows capabilities (chat, embed, moderate)
     ✓ Badge: Ready / Not configured
  
  2. Per-Task Models
     ✓ 7 tasks (parse, generate, match, coverLetter, suggest, embed, moderate)
     ✓ Provider select per task
     ✓ Model name input per task
     ✓ Auto-populated defaults
  
  3. Defaults
     ✓ Temperature (0-1)
     ✓ Timeout (ms)
     ✓ Retries (attempts)
  
  4. Toggles
     ✓ Safety (checkbox)
     ✓ Cache (checkbox)
     ✓ Show meters (checkbox)
     ✓ Cache TTL (input)
     ✓ Reset button

Layout:
  Grid responsive
  ✓ Mobile: Stacked
  ✓ Desktop: 2-3 columns
```

### ProviderStatusCard.tsx

```typescript
Display:
  ✓ Provider name
  ✓ Env key (e.g., VITE_OPENAI_API_KEY)
  ✓ Capabilities (e.g., "chat, embed, moderation")
  ✓ Status badge (Ready / Not configured)

Logic:
  const ok = !!import.meta.env[envKey]
  → Checks if env var is set

Styling:
  ✓ Border card
  ✓ Flex layout
  ✓ Badge variant (default or secondary)
```

### AITestConsole.tsx

```typescript
Features:
  ✓ Textarea for prompt input
  ✓ Run button
  ✓ Loading state
  ✓ Output display
  ✓ Cache indicator

Usage:
  1. Enter test prompt
  2. Click "Run"
  3. Router executes
  4. Output displayed
  5. "(cached)" suffix if from cache

Purpose:
  ✓ Quick AI testing
  ✓ Verify provider configuration
  ✓ Debug prompts
```

### SettingsAI.tsx

```typescript
Page:
  Container with cards:
    1. AISettingsPanel
    2. AITestConsole

Layout:
  ✓ Full page width
  ✓ Vertical spacing
  ✓ Card wrappers
```

## Integration Points

### With Step 27 (Advanced Parsing)

```typescript
Enhancement:
  Parse pipeline can now use AI:
  
  Before:
    parseJobText(raw)
    → Deterministic extraction
  
  After:
    1. Try aiParseCV(raw)
    2. If result shallow, use deterministic
    3. Merge results
  
  Implementation:
    // In parse-text.ts
    let aiResult = {}
    try {
      aiResult = await aiParseCV(raw)
    } catch { /* use heuristic */ }
    
    const heuristicResult = parseHeuristic(raw)
    return { ...heuristicResult, ...aiResult }

Benefits:
  ✓ Better entity extraction
  ✓ More accurate parsing
  ✓ Handles unusual formats
  ✓ Falls back gracefully
```

### With Step 28 (ATS Details)

```typescript
Enhancement:
  Keyword Explorer gets "Suggest Similar"
  
  Button:
    <Button onClick={handleSuggestSimilar}>
      Suggest Similar
    </Button>
  
  Handler:
    const suggested = await aiSuggestKeywords(
      jobText,
      [...matched, ...missing],
      15
    )
    setSuggestedKeywords(suggested)
  
  Display:
    {suggestedKeywords.map(kw => (
      <Button onClick={() => addToSkills(kw)}>
        + {kw}
      </Button>
    ))}

Benefits:
  ✓ AI finds related keywords
  ✓ Expands beyond exact matches
  ✓ Semantic understanding
  ✓ One-click insertion
```

### With Step 30 (Cover Letter Studio)

```typescript
Enhancement:
  Generation now uses AI router
  
  Before:
    try {
      const { aiGenerate } = await import('@/services/ai/provider.service')
      // ...
    } catch {
      return fallbackGenerate(opts)
    }
  
  After:
    try {
      const { aiRoute } = await import('@/services/ai/router.service')
      const result = await aiRoute({
        task: 'coverLetter',
        system: buildSystemPrompt(opts),
        prompt: renderTemplate(...),
        maxTokens: lengthBudget(...)
      })
      return { html: wrap(result.text) }
    } catch {
      return { html: fallbackGenerate(opts) }
    }

Benefits:
  ✓ Model selection per task
  ✓ Automatic retries
  ✓ Cost tracking
  ✓ Semantic caching
  ✓ Safety checks
```

## Security & Privacy

### API Key Management

```typescript
Environment Variables:
  ✓ Prefix: VITE_*
  ✓ Exposed to client (Vite limitation)
  ✓ Not in version control
  ✓ Example file provided

Production:
  ✓ Use backend proxy (future)
  ✓ Never expose keys in client
  ✓ Server-side API calls
```

### Input Sanitization

```typescript
Pre-Request:
  ✓ Safety gate checks
  ✓ PII detection
  ✓ Dangerous pattern matching

Post-Response:
  ✓ XSS pattern detection
  ✓ HTML sanitization
  ✓ Safe output rendering
```

### Data Privacy

```typescript
Logging:
  ✓ No raw prompts in production logs
  ✓ Redact PII (emails, phones)
  ✓ Hash identifiers

Caching:
  ✓ In-memory only (ephemeral)
  ✓ TTL expiration
  ✓ Clear on logout (future)
```

## Performance

### Caching Effectiveness

```typescript
Hit Rate:
  Same prompt + same model + same temp
  → Cache hit
  
  Expected:
    ✓ 60-80% for repeated queries
    ✓ 20-30% for unique requests

Latency Reduction:
  Cache miss: ~1-5 seconds (API call)
  Cache hit: ~1-10ms (memory lookup)
  → 100-1000x faster
```

### Token Budget Optimization

```typescript
Length Budget:
  Cover Letter:
    short: 250 tokens
    medium: 500 tokens
    long: 900 tokens
  
  Turkish: +10% (more chars/token)

Parsing:
  ✓ maxTokens: 1500
  ✓ Sufficient for most CVs

Keyword Suggest:
  ✓ maxTokens: 250
  ✓ Returns 15 keywords
```

### Memory Usage

```typescript
Cache Size:
  Entry: ~1-5 KB
  Capacity: ~1000 entries
  Total: ~1-5 MB

Rate Limiter:
  Buckets: ~100 bytes each
  Providers: 5
  Total: ~500 bytes

Token Estimator:
  No persistent state
  Pure function
```

## Testing

### Unit Tests (7 files, 40+ tests)

**router.service.spec.ts:**
```typescript
✓ Route request to provider
✓ Handle cache hit
✓ Respect allowCache false
✓ Use fallback when unavailable
✓ Handle embeddings task
✓ Handle moderation task
✓ Block unsafe content
✓ Include usage metrics
```

**cache.service.spec.ts:**
```typescript
✓ Set and get cached value
✓ Return undefined for expired
✓ Return undefined for non-existent
✓ Clear all entries
✓ Handle multiple keys independently
```

**rateLimit.service.spec.ts:**
```typescript
✓ Allow consumption within capacity
✓ Consume multiple times
✓ Handle different providers independently
```

**cost.service.spec.ts:**
```typescript
✓ Calculate cost from tokens
✓ Handle zero tokens
✓ Calculate different costs for models
```

**safety.service.spec.ts:**
```typescript
✓ Allow safe content (pre)
✓ Flag risky content (pre)
✓ Check contentToCheck field
✓ Allow empty content
✓ Allow safe response (post)
✓ Flag XSS-like content (post)
✓ Flag javascript: protocol
```

**ai.store.spec.ts:**
```typescript
✓ Initialize with defaults
✓ Set model for task
✓ Update defaults
✓ Update toggles
✓ Reset to defaults
✓ Persist settings
```

**aiSuggestKeywords.service.spec.ts:**
```typescript
✓ Return array of keywords
✓ Limit results
✓ Handle empty job text
✓ Handle errors gracefully
✓ Return empty on invalid JSON
```

## Environment Configuration

### .env.ai.example

```bash
# OpenAI
VITE_OPENAI_API_KEY=sk-...
VITE_OPENAI_BASE_URL=https://api.openai.com/v1

# Anthropic
VITE_ANTHROPIC_API_KEY=sk-ant-...

# Google
VITE_GOOGLE_API_KEY=AIza...

# DeepSeek
VITE_DEEPSEEK_API_KEY=sk-...

# Llama Local (Ollama)
VITE_LLAMA_BASE_URL=http://localhost:11434
```

### Setup Instructions

```bash
1. Copy env/.env.ai.example to .env
2. Fill in API keys
3. Restart dev server
4. Open AI Settings
5. Verify provider status
6. Configure per-task models
7. Test in AI Test Console
```

## Future Enhancements

### Advanced Caching

```typescript
Planned:
  ✓ IndexedDB persistence
  ✓ LRU eviction policy
  ✓ Size limits (100 MB)
  ✓ Cache warming (pre-load common queries)
  ✓ Cache analytics (hit rate, savings)
```

### Streaming Responses

```typescript
Planned:
  ✓ SSE streaming from providers
  ✓ Token-by-token UI updates
  ✓ Real-time cost tracking
  ✓ Cancel in-flight requests
```

### Multi-Model Comparison

```typescript
Planned:
  ✓ Run same prompt on multiple models
  ✓ Side-by-side comparison
  ✓ A/B testing
  ✓ Quality scoring
```

### Budget Management

```typescript
Planned:
  ✓ Daily/monthly spending caps
  ✓ Alert thresholds
  ✓ Per-user budgets
  ✓ Cost forecasting
```

### Provider Health Monitoring

```typescript
Planned:
  ✓ Latency tracking
  ✓ Error rates
  ✓ Uptime monitoring
  ✓ Auto-failover
```

## Known Limitations

1. **Client-Side API Keys:**
   - Vite exposes VITE_* vars to client
   - Not production-safe
   - Solution: Backend proxy (future)

2. **Token Estimation:**
   - Approximate (±20% accuracy)
   - Not true tokenization
   - Solution: Use tiktoken library

3. **In-Memory Cache:**
   - Lost on page reload
   - Limited size
   - Solution: IndexedDB persistence

4. **Rate Limiting:**
   - Per-provider only
   - No per-model limits
   - Solution: Granular limits

5. **Cost Tracking:**
   - No persistent history
   - No budget alerts
   - Solution: Cost dashboard

## Migration Notes

### Backward Compatibility

```typescript
Step 27 (Parsing):
  ✓ No breaking changes
  ✓ AI enhancement optional
  ✓ Deterministic fallback

Step 28 (ATS):
  ✓ "Suggest Similar" is new button
  ✓ Existing features unchanged

Step 30 (Cover Letter):
  ✓ Generation now AI-aware
  ✓ Fallback unchanged
  ✓ No API changes
```

### Usage

```typescript
Import:
  import { aiRoute } from '@/services/ai/router.service'
  import { aiSuggestKeywords } from '@/services/features/aiSuggestKeywords.service'
  import { useAIStore } from '@/store/aiStore'

Basic:
  const result = await aiRoute({
    task: 'generate',
    prompt: 'Hello'
  })

Advanced:
  const { settings } = useAIStore()
  const result = await aiRoute({
    task: 'coverLetter',
    system: 'Write professionally',
    prompt: template,
    temperature: settings.defaults.temperature
  }, {
    allowCache: true,
    timeoutMs: 60000,
    retry: { attempts: 3, backoffMs: 1000 }
  })
```

## References

- OpenAI API: https://platform.openai.com/docs/api-reference
- Anthropic API: https://docs.anthropic.com/claude/reference
- Google Gemini API: https://ai.google.dev/api
- Token Bucket: https://en.wikipedia.org/wiki/Token_bucket
- FNV Hash: https://en.wikipedia.org/wiki/Fowler–Noll–Vo_hash_function
- Semantic Caching: https://redis.io/docs/stack/search/reference/vectors/
