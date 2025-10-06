# Step 26: Job Posting Structured UI & Saved Jobs

## Overview

This module extends Step 25's job posting input with a structured form and a persistent saved jobs system.

## Architecture

### Data Flow

```
Step 25 → Step 26 Integration:

1. Job Input (paste/URL/file)
   ↓
2. Parse → parsedJob (Step 25)
   ↓
3. Auto-prefill Structured Form ← parsedJob
   ↓
4. User edits/adds details
   ↓
5. Save → JobPosting (Firestore/localStorage)
   ↓
6. Saved Jobs List
   ↓
7. Analyze → ATS (Step 25)
```

### Components

```
JobInputTabs (NEW wrapper)
├── Input Tab
│   ├── JobInput (Step 25: paste/URL/file)
│   └── JobStructuredForm (NEW: prefills from parsedJob)
└── Saved Tab
    └── SavedJobsList (NEW)
        ├── SavedJobRow (with actions)
        └── JobDetailDrawer (detail view)
```

### Services

**jobPostings.service.ts** (Firestore + fallback):
- `saveJobPosting()`: Upsert with merge
- `getJobPosting(id)`: Fetch single item
- `listJobPostings(limit)`: Ordered by updatedAt desc
- `deleteJobPosting(id)`: Remove from collection
- Serialize/deserialize Date ↔ ISO strings

**jobPostings.local.ts** (localStorage fallback):
- Same API as Firestore version
- Stores in `job_postings_local` key
- Date conversion on read/write

**jobHash.ts**:
- `jobStableHash(rawText, url)`: Deterministic hash
- Used for deduplication
- Based on normalized text + URL

### Store

**jobsStore.ts** (Zustand + persist):

State:
- `items`: JobPosting[]
- `selectedId`: Current selection
- `filter`: { q, favorite, status, site }
- `loading`: Boolean
- `error`: String

Actions:
- `setFilter()`: Update filters
- `refresh()`: Load from service
- `select(id)`: Set selected job
- `upsertFromForm()`: Save/update with dedupe
- `remove(id)`: Delete job
- `toggleFavorite(id)`: Toggle favorite flag
- `duplicate(id)`: Create copy

Persistence:
- Filters and selectedId saved to localStorage
- Items loaded on refresh

### Deduplication Strategy

```typescript
Job Dedupe:

1. Generate hash: jobStableHash(rawText, url)
2. Check existing items:
   - Match: same hash AND same url
3. If match found:
   - Keep original id
   - Keep original createdAt
   - Update updatedAt
4. If no match:
   - Create new id
   - Set current timestamps

Example:
  Job A: hash=123, url=linkedin.com/job/456
  Job B: Same text, same URL → uses Job A's id
  Job C: Same text, different URL → new id
```

## Form Prefilling

The `JobStructuredForm` automatically prefills from `parsedJob` (Step 25):

```typescript
Auto-fill Logic:

1. On mount or parsedJob change:
   ✓ title: parsedJob.title
   ✓ company: parsedJob.company
   ✓ location: parsedJob.location
   ✓ remoteType: parsedJob.remoteType
   ✓ salary: parsedJob.salary
   ✓ rawText: currentJobText or parsedJob.sections.raw

2. User can edit any field
3. Additional fields available:
   - employmentType
   - seniority
   - source (url, site)
   - recruiter (name, email)
   - tags
   - notes
   - status
   - favorite

4. Validation (Zod):
   - title: min 2 chars
   - company: min 2 chars
   - rawText: min 20 chars
   - email: valid format
   - url: valid format
```

## Saved Jobs Features

### Search & Filters

```typescript
Filter Logic:

1. Text Search (q):
   - Searches: title, company, location, site, tags
   - Case-insensitive
   - Substring match

2. Favorite:
   - Checkbox: show only favorites
   - Starred icon in row

3. Status:
   - All, Saved, Applied, Interview, Offer, Rejected
   - Dropdown selection

4. Site:
   - Filter by source.site
   - Text input (onBlur)

Memoized:
  useMemo(() => filterLogic, [items, filter])
```

### Actions

```typescript
Row Actions:

1. Favorite (Star icon):
   - Toggle favorite flag
   - Visual: filled star when favorited
   - Persisted to storage

2. Analyze:
   - Load job rawText
   - Parse (Step 25)
   - Analyze against current CV
   - Results shown in Optimize tab
   - Disabled if no current CV

3. Open:
   - Show JobDetailDrawer
   - Display all metadata
   - View full rawText
   - Additional actions (analyze, duplicate)

4. Delete:
   - Remove from list
   - Delete from storage
   - Immediate update

Detail Drawer Actions:

1. Analyze with current CV:
   - Same as row action
   - Closes drawer on success

2. Duplicate:
   - Creates copy with "(Copy)" suffix
   - New id and timestamps
   - Closes drawer
```

## Integration with Step 25

