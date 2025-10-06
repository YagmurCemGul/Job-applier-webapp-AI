# Step 25: Job Posting Input + ATS Analysis Core

## Overview

This module implements a complete ATS (Applicant Tracking System) analysis flow for CV optimization against job postings.

## Architecture

### Components

```
Job Input Flow:
  JobInput → [JobPasteTab | JobUrlTab | JobFileTab]
    ↓
  parseJobText (heuristic parser)
    ↓
  ParsedJob (structured data)

Analysis Flow:
  ParsedJob + CVData
    ↓
  analyzeCVAgainstJob
    ↓
  ATSAnalysisResult (score + suggestions)
    ↓
  ATSPanel → ATSPill (interactive UI)
```

### Services

1. **jobParser.ts**: Heuristic text parser
   - Extracts title, company, location, remote type, salary
   - Splits sections (summary, requirements, responsibilities, etc.)
   - Detects language (EN/TR)
   - Extracts and dedupes keywords

2. **analysis.service.ts**: Rule-based CV analysis
   - Keyword matching (matched vs missing)
   - Section completeness checks
   - Contact information validation
   - Length analysis
   - Experience/education validation
   - ATS score calculation (0-100)

3. **textUtils.ts**: Text processing utilities
   - Normalization (diacritics, case, whitespace)
   - Tokenization
   - Language detection
   - CV path updates for applying suggestions

### State Management

**ATSStore** (Zustand + persist):
- Current job text
- Parsed job data
- Analysis result
- Undo/redo stacks (history of suggestion states)
- UI filters (category, severity, search)
- Loading states

### Undo/Redo Implementation

The undo/redo system maintains stacks of suggestion snapshots:
- **past**: Array of previous suggestion states
- **future**: Array of undone states (for redo)

When a suggestion is applied or dismissed:
1. Current state is snapshot to `past`
2. `future` is cleared
3. Change is applied

Undo restores the last `past` state and moves current to `future`.
Redo restores the first `future` state and moves it back to `past`.

## Future AI Integration (Step 31)

The current implementation is rule-based/heuristic. For AI integration:

1. **Replace keyword extraction**: Use LLM to extract domain-specific keywords
2. **Replace scoring**: Use AI to provide nuanced scoring with explanations
3. **Replace suggestion generation**: Use AI to generate contextual, actionable suggestions
4. **Add**: Rewrite suggestions for specific sections

### Adapter Pattern

Create an AI provider interface:

```typescript
interface ATSProvider {
  parseJob(text: string): Promise<ParsedJob>
  analyzeCV(cv: CVData, job: ParsedJob): Promise<ATSAnalysisResult>
}

// Implementations:
// - HeuristicProvider (current)
// - ClaudeProvider
// - OpenAIProvider
// - LocalLLMProvider
```

## Testing

Unit tests cover:
- Job parser (EN/TR samples)
- Analysis service (keyword matching, scoring)
- Text utilities (normalization, tokenization, language detection)

E2E tests verify:
- Job input flow (paste/URL/file)
- Parse → Analyze flow
- Pill interactions (apply, dismiss, hover)
- Undo/redo functionality
- Live CV preview updates

## Performance Considerations

- Debounced text input (250ms)
- Lazy imports for parser/analyzer (code splitting)
- Memoized filter computations
- Persisted state (no re-parsing on page reload)

## Accessibility

- Pills: `role="button"`, `tabIndex=0`, ARIA labels
- Keyboard navigation (Enter to apply, × button to dismiss)
- Focus rings and hover states
- Screen reader support for all interactive elements

## Security

- URL fetch: CORS-aware (may need server proxy)
- HTML sanitization for fetched content
- No PII in error logs
- Rate limiting considerations for URL fetching

## Known Limitations

1. **CORS**: URL fetch may fail for some job sites (needs server proxy)
2. **PDF/DOCX parsing**: File upload only supports plain text formats
3. **Language detection**: Heuristic based on character distribution
4. **Scoring**: Simple rule-based (will be replaced by AI)

## Development

To extend the parser:
1. Add patterns to `jobParser.ts`
2. Update `ParsedJob` interface
3. Add corresponding UI in `JobInput`

To add suggestion types:
1. Add function in `analysis.service.ts`
2. Add to `analyzeCVAgainstJob` suggestions array
3. Update `ATSCategory` type if needed

## References

- Zustand docs: https://github.com/pmndrs/zustand
- ATS best practices: Industry standard CV parsing patterns
- i18n: EN/TR translations in `src/i18n/locales/`
