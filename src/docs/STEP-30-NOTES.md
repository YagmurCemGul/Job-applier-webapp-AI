# Step 30: Cover Letter Studio - Templates, Prompt Library & Export

## Overview

This module introduces a complete Cover Letter Studio for generating, editing, and managing professional cover letters with tight integration to CV data, job postings, ATS analysis, and variant system.

## Architecture

### Component Hierarchy

```
CVBuilder (Cover Letter Tab)
└─ CoverLetterTab
   ├─ Left Column (2/3 width)
   │  ├─ CLToolbar
   │  │  ├─ Language Select (EN/TR)
   │  │  ├─ Tone Select (formal/friendly/enthusiastic)
   │  │  ├─ Length Select (short/medium/long)
   │  │  ├─ Template Select (15 templates)
   │  │  ├─ Generate Button → generateCoverLetter()
   │  │  ├─ Prompt Library Button → CLPromptLibraryDialog
   │  │  └─ Export Button → CLExportDialog
   │  ├─ Editor & Preview (Grid 2 cols)
   │  │  ├─ CLEditor (contentEditable)
   │  │  └─ CLPreview (HTML render)
   │  ├─ CLKeywordAssist
   │  │  └─ Missing ATS Keywords (clickable)
   │  └─ CLHistory
   │     └─ Version snapshots with restore
   └─ Right Column (1/3 width)
      └─ CLSavedList
         ├─ Search input
         └─ CLSavedRow (multiple)
            ├─ Favorite toggle
            ├─ Open button
            ├─ Duplicate button
            ├─ PDF export button
            └─ Delete button
```

### State Management

```
Stores:
┌────────────────────────┐
│ useCoverLetterStore    │ ← CL management
│ - items[]              │   (CoverLetterDoc[])
│ - activeId             │
│ - create()             │
│ - updateContent()      │
│ - duplicate()          │
│ - toggleFavorite()     │
│ - upsertVars()         │
│ - setMeta()            │
└────────────────────────┘

┌────────────────────────┐
│ usePromptLibraryStore  │ ← Prompt management
│ - folders[]            │   (PromptFolder[])
│ - prompts[]            │   (SavedPrompt[])
│ - upsertFolder()       │
│ - deleteFolder()       │
│ - upsertPrompt()       │
│ - deletePrompt()       │
│ - listByFolder()       │
└────────────────────────┘

┌────────────────────────┐
│ useCLUIStore           │ ← UI state
│ - tone                 │   (CLTone)
│ - length               │   (CLLength)
│ - lang                 │   (CLLang)
│ - templateId           │
│ - showPreview          │
│ - kwAssistOpen         │
└────────────────────────┘

Integration:
  ✓ useCVDataStore: CV data for generation
  ✓ useJobsStore: Job posting data
  ✓ useATSStore: Missing keywords
  ✓ useVariantsStore: Variant linking
```

## Features

### 1. Cover Letter Generation

**15 Templates:**
```typescript
Templates:
  1. Classic Professional
  2. Concise Impact
  3. Narrative Style
  4. Bullet Format
  5. Story Opening
  6. Data-Driven
  7. Problem-Solution
  8. Enthusiastic Opener
  9. Direct & Bold
  10. Value Proposition
  11. Research-Based
  12. Achievement Focus
  13. Collaborative Tone
  14. Mission-Aligned
  15. Modern & Brief

Placeholders:
  ✓ {{Company}}
  ✓ {{Role}}
  ✓ {{RecruiterName}}
  ✓ {{YourName}}
  ✓ {{Skills}}
  ✓ {{WhyUs}}
  ✓ {{Closing}}

Variable Building:
  - Extracts from CV: name, skills (top 8)
  - Extracts from Job: title, company, recruiter
  - Defaults: "Hiring Manager" for recruiter
  - Skills text: "Key strengths include X, Y, Z."
```

**Generation Flow:**
```typescript
User Flow:
  1. Select language (EN/TR)
  2. Select tone (formal/friendly/enthusiastic)
  3. Select length (short/medium/long)
  4. Select template (cl-01 to cl-15)
  5. Click "Generate"
  6. Cover letter generated with:
     - Current CV data
     - Active job posting data
     - Missing ATS keywords (injected)
     - Template with variables
     - Tone adjustments
     - Length adjustments

Code Flow:
  generateCoverLetter(opts)
  ├─ Try AI provider (if available)
  │  ├─ Build system prompt
  │  ├─ Render template with variables
  │  ├─ Append custom prompts
  │  └─ Call aiGenerate()
  └─ Fallback (deterministic)
     ├─ Get template by ID
     ├─ Build variables from CV + job
     ├─ Inject missing ATS keywords
     ├─ Render template
     ├─ Apply tone transformation
     ├─ Apply length transformation
     └─ Wrap in HTML paragraphs

Tone Transformations:
  formal:
    - No changes (default)
  
  friendly:
    - "I am writing to" → "I'm excited to"
    - "Merhaba" → "Merhaba, büyük bir heyecanla"
  
  enthusiastic:
    - "." → "!"
    - "I am" → "I'm"

Length Transformations:
  short:
    - Take first 6 paragraphs
  
  medium:
    - No changes (default)
  
  long:
    - Append P.S. paragraph

Language Support:
  EN:
    - "Dear Hiring Manager,"
    - "Best regards,"
  
  TR:
    - "Merhaba İK Ekibi,"
    - "Saygılarımla,"
```

### 2. Rich Editor

**ContentEditable Editor:**
```typescript
Features:
  ✓ Live editing
  ✓ HTML formatting preserved
  ✓ Auto-save on blur
  ✓ Focus ring indicator
  ✓ Prose styling (Tailwind)

Sanitization:
  Allowed tags:
    - b, i, u, em, strong
    - p, br, ul, ol, li
    - a, span
  
  Allowed attributes:
    - href, target, rel
    - data-*
    - style (limited)
  
  Removed:
    - script, iframe, object
    - onclick, onerror, etc.
    - Dangerous attributes

Editor Operations:
  ✓ Type directly
  ✓ Format with keyboard shortcuts
  ✓ Copy/paste (sanitized)
  ✓ Insert keywords at cursor
  ✓ Auto-save every edit
  ✓ History snapshot on save
```

**Live Preview:**
```typescript
Features:
  ✓ Side-by-side with editor
  ✓ Rendered HTML
  ✓ Prose styling
  ✓ Syncs in real-time
  ✓ Same content as editor
```

### 3. ATS Keyword Assist

**Missing Keywords Integration:**
```typescript
Source:
  ✓ useATSStore.result.missingKeywords
  ✓ Up to 30 keywords displayed
  ✓ Clickable chips

Insertion:
  User Flow:
    1. Click keyword chip
    2. Keyword inserted at cursor
    3. Editor content updated
    4. History snapshot created
  
  Code Flow:
    insertAtCursor(keyword)
    ├─ Get window selection
    ├─ Get current range
    ├─ Create text node
    ├─ Insert node at range
    ├─ Move cursor after node
    ├─ Find root editable element
    └─ Update store with new HTML

Chip Styling:
  ✓ Outline button
  ✓ Small size
  ✓ Plus icon
  ✓ Hover effect
  ✓ Keyboard accessible
```

### 4. Prompt Library

**Folder System:**
```typescript
Structure:
  Folders (top-level)
  ├─ Folder 1
  │  ├─ Prompt 1
  │  ├─ Prompt 2
  │  └─ Prompt 3
  ├─ Folder 2
  │  └─ Prompt 4
  └─ (No folder)
     └─ Prompt 5

Operations:
  ✓ Create folder
  ✓ Delete folder (unassigns prompts)
  ✓ Create prompt
  ✓ Update prompt
  ✓ Delete prompt
  ✓ Copy prompt body to clipboard
  ✓ List prompts by folder

Usage:
  1. User creates custom prompts
  2. Organizes into folders
  3. Copies prompt body
  4. Appends to generation request
  5. AI uses prompt as additional instruction
```

**Prompt Dialog:**
```typescript
Layout:
  Left Column:
    ✓ Folder selector (dropdown)
    ✓ Prompts list (scrollable)
    ✓ Copy button per prompt
    ✓ Delete button per prompt
  
  Right Column:
    ✓ Prompt name input
    ✓ Prompt body textarea
    ✓ Clear button
    ✓ Save button

Features:
  ✓ Add new folder inline
  ✓ Select folder for new prompt
  ✓ Unfoldered prompts supported
  ✓ Real-time filtering
```

### 5. Version History

**Snapshot System:**
```typescript
Features:
  ✓ Auto-snapshot on save
  ✓ Manual snapshot on keyword insert
  ✓ Keep last 25 snapshots
  ✓ Restore to any snapshot
  ✓ Notes/commit messages

History Entry:
  {
    id: "h1"
    at: Date("2025-10-06T10:30:00")
    note: "edit" | "keyword-insert" | "restore" | "regenerate"
    content: "<p>Full HTML snapshot</p>"
  }

Restore:
  User Flow:
    1. View history list
    2. Click "Restore" on entry
    3. Content reverted
    4. Editor & preview updated
  
  Code Flow:
    updateContent(id, historyContent, 'restore')
    ├─ Find document
    ├─ Replace content with snapshot
    ├─ Add new history entry
    ├─ Update updatedAt
    └─ Trigger editor refresh
```

### 6. Saved Cover Letters

**Management:**
```typescript
Operations:
  ✓ Create (from generation)
  ✓ Open (edit in dialog)
  ✓ Duplicate (copy with "(Copy)" suffix)
  ✓ Delete (remove permanently)
  ✓ Favorite (toggle star)
  ✓ Export (PDF directly from row)

Search:
  ✓ Real-time filtering
  ✓ Searches: name, company, role
  ✓ Case-insensitive
  ✓ Debounced (via useMemo)

Row Display:
  ✓ Name + Company (truncated)
  ✓ Role + Updated date
  ✓ Favorite star indicator
  ✓ Action buttons (Open, Duplicate, PDF, Delete)
```

**Linking:**
```typescript
Linked Job:
  ✓ linkedJobId: Saved Job id
  ✓ Extracts company for export filename
  ✓ Displayed in row (if present)

Linked Variant:
  ✓ linkedVariantId: CV Variant id
  ✓ Uses variant CV instead of current
  ✓ Displayed in row (if present)

Integration:
  Create CL from Job:
    → Auto-links job
    → Pre-fills company/role
  
  Create CL from Variant:
    → Auto-links variant
    → Uses variant CV data
```

### 7. Export System

**Formats:**
```typescript
Supported:
  ✓ PDF (.pdf)
  ✓ DOCX (.docx)
  ✓ Google Doc (.gdoc)

Export Dialog:
  Checkboxes:
    ✓ PDF (default checked)
    ✓ DOCX (default unchecked)
    ✓ Google Doc (default unchecked)
  
  Buttons:
    ✓ Close (cancel)
    ✓ Export (generates files)

Naming:
  Template:
    "CoverLetter_{FirstName}_{LastName}_{Company}_{Role}_{Date}"
  
  Tokens:
    ✓ FirstName: From variables.YourName
    ✓ LastName: From variables.YourName
    ✓ Company: From variables.Company
    ✓ Role: From variables.Role
    ✓ Date: Current date (YYYY-MM-DD)
    ✓ JobId: From linkedJobId
    ✓ VariantName: From linkedVariantId
    ✓ Locale: From lang
    ✓ DocType: "CoverLetter"
  
  Example:
    "CoverLetter_John_Doe_TechCorp_Backend-Engineer_2025-10-06.pdf"

Integration:
  ✓ Uses naming.service from Step 29
  ✓ renderFilename() with extended context
  ✓ Safe filename (no illegal chars)
```

**Copy as Text:**
```typescript
Features:
  ✓ One-click copy button
  ✓ Converts HTML to plain text
  ✓ Preserves line breaks
  ✓ Preserves paragraphs
  ✓ Strips all tags
  ✓ Copies to clipboard
  ✓ Toast notification

Algorithm:
  toPlain(html)
  ├─ Replace <br> with \n
  ├─ Replace </p> with \n\n
  ├─ Strip all tags
  ├─ Normalize whitespace
  └─ Trim edges
```

## Type System

### CoverLetterMeta

```typescript
export interface CoverLetterMeta {
  id: string              // Unique CL ID
  name: string            // User-friendly name
  linkedJobId?: string    // Saved Job reference
  linkedVariantId?: string// CV Variant reference
  favorite?: boolean      // Favorite flag
  createdAt: Date         // Creation timestamp
  updatedAt: Date         // Last modification
  notes?: string          // Commit message
}
```

### CoverLetterDoc

```typescript
export interface CoverLetterDoc {
  meta: CoverLetterMeta   // Metadata
  content: string         // HTML (sanitized)
  plain?: string          // Cached plain text
  tone: CLTone            // formal/friendly/enthusiastic
  length: CLLength        // short/medium/long
  lang: CLLang            // en/tr
  templateId: string      // cl-01 to cl-15
  variables: Record<string, string>  // Company, Role, etc.
  promptsUsed?: string[]  // Prompt IDs applied
  history: Array<{        // Version history
    id: string
    at: Date
    note?: string
    content: string       // HTML snapshot
  }>
}
```

### SavedPrompt

```typescript
export interface SavedPrompt {
  id: string              // Prompt ID
  name: string            // Prompt name
  folderId?: string       // Folder reference
  body: string            // Freeform text
  createdAt: Date         // Creation timestamp
  updatedAt: Date         // Last modification
}
```

### PromptFolder

```typescript
export interface PromptFolder {
  id: string              // Folder ID
  name: string            // Folder name
  createdAt: Date         // Creation timestamp
  updatedAt: Date         // Last modification
}
```

## Services

### clTemplates.service.ts

```typescript
Key Data:
  ✓ CL_TEMPLATES[] (15 templates)
  ✓ Each template has: id, name, body
  ✓ Placeholders in body

Key Functions:
  ✓ getTemplateById(id): CLTemplate
    - Find by ID
    - Fallback to cl-01

Template Structure:
  {
    id: "cl-01"
    name: "Classic Professional"
    body: "Dear {{RecruiterName}},\n\n..."
  }
```

### clGenerator.service.ts

```typescript
Key Functions:
  ✓ generateCoverLetter(opts): Promise<{html}>
    - Try AI provider
    - Fallback to deterministic
  
  ✓ fallbackGenerate(opts): string
    - Get template
    - Build variables
    - Inject keywords
    - Render template
    - Apply tone
    - Apply length
    - Wrap in HTML
  
  ✓ renderTemplate(body, vars, lang): string
    - Replace placeholders
    - Localize (EN/TR)
  
  ✓ applyTone(text, tone, lang): string
    - friendly: "I am" → "I'm"
    - enthusiastic: "." → "!"
  
  ✓ applyLength(text, length): string
    - short: first 6 paragraphs
    - long: append P.S.

AI Integration:
  If provider available:
    1. Build system prompt
    2. Render user message (template + vars)
    3. Append custom prompts
    4. Call aiGenerate()
    5. Wrap result in HTML
  
  If not available:
    → Use fallbackGenerate()
```

### clVariables.service.ts

```typescript
Key Functions:
  ✓ sanitizeHtml(html): string
    - DOMPurify with allowed tags
    - Remove scripts, dangerous attrs
  
  ✓ buildVariables(opts): Record<string,string>
    - Extract from CV: name, skills
    - Extract from job: title, company, recruiter
    - Build Skills text
    - Merge with extra vars
  
  ✓ toPlain(html): string
    - Convert HTML to plain text
    - Preserve line breaks
    - Strip tags
    - Trim whitespace

Variables:
  Company: job.company
  Role: job.title
  RecruiterName: job.recruiterName || "Hiring Manager"
  YourName: cv.personalInfo.fullName
  Skills: "Key strengths include X, Y, Z."
  WhyUs: "" (future: AI-generated)
  Closing: "Thank you for considering..."
```

### clExport.service.ts

```typescript
Key Functions:
  ✓ exportCoverLetter(doc, format): Promise<void>
    - Build filename context
    - Render filename
    - Call format-specific exporter
    - Console stub (actual export TBD)

Context Building:
  ctx = {
    FirstName: Parse from YourName
    LastName: Parse from YourName
    Role: From variables.Role
    Company: From variables.Company
    Date: Current date (YYYY-MM-DD)
    JobId: From linkedJobId
    VariantName: From linkedVariantId
    Locale: From lang
    DocType: "CoverLetter"
  }

Filename Example:
  "CoverLetter_John_Doe_TechCorp_Backend-Engineer_2025-10-06.pdf"

Export Stubs:
  ✓ PDF: console.log (stub)
  ✓ DOCX: console.log (stub)
  ✓ Google Doc: console.log (stub)
```

## Stores

### coverLetterStore.ts

```typescript
State:
  items: CoverLetterDoc[]  // All cover letters
  activeId?: string        // Selected CL
  loading: boolean
  error?: string

Actions:
  create(init)
    → Creates new CL
    → Sanitizes content
    → Adds to items
    → Sets active
    → Returns ID
  
  updateContent(id, html, note)
    → Sanitizes HTML
    → Updates content
    → Adds history entry
    → Keeps last 25
  
  upsertVars(id, vars)
    → Merges variables
  
  setMeta(id, patch)
    → Updates metadata
    → Updates updatedAt
  
  select(id)
    → Sets activeId
  
  remove(id)
    → Removes from items
    → Clears activeId if deleted
  
  duplicate(id)
    → Clones CL
    → Appends "(Copy)"
    → Adds to items
    → Returns new ID
  
  toggleFavorite(id)
    → Toggles favorite flag

Persistence:
  ✓ localStorage via zustand/persist
  ✓ Partialize: activeId, items
  ✓ Version: 1
```

### promptLibraryStore.ts

```typescript
State:
  folders: PromptFolder[]  // All folders
  prompts: SavedPrompt[]   // All prompts

Actions:
  upsertFolder(name, id?)
    → Creates or updates folder
    → Returns folder ID
  
  deleteFolder(id)
    → Removes folder
    → Unassigns prompts from folder
  
  upsertPrompt(p)
    → Creates or updates prompt
    → Returns prompt ID
  
  deletePrompt(id)
    → Removes prompt
  
  listByFolder(folderId)
    → Filters prompts by folder
    → Supports undefined (unfoldered)

Persistence:
  ✓ localStorage via zustand/persist
  ✓ Version: 1
```

### clUIStore.ts

```typescript
State:
  tone: CLTone             // formal/friendly/enthusiastic
  length: CLLength         // short/medium/long
  lang: CLLang             // en/tr
  templateId: string       // cl-01 to cl-15
  showPreview: boolean     // Preview visibility
  kwAssistOpen: boolean    // Keyword assist visibility

Actions:
  setTone(t)
  setLength(l)
  setLang(l)
  setTemplate(id)
  togglePreview()
  toggleKwAssist()

Persistence:
  ✓ localStorage via zustand/persist
  ✓ Version: 1
```

## UI Components

### CoverLetterTab.tsx

```typescript
Layout:
  Grid (xl: 3 columns)
  ├─ Left (2 cols): Toolbar, Editor/Preview, KeywordAssist, History
  └─ Right (1 col): Saved List

Responsive:
  ✓ Mobile: Stacked
  ✓ Desktop: Side-by-side
```

### CLToolbar.tsx

```typescript
Controls:
  ✓ Language select (EN/TR)
  ✓ Tone select (3 options)
  ✓ Length select (3 options)
  ✓ Template select (15 options)
  ✓ Generate button (with loading state)
  ✓ Prompt Library button
  ✓ Export button (disabled if no active)

Generation:
  onClick:
    1. Get current CV
    2. Get first job (if available)
    3. Get missing keywords from ATS
    4. Call generateCoverLetter()
    5. Create or update CL
    6. Set active
```

### CLEditor.tsx

```typescript
Features:
  ✓ contentEditable div
  ✓ Prose styling
  ✓ Focus ring
  ✓ Auto-save on blur
  ✓ Copy as text button
  ✓ Toast notification

State:
  ✓ Syncs with store via useEffect
  ✓ Updates store on blur
  ✓ Ref to editable div
```

### CLPreview.tsx

```typescript
Features:
  ✓ Read-only HTML render
  ✓ Prose styling
  ✓ Border & background
  ✓ Syncs with active CL

Display:
  ✓ dangerouslySetInnerHTML (sanitized)
  ✓ Same content as editor
```

### CLKeywordAssist.tsx

```typescript
Features:
  ✓ Lists missing ATS keywords (up to 30)
  ✓ Clickable chips
  ✓ Plus icon
  ✓ Inserts at cursor
  ✓ Updates editor

Insertion Logic:
  1. Get window selection
  2. Create text node
  3. Insert at range
  4. Move cursor
  5. Find editable root
  6. Update store
```

### CLSavedRow.tsx

```typescript
Display:
  ✓ Name + Company (truncated)
  ✓ Role + Updated date
  ✓ Favorite star (filled if favorited)

Actions:
  ✓ Favorite toggle
  ✓ Open (edit in dialog)
  ✓ Duplicate
  ✓ PDF export (quick)
  ✓ Delete (destructive)

Styling:
  ✓ Border card
  ✓ Hover effect
  ✓ Icon buttons
```

### CLSavedList.tsx

```typescript
Features:
  ✓ Search input (with icon)
  ✓ Real-time filtering
  ✓ Maps to CLSavedRow
  ✓ Empty state message
  ✓ Open dialog (edit mode)

Dialog:
  ✓ Grid 2 columns
  ✓ Left: Editor
  ✓ Right: Preview
  ✓ Syncs with selected CL
```

### CLHistory.tsx

```typescript
Features:
  ✓ Lists snapshots (up to 10 recent)
  ✓ Timestamp + Note
  ✓ Restore button per entry
  ✓ Truncated display

Action:
  ✓ Restore → updateContent()
  ✓ Updates editor & preview
```

### CLExportDialog.tsx

```typescript
Features:
  ✓ Format checkboxes (PDF, DOCX, GDoc)
  ✓ Close button
  ✓ Export button (disabled if none selected)

Flow:
  1. User selects formats
  2. Clicks Export
  3. For each format:
     → exportCoverLetter(doc, fmt)
  4. Dialog closes
```

### CLPromptLibraryDialog.tsx

```typescript
Layout:
  2 columns:
    Left:
      ✓ Add folder input + button
      ✓ Folder select
      ✓ Prompts list (scrollable)
      ✓ Copy & Delete per prompt
    
    Right:
      ✓ Prompt name input
      ✓ Prompt body textarea
      ✓ Clear button
      ✓ Save button

Features:
  ✓ Create/delete folders
  ✓ Create/update/delete prompts
  ✓ Copy prompt to clipboard
  ✓ Real-time folder filtering
```

## Integration Points

### With Step 26 (Saved Jobs)

```typescript
Linking:
  ✓ linkedJobId → Job.id
  ✓ Extracts: title, company, recruiterName
  ✓ Used for: generation, export filename

Future:
  ✓ "Generate CL" button in SavedJobRow
  ✓ Auto-create CL from job
```

### With Step 28 (ATS Details)

```typescript
Keywords:
  ✓ result.missingKeywords
  ✓ Displayed in CLKeywordAssist
  ✓ Clickable insertion
  ✓ Injected into generation

Future:
  ✓ Track keyword usage
  ✓ Highlight covered keywords
```

### With Step 29 (Variants)

```typescript
Linking:
  ✓ linkedVariantId → Variant.id
  ✓ Uses variant CV instead of current
  ✓ Export filename includes variant name

Future:
  ✓ "Generate CL" button in VariantRow
  ✓ Auto-create CL from variant
```

## Accessibility

### Keyboard Support

```typescript
Dialogs:
  ✓ Esc closes
  ✓ Tab cycles through fields
  ✓ Enter submits forms

Buttons:
  ✓ Focus rings visible
  ✓ Aria-labels for icon buttons

Editor:
  ✓ aria-label="Cover letter editor"
  ✓ contentEditable accessible
```

### Screen Readers

```typescript
Announcements:
  ✓ Dialog titles
  ✓ Button labels
  ✓ Form labels

Keyword Chips:
  ✓ Button role
  ✓ Visible text
```

### Color Contrast

```typescript
Compliance:
  ✓ WCAG AA for all text
  ✓ Buttons meet contrast ratio
  ✓ Borders visible in dark mode
```

## Security

### HTML Sanitization

```typescript
Protection:
  ✓ DOMPurify on all content
  ✓ Allowed tags only
  ✓ No scripts
  ✓ No dangerous attributes
  ✓ XSS-safe

Sanitization Points:
  ✓ On create()
  ✓ On updateContent()
  ✓ On generation fallback
```

### Input Validation

```typescript
Validation:
  ✓ No empty names for CLs
  ✓ No empty prompt bodies
  ✓ Template ID validated
  ✓ Tone/Length/Lang enums
```

## Performance

### Editor Performance

```typescript
Optimization:
  ✓ Debounced updates (blur event)
  ✓ useEffect dependencies minimal
  ✓ Ref instead of state for content
  ✓ History limited to 25 entries
```

### Search Performance

```typescript
Optimization:
  ✓ useMemo for filtering
  ✓ Case-insensitive toLowerCase()
  ✓ Early exit for empty query
```

### Storage Limits

```typescript
Considerations:
  ✓ localStorage limit: ~5-10 MB
  ✓ Typical CL: ~5-15 KB
  ✓ Estimated capacity: ~200-500 CLs
  ✓ History: 25 snapshots max

Future:
  ✓ Migrate to Firestore
  ✓ Implement retention policy
```

## Testing

### Unit Tests

**clTemplates.service.spec.ts:**
```typescript
✓ Should have 15 templates
✓ Should have unique ids
✓ Should contain placeholders
✓ Should get template by id
✓ Should return first template for invalid id
✓ Should have valid names
```

**clGenerator.service.spec.ts:**
```typescript
✓ Should generate with fallback
✓ Should inject variables
✓ Should handle EN language
✓ Should handle TR language
✓ Should apply friendly tone
✓ Should apply enthusiastic tone
✓ Should handle short length
✓ Should handle long length
✓ Should inject missing keywords
```

**clVariables.service.spec.ts:**
```typescript
✓ Should preserve allowed tags
✓ Should remove script tags
✓ Should remove dangerous attributes
✓ Should extract variables from CV
✓ Should include job information
✓ Should use default recruiter name
✓ Should handle extra variables
✓ Should derive skills text
✓ Should convert HTML to plain text
✓ Should handle br tags
✓ Should handle paragraphs
✓ Should trim whitespace
```

**clExport.service.spec.ts:**
```typescript
✓ Should export as PDF (stub)
✓ Should export as DOCX (stub)
✓ Should export as Google Doc (stub)
✓ Should generate filename with variables
```

**coverLetter.store.spec.ts:**
```typescript
✓ Should initialize with empty items
✓ Should create cover letter
✓ Should update content
✓ Should select cover letter
✓ Should remove cover letter
✓ Should duplicate cover letter
✓ Should toggle favorite
✓ Should upsert variables
✓ Should sanitize HTML on create
```

**promptLibrary.store.spec.ts:**
```typescript
✓ Should initialize with empty state
✓ Should upsert folder
✓ Should delete folder
✓ Should upsert prompt
✓ Should delete prompt
✓ Should list prompts by folder
✓ Should unassign prompts when folder deleted
✓ Should update existing prompt
```

**cl.ui.store.spec.ts:**
```typescript
✓ Should initialize with defaults
✓ Should set tone
✓ Should set length
✓ Should set language
✓ Should set template
✓ Should toggle preview
✓ Should toggle keyword assist
```

## Future Enhancements

### Step 31: AI Integration

```typescript
Potential Features:
  ✓ AI-generated WhyUs section
    - Research company
    - Match CV to mission
    - Generate personalized paragraph
  
  ✓ Smart tone suggestions
    - Analyze job posting
    - Recommend tone
    - Preview different tones
  
  ✓ Auto-improve CL
    - Analyze weak areas
    - Suggest improvements
    - One-click apply
```

### Advanced Features

```typescript
Planned:
  ✓ Multi-language support (beyond EN/TR)
  ✓ Custom template builder
  ✓ CL templates marketplace
  ✓ Version comparison (diff view)
  ✓ A/B testing (track which CLs got responses)
  ✓ Email integration (send directly)
  ✓ LinkedIn format export
  ✓ Firestore sync (cross-device)
```

## Known Limitations

1. **Export Stubs:**
   - PDF/DOCX/GDoc exports are console stubs
   - Actual export implementation pending
   - Integration with export services needed

2. **AI Provider:**
   - Optional dependency
   - Fallback is deterministic only
   - No advanced AI features without provider

3. **History Storage:**
   - No compression
   - No retention policy
   - Could fill localStorage
   - Solution: Firestore migration

4. **Template Customization:**
   - Fixed 15 templates
   - No user-created templates
   - No template marketplace
   - Solution: Template builder (future)

5. **Email Integration:**
   - No direct sending
   - Manual copy/paste required
   - Solution: Email service integration (future)

## Migration Notes

### From Step 29

```typescript
Integration:
  ✓ Uses naming.service for filenames
  ✓ Links to Variants via linkedVariantId
  ✓ No breaking changes

Usage:
  import { useCoverLetterStore } from '@/store'
  
  const { create } = useCoverLetterStore()
  create({ name: "CL - TechCorp", content: html })
```

### Store Changes

```typescript
New Stores:
  ✓ useCoverLetterStore (CL management)
  ✓ usePromptLibraryStore (prompt management)
  ✓ useCLUIStore (UI state)

No Changes to Existing:
  ✓ useCVDataStore
  ✓ useATSStore
  ✓ useJobsStore
  ✓ useVariantsStore
```

## References

- Step 26: Job Posting Structured UI
- Step 28: ATS Details & Keyword Explorer
- Step 29: Resume Variants & Export Presets
- DOMPurify: https://github.com/cure53/DOMPurify
- ContentEditable: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable
