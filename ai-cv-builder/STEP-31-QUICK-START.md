# Step 31: AI Orchestration Layer - Quick Start Guide

## 🚀 What's New?

Step 31 adds a powerful **AI Orchestration Layer** that enables:
- Multi-provider AI support (OpenAI, Anthropic, Google, DeepSeek, Local)
- Smart keyword suggestions in ATS analysis
- AI-powered cover letter generation
- Semantic caching for cost savings
- Safety filtering and rate limiting
- Per-task model configuration

## 📋 Prerequisites

- Node.js 18+ installed
- Existing Step 30 codebase
- (Optional) API keys for AI providers

## 🎯 Quick Setup (5 Minutes)

### 1. Install Dependencies
```bash
cd ai-cv-builder
npm install
```

### 2. Configure AI Providers (Optional)
```bash
# Copy environment template
cp .env.ai.example .env.local

# Edit .env.local and add your API keys
# (Skip if you want to use fallback mode)
```

Example `.env.local`:
```env
VITE_OPENAI_API_KEY=sk-your-key-here
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Access AI Settings
1. Open http://localhost:5173
2. Click **Settings** → **AI Settings**
3. Configure your preferred providers

## ✨ Key Features to Try

### 1. AI-Powered Keyword Suggestions
**Location**: ATS Analysis → Keywords Tab

1. Upload a CV and paste a job posting
2. Click **"Analyze"** to get ATS score
3. Go to **Keywords** tab
4. Click **"Suggest Similar"** button
5. AI will suggest related ATS-friendly keywords
6. Click **+** on any suggestion to add it to your CV

**What it does**: Uses AI to analyze your job posting and current keywords to suggest additional relevant terms that can improve your ATS score.

### 2. AI Cover Letter Generation
**Location**: Cover Letter Tab

1. Navigate to **Cover Letter**
2. Configure tone and length
3. Add optional custom instructions
4. Click **"Generate Cover Letter"**
5. AI creates a personalized cover letter

**What's new**: Now uses the AI orchestration layer with your configured provider instead of hardcoded Anthropic.

### 3. AI Settings Panel
**Location**: Settings → AI Settings

Configure per-task models:
- **Parsing**: CV text extraction
- **Generate**: General text generation
- **Cover Letter**: Cover letter creation
- **Suggest**: Keyword suggestions
- **Embed**: Semantic embeddings
- **Moderate**: Content filtering

Adjust defaults:
- Temperature (creativity: 0-1)
- Timeout (ms)
- Retry attempts

Toggle features:
- Safety filtering
- Semantic caching
- Cost meters

### 4. AI Test Console
**Location**: Settings → AI Settings (bottom)

Quick way to test AI responses:
1. Type a prompt (e.g., "Say hello in one sentence")
2. Click **"Run"**
3. See the response
4. Watch for "(cached)" indicator on repeat requests

## 🔧 Configuration Examples

### Example 1: Use OpenAI for Everything
```env
VITE_OPENAI_API_KEY=sk-...
```

Then in AI Settings:
- Cover Letter → OpenAI → `gpt-4o-mini`
- Suggest → OpenAI → `gpt-4o-mini`
- Parse → OpenAI → `gpt-4o-mini`

### Example 2: Mix Providers
```env
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_OPENAI_API_KEY=sk-...
```

Then in AI Settings:
- Cover Letter → Anthropic → `claude-3-5-sonnet-20241022`
- Suggest → OpenAI → `gpt-4o-mini`
- Embed → OpenAI → `text-embedding-3-small`

### Example 3: Local Llama (Free)
```env
VITE_LLAMA_BASE_URL=http://localhost:11434
```

1. Install [Ollama](https://ollama.ai)
2. Run `ollama pull llama3`
3. Configure in AI Settings:
   - Cover Letter → Llama Local → `llama3:instruct`

## 🎨 UI Tour

### Provider Status Cards
Shows which providers are configured:
- 🟢 **Ready**: API key configured
- ⚪ **Not configured**: No API key

### Per-Task Model Selection
Each task (parsing, generation, etc.) can use a different provider and model.

### Quick Toggles
- **Safety**: Enable/disable content filtering
- **Cache**: Enable/disable response caching
- **Meters**: Show/hide cost/token tracking

## 🧪 Testing Your Setup

### Manual Testing Checklist

1. **Test Console**
   - [ ] Go to AI Settings
   - [ ] Enter "Write a haiku about coding"
   - [ ] Click Run
   - [ ] Verify response appears

2. **Keyword Suggestions**
   - [ ] Upload sample CV
   - [ ] Paste job posting
   - [ ] Run ATS analysis
   - [ ] Click "Suggest Similar"
   - [ ] Verify keywords appear
   - [ ] Click + to add one

3. **Cover Letter**
   - [ ] Go to Cover Letter tab
   - [ ] Select tone & length
   - [ ] Click Generate
   - [ ] Verify letter appears

4. **Caching**
   - [ ] Run same test prompt twice
   - [ ] Verify "(cached)" appears second time

5. **Settings Persistence**
   - [ ] Change temperature to 0.8
   - [ ] Reload page
   - [ ] Verify setting persisted

### Automated Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

## 🔍 Troubleshooting

### "Not configured" showing but I have a key
- Ensure key starts with `VITE_` prefix
- Restart dev server after adding env vars
- Check `.env.local` is in project root

### AI responses are slow
- Check your internet connection
- Try a faster model (e.g., gpt-4o-mini vs gpt-4o)
- Increase timeout in defaults

### "Suggest Similar" not working
- Verify job posting is pasted
- Check provider is configured
- Try with fallback mode (no API key)

### Cached responses not showing
- Enable cache toggle in settings
- Ensure identical prompts (same text, params)
- Check TTL isn't too short (default 15min)

## 💡 Pro Tips

### Cost Optimization
1. Enable caching (saves repeat API calls)
2. Use smaller models for simple tasks
3. Set appropriate max tokens
4. Use local Llama for dev/testing

### Best Practices
1. **Cover Letters**: Use temperature 0.3-0.7 for creativity
2. **Keywords**: Use temperature 0.1-0.3 for consistency
3. **Safety**: Keep enabled for production
4. **Caching**: Enable for repeated queries

### Performance Tips
1. Lower temperature = faster responses
2. Reduce max tokens for quicker results
3. Use embeddings for semantic search
4. Local models = zero latency (no API)

## 📚 Next Steps

1. **Read Full Docs**: See `src/docs/STEP-31-NOTES.md`
2. **View File List**: See `STEP-31-FILES.md`
3. **Check Completion**: See `STEP-31-COMPLETION.md`
4. **Explore Code**: Start with `src/services/ai/router.service.ts`
5. **Add Provider**: See provider pattern in `src/services/ai/providers/`

## 🆘 Getting Help

### Common Questions

**Q: Do I need API keys?**
A: No! The app works with local fallbacks. API keys unlock real AI features.

**Q: Which provider is best?**
A: Depends on your needs:
- OpenAI: Best general purpose, embeddings
- Anthropic: Best for long-form text
- Google: Good balance of speed/quality
- DeepSeek: Cost-effective
- Local: Free but needs setup

**Q: How much does it cost?**
A: Typical usage:
- Cover letter: $0.01-0.05
- Keyword suggestions: <$0.01
- With caching: 50-90% cost reduction

**Q: Can I use multiple providers?**
A: Yes! Configure different providers per task.

**Q: Is my data safe?**
A: Safety gates filter sensitive patterns. API calls use HTTPS. No data logged.

### Resources

- [OpenAI Docs](https://platform.openai.com/docs)
- [Anthropic Docs](https://docs.anthropic.com)
- [Google AI Docs](https://ai.google.dev)
- [Ollama (Local)](https://ollama.ai)

## ✅ Success Checklist

After setup, you should be able to:
- [ ] See provider status in AI Settings
- [ ] Generate a cover letter
- [ ] Get keyword suggestions in ATS
- [ ] See cached responses indicator
- [ ] Settings persist across reloads
- [ ] Run test console successfully

## 🎉 You're Ready!

The AI Orchestration Layer is now active and enhancing your CV Builder with intelligent features. Start by trying the keyword suggestions or generating a cover letter!

**Happy Building! 🚀**
