# Step 33: Auto-Apply Engine & Application Tracker

## Overview

This step implements a comprehensive auto-apply and application tracking system with Kanban board, outreach sequences, and integration with existing CV, cover letter, and job ingestion features.

## Architecture

### System Layers

```
UI Layer
├─ ApplicationsPage (Kanban + Controls)
├─ ApplyDialog (Auto-apply with legal gate)
├─ ApplicationDetailDrawer (Details + Contacts + Events)
├─ SequenceBuilderDialog (Email sequences)
└─ EmailTemplateDialog (Template management)

Application Layer
├─ Stores (applications, templates, sequences, contacts)
├─ Apply Engine (compliance, throttle, mappers)
└─ Integrations (Gmail stub, Calendar stub)

Service Layer
├─ Forms Mappers (5 platforms)
├─ Resume Picker (Variant + CL export)
└─ Message Bus (Browser extension spec)

Integration Layer
├─ Step 27: Parsed CV data
├─ Step 29: Variant selection
├─ Step 30: Cover letter export
├─ Step 31: AI orchestration
└─ Step 32: Job ingestion & scoring
```

### Auto-Apply Flow

```
User Action (Quick Apply)
  ↓
ApplyDialog
  ├─ Select Platform (Greenhouse/Lever/etc.)
  ├─ Legal Opt-in Checkbox
  ├─ Prefill (Company, Role, URL)
  └─ Submit
  ↓
autoApply()
  ├─ 1. Compliance Check
  │    ✓ Require optIn=true
  │    ✓ Block if optIn=false
  ├─ 2. Throttle
  │    ✓ Token bucket (20/min/platform)
  │    ✓ Sleep if exhausted
  ├─ 3. Mapper
  │    ✓ Load platform mapper
  │    ✓ Build ApplyPayload
  ├─ 4. Create Application Record
  │    ✓ Store in applicationsStore
  │    ✓ Set stage='applied'
  ├─ 5. Send to Message Bus
  │    ✓ postMessage for extension
  │    ✓ No-op if no extension
  ├─ 6. Simulate Submit (STUB)
  │    ✓ 500ms delay
  │    ✓ Log "Submitted"
  └─ 7. Update Timestamps
       ✓ Set appliedAt
  ↓
Application appears in Kanban
```

## Features

### 1. Auto-Apply Engine

**Compliance Gate:**
```typescript
applyCompliance.check(optIn: boolean)

Rules:
  ✓ optIn must be true
  ✓ User must explicitly check legal affirmation
  ✓ Per-submission verification

Example:
  optIn=false
  → { ok: false, reason: 'optOut' }
  → autoApply() throws error

UI:
  "I confirm I have the rights to submit on this site (Legal Mode)."
  → Checkbox in ApplyDialog
```

**Throttling:**
```typescript
applyThrottle(platform, cap=20, refillMs=1000)

Algorithm:
  Token bucket per platform
  ✓ Capacity: 20 requests
  ✓ Refill: 1 request/second
  ✓ Sleep if exhausted

Example:
  Platform: greenhouse
  Remaining: 0
  → Sleep 1000ms
  → Refill: +1
  → Consume: -1
  → Remaining: 0

Limits:
  ✓ 20 applications/minute per platform
  ✓ Prevents hammering
  ✓ Respects rate limits
```

**Submission (Stub):**
```typescript
Current Implementation:
  ✓ 500ms simulated delay
  ✓ Log "Submitted (stub)"
  ✓ Returns success

Future Implementation:
  ✓ Browser extension content script
  ✓ DOM interaction with job board
  ✓ Form filling & submission
  ✓ Real-time status updates
  ✓ Error handling & retries

Message Bus:
  ✓ window.postMessage({ type: 'APPLY_START', payload })
  ✓ Extension listens & responds
  ✓ No-op in standalone app
```

### 2. Forms Mappers

**Platform Support:**
```typescript
✓ Greenhouse
✓ Lever
✓ Workday
✓ Indeed
✓ LinkedIn

Each mapper:
  Input:
    - jobUrl: string
    - cvFile: string
    - clFile?: string
    - answers?: Record<string, string>
  
  Output: ApplyPayload
    - platform: PlatformKey
    - jobUrl: string
    - files: FileRef[]
    - answers: Record<string, any>
    - extra?: platform-specific fields
```

**Greenhouse Mapper:**
```typescript
mapGreenhouse({ jobUrl, cvFile, clFile, answers })

Output:
  {
    platform: 'greenhouse',
    jobUrl: 'https://greenhouse.com/jobs/123',
    files: [
      { id: 'cv', name: 'cv.pdf', type: 'cv', url: 'blob:...' },
      { id: 'cl', name: 'cover-letter.pdf', type: 'coverLetter', url: 'blob:...' }
    ],
    answers: { question1: 'answer1' }
  }
```

**Lever Mapper:**
```typescript
mapLever({ jobUrl, cvFile, clFile, answers })

Differences:
  ✓ platform: 'lever'
  ✓ File names: 'resume.pdf', 'cover_letter.pdf'
```

**Workday Mapper:**
```typescript
mapWorkday({ jobUrl, cvFile, clFile, answers })

Special:
  ✓ extra: { workdayLocale: 'en-US' }
  ✓ Workday-specific configuration
```

**Indeed & LinkedIn Mappers:**
```typescript
Similar pattern:
  ✓ platform: 'indeed' | 'linkedin'
  ✓ File names: 'resume.pdf', 'CV.pdf'
  ✓ Standard answers field
```

### 3. Resume Picker

**pickFiles Service:**
```typescript
pickFiles({ variantId, coverLetterId }): Promise<FileRef[]>

Process:
  1. If variantId:
     - Export variant to PDF (silent)
     - Create blob URL
     - Add to files: { id: 'cv', name: 'CV.pdf', type: 'cv', url }
  
  2. If coverLetterId:
     - Find CL doc in coverLetterStore
     - Export HTML to PDF (silent)
     - Create blob URL
     - Add to files: { id: 'cl', name: 'CoverLetter_*.pdf', type: 'coverLetter', url }
  
  3. Return FileRef[]

Current (Stub):
  ✓ Returns blob URLs (placeholders)
  ✓ Actual export functions stubbed
  ✓ No real PDF generation

Future:
  ✓ Use Step 13/29 export services
  ✓ Real PDF generation
  ✓ In-memory blobs
  ✓ Auto-cleanup after submit
```

### 4. Application Tracker (Kanban)

**Stages:**
```typescript
✓ Applied: Initial submission
✓ Viewed: Recruiter opened
✓ Interview: Interview scheduled/completed
✓ Offer: Offer received
✓ Rejected: Application rejected
✓ On-Hold: Paused/waiting

Status:
  ✓ open: Active
  ✓ closed: Archived
```

**Application Data:**
```typescript
interface Application {
  id: string
  jobId?: string              // Link to Step 32 job
  jobUrl: string
  platform?: PlatformKey
  company: string
  role: string
  location?: string
  stage: AppStage
  status: 'open' | 'closed'
  appliedAt?: string
  updatedAt: string
  files: FileRef[]           // CV, CL
  notes?: string             // User notes
  contacts: ContactRef[]     // Recruiters, hiring managers
  events: AppEvent[]         // Interviews, calls
  score?: number             // Match score from Step 32
  sequenceId?: string        // Linked outreach sequence
  logs: ApplyLogEntry[]      // Submission logs
}
```

**Kanban Board:**
```typescript
KanbanBoard:
  ✓ 6 columns (applied, viewed, interview, offer, rejected, hold)
  ✓ Each column: KanbanColumn component
  ✓ Each card: ApplicationCard component
  ✓ Responsive: md:3 cols, xl:6 cols

KanbanColumn:
  ✓ Title with count
  ✓ List of ApplicationCard
  ✓ Empty state

ApplicationCard:
  ✓ Role (font-medium)
  ✓ Company (text-xs)
  ✓ Match score (if available)
  ✓ Open button (external link)
  ✓ Details button
  ✓ Stage dropdown (inline change)
```

**Details Drawer:**
```typescript
ApplicationDetailDrawer:
  ✓ Opens when activeId set
  ✓ max-w-4xl dialog
  ✓ 2-column layout

Left Column:
  ✓ Company, Role, Stage
  ✓ Notes
  ✓ Files (list)

Right Column:
  ✓ ContactEditor (add contacts)
  ✓ EventEditor (add events)
  ✓ Logs (scrollable)
```

### 5. Contacts & Events

**Contacts:**
```typescript
ContactRef:
  ✓ id, name, email
  ✓ role (e.g., "Recruiter")
  ✓ phone, linkedin

ContactEditor:
  ✓ List existing contacts
  ✓ Add new contact (name + email)
  ✓ Inline in detail drawer

Usage:
  Track recruiters, hiring managers, team members
  → Use for follow-ups
  → Reference in outreach
```

**Events:**
```typescript
AppEvent:
  ✓ id, type (interview | call | other)
  ✓ title, when (ISO timestamp)
  ✓ durationMin, location
  ✓ calendarId (Google Calendar)
  ✓ notes

EventEditor:
  ✓ List existing events
  ✓ Add new event (title + when)
  ✓ datetime-local input
  ✓ Calls calendar.service.createEvent() (stub)

Integration:
  ✓ Google Calendar stub
  ✓ Returns { ok, id, link }
  ✓ Future: Real Calendar API
```

### 6. Outreach Sequences

**Email Templates:**
```typescript
EmailTemplate:
  ✓ id, name, subject, body
  ✓ lang: 'en' | 'tr'
  ✓ Variables: {{Company}}, {{Role}}, {{YourName}}, {{RecruiterName}}

Examples:
  Follow-up #1:
    Subject: "Following up on {{Role}} at {{Company}}"
    Body: "Hi {{RecruiterName}},\n\nJust checking in..."
  
  Thank You:
    Subject: "Thank you for the interview"
    Body: "Hi {{RecruiterName}},\n\nThank you for..."

Storage:
  ✓ emailTemplatesStore
  ✓ localStorage
  ✓ CRUD operations
```

**Sequences:**
```typescript
OutreachSequence:
  ✓ id, name, steps[], active
  ✓ SequenceStep: offsetDays, sendTime, templateId

Example:
  {
    id: 'seq1',
    name: 'Standard Follow-Up',
    steps: [
      { id: 's1', offsetDays: 0, sendTime: '09:00', templateId: 't1' },
      { id: 's2', offsetDays: 3, sendTime: '09:00', templateId: 't2' },
      { id: 's3', offsetDays: 7, sendTime: '09:00', templateId: 't3' }
    ],
    active: true
  }

Usage:
  Day 0: Send initial application
  Day 3: Send follow-up #1
  Day 7: Send follow-up #2

Automation:
  ✓ Sequence linked to Application
  ✓ Scheduled execution (future)
  ✓ Manual trigger (current)
```

**SequenceBuilderDialog:**
```typescript
Features:
  ✓ Create new sequence
  ✓ Add steps to sequence
  ✓ Configure offset & send time
  ✓ Select email template
  ✓ Delete sequences

UI:
  ✓ 2-column layout
  ✓ Left: Create form
  ✓ Right: Existing sequences list
  ✓ + Step button per sequence
```

### 7. Gmail Integration (Stub)

**sendEmail Service:**
```typescript
sendEmail({ to, subject, html, inReplyToId })

Behavior:
  if (VITE_GMAIL_ENABLED === '1'):
    → POST /api/gmail/send
    → Returns { ok, id }
  else:
    → Returns { ok: true, id: 'local-...' }
    → No actual email sent

Future Implementation:
  ✓ Gmail API OAuth
  ✓ Backend proxy
  ✓ Thread management (inReplyToId)
  ✓ Draft creation
  ✓ Send & archive
```

**Template Variables:**
```typescript
Variables:
  ✓ {{Company}}: Application company
  ✓ {{Role}}: Application role
  ✓ {{YourName}}: User's full name
  ✓ {{RecruiterName}}: Contact name

Rendering:
  subject.replace('{{Company}}', app.company)
  body.replace('{{YourName}}', cv.personalInfo.fullName)

Example:
  Template: "Following up on {{Role}} at {{Company}}"
  Application: { role: 'Engineer', company: 'Acme' }
  → "Following up on Engineer at Acme"
```

### 8. Calendar Integration (Stub)

**createEvent Service:**
```typescript
createEvent({ title, when, durationMin, location, attendees })

Behavior:
  → Returns { ok: true, id: 'cal-...', link: '#' }
  → No actual calendar event created

Future Implementation:
  ✓ Google Calendar API
  ✓ OAuth flow
  ✓ Event creation
  ✓ Attendees management
  ✓ Reminders
  ✓ Meet/Zoom integration

Usage:
  EventEditor:
    → User adds "Interview" event
    → Calls createEvent()
    → Returns calendarId
    → Stored in AppEvent
```

### 9. Message Bus (Browser Extension Spec)

**Purpose:**
```typescript
Enable communication between:
  ✓ Web app (React)
  ✓ Browser extension (content script)
  ✓ Future: Actual form filling & submission
```

**Protocol:**
```typescript
Message Types:
  APPLY_START:
    Direction: App → Extension
    Payload: ApplyPayload
    Purpose: Trigger auto-fill & submit
  
  APPLY_RESULT:
    Direction: Extension → App
    Payload: { ok, message }
    Purpose: Return submission result

Implementation:
  sendBusMessage(msg):
    → window.postMessage({ __cvbus: true, ...msg }, '*')
  
  onBusMessage(callback):
    → window.addEventListener('message', handler)
    → Filter: ev.data.__cvbus === true
    → Return cleanup function

Current:
  ✓ No-op (no extension installed)
  ✓ Safe to call
  ✓ Spec defined for future
```

**Browser Extension Architecture (Future):**
```typescript
Content Script:
  1. Listen for window.postMessage({ __cvbus: true })
  2. Receive APPLY_START with ApplyPayload
  3. Detect platform (URL pattern)
  4. Auto-fill form fields
  5. Attach CV/CL files
  6. Submit form
  7. Capture result
  8. Send APPLY_RESULT back to app

Manifest V3:
  {
    "permissions": ["activeTab", "storage"],
    "content_scripts": [{
      "matches": ["*://*.greenhouse.io/*", "*://*.lever.co/*", ...],
      "js": ["content.js"]
    }]
  }

Security:
  ✓ User must install extension
  ✓ Content script in sandbox
  ✓ No direct DOM access from app
  ✓ Message validation
```

### 10. Application Insights

**Funnel Statistics:**
```typescript
funnel(): FunnelStats

Output:
  {
    applied: 25,
    viewed: 18,
    interview: 8,
    offer: 2,
    rejected: 12,
    hold: 3
  }

Display:
  ApplicationsPage toolbar:
    "Funnel: A 25 • V 18 • I 8 • O 2 • R 12"

Metrics:
  ✓ Conversion rate: viewed/applied
  ✓ Interview rate: interview/viewed
  ✓ Offer rate: offer/interview
  ✓ Rejection rate: rejected/total

Future:
  ✓ Time-to-response analytics
  ✓ Company-specific metrics
  ✓ Platform comparison
```

## Type System

### ApplyPayload

```typescript
interface ApplyPayload {
  platform: PlatformKey        // greenhouse, lever, etc.
  jobUrl: string               // Job posting URL
  jobId?: string               // Optional ID
  company?: string
  role?: string
  answers?: Record<string, string | boolean | string[]>
  files: FileRef[]             // CV, CL
  contactEmail?: string
  extra?: Record<string, string>  // Platform-specific
}
```

### Application

```typescript
interface Application {
  id: string
  jobId?: string               // Link to Step 32 JobNormalized
  jobUrl: string
  platform?: PlatformKey
  company: string
  role: string
  location?: string
  stage: AppStage              // Kanban column
  status: 'open' | 'closed'
  appliedAt?: string
  updatedAt: string
  files: FileRef[]
  notes?: string
  contacts: ContactRef[]
  events: AppEvent[]
  score?: number               // Match score from Step 32
  sequenceId?: string          // Linked outreach
  logs: ApplyLogEntry[]
}
```

### EmailTemplate

```typescript
interface EmailTemplate {
  id: string
  name: string
  subject: string              // With {{variables}}
  body: string                 // With {{variables}}
  lang: 'en' | 'tr'
  createdAt: string
  updatedAt: string
}
```

### OutreachSequence

```typescript
interface OutreachSequence {
  id: string
  name: string
  steps: SequenceStep[]
  active: boolean
  createdAt: string
  updatedAt: string
}

interface SequenceStep {
  id: string
  offsetDays: number           // Days after application
  sendTime?: string            // HH:MM (e.g., "09:00")
  templateId: string           // EmailTemplate reference
}
```

## Stores

### applicationsStore

```typescript
State:
  ✓ items: Application[]
  ✓ activeId?: string

Actions:
  ✓ create(init): Create application
  ✓ setStage(id, stage): Move to different column
  ✓ update(id, patch): Update fields
  ✓ addEvent(id, event): Add calendar event
  ✓ addLog(id, log): Append log entry
  ✓ attachFiles(id, files): Add files
  ✓ select(id): Set active for drawer

Persistence:
  ✓ localStorage
  ✓ Version: 1
```

### emailTemplatesStore

```typescript
State:
  ✓ items: EmailTemplate[]

Actions:
  ✓ upsert(template): Create/update
  ✓ remove(id): Delete
  ✓ getById(id): Find template

Persistence:
  ✓ localStorage
```

### outreachStore

```typescript
State:
  ✓ sequences: OutreachSequence[]

Actions:
  ✓ upsert(sequence): Create/update
  ✓ remove(id): Delete
  ✓ getById(id): Find sequence

Persistence:
  ✓ localStorage
```

### contactsStore

```typescript
State:
  ✓ items: ContactRef[]

Actions:
  ✓ upsert(contact): Create/update
  ✓ remove(id): Delete

Persistence:
  ✓ localStorage

Usage:
  ✓ Global contact pool
  ✓ Referenced by applications
  ✓ Shared across jobs
```

## Services

### apply.engine.ts

```typescript
autoApply(opts): Promise<string>

Parameters:
  ✓ platform: PlatformKey
  ✓ jobUrl: string
  ✓ company, role: string
  ✓ mapperArgs: any
  ✓ optIn: boolean

Process:
  1. Compliance check
  2. Throttle
  3. Load mapper
  4. Build payload
  5. Create application record
  6. Send to message bus
  7. Simulate submit (stub)
  8. Log result
  9. Update timestamps

Returns:
  Application ID

Throws:
  'Auto-apply requires explicit opt-in.'
```

### compliance.service.ts

```typescript
applyCompliance.check(optIn): { ok, reason? }

Logic:
  if (!optIn):
    → { ok: false, reason: 'optOut' }
  else:
    → { ok: true }

Purpose:
  ✓ Legal safeguard
  ✓ User accountability
  ✓ Prevent unauthorized submissions
```

### throttle.service.ts

```typescript
applyThrottle(key, cap=20, refillMs=1000)

Token Bucket:
  ✓ Per-platform buckets
  ✓ Capacity: 20 requests
  ✓ Refill: 1 req/second
  ✓ Sleep if exhausted

Example:
  greenhouse: { rem: 20, cap: 20 }
  lever: { rem: 20, cap: 20 }
  workday: { rem: 20, cap: 20 }

Limits:
  ✓ 20 applications/minute per platform
  ✓ 1200 applications/hour theoretical max
```

### gmail.service.ts

```typescript
sendEmail(opts): Promise<{ ok, id }>

Stub Behavior:
  if (VITE_GMAIL_ENABLED === '1'):
    → POST /api/gmail/send
    → Backend handles OAuth
    → Returns Gmail message ID
  else:
    → Returns local-* ID
    → Logs to console
    → No actual send

Production:
  ✓ Gmail API v1
  ✓ OAuth 2.0 flow
  ✓ Send as user
  ✓ Thread support (inReplyToId)
```

### calendar.service.ts

```typescript
createEvent(opts): Promise<{ ok, id, link }>

Stub Behavior:
  → Returns cal-* ID
  → link: '#'
  → No actual event

Production:
  ✓ Google Calendar API v3
  ✓ OAuth 2.0 flow
  ✓ Event creation
  ✓ Attendees
  ✓ Reminders
  ✓ Meet links
```

### applications.insights.service.ts

```typescript
funnel(): FunnelStats

Calculation:
  ✓ Count items per stage
  ✓ Return object with counts

Future:
  ✓ Conversion rates
  ✓ Time-in-stage
  ✓ Success prediction
```

## UI Components

### ApplicationsPage

```typescript
Purpose: Main container

Features:
  ✓ Auto-Apply button
  ✓ Sequences button
  ✓ Email Templates button
  ✓ Funnel stats (inline)
  ✓ KanbanBoard
  ✓ ApplyLogsPanel
  ✓ 3 dialogs (apply, sequences, templates)

Layout:
  ✓ Vertical stack
  ✓ Toolbar at top
  ✓ Board below
  ✓ Logs at bottom
```

### KanbanBoard

```typescript
Purpose: Visualize application pipeline

Features:
  ✓ 6 columns (stages)
  ✓ Responsive grid
  ✓ Empty states

Layout:
  ✓ md: 3 columns
  ✓ xl: 6 columns
  ✓ Gap: 3
```

### KanbanColumn

```typescript
Purpose: Single stage column

Features:
  ✓ Title with count
  ✓ List of cards
  ✓ Empty state "—"

Styling:
  ✓ Border, rounded
  ✓ Background
  ✓ Padding
```

### ApplicationCard

```typescript
Purpose: Single application

Features:
  ✓ Role (font-medium, line-clamp-1)
  ✓ Company (text-xs)
  ✓ Match score (if available)
  ✓ Open button (external link)
  ✓ Details button
  ✓ Stage dropdown (inline)

Actions:
  ✓ Click Open → new tab
  ✓ Click Details → drawer
  ✓ Change stage → update immediately
```

### ApplicationDetailDrawer

```typescript
Purpose: Full application details

Features:
  ✓ Dialog (max-w-4xl)
  ✓ 2-column grid
  ✓ Left: Info, notes, files
  ✓ Right: Contacts, events, logs

Sections:
  ✓ Company, Role, Stage
  ✓ Notes (future: editable)
  ✓ Files (list with icons)
  ✓ ContactEditor (add contacts)
  ✓ EventEditor (add events)
  ✓ Logs (scrollable, max-h-40)
```

### ApplyDialog

```typescript
Purpose: Quick apply from job

Features:
  ✓ Platform select (dropdown)
  ✓ Job URL input (prefilled)
  ✓ Company input (prefilled)
  ✓ Role input (prefilled)
  ✓ Legal opt-in checkbox
  ✓ Submit button (disabled until opted in)
  ✓ Loading state

Prefilling:
  ✓ Props: initialJobUrl, initialCompany, initialRole
  ✓ From JobCard (Step 32)

Submission:
  ✓ Calls autoApply()
  ✓ Closes on success
  ✓ Shows error if fails
```

### SequenceBuilderDialog

```typescript
Purpose: Manage outreach sequences

Features:
  ✓ Create sequence (name input)
  ✓ List existing sequences
  ✓ Add step (+ Step button)
  ✓ Delete sequence

UI:
  ✓ 2-column layout
  ✓ Left: Create form
  ✓ Right: Sequence list (scrollable)

Actions:
  ✓ Save → creates sequence
  ✓ + Step → adds step with default config
  ✓ Delete → removes sequence
```

### EmailTemplateDialog

```typescript
Purpose: Manage email templates

Features:
  ✓ Name input
  ✓ Subject input (variables allowed)
  ✓ Body textarea (variables allowed)
  ✓ Save button
  ✓ List saved templates
  ✓ Delete button per template

UI:
  ✓ 2-column layout
  ✓ Left: Create form
  ✓ Right: Template list (scrollable)

Variables:
  ✓ Documented in placeholder
  ✓ {{Company}}, {{Role}}, {{YourName}}, {{RecruiterName}}
```

### ContactEditor

```typescript
Purpose: Manage application contacts

Features:
  ✓ List existing contacts
  ✓ Name + Email inputs
  ✓ Add button
  ✓ Scrollable list (max-h-32)

Inline:
  ✓ Embedded in ApplicationDetailDrawer
  ✓ Per-application scope
```

### EventEditor

```typescript
Purpose: Manage application events

Features:
  ✓ List existing events
  ✓ Title input
  ✓ datetime-local input
  ✓ Add button
  ✓ Calls calendar.service

Inline:
  ✓ Embedded in ApplicationDetailDrawer
  ✓ Per-application scope
```

### ApplyLogsPanel

```typescript
Purpose: Show all apply logs

Features:
  ✓ Flattened logs from all applications
  ✓ Sorted by timestamp (newest first)
  ✓ Limited to 100 entries
  ✓ Scrollable (max-h-64)

Display:
  ✓ Level (INFO/WARN/ERROR)
  ✓ Timestamp
  ✓ Company / Role
  ✓ Message

Example:
  INFO • 1/15/2025 10:30:15 AM — Acme / Engineer — Submitted (stub) to greenhouse
```

## Integration Points

### With Step 27 (Parsing)

```typescript
Used For:
  ✓ Extract CV data for auto-fill
  ✓ Personal info (name, email, phone)
  ✓ Experience & education

Example:
  cv.personalInfo.fullName
  → Used in {{YourName}} variable
```

### With Step 29 (Variants)

```typescript
Integration:
  ✓ Resume picker selects active variant
  ✓ Export variant to PDF
  ✓ Attach as CV file

Flow:
  ApplyDialog
  → resumePicker({ variantId: activeId })
  → Export variant
  → Attach to ApplyPayload
```

### With Step 30 (Cover Letters)

```typescript
Integration:
  ✓ Resume picker exports cover letter
  ✓ Select from saved CLs
  ✓ Attach as file

Flow:
  ApplyDialog
  → resumePicker({ coverLetterId: selectedCLId })
  → Export CL to PDF
  → Attach to ApplyPayload
```

### With Step 31 (AI)

```typescript
Potential:
  ✓ AI-powered answer generation
  ✓ Auto-fill screening questions
  ✓ Generate follow-up emails

Example:
  Question: "Why do you want this role?"
  → aiGenerateText(system: "Answer professionally", prompt: question)
  → Fill in application
```

### With Step 32 (Jobs)

```typescript
Integration:
  ✓ Quick Apply button in JobCard
  ✓ Prefills ApplyDialog with job data
  ✓ Links Application to Job (jobId)
  ✓ Shows match score on ApplicationCard

Flow:
  JobCard
  → Click "Quick Apply"
  → ApplyDialog opens (prefilled)
  → Submit
  → Application created with jobId
  → Score inherited from job
```

## Security & Compliance

### Legal Safeguards

```typescript
1. Opt-in Required
   ✓ Checkbox in ApplyDialog
   ✓ "I confirm I have the rights..."
   ✓ Blocks submission if unchecked

2. Per-Submission Verification
   ✓ Not global setting
   ✓ Must opt-in each time
   ✓ Prevents accidental submissions

3. Throttling
   ✓ 20 applications/minute/platform
   ✓ Prevents spam
   ✓ Respects site policies

4. Logging
   ✓ All submissions logged
   ✓ Timestamps & results
   ✓ Audit trail
```

### Data Privacy

```typescript
✓ No credentials stored (OAuth flows)
✓ No email/calendar data persisted
✓ User-provided content only
✓ localStorage isolation
✓ No cross-domain requests (CORS)
```

### Gmail/Calendar (Production)

```typescript
OAuth Flow:
  1. User clicks "Connect Gmail"
  2. Backend initiates OAuth
  3. User authorizes in Google
  4. Backend receives tokens
  5. Backend stores refresh token (encrypted)
  6. App calls backend endpoints
  7. Backend uses tokens to call Gmail/Calendar

Security:
  ✓ Never expose tokens to client
  ✓ Backend proxy only
  ✓ Tokens encrypted at rest
  ✓ HTTPS required
```

## Performance

### Storage

```typescript
Applications:
  ✓ localStorage (Zustand persist)
  ✓ Typical: ~2KB per application
  ✓ Capacity: ~500 applications (1MB)

Templates:
  ✓ Typical: ~500 bytes per template
  ✓ Capacity: ~100 templates

Sequences:
  ✓ Typical: ~300 bytes per sequence
  ✓ Capacity: ~100 sequences

Logs:
  ✓ Capped at 200 per application
  ✓ Typical: ~100 bytes per log
```

### Network

```typescript
Auto-Apply (Stub):
  ✓ 500ms simulated delay
  ✓ No actual HTTP requests
  ✓ Future: Extension handles

Gmail (Stub):
  ✓ Local mode: 0ms
  ✓ API mode: ~500ms
  ✓ Backend proxy: ~1s

Calendar (Stub):
  ✓ Local mode: 0ms
  ✓ API mode: ~500ms
```

### UI Responsiveness

```typescript
Kanban:
  ✓ CSS Grid
  ✓ Responsive breakpoints
  ✓ Fast re-renders (Zustand)

Logs:
  ✓ max-h-64 scrollable
  ✓ Limited to 100 entries
  ✓ Sorted once

Details Drawer:
  ✓ Conditional render
  ✓ Only active application
  ✓ Fast open/close
```

## Testing

### Unit Tests (7 files, 30+ tests)

```typescript
greenhouse.mapper.spec.ts (3 tests):
  ✓ Map CV file
  ✓ Include cover letter
  ✓ Include answers

lever.mapper.spec.ts (2 tests):
  ✓ Map to Lever platform
  ✓ Include both CV and CL

workday.mapper.spec.ts (3 tests):
  ✓ Map to Workday platform
  ✓ Include workdayLocale in extra
  ✓ Include answers

apply.engine.spec.ts (4 tests):
  ✓ Throw when optIn=false
  ✓ Create application when optIn=true
  ✓ Add log entry
  ✓ Set appliedAt timestamp

applicationsStore.spec.ts (7 tests):
  ✓ Create application
  ✓ Set stage
  ✓ Update application
  ✓ Add event
  ✓ Add log
  ✓ Attach files
  ✓ Select application

outreachStore.spec.ts (4 tests):
  ✓ Upsert sequence
  ✓ Update existing
  ✓ Remove sequence
  ✓ Get by ID

resumePicker.service.spec.ts (4 tests):
  ✓ Return CV file
  ✓ Return both CV and CL
  ✓ Return empty when no IDs
  ✓ Handle errors gracefully
```

### E2E Tests (Planned)

```typescript
step33-apply-tracker-sequence.spec.ts:
  1. Open Jobs page
  2. Click "Quick Apply" on job card
  3. ApplyDialog opens (prefilled)
  4. Check legal opt-in
  5. Submit
  6. Application appears in Kanban "Applied" column
  7. Click "Details"
  8. Add contact (name + email)
  9. Add event (interview)
  10. Verify logs show "Submitted"
  11. Change stage to "Interview"
  12. Verify card moves to Interview column
  13. Create email template
  14. Create sequence with 2 steps
  15. Link sequence to application
  16. Verify sequence shows in list
```

## Known Limitations

### 1. Auto-Apply (Stub)

```typescript
Issue:
  ✓ No real form submission
  ✓ Simulated 500ms delay
  ✓ Always succeeds

Reason:
  ✓ Requires browser extension
  ✓ DOM manipulation needed
  ✓ Platform-specific logic

Solution:
  ✓ Build browser extension
  ✓ Implement content scripts
  ✓ Use message bus spec
```

### 2. Gmail/Calendar (Stubs)

```typescript
Issue:
  ✓ No real email sending
  ✓ No calendar events created
  ✓ Local IDs only

Reason:
  ✓ Requires OAuth
  ✓ Backend proxy needed
  ✓ API quotas

Solution:
  ✓ Implement backend proxy
  ✓ Add OAuth flow
  ✓ Store tokens securely
```

### 3. Resume Export (Stub)

```typescript
Issue:
  ✓ pickFiles returns blob URLs
  ✓ No actual PDF generation
  ✓ Placeholders only

Reason:
  ✓ Export services not wired
  ✓ Requires Step 13/29 integration

Solution:
  ✓ Wire actual export services
  ✓ Generate real PDFs
  ✓ In-memory blobs
```

### 4. Contact/Event Management

```typescript
Issue:
  ✓ Basic CRUD only
  ✓ No rich editing
  ✓ No validation

Enhancement:
  ✓ Contact de-duplication
  ✓ Email validation
  ✓ Phone formatting
  ✓ LinkedIn profile linking
  ✓ Event reminders
  ✓ Time zone handling
```

## Future Enhancements

### Short-Term

```typescript
✓ Browser extension (Chrome/Firefox)
✓ Real Gmail integration (OAuth backend)
✓ Real Calendar integration
✓ Resume picker UI (select variant/CL)
✓ Sequence automation (scheduled sends)
✓ Drag & drop Kanban (reorder cards)
```

### Medium-Term

```typescript
✓ Application notes (rich text editor)
✓ File attachments (additional docs)
✓ Email tracking (open/click rates)
✓ Interview prep (Q&A suggestions)
✓ Offer comparison (side-by-side)
✓ Analytics dashboard (conversion rates)
```

### Long-Term

```typescript
✓ AI-powered screening answers
✓ Auto-follow-up (intelligent timing)
✓ Salary negotiation (scripts, market data)
✓ Recruiter relationship tracking
✓ Company research (auto-populate notes)
✓ Interview recording (transcripts, feedback)
```

## Browser Extension Spec

### Manifest V3

```json
{
  "manifest_version": 3,
  "name": "AI CV Builder - Auto Apply",
  "version": "1.0.0",
  "permissions": [
    "activeTab",
    "storage"
  ],
  "content_scripts": [{
    "matches": [
      "*://*.greenhouse.io/*",
      "*://*.lever.co/*",
      "*://*.myworkday.com/*",
      "*://*.indeed.com/*",
      "*://*.linkedin.com/*"
    ],
    "js": ["content.js"]
  }],
  "background": {
    "service_worker": "background.js"
  }
}
```

### Content Script

```typescript
// Listen for apply requests from app
window.addEventListener('message', async (event) => {
  if (!event.data?.__cvbus) return
  if (event.data.type !== 'APPLY_START') return
  
  const payload = event.data.payload
  
  try {
    // Detect platform
    const platform = detectPlatform(window.location.href)
    
    // Auto-fill form
    await fillForm(platform, payload)
    
    // Attach files
    await attachFiles(payload.files)
    
    // Submit
    const result = await submitForm(platform)
    
    // Send result back
    window.postMessage({
      __cvbus: true,
      type: 'APPLY_RESULT',
      payload: { ok: true, message: 'Submitted successfully' }
    }, '*')
  } catch (error) {
    window.postMessage({
      __cvbus: true,
      type: 'APPLY_RESULT',
      payload: { ok: false, message: error.message }
    }, '*')
  }
})

function detectPlatform(url) {
  if (url.includes('greenhouse.io')) return 'greenhouse'
  if (url.includes('lever.co')) return 'lever'
  if (url.includes('myworkday.com')) return 'workday'
  if (url.includes('indeed.com')) return 'indeed'
  if (url.includes('linkedin.com')) return 'linkedin'
  return null
}

async function fillForm(platform, payload) {
  // Platform-specific selectors
  const selectors = {
    greenhouse: {
      firstName: '#first_name',
      lastName: '#last_name',
      email: '#email',
      phone: '#phone',
      resume: '#resume'
    },
    // ... other platforms
  }
  
  // Fill fields
  for (const [field, value] of Object.entries(payload.answers)) {
    const selector = selectors[platform][field]
    const el = document.querySelector(selector)
    if (el) {
      el.value = value
      el.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }
}

async function attachFiles(files) {
  for (const file of files) {
    const input = document.querySelector('input[type="file"]')
    if (!input) continue
    
    // Fetch blob URL
    const blob = await fetch(file.url).then(r => r.blob())
    const dt = new DataTransfer()
    dt.items.add(new File([blob], file.name))
    input.files = dt.files
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }
}

async function submitForm(platform) {
  const button = document.querySelector('button[type="submit"]')
  if (!button) throw new Error('Submit button not found')
  
  button.click()
  
  // Wait for confirmation
  await new Promise(r => setTimeout(r, 2000))
  
  return { ok: true }
}
```

### Installation

```bash
1. Build extension:
   cd browser-extension
   npm run build

2. Load in Chrome:
   - chrome://extensions
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select build folder

3. Use:
   - Open job posting
   - In app: Click "Quick Apply"
   - Extension auto-fills & submits
   - Result shown in app
```

## Operational Checklist

### Setup

```typescript
✓ Enable auto-apply (opt-in)
✓ Create CV variant
✓ Create cover letter
✓ Configure email templates
✓ Create outreach sequences
✓ (Optional) Install browser extension
```

### Usage

```typescript
Apply:
  1. Browse jobs (Step 32)
  2. Click "Quick Apply"
  3. Review prefilled data
  4. Check legal opt-in
  5. Submit
  6. Application appears in Kanban

Track:
  1. Open Applications page
  2. View Kanban board
  3. Click application for details
  4. Add contacts & events
  5. Change stage (drag or dropdown)
  6. Monitor logs

Follow-up:
  1. Create email template
  2. Create sequence
  3. Link to application
  4. (Future) Auto-send emails
```

### Compliance

```typescript
✓ Opt-in per application
✓ Legal affirmation required
✓ Throttling enforced
✓ Logs all submissions
✓ No unauthorized access
✓ Respect site TOS
```

## Migration Notes

### From No Application Tracker

```typescript
✓ No breaking changes
✓ New stores added
✓ New route: /applications
✓ Optional feature
✓ Integrates with existing jobs
```

### Adding Custom Platform

```typescript
1. Add to PlatformKey:
   type PlatformKey = ... | 'mycustom'

2. Create mapper:
   src/services/apply/forms/mycustom.mapper.ts
   
   export function mapMyCustom(args): ApplyPayload {
     return {
       platform: 'mycustom',
       jobUrl: args.jobUrl,
       files: [...],
       answers: {}
     }
   }

3. Register in apply.engine.ts:
   MAPPERS.mycustom = async () => (await import('./forms/mycustom.mapper')).mapMyCustom

4. Add to ApplyDialog dropdown:
   <option value="mycustom">My Custom Platform</option>

5. (Optional) Add extension support:
   - Update content script selectors
   - Add URL pattern to manifest
```

## API Endpoints (Future Backend)

### Gmail

```typescript
POST /api/gmail/send
Body:
  {
    to: string
    subject: string
    html: string
    inReplyToId?: string
  }
Response:
  {
    ok: boolean
    id: string              // Gmail message ID
    threadId: string
  }

Authentication:
  ✓ Session cookie
  ✓ OAuth tokens in backend
  ✓ Scopes: gmail.send, gmail.modify
```

### Calendar

```typescript
POST /api/calendar/events
Body:
  {
    title: string
    when: string            // ISO timestamp
    durationMin: number
    location?: string
    attendees?: string[]
  }
Response:
  {
    ok: boolean
    id: string              // Calendar event ID
    link: string            // Google Meet link
  }

Authentication:
  ✓ Session cookie
  ✓ OAuth tokens in backend
  ✓ Scopes: calendar.events
```

## Known Issues & Workarounds

### Issue: localStorage Limits

```typescript
Problem:
  ✓ 5-10MB total limit
  ✓ ~500 applications max
  ✓ Logs grow unbounded

Workaround:
  ✓ Limit logs to 200 per app
  ✓ Archive old applications
  ✓ Export to CSV

Solution:
  ✓ IndexedDB migration
  ✓ Cloud sync (Firestore)
  ✓ Pagination
```

### Issue: No Real Submission

```typescript
Problem:
  ✓ Auto-apply is stubbed
  ✓ 500ms fake delay
  ✓ Always succeeds

Workaround:
  ✓ Manual submission
  ✓ Track manually

Solution:
  ✓ Browser extension
  ✓ Content script
  ✓ Message bus integration
```

### Issue: No Email Sending

```typescript
Problem:
  ✓ Gmail service is stubbed
  ✓ No actual emails sent
  ✓ Local IDs only

Workaround:
  ✓ Manual email from Gmail
  ✓ Copy template content

Solution:
  ✓ Backend Gmail proxy
  ✓ OAuth flow
  ✓ Real API calls
```

## References

- Greenhouse API: https://developers.greenhouse.io/
- Lever API: https://hire.lever.co/developer/
- Workday Recruiting: https://doc.workday.com/
- Gmail API: https://developers.google.com/gmail/api
- Google Calendar API: https://developers.google.com/calendar
- Chrome Extensions: https://developer.chrome.com/docs/extensions/mv3/
- Message Passing: https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
