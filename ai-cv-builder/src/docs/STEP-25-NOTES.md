# Step 25: Job Posting Input & ATS Analysis Core — Developer Notes

## Overview

Step 25 implements a complete **Job Posting Input & ATS Analysis** module with interactive UI components, rule-based analysis, and undo/redo functionality. The architecture is designed to be clean and modular, with clear boundaries that will allow seamless integration of multi-provider AI in Step 31.

## Architecture

### 1. Data Flow

```
Job Text → Parser → ParsedJob → Analysis → ATSAnalysisResult → UI Pills
                                     ↓
                                  CV Data ← Apply/Dismiss → Updated CV
```

### 2. Core Services

#### `jobParser.ts`
- **Purpose**: Parse unstructured job posting text into structured data
- **Approach**: Heuristic-based extraction using regex patterns and text analysis
- **Language Support**: English & Turkish detection via character distribution
- **Outputs**: Title, company, location, keywords, sections (requirements, responsibilities, etc.)

#### `analysis.service.ts`
- **Purpose**: Compare CV against parsed job and generate actionable suggestions
- **Scoring**: 0-100 scale based on keyword matches and structural completeness
- **Suggestion Types**:
  - **Keywords**: Missing job-specific terms
  - **Sections**: Missing or weak summary/experience/education
  - **Contact**: Missing email/phone
  - **Length**: Too short (<200 words) or too long (>1200 words)
  - **Structure**: Missing skills, certifications, etc.

#### `textUtils.ts`
- **Purpose**: Text normalization and CV modification utilities
- **Key Functions**:
  - `normalizeText()`: Removes diacritics, lowercases, trims
  - `tokenize()`: Splits text into searchable tokens
  - `detectLang()`: Identifies English vs Turkish
  - `updateByPath()`: Applies suggestion actions to CV data structure

### 3. State Management (Zustand)

#### `ats.store.ts`
- **Persisted State**: `currentJobText`, `parsedJob`, `result`, `filter`
- **Transient State**: `isParsing`, `isAnalyzing`, `error`
- **History**: `past[]` and `future[]` arrays for undo/redo
- **Actions**:
  - `parseJob()`: Async parse with lazy service import
  - `analyze()`: Generate ATS result against CV
  - `applySuggestion()`: Update CV and mark suggestion as applied
  - `dismissSuggestion()`: Remove suggestion from list
  - `undo()/redo()`: Navigate history stacks

**Undo/Redo Implementation**:
- Before any mutation (apply/dismiss), snapshot current suggestions to `past[]`
- Clear `future[]` on new mutations (standard undo/redo UX)
- On undo: pop from `past`, push current to `future`, restore previous state
- On redo: pop from `future`, push current to `past`, restore next state

### 4. UI Components

#### Job Input
- **JobInput.tsx**: Tab container (Paste / URL / File)
- **JobPasteTab.tsx**: Textarea with word count and debounce
- **JobUrlTab.tsx**: URL fetch with CORS handling
- **JobFileTab.tsx**: File upload (.txt, .md, .html, .pdf, .docx)

#### ATS Panel
- **ATSPanel.tsx**: Main container with filters, actions, and pill list
- **ATSPill.tsx**: Interactive suggestion pill with:
  - Severity-based border color (critical=red, high=orange, medium=yellow, low=blue)
  - Hover → red background + dismiss "×" button
  - Click → apply suggestion (if not already applied)
  - Keyboard accessible (Enter to apply)
- **ATSFilters.tsx**: Category, severity, and search filters
- **ATSSummaryBar.tsx**: Score display with matched/missing keyword counts

#### Page Integration
- **CVBuilder.tsx**:
  - New **"Job"** tab: JobInput + "Analyze against CV" button
  - New **"ATS Optimize"** tab: ATSPanel + live CV preview (split view on xl+ screens)
  - Button to trigger analysis and navigate between tabs

### 5. Styling & UX

- **Tailwind CSS**: All components use utility classes
- **shadcn/ui**: Button, Input, Textarea, Select, Card, Tabs
- **Hover Behavior**: Pills turn red (`hover:bg-red-50`) and reveal dismiss button
- **Accessibility**:
  - `role="button"` and `tabIndex={0}` for pills
  - `aria-label` with category/severity/title
  - Keyboard support (Enter to apply, Esc to blur)
  - Focus rings (`focus-visible:ring-2`)
