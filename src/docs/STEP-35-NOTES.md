# Step 35: Production Gmail & Calendar Integration with Sequence Runner

## Overview

This step upgrades the Step 33 Outreach Sequences from stubs to production-ready Gmail and Google Calendar integrations with OAuth, sequence automation, threading, AI reply classification, and comprehensive tracking.

## Architecture

### High-Level Flow

```
User Connects Gmail
  ↓ (OAuth via GIS)
Google Authorization
  ↓ (Access Token)
Encrypt & Store Token
  ↓
Create Email Template
  ↓
Create Sequence (Steps)
  ↓
Link to Application
  ↓
Sequence Runner Starts
  ↓ (Every 30s tick)
Check Pending Steps
  ↓
Render Template (Variables)
  ↓
Add Tracking (Pixel + Links)
  ↓
Send via Gmail API
  ↓
Log to Outbox & Application
  ↓
Schedule Next Step
```

### Components

**OAuth Layer:**
- Google Identity Services (GIS)
- Token encryption (AES-GCM)
- Automatic refresh
- Account management

**Gmail Layer:**
- MIME message building (RFC 822)
- Send API
- Thread fetching
- Tracking hooks

**Calendar Layer:**
- Time slot proposals
- ICS generation
- Event creation
- Google Calendar API

**Sequence Runner:**
- Scheduled execution
- Persistent state
- Idempotent sends
- Error recovery with backoff

**Tracking:**
- Open pixel (transparent GIF)
- Click tracking (redirect)
- Thread monitoring
- AI reply classification

## Features

### 1. OAuth (Google Identity Services)

**Setup:**
```typescript
// 1. Create OAuth Client in Google Cloud Console
// 2. Add authorized origins
// 3. Set environment variables

VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_OAUTH_PASSPHRASE=your-secure-passphrase
```

**Connect Flow:**
```typescript
connectGoogleAccount({
  clientId: 'your-client-id',
  passphrase: 'secure-key',
  dryRun: true // Default: safe mode
})

Process:
  1. Load GIS script (accounts.google.com/gsi/client)
  2. Initialize token client
  3. Request access token (popup)
  4. User authorizes (Google consent screen)
  5. Receive access token
  6. Fetch user info
  7. Encrypt token with AES-GCM
  8. Store in emailAccountsStore

Result:
  GmailAccount {
    id: 'user@gmail.com',
    displayName: 'John Doe',
    tokenEncrypted: 'base64...',
    connectedAt: '2025-10-06T...',
    dryRun: true,
    dailyLimit: 90
  }
```

**Token Management:**
```typescript
getBearer(accountId, passphrase, clientId):
  1. Load account from store
  2. Decrypt token
  3. Check age (< 55 minutes)
  4. If fresh: return access_token
  5. If expired: refresh silently
  6. Re-encrypt and store
  7. Return new access_token

Token Structure (Encrypted):
  {
    access_token: 'ya29.a0AfH6SMBx...',
    expires_in: 3599,
    obtained_at: 1696598400000
  }

Encryption (AES-GCM):
  ✓ PBKDF2 key derivation (100,000 iterations)
  ✓ Random IV per encryption
  ✓ Authenticated encryption
  ✓ Base64 encoded blob
```

**Security:**
```typescript
✓ Tokens never logged
✓ Encrypted at rest
✓ Passphrase from env (not hardcoded)
✓ Production: Store tokens server-side
✓ Client-side: Short-lived access tokens only
```

### 2. Gmail Integration

**Send Email:**
```typescript
gmailSend(bearer, outboxMessage):
  1. Build MIME message (RFC 822)
  2. Base64 URL-safe encode
  3. POST to Gmail API
  4. Return { id, threadId }

MIME Structure:
  From: sender@gmail.com
  To: recipient@example.com
  Subject: Follow-up on Engineer at Acme
  Date: Thu, 06 Oct 2025 10:30:15 GMT
  MIME-Version: 1.0
  Content-Type: text/html; charset="UTF-8"
  
  <p>Hi Recruiter,</p>
  <p>Just checking in...</p>
  <img src="/api/trk/o.gif?id=track123" width="1" height="1" />

With Attachments:
  Content-Type: multipart/mixed; boundary="mime_boundary_xyz"
  
  --mime_boundary_xyz
  Content-Type: text/html; charset="UTF-8"
  
  <p>Body</p>
  
  --mime_boundary_xyz
  Content-Type: application/pdf; name="CV.pdf"
  Content-Transfer-Encoding: base64
  Content-Disposition: attachment; filename="CV.pdf"
  
  JVBERi0xLjQK...
  --mime_boundary_xyz--
```

**Fetch Thread:**
```typescript
gmailGetThread(bearer, threadId):
  1. GET /gmail/v1/users/me/threads/{threadId}?format=full
  2. Parse messages
  3. Extract headers (From, To, Subject, Date)
  4. Decode HTML body (base64)
  5. Return GmailThread

Example:
  {
    id: 'thread-abc123',
    subject: 'Re: Engineer at Acme',
    participants: ['user@gmail.com', 'recruiter@acme.com'],
    snippet: 'Thanks for reaching out...',
    messages: [
      {
        id: 'msg1',
        from: 'user@gmail.com',
        to: ['recruiter@acme.com'],
        date: '2025-10-06T10:30:15Z',
        html: '<p>Hi...</p>'
      },
      {
        id: 'msg2',
        from: 'recruiter@acme.com',
        to: ['user@gmail.com'],
        date: '2025-10-06T14:22:30Z',
        html: '<p>Thanks for reaching out...</p>'
      }
    ]
  }
```

