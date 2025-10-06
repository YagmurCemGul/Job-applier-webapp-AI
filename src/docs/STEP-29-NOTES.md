# Step 29: Resume Variants, Diff Review & Export Presets

## Overview

This module introduces a comprehensive Resume Variants system allowing users to create tailored CV versions for each job application, review changes with side-by-side diffs, and export consistently using naming presets across multiple formats.

## Architecture

### Component Hierarchy

```
CVBuilder (Variants Tab)
└─ VariantsTab
   ├─ Left Column
   │  ├─ VariantToolbar
   │  │  ├─ Create Variant Button → VariantCreateDialog
   │  │  └─ Export Button → ExportPresetDialog
   │  ├─ VariantList
   │  │  └─ VariantRow (multiple)
   │  │     ├─ Open/Active Button
   │  │     ├─ Rename Button
   │  │     ├─ Snapshot Button
   │  │     └─ Delete Button
   │  └─ VariantHistory
   │     └─ Restore Buttons
   └─ Right Column
      └─ VariantDiffViewer
         ├─ Summary Diff
         ├─ Skills Diff
         ├─ Experience Diffs
         ├─ Education Diffs
         └─ Contact Diff
```

### State Management

```
Stores:
┌─────────────────────┐
│ useVariantsStore    │ ← Variant management
│ - items[]           │   (CVVariant[])
│ - activeId          │
│ - createFromCurrent │
│ - createFromJob     │
│ - rename/delete     │
│ - diffAgainstBase   │
│ - addHistory        │
│ - revertToHistory   │
└─────────────────────┘

┌─────────────────────┐
│ useExportPresetsStore│ ← Export configuration
│ - presets[]         │   (ExportPreset[])
│ - upsert            │
│ - remove            │
│ - getById           │
└─────────────────────┘

Integration:
  ✓ useCVDataStore: Base CV reference
  ✓ useJobsStore: Linked job data
  ✓ useATSStore: ATS score snapshot
```

## Features

### 1. Variant Creation

**From Current CV:**
```typescript
User Flow:
  1. Click "Create Variant"
  2. Enter variant name
  3. Optionally link to saved job
  4. Variant created with:
     - Current CV snapshot
     - Linked job reference
     - ATS score snapshot (if available)
     - Initial history entry

Code:
  createFromCurrent(name, { linkedJobId, note })
  → Clones current CV
  → Creates VariantMeta
  → Snapshots ATS score
  → Adds to history
  → Returns variant ID
```

**From Saved Job:**
```typescript
User Flow:
  1. In Saved Jobs list
  2. Click "Create Variant for this Job"
  3. Auto-links job
  4. Pre-fills variant name with job title

Code:
  createFromJob(jobId, name, note)
  → Calls createFromCurrent with linkedJobId
```

**Variant Data Structure:**
```typescript
CVVariant {
  meta: {
    id: string
    name: "Backend Engineer - Acme Corp"
    linkedJobId: "job-123"
    createdAt: Date
    updatedAt: Date
    notes: "Applied via LinkedIn"
    atsAtCreate: {
      score: 85
      matched: 12
      missing: 5
    }
  }
  cv: CVData  // Full CV snapshot
  baseCvId: "base"  // Reference to base CV
  history: [
    {
      id: "h1"
      at: Date
      note: "init"
      cv: CVData  // Initial snapshot
    }
  ]
}
```

### 2. Diff Viewer

**Diff Computation:**
```typescript
Algorithm:
  1. Compare base CV with variant CV
  2. Generate structured diffs per section
  3. Compute inline word-level diffs (LCS)
  4. Classify changes: added/removed/modified/unchanged

Sections Compared:
  ✓ Summary (text)
  ✓ Skills (comma-separated list)
  ✓ Experience (array of descriptions)
  ✓ Education (array of descriptions)
  ✓ Contact (concatenated string)

DiffBlock Structure:
  {
    path: "summary"
    before: "Senior Software Engineer..."
    after: "Backend Engineer..."
    change: "modified"
    inline: [
      { text: "Senior ", change: "removed" }
      { text: "Backend ", change: "added" }
      { text: "Engineer", change: "unchanged" }
    ]
  }
```

**LCS Algorithm:**
```typescript
computeLCS(wordsA, wordsB):
  Purpose: Find longest common subsequence of words
  
  Process:
    1. Build DP table (m+1 x n+1)
    2. Fill table:
       if (wordsA[i] === wordsB[j]):
         dp[i][j] = dp[i-1][j-1] + 1
       else:
         dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    
    3. Backtrack to build LCS
    
  Complexity: O(m * n) time, O(m * n) space
  
  Example:
    A: ["Senior", "Software", "Engineer"]
    B: ["Backend", "Software", "Engineer"]
    LCS: ["Software", "Engineer"]
    
    Inline diff:
      - "Senior " (removed)
      + "Backend " (added)
      = "Software " (unchanged)
      = "Engineer" (unchanged)
```

**Visual Representation:**
```
┌─────────────────────────────────────────┐
│ Summary                   [modified]    │
├─────────────────┬───────────────────────┤
│ Before          │ After                 │
│ Senior Software │ Backend Software      │
│ Engineer...     │ Engineer...           │
├─────────────────┴───────────────────────┤
│ Inline Diff:                            │
│ [removed]Senior [added]Backend          │
│ [unchanged]Software Engineer...         │
└─────────────────────────────────────────┘
```

### 3. Version History

**Snapshot System:**
```typescript
Features:
  ✓ Manual snapshots (user-triggered)
  ✓ Notes/commit messages
  ✓ Full CV snapshot at each point
  ✓ Restore to any previous version
  ✓ Chronological timeline

User Flow:
  1. Edit variant CV
  2. Click "Snapshot"
  3. Optional: Add note
  4. Snapshot saved in history

Restore:
  1. View history list
  2. Click "Restore" on entry
  3. Variant CV reverts
  4. Global CV store updated (preview syncs)

History Entry:
  {
    id: "h2"
    at: Date("2025-10-06T10:30:00")
    note: "Added React skills"
    cv: CVData  // Full snapshot
  }

Storage:
  ✓ Stored in variant.history[]
  ✓ No limit on history length
  ✓ Persisted to localStorage
  ✓ Future: Firestore migration
```

### 4. Export Presets

**Naming Templates:**
```typescript
Supported Tokens:
  {FirstName}   → cv.personalInfo.firstName
  {MiddleName}  → (extracted if available)
  {LastName}    → cv.personalInfo.lastName
  {Role}        → Guessed from summary
  {Company}     → From linked job
  {Date}        → YYYY-MM-DD (current date)
  {JobId}       → Linked job ID
  {VariantName} → Variant meta name
  {Locale}      → Preset locale (en/tr)

Template Examples:
  "CV_{FirstName}_{LastName}_{Date}"
  → "CV_John_Doe_2025-10-06"
  
  "Resume_{FirstName}_{Role}_{Company}"
  → "Resume_John_Backend-Engineer_TechCorp"
  
  "{LastName}_{FirstName}_{VariantName}_{Locale}"
  → "Doe_John_Backend-Acme_en"

Illegal Characters:
  Stripped: / \ : * ? " < > |
  Replaced with: - (dash)
  
  Example: "Tech/Corp:Ltd" → "Tech-Corp-Ltd"
```

**Role Guessing:**
```typescript
guessRole(cv: CVData):
  Process:
    1. Extract summary text
    2. Lowercase and search for keywords:
       - frontend, backend, full-stack
       - product, data, marketing
       - designer, devops
    3. Return first match
    4. Normalize whitespace
  
  Example:
    Summary: "Senior Backend Engineer with 5 years..."
    → Role: "backend"
```

**Format Selection:**
```typescript
Supported Formats:
  ✓ PDF (.pdf)
  ✓ DOCX (.docx)
  ✓ Google Doc (.gdoc)

Multi-format Export:
  User selects: [PDF, DOCX]
  → Generates two files with same base name:
    - CV_John_Doe_2025-10-06.pdf
    - CV_John_Doe_2025-10-06.docx

Batch Process:
  for each format in preset.formats:
    filename = renderFilename(template, context) + ext(format)
    await exportOne(cv, format, filename, locale)
```

**Export Preset:**
```typescript
ExportPreset {
  id: "preset-123"
  name: "Default EN"
  namingTemplate: "CV_{FirstName}_{LastName}_{Role}_{Company}_{Date}"
  formats: ["pdf", "docx"]
  locale: "en"
  includeCoverLetter: false  // Future-ready
  createdAt: Date
  updatedAt: Date
}

Storage:
  ✓ Persisted to localStorage
  ✓ User can create multiple presets
  ✓ Reusable across variants
```

