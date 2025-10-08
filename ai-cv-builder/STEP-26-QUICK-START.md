# Step 26: Quick Start Guide

## 🚀 Getting Started (5 Minutes)

### 1. Try the Feature

```bash
# Start dev server
npm run dev

# Navigate to: http://localhost:5173/cv-builder
```

**Steps to test:**
1. Click **"3. Job"** tab
2. Click **"Paste Text"** → paste a job description
3. Wait for auto-parse (form fills automatically)
4. Edit any fields if needed
5. Click **"Save Job"**
6. Switch to **"Saved Jobs"** tab
7. See your saved job with search/filter options
8. Click **"Analyze"** to run ATS analysis

---

## 📋 Common Tasks

### Save a Job Programmatically

```ts
import { useJobsStore } from '@/stores/jobs.store'
import { useATSStore } from '@/stores/ats.store'

const { upsertFromForm } = useJobsStore()
const { parsedJob, currentJobText } = useATSStore()

const id = await upsertFromForm({
  title: parsedJob?.title || 'Untitled',
  company: parsedJob?.company || 'Unknown',
  remoteType: parsedJob?.remoteType || 'unknown',
  rawText: currentJobText,
  parsed: parsedJob!,
  tags: ['react', 'typescript'],
  notes: 'Interesting position',
  status: 'saved',
  favorite: false,
})
```

### Filter Saved Jobs

```ts
const { setFilter } = useJobsStore()

// Search by keyword
setFilter({ q: 'frontend' })

// Show only favorites
setFilter({ favorite: true })

// Filter by status
setFilter({ status: 'applied' })

// Filter by site
setFilter({ site: 'linkedin' })

// Combine filters
setFilter({ 
  q: 'react', 
  favorite: true, 
  status: 'saved' 
})
```

### Analyze a Saved Job

```ts
import { useATSStore } from '@/stores/ats.store'
import { useCVDataStore } from '@/stores/cvData.store'
import { useJobsStore } from '@/stores/jobs.store'

const { setJobText, parseJob, analyze } = useATSStore()
const { currentCV } = useCVDataStore()
const { items } = useJobsStore()

const job = items[0] // First saved job

setJobText(job.rawText)
await parseJob()
if (currentCV) {
  await analyze(currentCV)
}
```

---

## 🔧 Customization

### Add a Custom Field to Job Form

**1. Update Type** (`src/types/jobPosting.types.ts`):
```ts
export interface JobPosting {
  // ... existing fields
  customField?: string // Add your field
}
```

**2. Update Validation** (`src/lib/validations/jobPosting.schema.ts`):
```ts
export const jobPostingSchema = z.object({
  // ... existing fields
  customField: z.string().optional(),
})
```

**3. Add Input** (`src/components/job/JobStructuredForm.tsx`):
```tsx
<FormField label="Custom Field">
  <Input {...form.register('customField')} />
</FormField>
```

**4. Display in List** (`src/components/job/SavedJobRow.tsx`):
```tsx
{job.customField && <span>• {job.customField}</span>}
```

**5. Add i18n** (`public/locales/en/cv.json`):
```json
{
  "job": {
    "form": {
      "customField": "Custom Field"
    }
  }
}
```

### Add a Custom Filter

**1. Update Store** (`src/stores/jobs.store.ts`):
```ts
interface JobFilter {
  // ... existing filters
  customFilter?: string
}
```

**2. Add UI** (`src/components/job/SavedJobsList.tsx`):
```tsx
<Input
  placeholder="Custom filter..."
  onChange={(e) => setFilter({ customFilter: e.target.value })}
/>
```

**3. Apply Logic** (in `filteredJobs` useMemo):
```ts
const filtered = items.filter((job) => {
  if (filter.customFilter && !job.customField?.includes(filter.customFilter)) {
    return false
  }
  return true
})
```

---

## 🐛 Troubleshooting

### Jobs Not Appearing in List

**Check 1**: Verify jobs are saved
```ts
import { useJobsStore } from '@/stores/jobs.store'
console.log(useJobsStore.getState().items)
```

**Check 2**: Inspect localStorage
```js
localStorage.getItem('job_postings_local')
```

**Check 3**: Call refresh
```ts
const { refresh } = useJobsStore()
await refresh()
```

### Form Not Auto-Prefilling

**Check 1**: Verify parsedJob exists
```ts
import { useATSStore } from '@/stores/ats.store'
console.log(useATSStore.getState().parsedJob)
```

**Check 2**: Check currentJobText
```ts
console.log(useATSStore.getState().currentJobText)
```

**Fix**: Parse job first
```ts
const { parseJob } = useATSStore()
await parseJob()
```

### Firestore Not Working

**Check 1**: Verify env vars
```bash
# .env file should have:
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
```

**Check 2**: Console warnings
```
Look for: "[jobPostings.service] Firebase not configured"
```

**Fix**: Falls back to localStorage automatically

---

## 🧪 Running Tests

### Unit Tests
```bash
# All unit tests
npm run test

# Specific test file
npm run test jobPostings.service.spec.ts

# Watch mode
npm run test -- --watch
```

### E2E Tests
```bash
# All E2E tests
npx playwright test

# Step 26 only
npx playwright test step26

# Headed mode (see browser)
npx playwright test step26 --headed

# Debug mode
npx playwright test step26 --debug
```

---

## 📊 Data Flow Diagram

```
┌────────────┐
│ User Pastes│
│ Job Text   │
└──────┬─────┘
       │
       ▼
┌────────────┐
│ Step 25    │
│ Parser     │
└──────┬─────┘
       │
       ▼
┌────────────┐
│ ParsedJob  │◄──┐
└──────┬─────┘   │
       │         │
       ▼         │
┌────────────┐   │
│ Structured │   │
│ Form       │   │
│ (prefilled)│   │
└──────┬─────┘   │
       │         │
       ▼         │
┌────────────┐   │
│ User Edits │   │
└──────┬─────┘   │
       │         │
       ▼         │
┌────────────┐   │
│ Validation │   │
│ (Zod)      │   │
└──────┬─────┘   │
       │         │
       ▼         │
┌────────────┐   │
│ Hash       │   │
│ Calculation│   │
└──────┬─────┘   │
       │         │
       ▼         │
┌────────────┐   │
│ Dedupe     │   │
│ Check      │   │
└──────┬─────┘   │
       │         │
       ▼         │
┌────────────┐   │
│ Firestore/ │   │
│ LocalStore │   │
└──────┬─────┘   │
       │         │
       ▼         │
┌────────────┐   │
│ Saved Jobs │   │
│ List       │   │
└──────┬─────┘   │
       │         │
       ▼         │
┌────────────┐   │
│ User Clicks│   │
│ "Analyze"  │   │
└──────┬─────┘   │
       │         │
       ▼         │
┌────────────┐   │
│ ATS        │───┘
│ Analysis   │ (uses ParsedJob)
└────────────┘
```

---

## 🎯 Key Concepts

### Deduplication
- Jobs with same **content + URL** are treated as duplicates
- Hash calculated: `jobStableHash(rawText, url)`
- On save, existing job is **updated** instead of creating new

### Firestore Fallback
- Checks env vars at startup
- If Firebase not configured → uses localStorage
- Transparent to components (same API)

### Auto-Prefill
- Step 25 parses job → `parsedJob` in ATS store
- Form watches `parsedJob` with `useEffect`
- Updates form values when `parsedJob` changes

### Filter Persistence
- Filter state saved to localStorage via Zustand persist
- Restored on page reload
- Items themselves are **not** persisted (too large)

---

## 📚 Further Reading

- [STEP-26-NOTES.md](./src/docs/STEP-26-NOTES.md) - Full developer notes
- [STEP-26-SUCCESS.md](./STEP-26-SUCCESS.md) - Feature summary
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [Zod Docs](https://zod.dev/)
- [shadcn/ui Sheet](https://ui.shadcn.com/docs/components/sheet)

---

**Questions?** Check the documentation or search the codebase for examples.

**Happy coding! 🚀**
