# Step 31: AI Provider Orchestration Layer - Developer Notes

## Overview

Step 31 introduces a comprehensive **AI Orchestration Layer** that standardizes access to multiple LLM/embedding providers with built-in resilience, cost tracking, semantic caching, rate limiting, and safety gates.

## Architecture

### Core Components

#### 1. Router Service (`router.service.ts`)
- **Main entry point** for all AI operations
- Handles retry logic with exponential backoff
- Integrates caching, safety checks, rate limiting, and cost metering
- Supports timeout/abort via AbortController
- Routes requests to appropriate provider based on task configuration

#### 2. Provider Modules
Each provider implements a standardized `call()` interface:

```ts
async function call(model: AIModelRef, req: AIRequest, signal?: AbortSignal): Promise<AIResponse>
```

**Supported Providers:**
- **OpenAI**: Chat, embeddings, moderation
- **Anthropic**: Chat (Claude)
- **Google**: Chat (Gemini)
- **DeepSeek**: Chat
- **Llama Local**: HTTP endpoint for local models (e.g., Ollama)

**Fallback Strategy:**
- If API keys are missing, providers fall back to deterministic local responses
- Application remains functional without external dependencies
- Mock data is coherent and task-appropriate

#### 3. Supporting Services

**Cache Service** (`cache.service.ts`)
- In-memory semantic cache with TTL
- Key generation based on normalized request parameters
- Automatic expiration and cleanup
- Future: IndexedDB persistence layer

**Cost Meter** (`cost.service.ts`)
- Calculates USD cost from token usage
- Provider-specific pricing models
- Tracks input/output tokens separately
- Returns comprehensive usage statistics

**Rate Limiter** (`rateLimit.service.ts`)
- Token bucket algorithm
- 60 requests/min per provider (configurable)
- Automatic refill over time
- Prevents API quota exhaustion

**Safety Gate** (`safety.service.ts`)
- Pre-check: Blocks risky prompts (violence, hate, PII)
- Post-check: Filters XSS-like patterns in responses
- Heuristic-based (no external API)
- Extensible for provider-specific moderation

**Tokenizer** (`tokenizers/cl100k.ts`)
- Approximate token estimation
- Language-aware (English vs Turkish)
- ~4 chars/token (EN), ~3 chars/token (TR)
- Used for cost calculation and request sizing

### Feature Services

High-level services that use the router:

- **aiParseCV**: Extract structured CV data from text
- **aiSuggestKeywords**: Generate ATS-friendly keyword suggestions
- **aiGenerateText**: General text generation with system/user prompts
- **aiEmbed**: Text embedding for semantic search
- **aiModerate**: Content moderation checks

### State Management

**AI Store** (`ai.store.ts`)
- Zustand-based with localStorage persistence
- Per-task model configuration
- Global defaults (temperature, timeout, retries)
- Feature toggles (safety, cache, meters)
- Exposed `getAISettings()` helper for non-React contexts

### UI Components

**AISettingsPanel**
- Provider status cards (shows env key configuration)
- Per-task model selection (provider + model name dropdowns)
- Default parameter controls (temperature, timeout, retries)
- Feature toggles (safety, cache, meters, TTL)
- Reset to defaults button

**AITestConsole**
- Quick testing interface
- Live execution with caching indicator
- Error display
- Useful for debugging configurations

**ProviderStatusCard**
- Visual status of each provider
- Shows required environment variable
- Indicates supported features (chat, embed, moderation)

## Integration Points

### Step 27: Advanced Parsing
- Optionally use `aiParseCV()` before deterministic parsing
- Merge AI-extracted fields with rule-based results

### Step 28: ATS Keyword Explorer
- **"Suggest Similar" button** in ATSKeywordTable
- Calls `aiSuggestKeywords()` with job context
- Displays AI-suggested keywords as insertable badges
- One-click add to Summary/Skills

### Step 29: Variants
- No direct integration (optional future enhancement)
- Could use AI to generate variant descriptions

### Step 30: Cover Letter Studio
- Updated `coverLetterService` to use `aiGenerateText()`
- Falls back to mock if no model configured
- Respects per-task model selection from AI settings

## Environment Variables

Create `.env.local` based on `env/.env.ai.example`:

```bash
# OpenAI (chat, embeddings, moderation)
VITE_OPENAI_API_KEY=sk-...
VITE_OPENAI_BASE_URL=https://api.openai.com/v1

# Anthropic (chat)
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_ANTHROPIC_BASE_URL=https://api.anthropic.com/v1

# Google (chat)
VITE_GOOGLE_API_KEY=...

# DeepSeek (chat)
VITE_DEEPSEEK_API_KEY=...
VITE_DEEPSEEK_BASE_URL=https://api.deepseek.com/v1

# Local Llama (Ollama or similar)
VITE_LLAMA_BASE_URL=http://localhost:11434
```

**Note:** All keys are optional. The app gracefully degrades to local fallbacks.

## Testing

### Unit Tests
- **router.service.spec.ts**: Retry logic, caching, safety, model selection
- **cache.service.spec.ts**: Set/get/expire/clear
- **rateLimit.service.spec.ts**: Token bucket throttling
- **cost.service.spec.ts**: USD calculation accuracy
- **safety.service.spec.ts**: Pre/post filtering
- **ai.store.spec.ts**: State persistence and updates
- **aiSuggestKeywords.service.spec.ts**: Keyword generation

### E2E Tests
- **step31-ai-orchestrator-flow.spec.ts**:
  - Configure AI settings
  - Generate cover letter
  - Suggest keywords in ATS
  - Test console execution
  - Settings persistence
  - Cache indicator

Run tests:
```bash
npm run test:unit
npm run test:e2e
```

## Performance & Costs

### Caching
- Default TTL: 15 minutes
- Semantic keys based on normalized input
- Reduces API costs and latency
- Disable for real-time or sensitive tasks

### Rate Limiting
- Prevents quota exhaustion
- Provider-specific buckets
- Exponential backoff on retries
- Configurable thresholds

### Cost Tracking
- Real-time USD calculation
- Per-request usage stats
- Meter display in UI (optional)
- Future: Daily/monthly aggregates

## Security & Privacy

### Safety Gates
- Heuristic pre-filtering (violence, hate, PII)
- Post-filtering (XSS, injection patterns)
- No external API calls (offline)
- Extensible for provider moderation endpoints

### Data Handling
- Prompts never logged in production
- Redact sensitive patterns (emails, phones)
- API keys stored in environment (never in code)
- Cache cleared on logout (future)

### CORS & CSP
- All providers use HTTPS
- CORS configured for API endpoints
- CSP allows fetch to AI domains

## Future Enhancements

1. **Streaming Responses**
   - Real-time token streaming
   - Progress indicators
   - Partial result rendering

2. **Persistent Cache**
   - IndexedDB storage
   - Cross-session caching
   - Cache warming strategies

3. **Advanced Metering**
   - Daily/monthly cost reports
   - Budget alerts
   - Provider cost comparison

4. **Multi-Model Compare**
   - Run same prompt on multiple providers
   - Side-by-side results
   - Quality/speed/cost analysis

5. **Fine-Tuning Support**
   - Upload custom models
   - Provider-specific fine-tunes
   - Version management

6. **Embeddings Search**
   - Vector similarity search
   - Semantic CV matching
   - Related job recommendations

## Troubleshooting

### Provider Not Working
- Check environment variable name (must start with `VITE_`)
- Verify API key validity
- Check provider status card in UI
- Review browser console for errors

### Slow Responses
- Increase timeout in AI settings
- Check rate limit throttling
- Monitor network tab for API latency
- Consider using faster models

### Cache Not Working
- Ensure cache toggle is enabled
- Check TTL is not too short
- Verify cache key generation (identical inputs)
- Clear cache and retry

### Safety Blocking Valid Content
- Disable safety toggle temporarily
- Review safety.service.ts patterns
- Add exceptions for specific terms
- Use provider-specific moderation instead

### Cost Tracking Inaccurate
- Verify model pricing in AIModelRef
- Check token estimation accuracy
- Update cost rates for new models
- Use provider usage dashboards for verification

## Contributing

When adding new providers:
1. Create `providers/newProvider.provider.ts`
2. Implement `call()` interface
3. Add fallback behavior
4. Update `providerModule()` switch in router
5. Add status card in AISettingsPanel
6. Document env variables
7. Add unit tests

## Resources

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Anthropic API Docs](https://docs.anthropic.com)
- [Google Gemini API](https://ai.google.dev/docs)
- [DeepSeek API](https://platform.deepseek.com/docs)
- [Ollama Local Models](https://ollama.ai)