**Batch Export Flow:**
```typescript
User Flow:
  1. Select active variant
  2. Click "Export..."
  3. Configure or select preset:
     - Name
     - Naming template
     - Formats (checkboxes)
     - Locale (select)
  4. Click "Save & Export"
  5. Files generated and downloaded

Code Flow:
  batchExport(variantId, preset)
  → Find variant
  → Build context from CV + job
  → For each format:
    → Render filename
    → Call format-specific exporter
    → Download file

Context Building:
  ctx = {
    FirstName: cv.personalInfo.firstName
    LastName: cv.personalInfo.lastName
    Role: guessRole(cv)
    Company: linkedCompany(variant.meta.linkedJobId)
    Date: new Date().toISOString().slice(0, 10)
    JobId: variant.meta.linkedJobId
    VariantName: variant.meta.name
    Locale: preset.locale
  }
```

## Type System

### VariantMeta

```typescript
export interface VariantMeta {
  id: string              // Unique variant ID
  name: string            // User-friendly name
  linkedJobId?: string    // Reference to saved job
  createdAt: Date         // Creation timestamp
  updatedAt: Date         // Last modification
  createdBy?: string      // User ID (future auth)
  notes?: string          // Commit message
  atsAtCreate?: {         // ATS snapshot
    score: number         // Score at creation
    matched: number       // Matched keywords count
    missing: number       // Missing keywords count
  }
}
```

### CVVariant

```typescript
export interface CVVariant {
  meta: VariantMeta       // Variant metadata
  cv: CVData              // Full CV snapshot
  baseCvId: string        // Base CV reference
  history: Array<{        // Version history
    id: string            // History entry ID
    at: Date              // Timestamp
    note?: string         // User note
    cv: CVData            // CV snapshot at this point
  }>
}
```

### DiffBlock

```typescript
export interface DiffBlock {
  path: string            // Section path (e.g., "summary")
  before?: string         // Original text
  after?: string          // Modified text
  change: DiffChange      // Change type
  inline?: Array<{        // Word-level diff
    text: string          // Word
    change: DiffChange    // Word change type
  }>
}

export type DiffChange = 'added' | 'removed' | 'modified' | 'unchanged'
```

### ExportPreset

```typescript
export interface ExportPreset {
  id: string              // Preset ID
  name: string            // Preset name
  namingTemplate: string  // Filename template
  formats: ExportFormat[] // Selected formats
  locale?: 'en' | 'tr'    // Export locale
  includeCoverLetter?: boolean  // Future feature
  createdAt: Date         // Creation timestamp
  updatedAt: Date         // Last modification
}

export type ExportFormat = 'pdf' | 'docx' | 'gdoc'
```

### RenderContext

```typescript
export interface RenderContext {
  FirstName?: string      // From personalInfo
  MiddleName?: string     // Extracted from name
  LastName?: string       // From personalInfo
  Role?: string           // Guessed from summary
  Company?: string        // From linked job
  Date: string            // YYYY-MM-DD
  JobId?: string          // Linked job ID
  VariantName?: string    // Variant name
  Locale?: string         // Preset locale
}
```

## Integration Points

### With Step 26 (Saved Jobs)

```typescript
Linking:
  ✓ Variant can reference a saved job
  ✓ createFromJob() helper
  ✓ Company name extracted from job
  ✓ Job ID used in filename

UI:
  Saved Jobs List:
    → "Create Variant" button per job
    → Opens VariantCreateDialog with job pre-linked

Variant Row:
    → Shows "Linked job: {title} • {company}"
    → Badge with job info
```

### With Step 28 (ATS Details)

```typescript
Snapshot:
  ✓ atsAtCreate captures score at variant creation
  ✓ snapshot.service.ts reads from useATSStore
  ✓ Displayed in variant row badge

Future:
  ✓ Re-analyze variant against linked job
  ✓ Track score improvements over time
  ✓ Suggest keywords to add from job
```

### With CVDataStore

```typescript
Base CV Reference:
  ✓ computeDiff(baseCv, variantCv)
  ✓ baseCv from useCVDataStore.currentCV
  ✓ variantCv from variant.cv

Revert:
  ✓ revertToHistory() updates variant.cv
  ✓ Also calls useCVDataStore.loadCV(snapshot)
  ✓ Live preview reflects reverted state
```

## Services

### diff.service.ts

```typescript
Key Functions:
  ✓ computeDiff(before, after): VariantDiff
  ✓ textBlock(path, a, b): DiffBlock
  ✓ diffArray(a[], b[], basePath): DiffBlock[]
  ✓ inlineDiff(a, b): InlineDiffSegment[]
  ✓ computeLCS(wordsA, wordsB): string[]

Algorithms:
  ✓ LCS (Longest Common Subsequence) for word diff
  ✓ Dynamic programming approach
  ✓ O(m*n) complexity
  ✓ Backtracking to reconstruct LCS

Features:
  ✓ Section-level comparison
  ✓ Word-level inline diff
  ✓ Array element diff (experience, education)
  ✓ Change classification (added/removed/modified/unchanged)
```

### naming.service.ts

```typescript
Key Functions:
  ✓ renderFilename(template, context): string
  ✓ safe(value): string (strip illegal chars)

Process:
  1. Replace all tokens with context values
  2. Strip illegal filename characters
  3. Collapse multiple spaces/dashes
  4. Trim whitespace
  5. Return safe filename

Safety:
  ✓ No path traversal (../)
  ✓ No reserved characters
  ✓ Cross-platform compatible
```

### batchExport.service.ts

```typescript
Key Functions:
  ✓ batchExport(variantId, preset): Promise<void>
  ✓ buildContext(variant, preset): RenderContext
  ✓ exportOne(cv, format, filename, locale): Promise<void>
  ✓ guessRole(cv): string | undefined
  ✓ linkedCompany(jobId): string | undefined

Export Stubs:
  ✓ PDF: console.log (stub)
  ✓ DOCX: console.log (stub)
  ✓ Google Doc: console.log (stub)
  
  Note: Actual export implementations depend on:
    - services/export/pdf.service.ts
    - services/export/docx.service.ts
    - services/export/gdoc.service.ts
```

### snapshot.service.ts

```typescript
Key Functions:
  ✓ snapshotATSAtCreation(): ATSSnapshot | undefined

Process:
  1. Try to access useATSStore
  2. Get current result
  3. Extract score, matched, missing counts
  4. Return snapshot or undefined
  5. Catch any errors gracefully

Error Handling:
  ✓ Returns undefined if store unavailable
  ✓ Returns undefined if no result
  ✓ Catches exceptions
```

## Stores

### variantsStore.ts

```typescript
State:
  items: CVVariant[]      // All variants
  activeId?: string       // Selected variant
  loading: boolean
  error?: string

Actions:
  createFromCurrent(name, opts?)
    → Creates new variant from current CV
    → Optionally links job
    → Snapshots ATS score
    → Adds to history
  
  createFromJob(jobId, name, note?)
    → Wrapper for createFromCurrent with linkedJobId
  
  rename(id, nextName)
    → Updates variant name
    → Updates updatedAt
  
  note(id, note)
    → Updates variant notes
  
  select(id?)
    → Sets activeId
    → Used by diff viewer
  
  delete(id)
    → Removes variant from items
    → Clears activeId if deleted
  
  diffAgainstBase(id)
    → Computes diff vs base CV
    → Returns VariantDiff
  
  addHistory(id, note?)
    → Snapshots current CV state
    → Prepends to history array
    → Updates variant
  
  revertToHistory(id, historyId)
    → Finds history entry
    → Restores variant.cv
    → Updates global CV store (preview)

Persistence:
  ✓ localStorage via zustand/persist
  ✓ Partialize: activeId, items
  ✓ Version: 1
```

### exportPresetsStore.ts

```typescript
State:
  presets: ExportPreset[]  // All presets

Actions:
  upsert(preset)
    → Creates or updates preset
    → Auto-generates ID if new
    → Sets timestamps
    → Returns preset ID
  
  remove(id)
    → Removes preset from list
  
  getById(id)
    → Finds preset by ID
    → Returns ExportPreset | undefined

Persistence:
  ✓ localStorage via zustand/persist
  ✓ Version: 1
```

## UI Components

### VariantsTab.tsx

