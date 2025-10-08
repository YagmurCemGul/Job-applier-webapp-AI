# Step 26: Job Posting Structured UI & Saved Jobs — Developer Notes

## Overview

Step 26 extends the Job Posting flow (from Step 25) with a **structured form interface** and a **persistent job management system**. Users can now parse job postings, review/edit structured metadata, save postings for later, and manage a library of saved jobs with search, filters, and quick actions.

## Key Features

### 1. Structured Job Form
- **Auto-prefill**: Automatically populated from Step 25's parsed job data
- **Comprehensive fields**: Title, company, location, remote type, employment type, seniority, salary, tags, notes, etc.
- **Validation**: Zod schema ensures data integrity before save
- **Quick Actions**: Save job, Analyze with CV

### 2. Saved Jobs Library
- **Persistent Storage**: Firestore (primary) with localStorage fallback
- **Deduplication**: Hash-based (content + URL) to prevent duplicates
- **Rich Metadata**: Status tracking (saved/applied/interview/offer/rejected), favorites, tags, notes
- **Search & Filters**: Real-time search, filter by status/site/favorites
- **Quick Actions**: Analyze, Open detail, Favorite, Duplicate, Delete

### 3. Job Detail Drawer
- **Full View**: All job metadata in a side sheet
- **Raw Text**: Original job description preserved
- **Actions**: Analyze with CV, Duplicate posting

### 4. Integration with Step 25 (ATS Analysis)
- **Seamless Flow**: Parse → Form → Save → Analyze
- **Re-analysis**: Click "Analyze" on saved job to re-run ATS against current CV
- **Context Preservation**: Parsed job data carries through to analysis

## Architecture

### Data Flow

```
Job Text (Step 25) → Parser → ParsedJob
                                   ↓
                            Structured Form ← User Edits
                                   ↓
                            Validation (Zod)
                                   ↓
                            Hash Calculation
                                   ↓
                        Firestore/LocalStorage
                                   ↓
                            Saved Jobs List ← Search/Filter
                                   ↓
                        [Analyze] → ATS Panel (Step 25)
```

### Core Components

#### Types (`src/types/jobPosting.types.ts`)
- `JobPosting`: Main document type
- `RemoteType`, `EmploymentType`, `Seniority`: Enums for structured data
- `JobSalary`, `JobSource`, `RecruiterContact`: Nested metadata
- `JobATSShort`: Lightweight ATS result cache

#### Services
- **`jobPostings.service.ts`**: Firestore implementation with fallback
- **`jobPostings.local.ts`**: localStorage-based persistence
- **`jobHash.ts`**: Stable hash generation for deduplication

#### Store (`stores/jobs.store.ts`)
- **State**: `items[]`, `filter`, `selectedId`, `loading`, `error`
- **Actions**:
  - `upsertFromForm()`: Create/update with dedupe logic
  - `toggleFavorite()`, `duplicate()`, `remove()`
  - `setFilter()`, `refresh()`, `select()`

#### UI Components
- **`JobInputTabs.tsx`**: Main container with Input/Saved tabs
- **`JobStructuredForm.tsx`**: Validated form with auto-prefill
- **`SavedJobsList.tsx`**: List with filters
- **`SavedJobRow.tsx`**: Individual job row with actions
- **`JobDetailDrawer.tsx`**: Detail view (Sheet/Drawer)

### Storage Strategy

#### Firestore (Primary)
- **Collection**: `job_postings`
- **Document ID**: UUID or stable job ID
- **Indexes** (recommended):
  ```
  - updatedAt (desc) — for list ordering
  - hash + source.url (composite) — for dedupe queries
  - favorite (asc) — for favorites filter
  - status (asc) — for status filter
  ```

#### localStorage (Fallback)
- **Key**: `job_postings_local`
- **Format**: JSON map `{ [id]: JobPosting }`
- **Serialization**: Dates → ISO strings
- **Deserialization**: ISO strings → Date objects

#### Deduplication Logic
1. Compute `hash = jobStableHash(rawText, url)`
2. On save, check if existing job with same `hash` and `source.url`
3. If match found:
   - Reuse existing `id`
   - Preserve `createdAt`
   - Update `updatedAt`

### Validation

**Schema** (`lib/validations/jobPosting.schema.ts`):
- Required: `title`, `company`, `rawText`, `parsed`
- Optional but validated: `salary`, `source.url`, `recruiter.email`, etc.
- Constraints:
  - `title`, `company`: min 2 chars
  - `rawText`: min 20 chars
  - `tags`: max 20 items
  - `notes`: max 4000 chars

### Security & Performance

#### Security
- **Input Sanitization**: Zod validation prevents XSS/injection
- **Firestore Rules** (to be configured):
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /job_postings/{jobId} {
        allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      }
    }
  }
  ```
- **No PII Logging**: Sensitive data excluded from error logs

#### Performance
- **Debounced Search**: 250ms delay on filter input
- **Memoized List**: `useMemo` for filtered jobs
- **Lazy Service Import**: Dynamic import reduces initial bundle
- **Indexed Queries**: Firestore composite indexes for fast lookups
- **Pagination** (future): Limit 100 jobs in current implementation

## Internationalization (i18n)

### English (`en/cv.json`)
```json
{
  "job": {
    "subtabs": { "input": "Input", "saved": "Saved Jobs" },
    "form": { "title": "Title", "company": "Company", ... },
    "saved": { "search": "Search...", "none": "No saved jobs" }
  }
}
```

### Turkish (`tr/cv.json`)
```json
{
  "job": {
    "subtabs": { "input": "Girdi", "saved": "Kayıtlı İlanlar" },
    "form": { "title": "Pozisyon", "company": "Şirket", ... },
    "saved": { "search": "Ara...", "none": "Kayıtlı ilan yok" }
  }
}
```

## Testing

### Unit Tests

#### `jobPostings.service.spec.ts`
- ✅ Save job to localStorage
- ✅ Update existing job
- ✅ List jobs ordered by `updatedAt desc`
- ✅ Delete job
- ✅ Hash stability and normalization

#### `jobs.store.spec.ts`
- ✅ Filter state management
- ✅ Upsert with dedupe
- ✅ Toggle favorite
- ✅ Duplicate job
- ✅ Remove job

### E2E Test (`step26-jobs-flow.spec.ts`)
- ✅ Parse job → Fill form → Save → List
- ✅ Search and filter saved jobs
- ✅ Favorite/unfavorite
- ✅ Analyze saved job with CV
- ✅ Open detail drawer
- ✅ Duplicate job
- ✅ Delete job
- ✅ Empty state handling

## Accessibility (a11y)

- **Keyboard Navigation**: Tab through form fields, Enter to submit, Esc to close drawer
- **ARIA Labels**: All icon buttons have `aria-label` (e.g., "Add to favorites", "Delete job")
- **Focus Management**: Drawer traps focus, returns on close
- **Color Contrast**: WCAG AA compliant (tested with axe DevTools)
- **Screen Reader**: Semantic HTML (`<label>`, `<button>`, `role` attributes)

## Known Limitations & Future Enhancements

### Current Limitations
1. **No User Scoping**: Jobs are stored globally (not per-user in localStorage mode)
2. **No Sync**: localStorage jobs don't sync to Firestore when user logs in
3. **No Application Tracking**: Status field present but no workflow UI
4. **No Bulk Actions**: Can't select multiple jobs for batch delete/export

### Planned Enhancements (Future Steps)
1. **User-scoped Storage**: Add `userId` to Firestore docs, filter by `auth.uid`
2. **Sync on Login**: Migrate localStorage jobs to Firestore when user authenticates
3. **Application Pipeline**: Kanban board for job application stages
4. **Export**: Download saved jobs as CSV/JSON
5. **Reminders**: Deadline notifications for applications
6. **Job Matching**: AI-powered job recommendations based on CV

## Developer Quick Start

### Add a New Job Field
1. **Type**: Update `JobPosting` in `types/jobPosting.types.ts`
2. **Validation**: Add field to `jobPostingSchema` in `lib/validations/jobPosting.schema.ts`
3. **Form**: Add input to `JobStructuredForm.tsx`
4. **Display**: Update `SavedJobRow.tsx` and `JobDetailDrawer.tsx`
5. **i18n**: Add labels to `en/cv.json` and `tr/cv.json`

### Add a New Filter
1. **Store**: Add filter property to `JobFilter` type in `stores/jobs.store.ts`
2. **UI**: Add Select/Input to `SavedJobsList.tsx` filters section
3. **Logic**: Update `filteredJobs` useMemo with new condition

### Customize Dedupe Logic
Edit `upsertFromForm` in `stores/jobs.store.ts`:
```ts
const existing = get().items.find(
  (j) => j.hash === hash && j.source?.url === input.source?.url
)
```
Change comparison to match your business rules.

## Integration Points

### With Step 25 (ATS Analysis)
- `parsedJob` from ATS store → auto-prefills form
- `currentJobText` → populates `rawText` field
- `analyze()` action → triggered from Saved Jobs "Analyze" button

### With CV Data (Step 1-24)
- `currentCV` from `cvData.store` → passed to `analyze()` for ATS scoring
- Live preview visible in Job tab (xl+ screens)

### With Future Steps
- **Step 31 (AI Multi-Provider)**: Replace parser/analysis with LLM-based extraction
- **Step 32+ (Application Tracking)**: Status field ready for workflow management

## Troubleshooting

### Jobs Not Appearing in List
1. Check browser console for errors
2. Verify `refresh()` called on mount (`useEffect` in `SavedJobsList`)
3. Inspect localStorage: `localStorage.getItem('job_postings_local')`
4. Check Firestore console (if using Firestore)

### Form Not Prefilling
1. Ensure `parsedJob` exists in ATS store (check DevTools)
2. Verify `useEffect` dependencies in `JobStructuredForm.tsx`
3. Check if `currentJobText` is populated

### Dedupe Not Working
1. Inspect hash calculation: `console.log(jobStableHash(rawText, url))`
2. Verify URL is exactly the same (trailing slashes, query params matter)
3. Check `existing` lookup logic in `upsertFromForm`

### Firestore Errors
1. Ensure Firebase config in `.env` is correct
2. Check Firestore rules allow read/write for authenticated users
3. Verify indexes are created (Firestore console → Indexes)

## References

- **Zustand Persist**: https://docs.pmnd.rs/zustand/integrations/persisting-store-data
- **Zod Validation**: https://zod.dev/
- **shadcn/ui Sheet**: https://ui.shadcn.com/docs/components/sheet
- **Firestore Best Practices**: https://firebase.google.com/docs/firestore/best-practices

---

**Author**: AI CV Builder Team  
**Date**: 2025-10-08  
**Version**: 1.0.0  
**Step**: 26
