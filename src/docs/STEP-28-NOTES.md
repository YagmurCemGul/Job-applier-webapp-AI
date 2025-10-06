# Step 28: ATS Details View with Keyword Explorer, Inline Highlighting & Configurable Weights

## Overview

This module elevates the ATS experience with a comprehensive details view featuring keyword management, inline highlighting, and configurable scoring weights.

## Architecture

### Component Hierarchy

```
CVBuilder (Optimize Tab)
├─ Tabs (Suggestions | Details)
│  ├─ Suggestions Tab (existing ATSPanel)
│  └─ Details Tab
│     └─ ATSDetails
│        ├─ Export Buttons (JSON, CSV)
│        ├─ ATSHighlightsToggles
│        └─ ATSDetailsTabs
│           ├─ Overview Tab
│           │  ├─ Score Cards (score, matched, missing)
│           │  ├─ Weights Used (display)
│           │  └─ Suggestions Summary
│           ├─ Keywords Tab
│           │  └─ ATSKeywordTable
│           │     ├─ Filters (search, status)
│           │     └─ Actions (Add to Summary/Skills/Experience)
│           └─ Weights Tab
│              └─ ATSWeightsPanel
│                 ├─ Weight Sliders (5 categories)
│                 └─ Recalculate Button
```

### State Management

```
Stores:
┌─────────────────────┐
│ useATSStore         │ ← Core ATS analysis (Step 25)
│ - result            │
│ - parsedJob         │
│ - analyze()         │
└─────────────────────┘

┌─────────────────────┐
│ useATSUIStore       │ ← New UI state
│ - highlights        │   ('off' | 'job' | 'cv' | 'both')
│ - showLegend        │
│ - kwSearch          │
│ - selectedKw        │
└─────────────────────┘

┌─────────────────────┐
│ useATSWeightsStore  │ ← New weights configuration
│ - weights           │   (keywords, sections, etc.)
│ - setWeight()       │
│ - normalized()      │   (sum = 1.0)
│ - reset()           │
└─────────────────────┘

Persistence:
  - atsUIStore: localStorage (highlights, showLegend)
  - atsWeightsStore: in-memory (resets on refresh)
```

## Features

### 1. Keyword Explorer

**ATSKeywordTable Component:**

```typescript
Features:
  ✓ Display all keywords (matched + missing)
  ✓ Show importance scores (0-1)
  ✓ Status badges (Matched/Missing)
  ✓ Section presence indicators (Title/Req/Qual/Resp)
  ✓ Actions for missing keywords:
    - Add to Summary
    - Add to Skills
    - Add to Experience (pick which one)

Filters:
  ✓ Search by term (debounced)
  ✓ Status filter (All/Matched/Missing)

Sorting:
  ✓ Pre-sorted by importance (descending)

Interactions:
  ✓ Click row → sets selectedKw
  ✓ Click action → updates CV data immediately
  ✓ Live preview updates automatically
```

**Keyword Importance Calculation:**

```typescript
Algorithm (keywordImportance.service.ts):

1. Calculate frequency:
   freq = count(term in all sections) / max(all freqs)
   base_importance = freq * 0.5

2. Add bonuses:
   if (inTitle): importance += 0.2
   if (inRequirements): importance += 0.15
   if (inResponsibilities): importance += 0.1

3. Cap and round:
   importance = min(1.0, importance)
   importance = round(importance, 2)

4. Sort:
   keywords.sort((a, b) => b.importance - a.importance)

Example:
  "typescript" appears:
    - Title: "Senior TypeScript Engineer" ✓
    - Requirements: "Must have TypeScript" ✓
    - 5 times total (max freq = 10)
  
  calculation:
    base = (5/10) * 0.5 = 0.25
    bonus = 0.2 (title) + 0.15 (req) = 0.35
    total = 0.25 + 0.35 = 0.60
```

### 2. Inline Highlighting