```typescript
Layout:
  Grid (xl: 2 columns)
  ├─ Left: Toolbar, List, History
  └─ Right: Diff Viewer

Responsive:
  ✓ Mobile: Stacked
  ✓ Desktop: Side-by-side
```

### VariantToolbar.tsx

```typescript
Buttons:
  ✓ Create Variant (opens dialog)
  ✓ Export... (opens preset dialog, disabled if no active)

State:
  ✓ Dialog open states
```

### VariantCreateDialog.tsx

```typescript
Fields:
  ✓ Variant name (required)
  ✓ Linked job (optional select)

Validation:
  ✓ Name must not be empty

Flow:
  1. Enter name
  2. Select job (optional)
  3. Click "Create"
  4. Dialog closes
  5. Variant created and activated
```

### VariantList.tsx

```typescript
Display:
  ✓ Maps items to VariantRow
  ✓ Empty state message

Styling:
  ✓ Vertical list
  ✓ 2px gap between rows
```

### VariantRow.tsx

```typescript
Display:
  ✓ Variant name (truncated)
  ✓ Linked job badge
  ✓ ATS score badge
  ✓ Last updated date

Actions:
  ✓ Open/Active button (toggles active state)
  ✓ Rename button (prompt dialog)
  ✓ Snapshot button (adds history)
  ✓ Delete button (removes variant)

Styling:
  ✓ Border card
  ✓ Hover effect
  ✓ Active variant highlighted
```

### VariantDiffViewer.tsx

```typescript
Sections:
  ✓ Summary
  ✓ Skills
  ✓ Experience (array)
  ✓ Education (array)
  ✓ Contact

Per Section:
  ✓ Section title + change indicator
  ✓ Before/After columns
  ✓ Inline diff (colored spans)

Colors:
  ✓ Added: green background
  ✓ Removed: red background + strikethrough
  ✓ Unchanged: no styling
  ✓ Dark mode compatible
```

### VariantHistory.tsx

```typescript
Display:
  ✓ Chronological list (newest first)
  ✓ Timestamp
  ✓ Note (if provided)
  ✓ Restore button

Action:
  ✓ Restore → revertToHistory()
  ✓ Updates variant and preview
```

### ExportPresetDialog.tsx

```typescript
Fields:
  ✓ Preset name
  ✓ Naming template (text input)
  ✓ Format checkboxes (PDF, DOCX, GDoc)
  ✓ Locale select (EN, TR)

Token Help:
  ✓ Shows available tokens
  ✓ Monospace font for template

Actions:
  ✓ Close (discard)
  ✓ Save & Export (saves preset + exports)

Flow:
  1. Configure preset
  2. Click "Save & Export"
  3. Preset saved
  4. Batch export triggered
  5. Files downloaded
  6. Dialog closes
```

## Accessibility

### Keyboard Support

```typescript
Dialogs:
  ✓ Esc closes dialog
  ✓ Tab cycles through fields
  ✓ Enter submits form

Buttons:
  ✓ Focus rings visible
  ✓ Aria-labels for icon buttons

Diff Viewer:
  ✓ Semantic HTML (before/after columns)
  ✓ Color not sole indicator (text labels)
```

### Screen Readers

```typescript
Announcements:
  ✓ Dialog titles
  ✓ Button labels
  ✓ Form labels

Change Indicators:
  ✓ "added", "removed", "modified", "unchanged"
  ✓ Visible text labels, not just color
```

### Color Contrast

```typescript
Diffs:
  ✓ Green: bg-green-100 (light), bg-green-900/30 (dark)
  ✓ Red: bg-red-100 (light), bg-red-900/30 (dark)
  ✓ Text: foreground color maintained
  ✓ WCAG AA compliant
```

## Performance

### Diff Computation

```typescript
Optimization:
  ✓ LCS computed on demand (lazy)
  ✓ Memoized in component
  ✓ Only recomputed when variant changes
  ✓ O(m*n) acceptable for typical CV sizes

Limits:
  ✓ Max words per section: ~1000
  ✓ Max experience/education items: ~20
  ✓ No pagination needed for typical CVs
```

### History Storage

```typescript
Considerations:
  ✓ Each snapshot stores full CV
  ✓ localStorage limit: ~5-10 MB
  ✓ Typical CV: ~10-50 KB
  ✓ Estimated capacity: ~100-500 snapshots

Future:
  ✓ Compress snapshots (gzip)
  ✓ Migrate to Firestore (unlimited)
  ✓ Implement retention policy (keep N recent)
```

### Export Performance

```typescript
Sequential Export:
  ✓ Formats exported one-by-one
  ✓ Avoids overwhelming browser
  ✓ Progress could be shown (future)

Parallel Option (Future):
  ✓ Promise.all() for simultaneous exports
  ✓ Faster but higher memory usage
```

## Testing

### Unit Tests

**diff.service.spec.ts:**
```typescript
✓ Detect unchanged text
✓ Detect modified summary
✓ Detect added text
✓ Detect removed text
✓ Generate inline diff
✓ Handle skills diff
✓ Handle experience array diff
✓ Handle contact info changes
```

**naming.service.spec.ts:**
```typescript
✓ Replace tokens with context values
✓ Strip illegal filename characters
✓ Handle missing context values
✓ Collapse multiple spaces and dashes
✓ Handle all tokens
✓ Trim whitespace
```

**snapshot.service.spec.ts:**
```typescript
✓ Return undefined when no ATS result
✓ Return snapshot when ATS result exists
✓ Handle errors gracefully
```

**variants.store.spec.ts:**
```typescript
✓ Initialize with empty items
✓ Create variant from current CV
✓ Set active variant
✓ Rename variant
✓ Delete variant
✓ Create variant with linked job
✓ Add history entry
```

**exportPresets.store.spec.ts:**
```typescript
✓ Initialize with empty presets
✓ Upsert a new preset
✓ Update existing preset
✓ Remove preset
✓ Get preset by ID
✓ Handle multiple formats
✓ Set default locale to en
```

## Future Enhancements

### Step 31: AI Integration

```typescript
Potential Features:
  ✓ AI-suggested edits for variant
    - "Add these keywords for better ATS score"
    - Auto-rewrite bullets with keywords
  
  ✓ Smart diff summaries
    - "You added 5 relevant skills"
    - "Missing 2 critical keywords"
  
  ✓ Auto-generate variant name
    - Based on job title + company
    - Semantic understanding
```

### Advanced Features

```typescript
Planned:
  ✓ Bulk export (all variants at once)
  ✓ Comparison view (3+ variants side-by-side)
  ✓ Variant templates
    - "Backend Engineer Template"
    - Pre-configure section emphasis
  
  ✓ Export history
    - Track which variants exported when
    - Re-export with same preset
  
  ✓ Cover letter variants
    - Link cover letter to CV variant
    - Export both together
  
  ✓ Firestore sync
    - Cloud storage for variants
    - Cross-device access
    - Team collaboration (future)
```

## Known Limitations

1. **Export Stubs:**
   - PDF/DOCX/GDoc exports are console stubs
   - Actual export services not implemented
   - Integration needed with export services

2. **History Storage:**
   - No compression
   - No retention policy
   - Could fill localStorage
   - Solution: Firestore migration

3. **Diff Granularity:**
   - Word-level diff only
   - No character-level diff
   - No semantic diff
   - Solution: Step 31 AI enhancements

4. **Performance:**
   - LCS is O(m*n)
   - Could be slow for very long texts (>1000 words)
   - No virtualization for long lists
   - Solution: Optimize or paginate

5. **Variant Metadata:**
   - No tags/categories
   - No search/filter
   - No sort options
   - Solution: Add in future updates

## Migration Notes

### From Step 28

```typescript
Integration:
  ✓ ATS snapshot uses useATSStore
  ✓ No breaking changes
  ✓ Optional feature (can be ignored)

Usage:
  import { useVariantsStore } from '@/store'
  
  const { createFromCurrent } = useVariantsStore()
  createFromCurrent("Backend - Acme")
```

### Store Changes

```typescript
New Stores:
  ✓ useVariantsStore (variant management)
  ✓ useExportPresetsStore (export configuration)

No Changes to Existing:
  ✓ useCVDataStore
  ✓ useATSStore
  ✓ useJobsStore
```

## References

- Step 26: Job Posting Structured UI
- Step 28: ATS Details & Keyword Explorer
- LCS Algorithm: https://en.wikipedia.org/wiki/Longest_common_subsequence_problem
- Zustand Persist: https://docs.pmnd.rs/zustand/integrations/persisting-store-data