```typescript
Connection Points:

1. Parse → Form:
   parsedJob (Step 25) → JobStructuredForm prefill

2. Saved → Analyze:
   SavedJobRow → setJobText + parseJob + analyze → ATS results

3. Form → Analyze:
   JobStructuredForm "Analyze with current CV" button

4. Shared State:
   - useATSStore (Step 25)
   - parsedJob, currentJobText, analyze()
   
Flow Example:
  User pastes job (Step 25)
  → Parse
  → parsedJob created
  → Form prefills automatically
  → User adds tags, notes
  → Saves
  → Listed in Saved tab
  → Later: Click Analyze
  → Uses saved rawText
  → Re-parses and analyzes
  → Shows ATS results (Step 25)
```

## Storage Strategy

### Firestore (if available)

```typescript
Collection: job_postings

Document Structure:
{
  id: string
  hash: string
  title: string
  company: string
  location?: string
  remoteType: 'remote' | 'hybrid' | 'onsite' | 'unknown'
  employmentType?: string
  seniority?: string
  salary?: { min, max, currency, period }
  source?: { url, site }
  recruiter?: { name, email }
  postedAt?: ISO string
  deadlineAt?: ISO string
  tags?: string[]
  notes?: string
  rawText: string
  parsed: object (ParsedJob from Step 25)
  status?: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected'
  favorite?: boolean
  lastATS?: { score, matched, missing, at: ISO string }
  createdAt: ISO string
  updatedAt: ISO string
}

Indexes (recommended):
- updatedAt desc (for list ordering)
- favorite desc, updatedAt desc
- status asc, updatedAt desc
- source.site asc, updatedAt desc

Security Rules:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /job_postings/{jobId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### localStorage (fallback)

```typescript
Key: job_postings_local

Structure:
{
  "job_uuid_1": { ...JobPosting },
  "job_uuid_2": { ...JobPosting },
  ...
}

Date Handling:
- Stored as ISO strings
- Converted to Date objects on read
- Converted back to ISO on write

Limitations:
- No server-side validation
- No cross-device sync
- 5-10MB storage limit
- Manual serialization
```

## Type System

```typescript
Key Types:

RemoteType:
  'remote' | 'hybrid' | 'onsite' | 'unknown'

EmploymentType:
  'full_time' | 'part_time' | 'contract' | 'intern' | 'temporary' | 'freelance' | 'other'

Seniority:
  'intern' | 'junior' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'vp' | 'c_level' | 'na'

JobPosting:
  - All fields from form
  - Plus: id, hash, createdAt, updatedAt
  - parsed: ParsedJob (from Step 25)
  - lastATS: Optional ATS result summary

JobSalary:
  { min?, max?, currency?, period? }

JobSource:
  { url?, site? }

RecruiterContact:
  { name?, email? }

JobATSShort:
  { score?, matched?, missing?, at? }
```

## Validation

```typescript
Zod Schema:

Required:
  - title (min 2)
  - company (min 2)
  - remoteType (enum)
  - rawText (min 20)
  - parsed (any)

Optional but validated:
  - source.url (valid URL or empty)
  - recruiter.email (valid email or empty)
  - salary.min/max (positive integers)
  - tags (array, max 20 items)
  - notes (max 4000 chars)

Form Errors:
  - Displayed below each field
  - Red text, small font
  - Prevents submission
```

## Performance

```typescript
Optimizations:

1. Memoized Filtering:
   useMemo(() => filter logic, [items, filter])
   - Only recalculates when items or filter changes

2. Debounced Search:
   - Text input onChange
   - Immediate filter update (useMemo handles efficiency)

3. Lazy Service Imports:
   - jobPostings.service lazy loads Firestore
   - Falls back to local if not available

4. Pagination (future):
   - Currently loads 500 items
   - Can add pagination for larger lists
   - Firestore query limit + offset

5. Selective Re-renders:
   - Zustand shallow comparison
   - Component-level memoization

6. Date Conversion:
   - Only on read/write boundaries
   - In-memory uses Date objects
```

## Accessibility

```typescript
WCAG AA Compliance:

1. Form Labels:
   - All inputs have visible labels
   - Label wraps input for click area

2. Error Messages:
   - Announced by screen readers
   - Red color + icon (not just color)

3. Keyboard Navigation:
   - All actions keyboard accessible
   - Tab through list rows
   - Enter to open drawer
   - Escape to close drawer

4. ARIA Labels:
   - Star button: "Favorite" / "Unfavorite"
   - Delete button: "Delete"
   - All icon-only buttons labeled

5. Focus Management:
   - Visible focus rings
   - Focus trapped in drawer/dialog
   - Return focus on close

6. Color Contrast:
   - Text: WCAG AA minimum
   - Icons: Sufficient contrast
   - Hover states: Clear indication
```

## Security

```typescript
Security Measures:

1. Input Validation:
   - Zod schema validation
   - Type safety
   - Length limits

2. Sanitization:
   - No HTML rendering (plain text only)
   - URL validation
   - Email validation

3. Firestore Rules:
   - User-owned records only
   - Authentication required
   - Field-level validation

4. No PII in Logs:
   - Error messages generic
   - No job content in console
   - No email/phone exposed

5. HTTPS Only:
   - All Firestore communication encrypted
   - URL fetching over HTTPS preferred
```

## Testing Strategy

```typescript
Unit Tests:

1. jobPostings.service.spec.ts:
   ✓ Save creates new posting
   ✓ Save with existing id updates
   ✓ List returns ordered items
   ✓ Delete removes posting
   ✓ Date serialization/deserialization
   ✓ Fallback to local when Firestore unavailable

2. jobs.store.spec.ts:
   ✓ upsertFromForm with dedupe
   ✓ toggleFavorite updates flag
   ✓ duplicate creates new id
   ✓ filter logic (search, favorite, status, site)
   ✓ refresh loads from service

E2E Tests:

1. step26-jobs-flow.spec.ts:
   ✓ Paste job text (Step 25)
   ✓ Form auto-prefills
   ✓ Edit field and save
   ✓ Appears in Saved tab
   ✓ Search finds item
   ✓ Filter by status
   ✓ Click Analyze
   ✓ ATS results shown in Optimize tab
   ✓ Delete removes from list
```

## Future Enhancements

```typescript
Step 31+ Integration:

1. AI-Powered Parsing:
   - Replace heuristic parser with LLM
   - Extract structured data more accurately
   - Handle complex formats

2. Smart Tagging:
   - AI suggests relevant tags
   - Auto-categorization

3. Application Tracking:
   - Status progression timeline
   - Reminders for deadlines
   - Interview notes

4. Job Matching:
   - Score against CV (not just ATS)
   - Recommend relevant jobs
   - Skills gap analysis

5. Bulk Operations:
   - Multi-select jobs
   - Bulk delete, tag, status update
   - Export list

6. Advanced Search:
   - Date ranges
   - Salary ranges
   - Keyword highlighting
   - Saved searches
```

## Known Limitations

```typescript
Current Limitations:

1. No Pagination:
   - Loads all jobs at once
   - May be slow with 500+ jobs
   - Solution: Add pagination or virtual scrolling

2. No Job Board Integration:
   - URL fetch limited by CORS
   - Solution: Server-side proxy (later step)

3. No Attachments:
   - Can't attach documents
   - Solution: Add file storage (Step 27+)

4. No Collaboration:
   - Single-user only
   - Solution: Add sharing (later)

5. No Notifications:
   - No deadline reminders
   - Solution: Add notification system

6. Basic Search:
   - Simple substring matching
   - Solution: Full-text search with Firestore or Algolia
```

## Migration Notes

```typescript
From Step 25 to Step 26:

Breaking Changes: NONE
- Step 25 components unchanged
- parsedJob structure unchanged
- ATS analysis flow unchanged

Additive Changes:
✓ New JobInputTabs wrapper
✓ New JobStructuredForm
✓ New SavedJobsList
✓ New jobsStore
✓ New services/jobs/*
✓ New validation schema

Integration:
✓ CVBuilder.tsx uses JobInputTabs
✓ Analyze flow preserved
✓ All Step 25 features working

Data Migration:
- No existing data to migrate
- New users start fresh
- localStorage key: job_postings_local
```

## Development Guide

### Adding New Job Fields

1. Update `jobPosting.types.ts`:
   ```typescript
   export interface JobPosting {
     // ... existing fields
     newField?: string
   }
   ```

2. Update `jobPosting.schema.ts`:
   ```typescript
   export const jobPostingSchema = z.object({
     // ... existing fields
     newField: z.string().optional()
   })
   ```

3. Update `JobStructuredForm.tsx`:
   ```tsx
   <Field label="New Field">
     <Input {...form.register('newField')} />
   </Field>
   ```

4. Update serialization if Date type:
   ```typescript
   // In jobPostings.service.ts
   function serialize(d: JobPosting) {
     return {
       ...d,
       newField: d.newField instanceof Date 
         ? d.newField.toISOString() 
         : d.newField
     }
   }
   ```

### Adding New Filters

1. Update Filter type in `jobsStore.ts`:
   ```typescript
   type Filter = {
     // ... existing
     newFilter?: string
   }
   ```

2. Add UI in `SavedJobsList.tsx`:
   ```tsx
   <Select onValueChange={(v)=>setFilter({ newFilter: v })}>
     {/* options */}
   </Select>
   ```

3. Update filter logic:
   ```typescript
   const filtered = useMemo(()=>{
     return items.filter(j => {
       // ... existing filters
       if (filter.newFilter && j.newField !== filter.newFilter) return false
       return true
     })
   }, [items, filter])
   ```

### Adding New Actions

1. Add action to store:
   ```typescript
   newAction: async (id) => {
     const curr = get().items.find(x => x.id === id)
     if (!curr) return
     // ... logic
     await saveJobPosting(updated)
     set({ items: get().items.map(x => x.id === id ? updated : x) })
   }
   ```

2. Add button in `SavedJobRow.tsx`:
   ```tsx
   <Button onClick={()=>newAction(j.id)}>
     New Action
   </Button>
   ```

## References

- Step 25: Job parsing and ATS analysis
- Zustand docs: https://github.com/pmndrs/zustand
- Zod docs: https://zod.dev
- Firestore docs: https://firebase.google.com/docs/firestore
- React Hook Form: https://react-hook-form.com