**Rate Limiting:**
```typescript
Gmail Quotas:
  ✓ Free: 100 emails/day
  ✓ Workspace: 2000 emails/day
  ✓ Burst: 100 emails/second

Our Limits:
  ✓ Default: 90 emails/day (safe buffer)
  ✓ User configurable per account
  ✓ Checked before send
  ✓ Backoff on 429 errors

Implementation:
  if (account.sentToday >= account.dailyLimit) {
    throw new Error('Daily limit reached')
  }

Backoff:
  Attempt 1: Immediate
  Attempt 2: 1 minute
  Attempt 3: 6 hours
  Attempt 4: 24 hours
  Fail: Mark as failed
```

### 3. Calendar Integration

**Propose Time Slots:**
```typescript
proposeSlots({
  durationMin: 30,
  windowStartISO: '2025-10-10T08:00:00Z',
  windowEndISO: '2025-10-12T18:00:00Z',
  timeZone: 'America/New_York'
})

Output:
  {
    durationMin: 30,
    windowStartISO: '...',
    windowEndISO: '...',
    timeZone: 'America/New_York',
    slots: [
      '2025-10-10T08:00:00Z',
      '2025-10-10T09:00:00Z',
      '2025-10-10T10:00:00Z',
      ...
      '2025-10-12T18:00:00Z'
    ]
  }

Algorithm:
  ✓ Iterate from start to end
  ✓ Increment by 1 hour
  ✓ Filter: 8 AM - 6 PM local time
  ✓ Ensure duration fits before window end
```

**ICS Generation:**
```typescript
buildICS({
  uid: 'event-123',
  title: 'Interview with Acme',
  startISO: '2025-10-10T14:00:00Z',
  durationMin: 30,
  location: 'Zoom',
  description: 'Technical interview'
})

Output (ICS Format):
  BEGIN:VCALENDAR
  VERSION:2.0
  PRODID:-//JobPilot//Outreach//EN
  CALSCALE:GREGORIAN
  BEGIN:VEVENT
  UID:event-123
  DTSTAMP:20251006T103015Z
  DTSTART:20251010T140000Z
  DTEND:20251010T143000Z
  SUMMARY:Interview with Acme
  LOCATION:Zoom
  DESCRIPTION:Technical interview
  END:VEVENT
  END:VCALENDAR

Usage:
  ✓ Download as .ics file
  ✓ Attach to email
  ✓ Recipient can add to their calendar
  ✓ Works with Gmail, Outlook, Apple Calendar
```

**Google Calendar Event:**
```typescript
calendarCreate(bearer, {
  title: 'Interview',
  whenISO: '2025-10-10T14:00:00Z',
  durationMin: 30,
  attendees: ['recruiter@acme.com'],
  location: 'https://meet.google.com/xyz',
  description: 'Technical interview'
})

API Call:
  POST /calendar/v3/calendars/primary/events
  Body: {
    summary: 'Interview',
    start: { dateTime: '2025-10-10T14:00:00Z' },
    end: { dateTime: '2025-10-10T14:30:00Z' },
    attendees: [{ email: 'recruiter@acme.com' }],
    location: 'https://meet.google.com/xyz',
    description: 'Technical interview'
  }

Response:
  {
    id: 'event-abc123',
    htmlLink: 'https://calendar.google.com/event?eid=...'
  }

Result:
  ✓ Event created in user's calendar
  ✓ Invite sent to attendees
  ✓ Google Meet link auto-generated (if enabled)
```

### 4. Template Rendering

**Variable Substitution:**
```typescript
Template:
  Subject: "Following up on {{Role}} at {{Company}}"
  Body: "Hi {{RecruiterName}},\n\nI'm excited about the {{Role}} position..."

Variables:
  {
    Role: 'Software Engineer',
    Company: 'Acme Corp',
    RecruiterName: 'Sarah Johnson'
  }

Output:
  Subject: "Following up on Software Engineer at Acme Corp"
  HTML: "<p>Hi Sarah Johnson,</p><br/><p>I'm excited about the Software Engineer position...</p>"
  Text: "Hi Sarah Johnson,\n\nI'm excited about the Software Engineer position..."

Process:
  1. Substitute variables: {{Key}} → vars[Key]
  2. Convert newlines to <br/> tags
  3. Sanitize HTML (DOMPurify)
  4. Generate plain text version
```

**Supported Variables:**
```typescript
Standard:
  ✓ {{YourName}}: User's full name
  ✓ {{Company}}: Application company
  ✓ {{Role}}: Job role/title
  ✓ {{RecruiterName}}: Contact name
  ✓ {{RecruiterEmail}}: Contact email

Custom:
  ✓ Users can define any variable
  ✓ Passed in SequenceRun.variables
  ✓ Fallback to empty string if missing

Example Custom:
  {{JobURL}}: https://example.com/jobs/123
  {{Deadline}}: October 15, 2025
  {{ReferralName}}: John Doe
```

**Sanitization:**
```typescript
DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })

Allowed:
  ✓ <p>, <br>, <b>, <i>, <u>, <a>
  ✓ <h1-h6>, <ul>, <ol>, <li>
  ✓ <strong>, <em>, <span>

Blocked:
  ❌ <script>, <iframe>, <object>
  ❌ javascript:, data: URLs
  ❌ event handlers (onclick, etc.)

Result:
  Safe HTML for email clients
```

### 5. Tracking

**Open Tracking:**
```typescript
<img src="/api/trk/o.gif?id=track123" width="1" height="1" alt="" />

Backend (Optional):
  GET /api/trk/o.gif?id=track123
  
  Process:
    1. Log: { trackingId: 'track123', event: 'open', ts: Date.now() }
    2. Return: 1x1 transparent GIF
  
  Result:
    ✓ Track when email opened
    ✓ Timestamp recorded
    ✓ Multiple opens counted

Fallback (No Backend):
  Data URI: data:image/gif;base64,R0lGODlhAQABAPAAAP///wAAACwAAAAAAQABAAACAkQBADs=
  
  ✓ Always works
  ✓ No tracking
  ✓ Privacy-friendly
```

**Click Tracking:**
```typescript
Original:
  <a href="https://example.com/jobs">Apply Here</a>

Wrapped:
  <a href="/api/trk/c?u=https%3A%2F%2Fexample.com%2Fjobs&id=track123">Apply Here</a>

Backend (Optional):
  GET /api/trk/c?u=...&id=track123
  
  Process:
    1. Log: { trackingId: 'track123', event: 'click', url: '...', ts: Date.now() }
    2. Redirect: 302 to original URL
  
  Result:
    ✓ Track link clicks
    ✓ Know which links engaged
    ✓ Measure interest

Fallback (No Backend):
  Links unchanged
  ✓ Direct navigation
  ✓ No tracking
```

### 6. Sequence Runner

**Execution Model:**
```typescript
Scheduler:
  ✓ Interval: 30 seconds (default)
  ✓ Persistent: Survives reload
  ✓ State: running | paused

Tick Process:
  1. Get all runs with status='running'
  2. Filter: nextSendAt <= now
  3. For each run:
     - Load sequence & step
     - Render template
     - Send email (or dry-run)
     - Log result
     - Schedule next step
     - Update currentStepIndex
  4. Sleep until next tick

Idempotency:
  ✓ Each step has unique outboxId
  ✓ Duplicate sends prevented
  ✓ History tracks all attempts
```

**Step Scheduling:**
```typescript
Sequence:
  {
    steps: [
      { offsetDays: 0, sendTime: '09:00', templateId: 't1' },
      { offsetDays: 3, sendTime: '09:00', templateId: 't2' },
      { offsetDays: 7, sendTime: '09:00', templateId: 't3' }
    ]
  }

Run:
  {
    currentStepIndex: 0,
    nextSendAt: '2025-10-06T09:00:00Z'
  }

Calculation:
  nextTime(step):
    base = new Date()
    base.setDate(base.getDate() + step.offsetDays)
    if (step.sendTime) {
      [h, m] = step.sendTime.split(':')
      base.setHours(h, m, 0, 0)
    }
    return base.toISOString()

Example:
  Applied: 2025-10-06 at 15:30
  
  Step 1 (offsetDays: 0, sendTime: '09:00'):
    Next: 2025-10-07T09:00:00Z (next morning)
  
  Step 2 (offsetDays: 3, sendTime: '09:00'):
    Next: 2025-10-10T09:00:00Z (3 days later)
  
  Step 3 (offsetDays: 7, sendTime: '09:00'):
    Next: 2025-10-14T09:00:00Z (7 days later)
```

**Error Handling:**
```typescript
Try:
  Send email via Gmail API

Catch (Network Error):
  ✓ Mark outbox message as 'failed'
  ✓ Log error to run history
  ✓ Backoff: nextSendAt = now + 6 hours
  ✓ Retry on next tick
  ✓ Max 3 retries per step

Catch (Auth Error):
  ✓ Token expired
  ✓ Attempt refresh
  ✓ If refresh fails: mark run as 'stopped'
  ✓ Notify user to reconnect

Catch (Quota Error):
  ✓ Daily limit reached
  ✓ Backoff: nextSendAt = tomorrow 00:00
  ✓ Resume automatically

Catch (Other):
  ✓ Log detailed error
  ✓ Mark as 'failed'
  ✓ User intervention required
```

**Persistence:**
```typescript
Store State:
  ✓ useSequenceRunsStore (Zustand + persist)
  ✓ localStorage backup
  ✓ Survives browser reload
  ✓ Survives app restart

On Reload:
  1. Load runs from localStorage
  2. If scheduler.running: start scheduler
  3. Resume pending steps
  4. Continue from last checkpoint

Checkpoint Data:
  {
    currentStepIndex: 2,
    nextSendAt: '2025-10-14T09:00:00Z',
    history: [
      { stepIndex: 0, outboxId: 'msg1', ok: true },
      { stepIndex: 1, outboxId: 'msg2', ok: true }
    ]
  }
```

### 7. Dry-Run Mode

**Purpose:**
```typescript
✓ Safe default for new accounts
✓ Preview emails without sending
✓ Test templates and variables
✓ Verify timing and sequencing
```

**Behavior:**
```typescript
if (account.dryRun) {
  // Create outbox message
  outbox.status = 'scheduled'
  
  // Log to run history
  history.push({ ok: true, outboxId })
  
  // Schedule next step
  nextSendAt = calculateNext()
  currentStepIndex += 1
  
  // DO NOT send via Gmail API
  return
}

Result:
  ✓ Outbox contains message
  ✓ Status: 'scheduled'
  ✓ Sequence advances
  ✓ No actual send
```

**Toggle:**
```typescript
// Per-account setting
AccountSettingsCard:
  <Checkbox
    checked={account.dryRun}
    onChange={(e) => setDryRun(account.id, e.checked)}
  />

Effect:
  ✓ Immediate: Next sends will be live
  ✓ Warning: Confirm before toggle off
  ✓ Can toggle back on anytime
```

### 8. AI Reply Classification

**Purpose:**
```typescript
✓ Analyze recruiter replies
✓ Identify intent (POSITIVE, SCHEDULING, etc.)
✓ Auto-tag threads
✓ Prioritize responses
```

**Implementation:**
```typescript
classifyReply(emailText):
  1. Call Step 31 AI Orchestrator
  2. Prompt: "Classify email reply into: POSITIVE, NEUTRAL, NEGATIVE, SCHEDULING, OUT_OF_OFFICE"
  3. Parse JSON response: { label, confidence }
  4. Return classification

Labels:
  POSITIVE: Interested, wants to proceed
  NEUTRAL: Acknowledgment, no clear signal
  NEGATIVE: Rejection, not interested
  SCHEDULING: Proposing interview times
  OUT_OF_OFFICE: Auto-reply

Example:
  Text: "Thanks for applying! Let's schedule a call next week."
  
  Result: { label: 'SCHEDULING', confidence: 0.95 }

Usage:
  ✓ Display badge on thread
  ✓ Filter threads by sentiment
  ✓ Auto-update application stage (POSITIVE → viewed, SCHEDULING → interview)
```

### 9. Outbox & Threads

**Outbox:**
```typescript
OutboxMessage:
  ✓ id: unique identifier
  ✓ threadId: Gmail thread (after send)
  ✓ accountId: Sender account
  ✓ to, cc, bcc: Recipients
  ✓ subject, html, text: Content
  ✓ status: pending | sent | failed | scheduled
  ✓ error: Error message (if failed)
  ✓ createdAt, sentAt: Timestamps
  ✓ tracking: Open/click IDs

Display (OutboxPage):
  ✓ List all messages
  ✓ Badge for status
  ✓ Error messages (red)
  ✓ "Open Thread" link
  ✓ Sort by createdAt (newest first)
```

**Threads:**
```typescript
GmailThread:
  ✓ id: Gmail thread ID
  ✓ subject: Email subject
  ✓ participants: All email addresses
  ✓ snippet: Preview text
  ✓ messages: Full message list
  ✓ updatedAt: Last activity

ThreadView:
  ✓ Display all messages
  ✓ Chronological order
  ✓ From/To/Date headers
  ✓ HTML rendering (sanitized)
  ✓ Scrollable (max-h-96)

Features:
  ✓ Fetch thread on demand
  ✓ Cache in component state
  ✓ Auto-refresh (optional)
  ✓ Reply button (future)
```

## Type System

### GmailAccount

```typescript
interface GmailAccount {
  id: string                 // Email address
  displayName?: string       // User's name
  connectedAt: string        // ISO timestamp
  tokenEncrypted: string     // AES-GCM encrypted token blob
  dryRun: boolean           // Safe mode
  dailyLimit: number        // Max emails/day
  lastSentAt?: string       // Last send timestamp
}
```

### OutboxMessage

```typescript
interface OutboxMessage {
  id: string
  threadId?: string         // Gmail thread (post-send)
  accountId: string         // GmailAccount.id
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  html: string              // Rich HTML
  text?: string             // Plain text fallback
  attachments?: Array<{
    filename: string
    mimeType: string
    dataBase64?: string
    url?: string
  }>
  status: 'pending' | 'sent' | 'failed' | 'scheduled'
  error?: string
  createdAt: string
  scheduledFor?: string     // Future send (optional)
  sentAt?: string
  headers?: Record<string, string>
  tracking?: {
    openId?: string
    clickId?: string
    pixelUrl?: string
  }
}
```

### SequenceRun

```typescript
interface SequenceRun {
  id: string
  sequenceId: string        // OutreachSequence reference
  applicationId?: string    // Step 33 Application
  accountId: string         // GmailAccount
  currentStepIndex: number  // Current position
  nextSendAt?: string       // Next execution time
  variables: Record<string, string>  // Template vars
  createdAt: string
  updatedAt: string
  status: 'idle' | 'running' | 'paused' | 'stopped'
  history: Array<{
    at: string
    stepIndex: number
    outboxId: string
    ok: boolean
    error?: string
  }>
}
```

## Stores

### emailAccountsStore

```typescript
State:
  ✓ items: GmailAccount[]

Actions:
  ✓ upsert(account): Add/update account
  ✓ remove(id): Disconnect account
  ✓ setDryRun(id, value): Toggle dry-run mode

Persistence:
  ✓ localStorage
  ✓ Version: 1
```

### outboxStore

```typescript
State:
  ✓ messages: OutboxMessage[]

Actions:
  ✓ upsert(message): Add/update message
  ✓ setStatus(id, status, patch): Update send status
  ✓ byThread(threadId): Filter by thread

Persistence:
  ✓ localStorage
  ✓ Capped at 500 messages (auto-cleanup)
```

### sequenceRunsStore

```typescript
State:
  ✓ runs: SequenceRun[]

Actions:
  ✓ upsert(run): Add/update run
  ✓ setStatus(id, status): Change run status
  ✓ markStep(id, entry, nextSendAt, nextIndex): Complete step

Persistence:
  ✓ localStorage
  ✓ History capped at 50 per run
```

### sequenceSchedulerStore

```typescript
State:
  ✓ running: boolean
  ✓ tickSec: number (default: 30)
  ✓ lastTick?: string

Actions:
  ✓ setRunning(value): Start/stop scheduler
  ✓ setTickSec(seconds): Adjust interval

Persistence:
  ✓ localStorage
  ✓ Auto-resume on reload
```

## Services

### google.oauth.service.ts

```typescript
initGIS(clientId):
  ✓ Load GIS script once
  ✓ Idempotent (checks window.__gisLoaded)

connectGoogleAccount({ clientId, passphrase, dryRun }):
  ✓ Initialize token client
  ✓ Request access token (popup)
  ✓ Fetch user info
  ✓ Encrypt token
  ✓ Store in emailAccountsStore

getBearer(accountId, passphrase, clientId):
  ✓ Load account
  ✓ Decrypt token
  ✓ Check expiry
  ✓ Refresh if needed
  ✓ Return valid bearer token
```

### gmail.real.service.ts

```typescript
buildMime(outboxMessage):
  ✓ Construct RFC 822 headers
  ✓ Multipart/mixed for attachments
  ✓ Base64 URL-safe encode
  ✓ Return raw MIME string

gmailSend(bearer, message):
  ✓ Build MIME
  ✓ POST to Gmail API
  ✓ Return { id, threadId }
  ✓ Throw on error

gmailGetThread(bearer, threadId):
  ✓ GET thread from Gmail API
  ✓ Parse messages
  ✓ Decode HTML bodies
  ✓ Return GmailThread
```

### calendar.real.service.ts

```typescript
proposeSlots({ durationMin, windowStartISO, windowEndISO, timeZone }):
  ✓ Generate hourly slots
  ✓ Filter business hours (8 AM - 6 PM)
  ✓ Respect duration
  ✓ Return array of ISO timestamps

calendarCreate(bearer, eventInput):
  ✓ POST to Calendar API
  ✓ Create event
  ✓ Send invites
  ✓ Return { id, htmlLink }
```

### ics.service.ts

```typescript
buildICS({ uid, title, startISO, durationMin, location?, description? }):
  ✓ Generate VCALENDAR format
  ✓ VEVENT with UID
  ✓ Start/End times (UTC)
  ✓ Escape special chars (, ; \n)
  ✓ Return ICS string

Usage:
  const ics = buildICS(...)
  const blob = new Blob([ics], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  <a download="event.ics" href={url}>Download</a>
```

### templateRender.service.ts

```typescript
renderTemplate({ subject, body }, variables):
  ✓ Substitute {{Variables}}
  ✓ Convert \n → <br/>
  ✓ Sanitize HTML (DOMPurify)
  ✓ Generate plain text
  ✓ Return { subject, html, text }
```

### tracking.service.ts

```typescript
makeOpenPixel(trackingId?):
  ✓ With ID: /api/trk/o.gif?id=...
  ✓ Without: data URI

wrapLinksForClick(html, trackingId?):
  ✓ Replace href with tracking URL
  ✓ Preserve original URL in query
  ✓ Return modified HTML
```

### sequenceRunner.service.ts

```typescript
startSequenceScheduler():
  ✓ Clear existing timer
  ✓ Start setInterval(tick, tickSec * 1000)

stopSequenceScheduler():
  ✓ clearInterval(timer)

runStep(runId):
  ✓ Load run, sequence, step, template
  ✓ Render template
  ✓ Add tracking
  ✓ Create outbox message
  ✓ If dry-run: mark scheduled
  ✓ Else: send via Gmail API
  ✓ Log result
  ✓ Schedule next step
```

### replyClassifier.service.ts

```typescript
classifyReply(emailText):
  ✓ Use Step 31 AI Orchestrator
  ✓ Prompt: Classify into POSITIVE, NEUTRAL, NEGATIVE, SCHEDULING, OUT_OF_OFFICE
  ✓ Parse JSON response
  ✓ Return { label, confidence }
  ✓ Fallback: { label: 'NEUTRAL', confidence: 0.5 }
```

### crypto.service.ts

```typescript
deriveKey(passphrase):
  ✓ PBKDF2 (100,000 iterations)
  ✓ Salt: 'jobpilot'
  ✓ Hash: SHA-256
  ✓ Return CryptoKey

encryptJSON(obj, passphrase):
  ✓ Derive key
  ✓ Generate random IV
  ✓ AES-GCM encrypt
  ✓ Return base64({ iv, data })

decryptJSON(blob, passphrase):
  ✓ Parse base64({ iv, data })
  ✓ Derive key
  ✓ AES-GCM decrypt
  ✓ Return JSON object
```

## UI Components

### OAuthConnectButton

```typescript
Purpose: Connect Gmail account

Features:
  ✓ "Connect Gmail" button
  ✓ Shows connected accounts (badges)
  ✓ Displays dry-run status
  ✓ Error handling

Flow:
  Click → OAuth popup → Consent → Token stored
```

### AccountSettingsCard

```typescript
Purpose: Manage connected accounts

Features:
  ✓ List all accounts
  ✓ Display name + email
  ✓ Dry-Run toggle (per account)
  ✓ Disconnect button

Layout:
  ✓ Card with list
  ✓ Each account: row with toggle
```

### SequenceRunnerPanel

```typescript
Purpose: Monitor and control sequence execution

Features:
  ✓ Pause/Resume scheduler
  ✓ List active runs
  ✓ Show current step
  ✓ Next send time
  ✓ Variables used
  ✓ Pause individual runs

Display:
  ✓ Status badge (running/paused)
  ✓ Step number
  ✓ Next send timestamp
  ✓ Variable list
```

### TemplatePreviewDialog

```typescript
Purpose: Preview rendered template

Features:
  ✓ Select template
  ✓ Provide variables
  ✓ Render preview
  ✓ Show subject + HTML body

Display:
  ✓ Dialog (max-w-2xl)
  ✓ Subject line
  ✓ HTML preview (prose styling)
```

### CalendarLinkDialog