**Highlights Service:**

```typescript
highlightText(input: string, terms: string[]): string

Safety Features:
  ✓ XSS-safe (escapes HTML)
  ✓ No nested <mark> tags
  ✓ Case-insensitive matching
  ✓ Word boundary respecting
  ✓ Longest-first to avoid partial matches

Implementation:
  1. Sort terms by length (longest first)
  2. Find all matches (regex with \b boundaries)
  3. Track marked ranges (avoid overlaps)
  4. Build HTML with <mark data-kw="term"> wrappers
  5. Add aria-label for accessibility

Example:
  Input: "I love React and TypeScript"
  Terms: ["react", "typescript"]
  
  Output:
    "I love <mark data-kw="react" aria-label="keyword: react">React</mark>
     and <mark data-kw="typescript" aria-label="keyword: typescript">TypeScript</mark>"
```

**Highlighting Modes:**

```typescript
Modes:
  'off':  No highlighting
  'job':  Highlight in job text only
  'cv':   Highlight in CV preview only
  'both': Highlight in both

Toggle UI:
  ✓ Radio group (4 options)
  ✓ Legend (matched = blue, missing = gray)
  ✓ Persisted to localStorage
```

**Keyboard Navigation:**

```typescript
Shortcuts:
  Alt + ↓ : Next highlight
  Alt + ↑ : Previous highlight

Features:
  ✓ Scroll to mark (smooth)
  ✓ Focus ring on current mark
  ✓ Counter (e.g., "Highlight 3 of 12")
  ✓ Navigation buttons
```

**Job Text Viewer:**

```typescript
ATSJobTextViewer:
  ✓ Displays raw job text
  ✓ Applies highlights when enabled
  ✓ Scrollable area
  ✓ Monospace font option
  ✓ Navigation controls
  ✓ Keyboard shortcuts

Rendering:
  dangerouslySetInnerHTML={
    { __html: highlighted.html }
  }
  
  Safety: HTML is sanitized by highlightText()
```

### 3. Configurable Weights

**Default Weights:**

```typescript
{
  keywords: 0.40,    // 40% - keyword matching
  sections: 0.20,    // 20% - section completeness
  length: 0.10,      // 10% - CV length
  experience: 0.20,  // 20% - experience count
  formatting: 0.10   // 10% - formatting issues
}
```

**Weights Panel UI:**

```typescript
ATSWeightsPanel:
  ✓ 5 sliders (0-1, step 0.05)
  ✓ Live sum indicator
  ✓ Normalized values shown
  ✓ Reset button (restore defaults)
  ✓ Recalculate button (re-analyze with new weights)

Display:
  keywords: 0.45 → 0.39 (normalized)
  sections: 0.55 → 0.48
  ...
  Sum: 1.15 → 1.00

Normalization:
  normalized = value / sum(all values)
```

**Score Calculation (Enhanced):**

```typescript
computeScore(
  matchedCount,
  missingCount,
  cv,
  suggestions,
  weights: ATSScoringWeights
): number

Components:
  1. Keywords Score:
     kwScore = matchedCount / (matchedCount + missingCount)
  
  2. Sections Score:
     sectionScore = count(complete sections) / 5
     (contact, summary, experience, education, skills)
  
  3. Length Score:
     if (wordCount < 200): lengthScore = 0.3
     else if (wordCount > 800): lengthScore = 0.7
     else: lengthScore = 0.3 + (wordCount - 200) / 600 * 0.4
  
  4. Experience Score:
     expScore = min(experience.length / 3, 1)
  
  5. Formatting Score:
     criticalCount = count(critical suggestions)
     highCount = count(high suggestions)
     formattingScore = max(0, 1 - criticalCount * 0.2 - highCount * 0.1)

Final Score:
  raw = kwScore * weights.keywords
      + sectionScore * weights.sections
      + lengthScore * weights.length
      + expScore * weights.experience
      + formattingScore * weights.formatting
  
  score = round(clamp(raw * 100, 0, 100))
```

**Recalculate Flow:**

```typescript
User Action:
  1. Adjust weights using sliders
  2. Click "Recalculate"

Process:
  1. Get normalized weights
  2. Call analyze(cv, { weights: normalized() })
  3. analysis.service.ts uses custom weights
  4. Returns new ATSAnalysisResult with:
     - Updated score
     - weightsUsed: normalized weights
  5. UI updates automatically

Result:
  ✓ New score displayed
  ✓ Weights snapshot saved in result
  ✓ Overview tab shows weights used
```

### 4. Export Features

**JSON Export:**

```typescript
exportATSJson(result: ATSAnalysisResult): Blob

Format:
  {
    "id": "abc-123",
    "jobHash": "hash-456",
    "score": 85,
    "suggestions": [...],
    "matchedKeywords": [...],
    "missingKeywords": [...],
    "createdAt": "2025-10-06T...",
    "keywordMeta": [...],
    "weightsUsed": {
      "keywords": 0.4,
      ...
    }
  }

Download:
  Filename: ats-analysis-{id}.json
  Type: application/json
```

**CSV Export:**

```typescript
exportKeywordsCsv(meta, matched, missing): Blob

Format:
  term,importance,status,inTitle,inReq,inQual,inResp
  typescript,0.90,matched,yes,yes,no,yes
  react,0.75,matched,no,yes,yes,no
  vue,0.60,missing,no,yes,no,no

Features:
  ✓ CSV header row
  ✓ Importance rounded to 2 decimals
  ✓ Status (matched/missing)
  ✓ Boolean columns as yes/no
  ✓ Proper CSV escaping (quotes)

Download:
  Filename: ats-keywords-{id}.csv
  Type: text/csv;charset=utf-8
```

**Download Utility:**

```typescript
downloadBlob(blob: Blob, filename: string)

Process:
  1. Create object URL
  2. Create temp <a> element
  3. Set href and download attributes
  4. Trigger click
  5. Remove element
  6. Revoke URL after 100ms

Safety:
  ✓ URL.revokeObjectURL() prevents memory leak
  ✓ Temp element removed from DOM
```

## Type Extensions (Non-Breaking)

### ATSKeywordMeta

```typescript
export interface ATSKeywordMeta {
  term: string              // Keyword text
  stem?: string             // Lowercase stem
  importance: number        // 0-1 score
  inTitle?: boolean         // In job title
  inReq?: boolean           // In requirements
  inQual?: boolean          // In qualifications
  inResp?: boolean          // In responsibilities
}
```

### ATSScoringWeights

```typescript
export interface ATSScoringWeights {
  keywords: number          // Weight for keyword matching
  sections: number          // Weight for section completeness
  length: number            // Weight for CV length
  experience: number        // Weight for experience count
  formatting: number        // Weight for formatting quality
}
```

### ATSAnalysisResult Extensions

```typescript
export interface ATSAnalysisResult {
  // Existing fields (unchanged)
  id: string
  jobHash: string
  score: number
  suggestions: ATSSuggestion[]
  matchedKeywords: string[]
  missingKeywords: string[]
  createdAt: Date

  // New optional fields (Step 28)
  keywordMeta?: ATSKeywordMeta[]
  weightsUsed?: ATSScoringWeights
}
```

**Backward Compatibility:**

```typescript
Old code (Step 25):
  const result = analyze(cv, job)
  // result.keywordMeta is undefined
  // UI degrades gracefully

New code (Step 28):
  const result = analyze(cv, job, { weights })
  // result.keywordMeta is populated
  // result.weightsUsed is set
  // Enhanced UI shows details

Migration:
  ✓ No changes needed to existing code
  ✓ analysis.service.ts extends, doesn't break
  ✓ Step 25/26 UI continues to work
  ✓ Step 28 UI checks for keywordMeta existence
```

## Integration Flow

### 1. Analysis with Weights

```typescript
User Flow:
  1. User parses job posting
  2. User clicks "Analyze"
  3. Default weights used:
     analyze(cv, job) // No opts
  
  4. User navigates to Optimize → Details → Weights
  5. User adjusts weights
  6. User clicks "Recalculate"
  7. Custom weights used:
     analyze(cv, job, { weights: normalized() })

Code:
  // CVBuilder.tsx
  <Button onClick={() => analyze(cv)}>
    Analyze
  </Button>

  // ATSWeightsPanel.tsx
  <Button onClick={handleRecalculate}>
    Recalculate
  </Button>
  
  const handleRecalculate = async () => {
    const norm = normalized()
    await analyze(cv, { weights: norm })
  }
```

### 2. Keyword Actions

```typescript
Add to Summary:
  1. User clicks "Add to Summary" on missing keyword
  2. ATSKeywordTable calls:
     updateSummary(current + ' ' + term)
  3. CV store updates
  4. Live preview re-renders
  5. Keyword now appears in CV

Add to Skills:
  1. User clicks "Add to Skills"
  2. Check if skill exists
  3. If not, append to skills array:
     updateSkills([...skills, { id, name: term, level: 3 }])
  4. Skills section updates

Add to Experience:
  1. User clicks "Add to Experience..."
  2. Dropdown shows all experiences
  3. User picks experience
  4. Prepend term to description:
     description = `${term}. ${oldDescription}`
  5. Experience updates
```

### 3. Highlighting Toggle

```typescript
Toggle Flow:
  1. User selects highlights mode:
     - Off: No highlights
     - Job: Job text viewer highlighted
     - CV: CV preview highlighted
     - Both: Both highlighted
  
  2. UI state updates:
     setHighlights(mode)
  
  3. Components react:
     if (highlights === 'job' || highlights === 'both') {
       <ATSJobTextViewer enabled={true} terms={matchedKeywords} />
     }
     
     if (highlights === 'cv' || highlights === 'both') {
       <CVPreview highlighted terms={matchedKeywords} />
     }

Navigation:
  1. User presses Alt+↓
  2. Event listener captures
  3. navigateToMark('next') called
  4. currentIndex increments
  5. Scroll to mark[currentIndex]
  6. Focus applied
```

## Accessibility

### Keyboard Support

```typescript
Global Shortcuts:
  Alt + ↓ : Next highlight
  Alt + ↑ : Previous highlight

Component Shortcuts:
  Tab     : Navigate between elements
  Enter   : Activate button/link
  Space   : Toggle checkbox/radio
```

### ARIA Labels

```typescript
<mark> Tags:
  aria-label="keyword: {term}"
  
  Example:
    <mark aria-label="keyword: typescript">TypeScript</mark>

Buttons:
  aria-label for icon-only buttons
  
  Example:
    <Button aria-label="Previous highlight">
      <ChevronUp />
    </Button>

Tables:
  Proper <th> headers
  scope attributes
  
  Example:
    <th scope="col">Term</th>
```

### Color Contrast

```typescript
Matched Keywords:
  Background: bg-blue-100 (light blue)
  Border: border-blue-500 (2px bottom)
  Contrast Ratio: > 4.5:1 (WCAG AA)

Missing Keywords:
  Background: bg-gray-100
  Border: border-gray-400
  Contrast Ratio: > 4.5:1

Legend Badges:
  Text color: text-foreground
  Background: appropriate contrast
```

### Focus Management

```typescript
Focus Rings:
  ✓ Visible on keyboard navigation
  ✓ Hidden on mouse click
  ✓ Consistent across components

Skip Links:
  ✓ Navigation buttons for highlights
  ✓ Direct jump to next/previous

Focus Trap:
  ✓ Dialogs trap focus
  ✓ Esc closes dialogs
```

## Security

### XSS Prevention

```typescript
highlightText():
  ✓ Escapes all input text
  ✓ No direct HTML injection
  ✓ Only safe <mark> tags added
  ✓ Attributes properly escaped

escapeHtml():
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
  
  Converts:
    <script>alert("xss")</script>
  To:
    &lt;script&gt;alert("xss")&lt;/script&gt;

dangerouslySetInnerHTML:
  ✓ Only used for pre-sanitized content
  ✓ Input passed through escapeHtml()
  ✓ No user-controlled HTML
```

### CSV Safety

```typescript
escapeCsv():
  ✓ Quotes values with special chars
  ✓ Escapes quotes with double-quotes
  ✓ Prevents CSV injection

Example:
  Input: =SUM(A1:A10)
  Output: "=SUM(A1:A10)"
  
  (Treated as string, not formula)
```

### Memory Management

```typescript
Object URLs:
  ✓ Created with URL.createObjectURL()
  ✓ Revoked with URL.revokeObjectURL()
  ✓ Timeout of 100ms for cleanup

Blobs:
  ✓ Created for downloads only
  ✓ Garbage collected after revoke
  ✓ No long-lived references
```

## Performance

### Debouncing

```typescript
Keyword Search:
  ✓ 300ms debounce on input
  ✓ Prevents excessive filtering
  ✓ Smooth user experience

Implementation:
  const [kwSearch, setKwSearch] = useState('')
  const debouncedSearch = useDebouncedValue(kwSearch, 300)
  
  // Filter uses debouncedSearch
  const filtered = useMemo(() => {
    return keywords.filter(k =>
      k.term.includes(debouncedSearch)
    )
  }, [debouncedSearch])
```

### Memoization

```typescript
Filtered Rows:
  const rows = useMemo(() => {
    return keywords
      .filter(statusFilter)
      .filter(searchFilter)
      .sort(byImportance)
  }, [keywords, statusFilter, searchFilter])

Matched/Missing Sets:
  const matchedSet = useMemo(() =>
    new Set(matched.map(k => k.toLowerCase())),
    [matched]
  )
  
  // O(1) lookup vs O(n) includes()
```

### Lazy Loading

```typescript
Tabs:
  ✓ Content rendered on tab activation
  ✓ No wasted renders for hidden tabs

Heavy Components:
  ✓ ATSJobTextViewer: Rendered when needed
  ✓ ATSKeywordTable: Virtualized if > 100 rows
```

## Testing

### Unit Tests

**keywordImportance.service.spec.ts:**
```typescript
✓ Calculate base importance from frequency
✓ Add bonus for title presence
✓ Add bonus for requirements
✓ Cap importance at 1.0
✓ Sort by importance descending
```

**highlights.service.spec.ts:**
```typescript
✓ Escape special regex characters
✓ Highlight terms with mark tags
✓ Be case-insensitive
✓ Respect word boundaries
✓ Avoid nested marks
✓ Escape HTML in input
✓ Handle empty terms array
✓ Add aria-label to marks
```

**export.service.spec.ts:**
```typescript
✓ Export analysis result as JSON blob
✓ Produce valid JSON
✓ Export keywords as CSV blob
✓ Include CSV header
✓ Include keyword rows
✓ Handle missing status
✓ Escape CSV special characters
```

**atsUIStore.spec.ts:**
```typescript
✓ Initialize with default values
✓ Set highlights mode
✓ Toggle legend
✓ Set keyword search
✓ Set selected keyword
```

**atsWeightsStore.spec.ts:**
```typescript
✓ Initialize with default weights
✓ Set individual weight
✓ Clamp weights to [0, 1]
✓ Reset to defaults
✓ Normalize weights to sum to 1
✓ Handle all zero weights
```

### E2E Tests

**step28-ats-details-flow.spec.ts:**
```typescript
Test Scenarios:
  1. Navigate to Details tab
     ✓ Tab is visible
     ✓ Shows score and counts
  
  2. Toggle highlights
     ✓ Job text updates
     ✓ CV preview updates
     ✓ Legend appears/disappears
  
  3. Add keyword to Summary
     ✓ Click "Add to Summary"
     ✓ Summary field updates
     ✓ Live preview shows keyword
  
  4. Adjust weights and recalculate
     ✓ Move sliders
     ✓ Click "Recalculate"
     ✓ Score changes
     ✓ Weights snapshot saved
  
  5. Export JSON
     ✓ Click "Export JSON"
     ✓ File downloads
     ✓ Blob size > 0
  
  6. Export CSV
     ✓ Click "Export Keywords CSV"
     ✓ File downloads
     ✓ Contains header and rows
  
  7. Keyboard navigation
     ✓ Press Alt+↓
     ✓ Highlight scrolls
     ✓ Counter updates
```

## Future Enhancements

### Step 31: AI Integration

```typescript
Potential AI Improvements:
  ✓ Semantic keyword matching
    - "react" matches "reactjs", "react.js"
    - NLP-based similarity
  
  ✓ Context-aware importance
    - Higher weight for rare, relevant terms
    - Lower weight for generic terms
  
  ✓ Smart keyword suggestions
    - "You have 'react', consider adding 'hooks'"
    - Synonym suggestions
  
  ✓ Auto-rewrite suggestions
    - "Enhance this bullet point to include 'typescript'"
    - Generate improved text
  
  ✓ Industry-specific scoring
    - Different weights per industry
    - Context-aware analysis
```

### Additional Features

```typescript
Planned:
  ✓ Batch keyword insertion
    - Select multiple missing keywords
    - Insert all at once
  
  ✓ Custom keyword importance
    - User overrides importance score
    - Manual boost/demotion
  
  ✓ Keyword grouping
    - Group by category (languages, tools, soft skills)
    - Collapsible groups
  
  ✓ History tracking
    - See how score changed over time
    - Compare different weight configurations
  
  ✓ Templates for weights
    - Save weight configurations
    - "Aggressive", "Balanced", "Conservative"
```

## Known Limitations

1. **Highlighting Performance:**
   - Large job postings (>10k chars) may slow down
   - Consider virtualization for very long texts

2. **Keyword Matching:**
   - Exact match only (no fuzzy matching)
   - No stemming (e.g., "develop" vs "developer")
   - Solution: Step 31 AI integration

3. **CSV Special Characters:**
   - Emojis and non-ASCII may not render correctly
   - Depends on CSV viewer

4. **Weight Persistence:**
   - Weights not persisted across sessions
   - Intentional design (per-analysis configuration)

5. **Keyboard Navigation:**
   - Only works when job text viewer is visible
   - No cross-component navigation (job ↔ CV)

## Migration Notes

### From Step 25/26

```typescript
No changes required:
  ✓ Existing analyze() calls work unchanged
  ✓ ATSPanel component unchanged
  ✓ Suggestion pills unchanged
  ✓ Undo/redo unchanged

Optional enhancements:
  ✓ Pass custom weights to analyze()
  ✓ Use keywordMeta if available
  ✓ Display weightsUsed in UI

Example:
  // Old (still works)
  analyze(cv, job)
  
  // New (enhanced)
  analyze(cv, job, { weights: custom })
```

### Store Changes

```typescript
New stores added:
  ✓ useATSUIStore (UI state)
  ✓ useATSWeightsStore (weights config)

Existing stores unchanged:
  ✓ useATSStore (core analysis)
  ✓ useCVDataStore (CV data)

Usage:
  import { useATSUIStore, useATSWeightsStore } from '@/store'
```

## References

- Step 25: ATS Analysis Core
- Step 26: Job Posting Structured UI
- Step 27: Advanced Job Parsing
- WCAG 2.1 Accessibility Guidelines
- CSV RFC 4180 Specification
