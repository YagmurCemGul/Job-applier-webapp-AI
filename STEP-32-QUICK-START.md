# Step 32 - Job Discovery - Quick Start Guide

## 🚀 Get Started in 3 Minutes

### 1. Install Dependencies

```bash
cd ai-cv-builder
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Access Job Finder

Open your browser and navigate to:
```
http://localhost:5173/jobs
```

## 📋 First Steps

### Configure Your First Job Source

1. **Click "Source Settings"**
   - The RSS Generic source is already enabled
   
2. **Add a Feed URL** (example)
   ```
   https://example.com/jobs.rss
   ```

3. **Click "Fetch Now"**
   - Jobs will appear in the grid
   - Logs will show at the bottom

### Search Jobs

1. **Enter a query** in the search box:
   ```
   React Developer
   ```

2. **Save the search** (optional)
   - Click "Save Search"
   - Name it: "React Jobs"
   - Set alert interval: 60 minutes
   - Click "Save"

### View Job Details

Each job card shows:
- Job title
- Company and location
- Match score (based on your CV)
- Missing ATS keywords
- Quick actions (Open, Save)

## 🧪 Run Tests

```bash
# All tests
npm test

# Specific test suites
npm test -- normalize.service.spec.ts
npm test -- jobs.store.spec.ts

# E2E tests
npm run test:e2e -- step32-jobs-flow.spec.ts
```

## 📖 Key Features to Try

### 1. RSS Feed Integration

The RSS adapter is ready to use. Just provide any valid RSS job feed URL in the source settings.

**Example RSS feeds** (verify availability):
- TechCrunch Jobs (if available)
- Stack Overflow Jobs RSS
- GitHub Jobs RSS
- Your company's job feed

### 2. Legal Mode for HTML Sources

For HTML adapters (LinkedIn, Indeed, etc.):

1. Enable "Legal Mode" in source settings
2. Provide fixture HTML via params
3. Or integrate with user-owned content only

**Warning**: HTML scraping requires explicit user consent!

### 3. Saved Searches & Alerts

1. Search for "Senior Engineer"
2. Add filters:
   - Location: "New York"
   - Remote: Yes
3. Save with alerts every 60 minutes
4. System will notify when new matches appear

### 4. Match Scoring

If you have a CV loaded (Step 27):
- Jobs automatically get match scores
- Score based on skill overlap
- Missing keywords highlighted

## 🎯 Common Use Cases

### Use Case 1: Monitor Multiple Sources

```typescript
// Configure multiple RSS sources
sources = [
  { key: 'rss.techcrunch', feedUrl: 'https://...' },
  { key: 'rss.stackoverflow', feedUrl: 'https://...' },
  { key: 'rss.github', feedUrl: 'https://...' }
]
```

### Use Case 2: Find Remote React Jobs

1. Search: "React"
2. Save search with filters:
   - `remote: true`
   - `minSalary: 100000`
   - `requireKeywords: ['typescript', 'graphql']`

### Use Case 3: Get Alerted for Senior Roles

1. Search: "Senior Software Engineer"
2. Filters:
   - `seniority: ['senior', 'lead']`
   - `postedWithinDays: 7`
3. Enable alerts: every 30 minutes

## 🔧 Advanced Configuration

### Custom Adapter

Create a new adapter in `src/services/jobs/adapters/`:

```typescript
export async function fetchMyAPI(source: SourceConfig): Promise<JobRaw[]> {
  // Your implementation
}
```

Add to `runAll.ts`:

```typescript
case 'myapi': return myAdapter.fetchMyAPI(s);
```

### Custom Normalization

Extend `normalize.service.ts`:

```typescript
export function extractCustomField(text: string) {
  // Your extraction logic
}
```

### Search Customization

Modify `searchIndex.service.ts` for custom ranking:

```typescript
export function customSearch(query: string, weights: Weights) {
  // Weighted search implementation
}
```

## 📊 Monitoring & Debugging

### Check Fetch Logs

Scroll to "Fetch Logs" section to see:
- ✓ OK / ✗ ERR status
- Source name
- Timestamp
- Jobs created/updated/skipped
- Error messages

### Debug Search

```typescript
import { search, rebuildIndex } from '@/services/jobs/searchIndex.service';

// Force index rebuild
await rebuildIndex(jobs);

// Test search
const results = search('react developer');
console.log('Found jobs:', results);
```

### Inspect Store

```typescript
import { useJobsStore } from '@/stores/jobs.store';

const state = useJobsStore.getState();
console.log('Jobs:', state.items);
console.log('Logs:', state.logs);
```

## 🐛 Troubleshooting

### Jobs Not Appearing

1. ✅ Source enabled?
2. ✅ Valid feed URL?
3. ✅ Check fetch logs for errors
4. ✅ Try manual fetch
5. ✅ Verify CORS if API

### Search Returns Nothing

1. ✅ Jobs exist in store?
2. ✅ Rebuild index: `rebuildIndex(jobs)`
3. ✅ Check query syntax
4. ✅ Verify keywords extracted

### Match Score is 0

1. ✅ CV data loaded? (Step 27)
2. ✅ Skills populated?
3. ✅ Active variant selected? (Step 29)

### Alerts Not Firing

1. ✅ Alerts enabled in search?
2. ✅ Scheduler running?
3. ✅ Filter criteria correct?
4. ✅ Check browser console

## 📚 Documentation

- **Full Docs**: `ai-cv-builder/src/docs/STEP-32-NOTES.md`
- **Completion Report**: `/workspace/STEP-32-COMPLETION-REPORT.md`
- **Validation**: Run `/workspace/validate-step-32.sh`

## 🔗 Integration Points

- **Step 27**: Job parsing & field extraction
- **Step 28**: ATS keyword analysis
- **Step 29**: Variant-based matching
- **Step 31**: AI embeddings for semantic search

## 🎉 What's Next?

After getting familiar with the basics:

1. **Configure Real Sources**
   - Add your favorite job board RSS feeds
   - Set up API credentials for LinkedIn/Indeed

2. **Create Saved Searches**
   - Build a library of targeted searches
   - Enable alerts for critical roles

3. **Optimize Matching**
   - Refine your CV (Step 27)
   - Create job-specific variants (Step 29)
   - Let the system find best matches

4. **Monitor Results**
   - Review fetch logs regularly
   - Fine-tune filters based on results
   - Track match quality over time

## 💡 Pro Tips

1. **Start with RSS** - It's reliable and legal
2. **Test with fixtures** - Use sample HTML for development
3. **Enable legal mode carefully** - Only for content you own
4. **Monitor rate limits** - Respect source TOS
5. **Use semantic search** - Enable AI embeddings (Step 31)
6. **Create multiple searches** - Different criteria for different goals
7. **Check logs regularly** - Catch issues early

---

Happy job hunting! 🎯