```typescript
Purpose: Create ICS for scheduling

Features:
  ✓ Propose time slots (next 2 days)
  ✓ Show first 10 slots
  ✓ Generate ICS file
  ✓ Download button

Display:
  ✓ Dialog with slot chips
  ✓ Download ICS button
  ✓ Instructions text
```

### ThreadView

```typescript
Purpose: Display email thread

Features:
  ✓ Show all messages
  ✓ From/To/Date headers
  ✓ HTML body rendering
  ✓ Plain text fallback

Display:
  ✓ Card with message list
  ✓ Scrollable (max-h-96)
  ✓ Chronological order
```

### OutboxPage

```typescript
Purpose: Main outreach dashboard

Features:
  ✓ OAuth connect button
  ✓ Account settings
  ✓ Sequence runner panel
  ✓ Outbox message list
  ✓ Thread viewer

Layout:
  ✓ Vertical stack
  ✓ 2-column grid (messages + thread)
```

## Integration Points

### With Step 27 (Parsed CV)

```typescript
// Variables from CV
variables = {
  YourName: cv.personalInfo.fullName,
  YourEmail: cv.personalInfo.email,
  YourPhone: cv.personalInfo.phone,
  YourLinkedIn: cv.personalInfo.linkedin
}
```

### With Step 29 (Variants)

```typescript
// Attach CV variant to email
const cvPDF = await exportVariantToPDF(variantId)
const cvBase64 = await fileToBase64(cvPDF)

outbox.attachments = [{
  filename: 'CV.pdf',
  mimeType: 'application/pdf',
  dataBase64: cvBase64
}]
```

### With Step 30 (Cover Letters)

```typescript
// Insert cover letter inline or as attachment
if (inlineMode) {
  // Add to email body
  body = coverLetterHTML + '<hr/>' + body
} else {
  // Attach as PDF
  outbox.attachments.push({
    filename: 'CoverLetter.pdf',
    mimeType: 'application/pdf',
    dataBase64: clBase64
  })
}
```

### With Step 31 (AI)

```typescript
// Reply classification
const { label, confidence } = await classifyReply(replyText)

// Auto-update application stage
if (label === 'POSITIVE') {
  application.stage = 'viewed'
} else if (label === 'SCHEDULING') {
  application.stage = 'interview'
} else if (label === 'NEGATIVE') {
  application.stage = 'rejected'
}
```

### With Step 32 (Jobs)

```typescript
// Email recruiter from job card
<JobCard>
  <Button onClick={() => {
    // Launch sequence with job variables
    variables = {
      Company: job.company,
      Role: job.title,
      RecruiterEmail: job.recruiterEmail || ''
    }
  }}>
    Email Recruiter
  </Button>
</JobCard>
```

### With Step 33 (Applications)

```typescript
// Link sequence to application
application.sequenceId = sequence.id

// Unified logs
application.logs.push({
  level: 'info',
  message: 'Email sent via sequence',
  meta: { outboxId, threadId }
})

// Display in Applications page
<ApplicationDetailDrawer>
  <SequenceInfo sequenceId={app.sequenceId} />
  <OutboxMessages applicationId={app.id} />
</ApplicationDetailDrawer>
```

## Security & Privacy

### Token Encryption

```typescript
Storage:
  ✓ Tokens encrypted with AES-GCM
  ✓ Passphrase from env
  ✓ PBKDF2 key derivation (100k iterations)
  ✓ Random IV per encryption

Production:
  ✓ Store tokens server-side only
  ✓ Client gets short-lived access tokens
  ✓ Backend handles refresh
  ✓ Never expose refresh tokens
```

### PII Protection

```typescript
Never Logged:
  ✓ Access tokens
  ✓ Refresh tokens
  ✓ Email content (unless user opts in)
  ✓ Recipient addresses

UI Masking:
  ✓ Tokens: ********...last4
  ✓ Email bodies: Truncated in logs
```

### Consent & Compliance

```typescript
✓ Dry-run default (safe)
✓ Explicit toggle to live mode
✓ Warning before sending
✓ Daily limit enforcement
✓ Rate limiting
✓ OAuth consent screen (Google-managed)
```

## Performance

### Token Refresh

```typescript
Strategy:
  ✓ Proactive refresh (< 55 min)
  ✓ Avoid mid-send expiry
  ✓ Cache in memory (short-lived)

Timing:
  ✓ Access tokens: 60 min
  ✓ Refresh at: 55 min
  ✓ Buffer: 5 min
```

### Scheduler Efficiency

```typescript
Tick Interval:
  ✓ Default: 30 seconds
  ✓ Configurable: 10-300 seconds
  ✓ Balance: Responsiveness vs CPU

Optimization:
  ✓ Filter: Only runs with nextSendAt <= now
  ✓ Skip: Paused or stopped runs
  ✓ Batch: Process multiple runs per tick
```

### Storage Limits

```typescript
localStorage:
  ✓ Outbox: ~500 messages (auto-cleanup)
  ✓ Runs: ~100 sequences
  ✓ Accounts: ~5 max recommended
  ✓ Total: ~2-3 MB
```

## Testing

### Unit Tests (8 files, 35+ tests)

```typescript
templateRender.service.spec.ts (5 tests):
  ✓ Substitute variables
  ✓ Convert newlines to br
  ✓ Sanitize HTML
  ✓ Create plain text
  ✓ Handle missing variables

gmail.real.service.spec.ts (3 tests):
  ✓ Build MIME message
  ✓ Include cc/bcc
  ✓ Handle attachments

google.oauth.service.spec.ts (1 test):
  ✓ Load GIS script once (idempotent)

sequenceRunner.service.spec.ts (3 tests):
  ✓ Create run with initial state
  ✓ Mark step complete
  ✓ Change run status

tracking.service.spec.ts (4 tests):
  ✓ Create data URI pixel
  ✓ Create tracking URL
  ✓ Wrap links
  ✓ No wrap without ID

crypto.service.spec.ts (3 tests):
  ✓ Encrypt and decrypt JSON
  ✓ Fail with wrong passphrase
  ✓ Handle complex objects

ics.service.spec.ts (4 tests):
  ✓ Build valid ICS
  ✓ Include location
  ✓ Include description
  ✓ Escape special characters

calendar.real.service.spec.ts (3 tests):
  ✓ Propose slots within window
  ✓ Filter non-business hours
  ✓ Respect duration
```

### Integration Tests (Planned)

```typescript
send_and_thread.spec.ts:
  1. Mock Gmail API
  2. Send message
  3. Verify MIME format
  4. Fetch thread
  5. Verify thread structure
```

### E2E Tests (Planned)

```typescript
step35-outreach-flow.spec.ts:
  1. Connect Gmail (mock OAuth)
  2. Create email template
  3. Create sequence
  4. Create run (dry-run)
  5. Runner executes
  6. Outbox shows 'scheduled'
  7. Toggle to live mode
  8. Runner sends
  9. Outbox shows 'sent'
  10. Thread appears
```

## Known Limitations

### 1. Token Storage (Client-Side)

**Issue:**
```typescript
// Tokens encrypted in localStorage
// Still accessible via DevTools
```

**Solution:**
```typescript
Production:
  ✓ Store tokens server-side only
  ✓ Backend proxy for Gmail/Calendar
  ✓ Short-lived access tokens to client
  ✓ Never expose refresh tokens
```

### 2. Tracking Backend (Optional)

**Issue:**
```typescript
// Tracking requires backend endpoints
// /api/trk/o.gif, /api/trk/c
```

**Workaround:**
```typescript
// Fallback to data URIs
// No tracking, privacy-friendly
```

**Solution:**
```typescript
// Deploy tracking endpoints
// Log opens/clicks to database
// Analytics dashboard
```

### 3. Gmail Quotas

**Issue:**
```typescript
// Free Gmail: 100 emails/day
// Can be exhausted quickly
```

**Mitigation:**
```typescript
✓ Default limit: 90/day (safe buffer)
✓ User configurable per account
✓ Checked before send
✓ Backoff on quota errors
✓ Resume next day automatically
```

### 4. Multi-Account Support

**Issue:**
```typescript
// Can connect multiple accounts
// Each has separate quota
```

**Enhancement:**
```typescript
✓ Round-robin sending
✓ Load balance across accounts
✓ Aggregate quotas
```

## Future Enhancements

### Short-Term

1. **Reply Detection:**
   - Gmail webhook (Cloud Pub/Sub)
   - Auto-classify replies
   - Update application stages
   - Notify user

2. **Smart Scheduling:**
   - Optimal send times (ML-based)
   - Time zone awareness
   - Recipient timezone detection

3. **A/B Testing:**
   - Multiple template variants
   - Track performance
   - Auto-select winner

### Medium-Term

4. **Conversation AI:**
   - Generate personalized replies
   - Context-aware responses
   - Tone matching

5. **Bulk Operations:**
   - Send to multiple recipients
   - Mail merge
   - BCC for privacy

6. **Advanced Tracking:**
   - Forwarding detection
   - Reply-to tracking
   - Engagement scoring

### Long-Term

7. **CRM Integration:**
   - Sync with external CRM
   - Contact enrichment
   - Activity logging

8. **Compliance Tools:**
   - GDPR data export
   - Unsubscribe handling
   - Consent management

## OAuth Setup Guide

### 1. Create OAuth Client

```bash
1. Go to Google Cloud Console
2. Create new project or select existing
3. Enable Gmail API
4. Enable Google Calendar API
5. Navigate to "Credentials"
6. Create "OAuth Client ID"
7. Type: Web application
8. Authorized origins:
   - http://localhost:5173 (dev)
   - https://app.jobpilot.com (production)
9. Copy Client ID
```

### 2. Configure Environment

```env
# .env.local
VITE_GOOGLE_CLIENT_ID=123456-abc.apps.googleusercontent.com
VITE_OAUTH_PASSPHRASE=your-secure-random-passphrase-min-32-chars

# Production: Use server-side OAuth flow instead
```

### 3. Test Connection

```typescript
1. Open app
2. Navigate to /outreach
3. Click "Connect Gmail"
4. Google consent screen appears
5. Authorize permissions:
   - Send emails
   - Read emails
   - Manage calendar
6. Account badge appears
7. "Dry-Run" mode active
```

### 4. Production Deployment

```typescript
Backend OAuth Proxy:
  
  POST /api/auth/google/connect
  Body: { code: '4/0AfJohXl...' }
  
  Process:
    1. Exchange code for tokens
    2. Store refresh_token (encrypted, database)
    3. Return short-lived access_token to client
  
  POST /api/gmail/send
  Body: { to, subject, html }
  Headers: { Authorization: 'Bearer session-token' }
  
  Process:
    1. Verify session
    2. Load refresh_token from database
    3. Get fresh access_token
    4. Call Gmail API
    5. Return result

Security:
  ✓ Refresh tokens never leave server
  ✓ Access tokens short-lived (1 hour)
  ✓ Session tokens for client auth
  ✓ HTTPS required
```

## Usage Examples

### Example 1: Simple Follow-Up

```typescript
// 1. Connect Gmail
Click "Connect Gmail" → Authorize

// 2. Create Template
Name: "Follow-up #1"
Subject: "Following up on {{Role}} at {{Company}}"
Body: "Hi {{RecruiterName}},\n\nJust checking in on my application for the {{Role}} position.\n\nBest,\n{{YourName}}"

// 3. Create Sequence
Name: "Standard Follow-Up"
Steps:
  - Day 3, 09:00, Template: "Follow-up #1"
  - Day 7, 09:00, Template: "Follow-up #2"

// 4. Create Run (from Application)
Application: "Software Engineer at Acme"
Variables:
  - Company: "Acme Corp"
  - Role: "Software Engineer"
  - RecruiterName: "Sarah Johnson"
  - RecruiterEmail: "sarah@acme.com"

// 5. Runner Executes
Day 3, 09:00:
  ✓ Render template
  ✓ Send email (or schedule if dry-run)
  ✓ Log to outbox

Day 7, 09:00:
  ✓ Send follow-up #2
  ✓ Log to outbox
  ✓ Sequence complete
```

### Example 2: Interview Scheduling

```typescript
// Recruiter replies: "Let's schedule an interview"

// 1. Open CalendarLinkDialog
Click "Propose Times"

// 2. Review Slots
Next 2 days, 8 AM - 6 PM:
  - Oct 10, 9:00 AM
  - Oct 10, 10:00 AM
  - Oct 10, 11:00 AM
  ...

// 3. Download ICS
Click "Download ICS"
→ proposed_times.ics saved

// 4. Attach to Email
Create new email
Subject: "Interview availability"
Body: "I'm available at the times in the attached ICS file."
Attachment: proposed_times.ics

// 5. Send
Recruiter opens email
→ ICS opens in their calendar
→ They select a time
→ You receive calendar invite
→ Event synced to your calendar
```

### Example 3: Bulk Outreach

```typescript
// Apply to 10 jobs, send follow-ups

// 1. Batch Apply (Step 33)
for (const job of jobs) {
  await autoApply({ job, optIn: true })
}

// 2. Create Runs
for (const application of applications) {
  const run = {
    sequenceId: 'standard-followup',
    applicationId: application.id,
    accountId: 'me@gmail.com',
    variables: {
      Company: application.company,
      Role: application.role,
      RecruiterEmail: application.contacts[0]?.email || ''
    }
  }
  
  useSequenceRunsStore.getState().upsert(run)
}

// 3. Runner Handles All
Scheduler:
  ✓ Runs every 30 seconds
  ✓ Sends one email at a time (rate limit)
  ✓ Logs all results
  ✓ Auto-retries on errors
  ✓ Completes all sequences

Result:
  ✓ 10 applications
  ✓ 30 emails (3 per sequence)
  ✓ Sent over 21 days
  ✓ All tracked in Outbox
```

## Troubleshooting

### OAuth Connection Fails

```typescript
Problem:
  "OAuth failed - no access token"

Causes:
  ✓ Invalid client ID
  ✓ Origins not authorized
  ✓ Scopes not enabled
  ✓ User denied consent

Solution:
  ✓ Verify VITE_GOOGLE_CLIENT_ID
  ✓ Add origin to OAuth client
  ✓ Enable Gmail & Calendar APIs
  ✓ Re-attempt connection
```

### Emails Not Sending

```typescript
Problem:
  Outbox shows 'pending' but never 'sent'

Causes:
  ✓ Dry-run mode ON
  ✓ Scheduler paused
  ✓ Token expired
  ✓ Quota exceeded

Solution:
  ✓ Check account.dryRun
  ✓ Resume scheduler
  ✓ Reconnect account
  ✓ Wait for quota reset
```

### Token Decryption Fails

```typescript
Problem:
  "Failed to decrypt token"

Causes:
  ✓ Wrong passphrase
  ✓ Corrupted token blob
  ✓ Environment changed

Solution:
  ✓ Verify VITE_OAUTH_PASSPHRASE unchanged
  ✓ Disconnect and reconnect account
  ✓ Check for typos in env file
```

### Sequence Stuck

```typescript
Problem:
  Run status='running' but no emails sent

Causes:
  ✓ nextSendAt in future
  ✓ Template missing
  ✓ Account missing
  ✓ Error not logged

Solution:
  ✓ Check nextSendAt timestamp
  ✓ Verify template exists
  ✓ Verify account connected
  ✓ Check run.history for errors
  ✓ Manually retry step
```

## Best Practices

### Template Design

```typescript
✓ Clear subject lines
✓ Personalize with variables
✓ Keep body concise
✓ Include call-to-action
✓ Professional tone
✓ Test rendering before sending
```

### Sequence Timing

```typescript
✓ Space steps 3-7 days apart
✓ Send during business hours
✓ Respect time zones
✓ Max 3-4 follow-ups
✓ Stop if reply received
```

### Variable Hygiene

```typescript
✓ Always provide default values
✓ Validate before sending
✓ Sanitize user input
✓ Handle missing gracefully
✓ Test with edge cases
```

### Error Handling

```typescript
✓ Log all errors
✓ Retry with backoff
✓ Notify user on permanent failure
✓ Provide actionable error messages
✓ Never lose data
```

## References

- Gmail API: https://developers.google.com/gmail/api
- Calendar API: https://developers.google.com/calendar
- GIS (OAuth): https://developers.google.com/identity/gsi/web
- ICS Format: https://icalendar.org/
- MIME RFC 822: https://www.rfc-editor.org/rfc/rfc822
- AES-GCM: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto
