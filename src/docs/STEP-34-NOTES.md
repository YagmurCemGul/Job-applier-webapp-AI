# Step 34: Browser Extension (MV3) for Real Auto-Apply Transport

## Overview

Production-ready Manifest V3 browser extension that provides secure auto-apply transport, page parsing, and guided file attachment for the JobPilot CV Builder (Steps 17-33).

## Architecture

### High-Level Flow

```
Web App (Step 33)
  ↓ (HMAC-signed message)
Extension Background (Service Worker)
  ├─ Security Check (origin + HMAC)
  ├─ Rate Limit Check
  └─ Route to Content Script
      ↓
Content Script (Platform Handler)
  ├─ Wait for page ready
  ├─ Parse existing form
  ├─ Autofill fields
  ├─ Show guided file overlay
  └─ Submit or stage for review
      ↓
Result Message (back to Web App)
```

### Components

**Background Service Worker:**
- Entry point for all extension logic
- Routes messages between web app and content scripts
- Enforces security (HMAC + origin allow-list)
- Implements rate limiting (token bucket)
- Maintains run history

**Content Scripts (6 handlers):**
- Greenhouse, Lever, Workday, Indeed, LinkedIn, Generic
- Each implements platform-specific selectors
- Shared utilities: DOM, autofill, overlay, parse, i18n
- Runs in page context (document_idle)

**UI Components:**
- Popup: Quick status, run history, pause toggle
- Options: Configure origins, HMAC key, platform settings

**Storage:**
- Local storage for settings
- Persistent across browser sessions
- Schema versioning for migrations

**Messaging:**
- Protocol types (APPLY_START, APPLY_RESULT, IMPORT_JOB)
- Bridge utilities for web app <-> extension
- HMAC signing and verification

## Features

### 1. Secure Bridge

**Origin Allow-List:**
```typescript
// User configures in Options
appOrigins: [
  'https://app.jobpilot.com',
  'http://localhost:5173' // dev
]

// Background checks on every request
if (!settings.appOrigins.includes(message.meta.origin)) {
  reject('unauthorized')
}
```

**HMAC Signature:**
```typescript
// Web app signs message
const body = JSON.stringify({ type, payload, meta })
const signature = HMAC_SHA256(body, sharedKey)
message.meta.sign = signature

// Extension verifies
const valid = await verifyHMAC(body, signature, settings.hmacKey)
if (!valid) reject('invalid signature')
```

### 2. Platform Handlers

**Greenhouse:**
```typescript
// Selectors
#first_name, #last_name, #email, #phone
input[type="file"][name*="resume"]

// Custom questions by label text
findByLabel('Why are you interested?')
→ textarea

// Multi-step: Continue button detection
findSubmitButton() → 'Continue' | 'Submit'
```

**Lever:**
```typescript
// Label-based approach
findByLabel('Full name') → input
findByLabel('Resume/CV') → file input

// Multi-step modal handling
await waitForElement('.application-form')
```

**Workday:**
```typescript
// Dynamic React components
[data-automation-id="input-*"]
[aria-label="First Name"]

// Waits for dynamic content
await waitForIdle(3000)
await waitForElement('[data-automation-id]')
```

**Indeed & LinkedIn:**
```typescript
// Minimal support (complex platforms)
// Generic label matching
// Manual review recommended
```

**Generic:**
```typescript
// Pure heuristics
findByName('email') || findByLabel('email')
findByLabel('phone') || findByName('phone')

// Works on any form
// Accuracy depends on structure
```

### 3. Autofill Engine

**Label-to-Control Mapping:**
```typescript
<label for="firstName">First Name</label>
<input id="firstName" />

findByLabel('First Name')
→ document.getElementById('firstName')
```

**Heuristics:**
```typescript
1. Try <label for="id"> → #id
2. Try label text → closest input
3. Try aria-label
4. Try placeholder
5. Try name attribute

Normalize text:
  'E-mail' → 'email'
  '  Phone  ' → 'phone'
```

**Fill Strategies:**
```typescript
// Text/textarea: direct value + events
element.value = 'John Doe'
element.dispatchEvent(new Event('input'))
element.dispatchEvent(new Event('change'))

// Select: match option text
options.find(opt => normalize(opt.text) === normalize(value))
select.value = opt.value

// Radio: match label text
radios.find(r => label(r).includes(value))
radio.checked = true

// Checkbox: boolean
checkbox.checked = true/false
```

**Events:**
```typescript
// Always dispatch to trigger validation
input → triggers onChange handlers
change → triggers form validation
blur → triggers field-level validation
```

### 4. Guided File Attachment

**Why User Gesture Required:**
```typescript
// Browser security: cannot programmatically set files
input.files = new FileList() // ❌ Blocked

// Solution: Guide user to click
showGuidedOverlay({
  targetElement: fileInput,
  onContinue: () => {
    // User clicks file input
    // Browser opens picker
    // User selects file
  }
})
```

**Overlay Implementation:**
```typescript
// A11y-friendly dialog
<div role="dialog" aria-modal="true">
  <h2 id="title">Attach your file</h2>
  <p>Click the highlighted field...</p>
  <button>Continue</button>
  <button>Skip</button>
</div>

// Highlights target input
border: 3px solid #3182ce
box-shadow: 0 0 0 4px rgba(49, 130, 206, 0.2)

// Focus trap
Tab/Shift+Tab cycles through dialog controls
ESC closes
```

**Future Enhancement:**
```typescript
// Download CV/CL from web app
const url = payload.files[0].url
const blob = await fetch(url).then(r => r.blob())

// Save to downloads
const a = document.createElement('a')
a.href = URL.createObjectURL(blob)
a.download = 'CV.pdf'
a.click()

// Guide user to select downloaded file
// (Still requires user gesture)
```

### 5. Page Parsers

**Extract Job Metadata:**
```typescript
parsePage('greenhouse'):
  title: extractTitle()
    → h1[class*="title"]
    → meta[property="og:title"]
    → document.title

  company: extractCompany()
    → [class*="company"]
    → [data-qa*="company"]

  location: extractLocation()
    → [class*="location"]

  description: extractDescription()
    → [class*="description"]
    → article
    → main
    (capped at 5000 chars)

  salary: extractSalary()
    → /\$[\d,]+\s*-\s*\$[\d,]+/
    → /[\d,]+\s*-\s*[\d,]+\s*USD/i

  remote: detectRemote()
    → text.includes('remote')
    → text.includes('work from home')
```

**Import to Web App:**
```typescript
IMPORT_JOB message:
  {
    type: 'IMPORT_JOB',
    payload: {
      url: window.location.href,
      title: 'Software Engineer',
      company: 'Acme Corp',
      location: 'San Francisco, CA',
      description: '...',
      salary: '$100,000 - $150,000',
      remote: true,
      platform: 'greenhouse'
    },
    meta: { ts: Date.now() }
  }

Web app:
  ← IMPORT_JOB
  → Step 32 jobsStore.upsertMany([...])
  → Normalizer runs
  → Job appears in Jobs Finder
```

### 6. Compliance & Safety

**Legal Mode:**
```typescript
// Per-platform toggle in Options
settings.legal.greenhouse = true

// Checked on every apply
if (!settings.legal[platform]) {
  return {
    ok: false,
    message: 'Legal Mode is OFF for greenhouse. Enable in Options.'
  }
}

// User confirms rights to submit
```

**Rate Limiting:**
```typescript
// Token bucket per platform
buckets: {
  greenhouse: { remaining: 10, capacity: 10, refillMs: 6000 },
  lever: { remaining: 10, capacity: 10, refillMs: 6000 },
  ...
}

// Consumes token on apply
bucket.remaining -= 1

// Refills over time
refillCount = Math.floor(elapsed / refillMs)
bucket.remaining = Math.min(capacity, remaining + refillCount)

// Rejects if exhausted
if (bucket.remaining <= 0) {
  return { ok: false, message: 'Rate limit exceeded. Wait 6s.' }
}
```

**Dry-Run Default:**
```typescript
// Default: true (safe)
settings.dryRunDefault.greenhouse = true

// On apply:
if (dryRun) {
  // Fill fields but don't submit
  // Show banner: "Dry-Run: form prefilled for review"
  return { reviewNeeded: true }
}

// User must explicitly opt into submit
```

**Minimal Permissions:**
```typescript
manifest.json:
  "host_permissions": [
    "https://boards.greenhouse.io/*",    // Greenhouse only
    "https://jobs.lever.co/*",           // Lever only
    ...                                  // No <all_urls>
  ]

  "permissions": [
    "storage",      // Settings only
    "tabs",         // Open/activate tabs
    "scripting",    // Inject content scripts
    "activeTab",    // Current tab access
    "alarms",       // Scheduled tasks
    "notifications" // User feedback
  ]

// No broad access
// No remote code execution
// No tracking
```

### 7. Logging & Telemetry

**Run History:**
```typescript
interface RunLog {
  id: string
  ts: number
  domain: 'greenhouse' | 'lever' | ...
  status: 'success' | 'error' | 'review'
  message: string
  url?: string
}

// Stored in background
runHistory: RunLog[] (max 50)

// Displayed in popup
Last 10 runs with status, domain, timestamp
```

**Detailed Logs:**
```typescript
// Content script logs each action
logs.push('first_name: filled')
logs.push('email: filled')
logs.push('resume: overlay shown')
logs.push('submit: button clicked')

// Returned to web app
{
  type: 'APPLY_RESULT',
  payload: {
    ok: true,
    hints: ['first_name: filled', 'email: filled', ...]
  }
}

// Web app displays in Apply Logs Panel (Step 33)
```

## Integration with Steps 17-33

### Step 27 (Parsed CV)

```typescript
// Extension receives CV data
payload.answers = {
  firstName: cv.personalInfo.firstName,
  lastName: cv.personalInfo.lastName,
  email: cv.personalInfo.email,
  phone: cv.personalInfo.phone,
  linkedin: cv.personalInfo.linkedin,
  github: cv.personalInfo.github,
  ...customAnswers
}

// Content script fills fields
for (const [key, value] of Object.entries(payload.answers)) {
  const element = findByLabel(key)
  fillField(element, value)
}
```

### Step 29 (Variants)

```typescript
// Resume picker selects active variant
const variantId = useVariantsStore.getState().activeId

// Export to PDF (stub in extension, real in future)
const cvFile = await exportVariantToPDF(variantId)

// Include in payload
payload.files = [
  { id: 'cv', name: 'CV.pdf', type: 'cv', url: cvFile }
]
```

### Step 30 (Cover Letters)

```typescript
// Include cover letter if provided
if (coverLetterId) {
  const clFile = await exportCLToPDF(coverLetterId)
  payload.files.push({
    id: 'cl',
    name: 'CoverLetter.pdf',
    type: 'coverLetter',
    url: clFile
  })
}

// If platform supports pasting CL
if (clText && platform.supportsPasteCL) {
  payload.answers.coverLetter = clText
  // Content script fills textarea
  fillField(clTextarea, clText)
}
```

### Step 31 (AI)

```typescript
// Future: AI-powered screening questions
if (question.requiresGeneration) {
  const result = await sendToExtension('GENERATE_TEXT', {
    prompt: question.text,
    context: cv.summary
  })

  payload.answers[question.key] = result.text
}
```

### Step 32 (Jobs)

```typescript
// Quick Apply from Jobs Finder
<JobCard>
  <Button onClick={() => {
    setApplyOpen(true)
    // Prefill with job data
    setInitialJobUrl(job.url)
    setInitialCompany(job.company)
    setInitialRole(job.title)
  }}>
    Quick Apply
  </Button>
</JobCard>

// Apply dialog submits to extension
await autoApply({
  platform: detectPlatform(job.url),
  jobUrl: job.url,
  company: job.company,
  role: job.title,
  mapperArgs: { jobUrl: job.url },
  optIn: true
})

// Extension returns match score
result.score = job.score
```

### Step 33 (Applications)

```typescript
// Extension logs appear in Apply Logs Panel
<ApplyLogsPanel>
  {applications.flatMap(a => a.logs).map(log => (
    <div>
      {log.level} • {log.ts} • {log.message}
    </div>
  ))}
</ApplyLogsPanel>

// Application stages update based on results
if (result.submitted) {
  app.stage = 'applied'
  app.appliedAt = new Date().toISOString()
} else if (result.reviewNeeded) {
  app.stage = 'hold'
}
```

## Security Considerations

### HMAC Signing

**Why:**
- Prevents unauthorized messages
- Ensures message integrity
- Protects against MITM attacks

**How:**
```typescript
// Web app
const body = JSON.stringify({ type, payload, meta })
const key = import.meta.env.VITE_EXTENSION_HMAC_KEY
const signature = HMAC_SHA256(body, key)

// Extension
const valid = await verifyHMAC(body, signature, settings.hmacKey)
if (!valid) reject()
```

**Key Management:**
```typescript
// Development
.env:
  VITE_EXTENSION_HMAC_KEY=dev-shared-secret-key

// Production
- User generates key in Options
- Enters same key in web app settings
- Keys never transmitted (local only)
```

### Origin Allow-List

**Why:**
- Prevents malicious sites from triggering auto-apply
- Restricts access to trusted origins only

**How:**
```typescript
// User configures
settings.appOrigins = [
  'https://app.jobpilot.com',
  'https://staging.jobpilot.com'
]

// Background checks
if (!settings.appOrigins.includes(message.meta.origin)) {
  return { ok: false, reason: 'unauthorized' }
}
```

### Rate Limiting

**Why:**
- Prevents accidental spam
- Respects platform policies
- Avoids IP bans

**How:**
```typescript
// Token bucket algorithm
capacity: 10 requests
refill: 1 request per 6 seconds (10/min)

// Consume on apply
remaining -= 1

// Reject if exhausted
if (remaining <= 0) wait(6000)
```

## Performance

### Lazy Loading

```typescript
// Content scripts loaded only on matched domains
manifest.json:
  "content_scripts": [{
    "matches": ["https://boards.greenhouse.io/*"],
    "js": ["content/greenhouse.js"],
    "run_at": "document_idle"
  }]

// Background loads platform module on demand
const handler = await import(`./content/${platform}.js`)
```

### Wait Strategies

```typescript
// Network idle (requestIdleCallback)
await waitForIdle(2000)

// Element appears (MutationObserver)
await waitForElement('form', 5000)

// Tab ready (chrome.tabs.onUpdated)
await waitForTabReady(tabId, 10000)
```

### Caching

```typescript
// Settings cached in background
let cachedSettings: Settings | null = null

getSettings():
  if (cachedSettings) return cachedSettings
  cachedSettings = await chrome.storage.local.get('settings')
  return cachedSettings

// Invalidate on change
chrome.storage.onChanged.addListener(() => {
  cachedSettings = null
})
```

## Testing

### Unit Tests (Vitest)

```typescript
// autofill.spec.ts
it('should fill text input', () => {
  const input = createElement('input', { type: 'text' })
  fillText(input, 'John')
  expect(input.value).toBe('John')
})

// parse.spec.ts
it('should extract title from h1', () => {
  document.body.innerHTML = '<h1>Software Engineer</h1>'
  const job = parsePage('test')
  expect(job.title).toBe('Software Engineer')
})

// security.spec.ts
it('should verify valid HMAC', async () => {
  const signature = await hmacSHA256('test', 'key')
  const valid = await verifyHMAC('test', signature, 'key')
  expect(valid).toBe(true)
})
```

### Integration Tests (Playwright)

```typescript
// content-greenhouse.spec.ts
test('should fill Greenhouse form', async ({ page }) => {
  await page.goto('fixtures/greenhouse.html')
  
  // Inject content script
  await page.addScriptTag({ path: 'dist/content/greenhouse.js' })
  
  // Send APPLY_START message
  await page.evaluate(() => {
    chrome.runtime.sendMessage({
      type: 'APPLY_START',
      payload: {
        answers: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com'
        },
        dryRun: true
      }
    })
  })
  
  // Verify fields filled
  expect(await page.inputValue('#first_name')).toBe('John')
  expect(await page.inputValue('#last_name')).toBe('Doe')
  expect(await page.inputValue('#email')).toBe('john@example.com')
})
```

### E2E Tests (Playwright)

```typescript
// apply-flow.spec.ts
test('full auto-apply flow', async ({ page, context }) => {
  // Install extension
  await context.addExtension('dist')
  
  // Open web app
  await page.goto('http://localhost:5173/applications')
  
  // Click Quick Apply
  await page.click('[data-testid="quick-apply"]')
  
  // Fill apply dialog
  await page.fill('[name="jobUrl"]', 'https://boards.greenhouse.io/test/123')
  await page.check('[name="optIn"]')
  
  // Submit
  await page.click('[data-testid="submit-apply"]')
  
  // Wait for extension to open tab
  const newPage = await context.waitForEvent('page')
  
  // Verify form filled
  await expect(newPage.locator('#first_name')).toHaveValue('John')
  
  // Verify result returned
  await page.waitForSelector('[data-testid="apply-success"]')
})
```

## Known Limitations

### 1. File Attach (User Gesture Required)

**Issue:**
```typescript
// Cannot programmatically set files
input.files = fileList // ❌ SecurityError
```

**Workaround:**
```typescript
// Show guided overlay
// User clicks file input
// Browser opens picker
// User selects file
```

**Future:**
```typescript
// Download files from web app
// Native file API (if/when available)
// Auto-select downloaded file
```

### 2. Shadow DOM

**Issue:**
```typescript
// Shadow roots isolate DOM
<div>
  #shadow-root
    <input id="email" />
</div>

document.querySelector('#email') // null
```

**Workaround:**
```typescript
// Traverse shadow roots
function findInShadow(selector) {
  // Check document
  let el = document.querySelector(selector)
  if (el) return el
  
  // Check all shadow roots
  const shadows = document.querySelectorAll('*')
  for (const host of shadows) {
    if (host.shadowRoot) {
      el = host.shadowRoot.querySelector(selector)
      if (el) return el
    }
  }
}
```

### 3. Multi-Step Forms

**Issue:**
```typescript
// Forms span multiple pages
// Need to detect completion and advance
```

**Workaround:**
```typescript
// Detect "Continue" button
const submitBtn = findSubmitButton()
if (submitBtn.textContent.includes('Continue')) {
  // Click and wait for next page
  submitBtn.click()
  await waitForElement('[data-step="2"]')
  // Fill next page
}
```

### 4. Platform-Specific Challenges

**Workday:**
- Dynamic React components
- Unpredictable selectors
- Multi-step with complex navigation
- → Manual review recommended

**LinkedIn:**
- Requires authentication
- Complex modal flows
- API restrictions
- → Manual review recommended

**Indeed:**
- Easy Apply is proprietary
- Varying form structures
- → Manual review recommended

## Future Enhancements

### Short-Term

1. **Real File Attach:**
   - Download CV/CL from web app
   - Save to OS downloads folder
   - Guide user to select downloaded file
   - Auto-cleanup after apply

2. **Multi-Page Detection:**
   - Detect form pagination
   - Auto-advance through steps
   - Maintain state across pages

3. **Screenshot Capture:**
   - Capture form before/after autofill
   - Attach to application logs
   - Help debug issues

4. **Platform Stats:**
   - Success rate per platform
   - Average time per apply
   - Most common errors

### Medium-Term

5. **AI Question Answering:**
   - Detect free-text questions
   - Request AI generation from web app
   - Fill with generated answer
   - User reviews before submit

6. **Form Learning:**
   - Remember successful field mappings
   - Build platform-specific selector DB
   - Improve accuracy over time

7. **Batch Apply:**
   - Queue multiple applications
   - Execute sequentially with rate limit
   - Progress indicator

8. **Browser Extension Store:**
   - Submit to Chrome Web Store
   - Submit to Firefox Add-ons
   - Auto-update users

### Long-Term

9. **Native File API:**
   - Investigate File System Access API
   - Direct file attach (if permissions allow)
   - Remove user gesture requirement

10. **Cross-Browser:**
    - Safari extension (MV3)
    - Maintain feature parity
    - Unified build pipeline

11. **Offline Mode:**
    - Cache job postings
    - Apply later when online
    - Sync results

12. **Mobile Extension:**
    - Chrome Android support (MV3)
    - Simplified mobile UI
    - Touch-optimized overlays

## Migration from Step 33 Stub

### Before (Step 33 Stub)

```typescript
// apply.engine.ts
await new Promise(r => setTimeout(r, 500))
log(appId, 'info', 'Submitted (stub) to greenhouse')
```

### After (Step 34 Real)

```typescript
// apply.engine.ts
const result = await sendToExtension('APPLY_START', payload, hmacKey)

if (result.type === 'APPLY_RESULT') {
  if (result.payload.ok) {
    log(appId, 'info', result.payload.message)
    update(appId, { appliedAt: new Date().toISOString() })
  } else {
    log(appId, 'error', result.payload.message)
  }
}
```

### Backward Compatibility

```typescript
// Graceful fallback if extension not installed
try {
  const result = await sendToExtension(...)
  // Use real result
} catch (error) {
  // Extension not installed
  log(appId, 'warn', 'Extension not available. Using stub.')
  // Fall back to stub behavior
  await new Promise(r => setTimeout(r, 500))
  log(appId, 'info', 'Submitted (stub)')
}

// App continues to work without extension
// Extension enhances experience when installed
```

## Deployment

### Development

1. Build extension:
   ```bash
   cd extension
   npm install
   npm run build
   ```

2. Load in Chrome:
   - chrome://extensions
   - Developer mode ON
   - Load unpacked → select `extension/dist`

3. Configure:
   - Click extension icon → Options
   - Add origin: `http://localhost:5173`
   - Set HMAC key: `dev-shared-secret-key`
   - Enable Legal Mode for all platforms

4. Test:
   - Open web app: `http://localhost:5173`
   - Navigate to job
   - Click Quick Apply
   - Extension should open tab and fill form

### Production

1. Package extension:
   ```bash
   npm run package
   ```
   Output: `jobpilot-extension.zip`

2. Submit to Chrome Web Store:
   - Create developer account
   - Upload zip
   - Fill out listing details
   - Submit for review

3. Configure web app:
   - Set production HMAC key in env
   - Update docs with extension install link
   - Add extension detection + install prompt

4. User flow:
   - User visits web app
   - App detects extension not installed
   - Shows install prompt with CWS link
   - User installs extension
   - User configures (add origin + HMAC key)
   - User enables Legal Mode
   - User can now use Quick Apply

## Support

### Debugging

**Console Logs:**
```typescript
// Background
console.log('JobPilot: Background service worker started')

// Content Script
console.log('JobPilot: Greenhouse handler loaded')

// Check console in:
// - Extension popup (right-click → Inspect)
// - Options page (right-click → Inspect)
// - Job posting page (F12 → Console)
// - Background (chrome://extensions → Inspect service worker)
```

**Error Messages:**
```typescript
// Security errors
'Origin not in allow-list'
→ Add origin in Options

'Invalid signature'
→ Check HMAC key matches

// Rate limit errors
'Rate limit exceeded'
→ Wait 60s or adjust limit

// Form errors
'Submit button not found'
→ Manual submission required
→ Report selector issue
```

### Common Issues

1. **Extension not responding**
   - Verify installed and enabled
   - Check origin in allow-list
   - Verify HMAC key
   - Check console for errors

2. **Forms not filling**
   - Platform enabled in Options?
   - Legal Mode ON?
   - Try Dry-Run first
   - Check selector compatibility

3. **Files not attaching**
   - User gesture required
   - Follow overlay instructions
   - Click file input when highlighted

4. **Submit fails**
   - Platform may have CAPTCHA
   - Manual review required
   - Report issue if persistent

## References

- Chrome Extensions (MV3): https://developer.chrome.com/docs/extensions/mv3/
- HMAC-SHA256: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/sign
- Content Scripts: https://developer.chrome.com/docs/extensions/mv3/content_scripts/
- Storage API: https://developer.chrome.com/docs/extensions/reference/storage/
- Tabs API: https://developer.chrome.com/docs/extensions/reference/tabs/
- Scripting API: https://developer.chrome.com/docs/extensions/reference/scripting/
- File API: https://developer.mozilla.org/en-US/docs/Web/API/File
- Shadow DOM: https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM
