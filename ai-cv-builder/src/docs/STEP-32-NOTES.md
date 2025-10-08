# Step 32 - Job Sources Ingestion & Discovery

## Overview

Complete job ingestion and discovery system with API-first connectors, compliance-gated HTML scraping, normalization, deduplication, hybrid search, saved searches, and alerts.

## Architecture

### Data Flow

```
Job Sources → Adapters → Raw Jobs → Normalize → Deduplicate → Store → Search Index → UI
                                                                           ↓
                                                                    Alerts & Matches
```

### Core Components

1. **Adapters** - Fetch jobs from various sources
2. **Normalization** - Convert raw data to standard format
3. **Deduplication** - Remove duplicate postings
4. **Search Index** - Hybrid keyword + semantic search
5. **Scheduler** - Periodic job fetching
6. **Alerts** - Notify users of new matches
7. **Compliance** - Legal/ethical safeguards

## Connector Matrix

| Source | Type | Status | Legal Mode Required | Notes |
|--------|------|--------|---------------------|-------|
| Generic RSS | RSS | ✅ Active | No | Preferred method |
| LinkedIn API | API | 🔶 Stub | No | Requires credentials |
| Indeed API | API | 🔶 Stub | No | Publisher program |
| Glassdoor API | API | ❌ N/A | No | No public API |
| LinkedIn HTML | HTML | ⚠️ Stub | **Yes** | User content only |
| Indeed HTML | HTML | ⚠️ Stub | **Yes** | User content only |
| Glassdoor HTML | HTML | ⚠️ Stub | **Yes** | User content only |
| Kariyer.net HTML | HTML | ⚠️ Stub | **Yes** | User content only |

## Compliance & Legal

### Principles

1. **API/RSS First** - Always prefer official endpoints
2. **Explicit Consent** - HTML scraping requires `legalMode=true`
3. **User Content** - HTML adapters only process user-provided content
4. **Robots.txt** - Non-blocking checks for HTML sources
5. **Rate Limiting** - Per-domain throttling
6. **No Credentials** - Users provide their own auth headers if needed

### Legal Mode

HTML adapters **require** explicit user consent:

```typescript
{
  key: 'linkedin.html',
  kind: 'html',
  legalMode: true  // ← User affirms legal rights
}
```

Without `legalMode=true`, HTML adapters will throw an error.

## Normalization Pipeline

### Extraction

- **Salary**: Regex-based with currency detection ($, €, £, ₺)
- **Location**: Pattern matching + normalization
- **Seniority**: Keyword detection (intern, junior, senior, lead, etc.)
- **Employment**: Full-time, part-time, contract, internship, etc.
- **Remote**: Boolean detection from description
- **Keywords**: Frequency-based top 30 terms

### Fingerprinting

Jobs are deduplicated using fingerprints:

```
fingerprint = hash(title + company + location + url_base)
```

- Case insensitive
- Ignores URL query params
- FNV-1a hash for speed

### Deduplication

When duplicates are found:
1. Calculate "richness score" (salary + postedAt + description length + keywords)
2. Keep the richer entry
3. Update `updatedAt` timestamp

## Search System

### Hybrid Search

1. **Keyword Search** - Inverted index with AND logic
2. **Semantic Search** - Embeddings via Step 31 `aiEmbed`
3. **KNN** - Find similar jobs via cosine similarity

### Index Building

```typescript
await rebuildIndex(jobs);  // Full rebuild
addToIndex(job);          // Incremental add
```

Index includes:
- By-ID map for fast lookup
- Keyword inverted index
- Vector embeddings (when available)

## Saved Searches & Alerts

### Search Structure

```typescript
{
  name: "React Jobs NYC",
  query: "react developer",
  filters: {
    location: "New York",
    remote: true,
    minSalary: 100000,
    postedWithinDays: 7,
    requireKeywords: ["typescript", "graphql"],
    excludeKeywords: ["php"]
  },
  alerts: {
    enabled: true,
    intervalMin: 60  // Check every hour
  }
}
```

### Alert Evaluation

Alerts run periodically and return:

```typescript
{
  searchId: "search_123",
  hits: ["job_456", "job_789"]
}
```

## Integration Points

### Step 27 (Parsing)
- Reuses field extraction patterns
- Shares salary/location normalization

### Step 28 (ATS Keywords)
- Displays missing keywords on job cards
- Highlights match gaps

### Step 29 (Variants)
- Match score based on active variant
- Skills comparison for relevance

### Step 31 (AI Orchestrator)
- Semantic embeddings for search
- Fallback gracefully if unavailable

## Usage

### Configure Source

```typescript
import { useJobSourcesStore } from '@/stores/jobSources.store';

const { upsert } = useJobSourcesStore();

upsert({
  key: 'rss.techcrunch',
  enabled: true,
  kind: 'rss',
  domain: 'techcrunch.com',
  params: {
    feedUrl: 'https://techcrunch.com/jobs/feed/'
  }
});
```

### Fetch Jobs

```typescript
import { runAllAdaptersOnce } from '@/services/jobs/adapters/runAll';
import { useJobSourcesStore } from '@/stores/jobSources.store';

const { sources } = useJobSourcesStore.getState();
await runAllAdaptersOnce(sources.filter(s => s.enabled));
```

### Search

```typescript
import { search, rebuildIndex } from '@/services/jobs/searchIndex.service';
import { useJobsStore } from '@/stores/jobs.store';

const { items } = useJobsStore.getState();
await rebuildIndex(items);

const ids = search('react typescript senior');
```

### Save Search

```typescript
import { useJobSearchesStore } from '@/stores/jobSearches.store';

const { upsert } = useJobSearchesStore();

upsert({
  name: 'My Dream Jobs',
  query: 'senior react',
  filters: { remote: true },
  alerts: { enabled: true, intervalMin: 60 }
});
```

## UI Components

- **JobFinderPage** - Main container
- **JobFilters** - Search + saved searches
- **JobList** - Grid of job cards
- **JobCard** - Individual posting with match score
- **SourceSettingsDialog** - Configure sources
- **SaveSearchDialog** - Create/edit saved searches
- **FetchRunLog** - Observability panel

## Testing

### Unit Tests

```bash
npm test -- normalize.service.spec.ts
npm test -- dedupe.service.spec.ts
npm test -- searchIndex.service.spec.ts
npm test -- compliance.service.spec.ts
npm test -- jobs.store.spec.ts
```

### Integration Tests

```bash
npm test -- adapters.rss.spec.ts
npm test -- adapters.html.stubs.spec.ts
```

### E2E Tests

```bash
npm run test:e2e -- step32-jobs-flow.spec.ts
```

## Performance

- **Index rebuild**: O(n log n) where n = jobs count
- **Search**: O(t × k) where t = query terms, k = avg keyword matches
- **Dedup**: O(n) with hashmap
- **Storage**: LocalStorage via Zustand persist

## Future Enhancements

1. **Advanced Filters**
   - Salary sliders
   - Date range picker
   - Company size/type

2. **Geo Search**
   - Geocoding integration
   - Map view
   - Radius search

3. **Bulk Actions**
   - Multi-select jobs
   - Batch apply
   - Export to spreadsheet

4. **Browser Extension**
   - One-click job capture
   - Page context integration

5. **Real-time Notifications**
   - Email alerts (Gmail API)
   - Push notifications
   - Slack/Discord webhooks

6. **Company Pages**
   - Aggregate by company
   - Company insights
   - Salary trends

7. **ML Enhancements**
   - Better seniority detection
   - Skills extraction via NER
   - Salary prediction

## Troubleshooting

### Jobs not appearing

1. Check source is enabled
2. Verify params (feedUrl, etc.)
3. Review fetch logs for errors
4. Test compliance gate (legalMode for HTML)

### Search returns no results

1. Rebuild index: `rebuildIndex(jobs)`
2. Check query syntax (AND logic)
3. Verify jobs have keywords extracted

### Alerts not firing

1. Confirm `alerts.enabled = true`
2. Check interval timing
3. Verify filter criteria

### Match scores always 0

1. Ensure CV data exists (Step 27)
2. Check skills are populated
3. Active variant selected (Step 29)

## Security Checklist

- ✅ HTML scraping gated by explicit consent
- ✅ No credentials stored (user-provided only)
- ✅ Robots.txt respected (non-blocking)
- ✅ Rate limiting per domain
- ✅ Input sanitization in search
- ✅ No XSS in job descriptions (React escapes)
- ✅ CORS-safe API calls

## Accessibility

- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ ARIA labels
- ✅ Screen reader support
- ✅ WCAG AA contrast

## i18n Support

- English (en)
- Turkish (tr)

All UI strings externalized in `i18n/*/jobs.json`.

## File Structure

```
src/
├── types/
│   ├── jobs.types.ts           # Job & source types
│   └── searches.types.ts       # Saved search types
├── stores/
│   ├── jobs.store.ts           # Jobs & logs
│   ├── jobSearches.store.ts    # Saved searches
│   ├── jobScheduler.store.ts   # Scheduling state
│   └── jobSources.store.ts     # Source configs
├── services/jobs/
│   ├── adapters/
│   │   ├── runAll.ts           # Orchestration
│   │   ├── rss.adapter.ts      # Generic RSS
│   │   ├── *.api.adapter.ts    # API stubs
│   │   └── *.html.adapter.ts   # HTML stubs
│   ├── normalize.service.ts    # Normalization
│   ├── dedupe.service.ts       # Deduplication
│   ├── searchIndex.service.ts  # Hybrid search
│   ├── scheduler.service.ts    # Periodic fetch
│   ├── alerts.service.ts       # Alert evaluation
│   ├── compliance.service.ts   # Legal checks
│   ├── http.service.ts         # HTTP client
│   └── upsert.service.ts       # Store updates
├── components/jobs/
│   ├── JobFinderPage.tsx
│   ├── JobFilters.tsx
│   ├── JobList.tsx
│   ├── JobCard.tsx
│   ├── SaveSearchDialog.tsx
│   ├── SourceSettingsDialog.tsx
│   └── FetchRunLog.tsx
├── i18n/
│   ├── en/jobs.json
│   └── tr/jobs.json
└── tests/
    ├── unit/                   # Service tests
    ├── integration/            # Adapter tests
    └── e2e/                    # Flow tests
```

## Commit Message

```
feat(jobs): API-first job ingestion with optional legal-mode HTML scraping, normalization/dedupe, hybrid search, saved searches & alerts, logs, and UI
```

## Related Steps

- **Step 27**: Parsing (field extraction patterns)
- **Step 28**: ATS Keywords (highlighting)
- **Step 29**: Variants (match scoring)
- **Step 31**: AI Orchestrator (embeddings)

---

**Status**: ✅ Complete  
**Version**: 1.0  
**Last Updated**: 2025-01-08