- **Reduced Motion**: Transitions use `duration-200` and respect `prefers-reduced-motion`

### 6. Internationalization (i18n)

- **Namespaces**: `cv`, `common`
- **Languages**: English (`en`) and Turkish (`tr`)
- **Keys Added**:
  - `job.*`: Tab labels, parse/fetch buttons, word count, placeholders
  - `optimize.*`: Filter labels, no-suggestions message
  - `common.*`: Undo/Redo

### 7. Testing

#### Unit Tests (Vitest)
- **jobParser.spec.ts**: 
  - Parses EN & TR samples
  - Extracts title, company, location, salary
  - Splits sections (requirements, responsibilities, benefits)
  - Detects remote type
  - Generates keywords
- **analysis.service.spec.ts**:
  - Computes matched/missing keywords
  - Emits critical/high suggestions for missing sections
  - Score bounded [0,100] and deterministic
  - Higher score with more matches

#### E2E Tests (Playwright)
- **step25-ats-flow.spec.ts**:
  - Paste job → Parse → Analyze → See pills
  - Hover pill → red + "×"
  - Click pill → applied state (opacity-50)
  - Dismiss pill → removed from list
  - Undo/Redo → state restoration
  - Filter by category/severity/search
  - Live preview visible on xl screens
  - Keyboard navigation (Enter to apply)

### 8. Future Integration Points (Step 31: Multi-Provider AI)

**Clean Boundaries for AI Swap**:
1. **Parser**: Replace `parseJobText()` with AI-based structured extraction
2. **Analysis**: Replace `analyzeCVAgainstJob()` with LLM-generated suggestions
3. **Scoring**: Enhance scoring with semantic similarity models
4. **Suggestions**: Add AI-generated rewrites and personalized advice

**No refactoring needed** — just swap service implementations while keeping types, UI, and state management intact.

### 9. Security & Performance

- **Sanitization**: HTML fetched from URLs is stripped before display
- **Rate Limiting**: (TODO) Add rate limit to `fetchJobUrl` in production
- **Debouncing**: Text input uses `useDebouncedValue` (250ms delay)
- **Lazy Imports**: Parser/analysis services imported only when needed
- **Memoization**: `useMemo` for filtered suggestions in `ATSPanel`

### 10. Known Limitations & TODOs

- [ ] CORS proxy needed for fetching jobs from external sites (Step 31)
- [ ] Vitest configuration for running tests (add `vitest.config.ts`)
- [ ] Playwright setup for E2E tests (install `@playwright/test`)
- [ ] Advanced PDF/DOCX parsing for file upload (current: plain text only)
- [ ] Telemetry event tracking (hooks ready, analytics service TBD)
- [ ] Multi-language keyword sets (currently hardcoded EN/TR)
- [ ] Suggestion action types beyond `add` (e.g., `replace`, `reorder`)

---

## Quick Start for Developers

1. **Add a new keyword category**:
   - Edit `services/ats/keywordSets.ts`
   - Add to `COMMON_EN_KEYWORDS` or `COMMON_TR_KEYWORDS`

2. **Add a new suggestion type**:
   - Edit `services/ats/analysis.service.ts`
   - Create a new function (e.g., `certificationSuggestions()`)
   - Add to the `suggestions` array in `analyzeCVAgainstJob()`

3. **Customize pill colors**:
   - Edit `components/ats/ATSPill.tsx`
   - Modify `severityColors` object

4. **Add a new filter**:
   - Edit `components/ats/ATSFilters.tsx`
   - Add new Select/Input component
   - Update `filter` object in `ats.store.ts`

5. **Run tests**:
   ```bash
   # Unit tests (after Vitest setup)
   npm run test

   # E2E tests (after Playwright setup)
   npx playwright test
   ```

---

## References

- **Zustand Docs**: https://zustand-demo.pmnd.rs/
- **shadcn/ui**: https://ui.shadcn.com/
- **i18next**: https://www.i18next.com/
- **Playwright**: https://playwright.dev/
- **Vitest**: https://vitest.dev/

---

**Author**: AI CV Builder Team  
**Date**: 2025-10-08  
**Version**: 1.0.0
