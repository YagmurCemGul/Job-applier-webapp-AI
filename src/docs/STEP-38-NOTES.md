# Step 38: Onboarding & First-90-Days Success Kit

## Overview

This step implements a comprehensive Onboarding & First-90-Days Success Kit for users who have accepted job offers. It helps them plan and execute a successful onboarding experience with AI-powered assistance, stakeholder management, 1:1 tracking, OKR planning, weekly reporting, and evidence collection.

## Core Features

### 1. 30/60/90 Day Planning

**Plan Builder:**
- Create role-aware onboarding plans
- Default milestones at 30, 60, and 90 days
- Seed tasks based on role (Engineer, PM, Manager, etc.)
- AI personalization for company-specific context
- Task tracking with status (todo, in_progress, blocked, done)
- Checklists for IT, HR, policies, equipment

**Milestones:**
```typescript
Default Structure:
  30 Days: Ramp up, meet stakeholders, learn systems
  60 Days: Own a scoped project, initial improvements
  90 Days: Deliver meaningful impact, plan next quarter

Customizable:
  - Target days (7, 14, 30, 45, 60, 90)
  - Summary descriptions
  - Linked tasks
```

**Tasks:**
```typescript
Properties:
  - title: Task description
  - details: Additional context
  - milestoneId: Link to milestone
  - status: todo | in_progress | blocked | done
  - dueISO: Due date
  - owner: Task owner (default: self)
  - tags: Category tags
  - evidenceIds: Linked evidence items

Auto-Generated:
  - Read onboarding docs
  - Set up 1:1 with manager
  - Shadow a peer
  - Run local dev & tests (for engineers)
  - Review roadmap & metrics (for PMs)

AI-Personalized:
  - Up to 8 additional tasks
  - Based on role, company, goals, risks
  - Milestone-specific (30/60/90)
```

### 2. Stakeholder Management

**Stakeholder Mapping:**
```typescript
Influence vs Interest Matrix:
  High Influence + High Interest: Key Partners
  High Influence + Low Interest: Keep Satisfied
  Low Influence + High Interest: Keep Informed
  Low Influence + Low Interest: Monitor

Properties:
  - name, email, org, role
  - influence: low | med | high
  - interest: low | med | high
  - cadence: weekly | biweekly | monthly | ad_hoc
  - notes: Free-form context

Deduplication:
  - By email (case-insensitive)
  - Ranked by combined influence + interest score
```

**Cadence Planning:**
- Weekly 1:1s with manager
- Biweekly check-ins with cross-functional leads
- Monthly touch-bases with stakeholders
- Ad-hoc meetings as needed

### 3. One-on-One (1:1) Management

**1:1 Series:**
```typescript
Series Configuration:
  - counterpartEmail: Who you're meeting
  - counterpartName: Display name
  - cadence: weekly | biweekly | monthly
  - weekday: 1-7 (Mon-Sun)
  - timeHHMM: '10:30' format
  - durationMin: Meeting duration
  - calendarEventId: Step 35 Calendar link

Scheduling:
  - Compute next occurrence based on weekday
  - Create Google Calendar event (Step 35)
  - Set attendees
  - Recurring series support
```

**1:1 Entries:**
```typescript
Per-Meeting Notes:
  - dateISO: Meeting date
  - agendaQueue: Planned topics (array)
  - notes: Free-form notes during meeting
  - actions: AI-extracted action items
  - sentiment: positive | neutral | negative

Action Items:
  - text: What to do
  - owner: Who's responsible
  - dueISO: Due date

AI Extraction:
  - Parse notes with AI
  - Extract actionable items
  - Assign owners and due dates
  - Link to tasks
```

### 4. OKR (Objectives & Key Results) Planning

**OKR Structure:**
```typescript
Objective:
  - id, planId, title, owner
  - krs: Array of Key Results
  - confidence: 0-5 (RAG scale)
  - createdAt, updatedAt

Key Result:
  - id, label
  - target: Numeric goal
  - current: Current value
  - unit: '%', 'issues', 'sessions', etc.
  - weight: Importance (default 1)
  - evidenceId: Supporting evidence

Progress Calculation:
  Weighted average of KR progress
  Formula: Σ(current/target × weight) / Σ(weight)
  Capped at 100%
```

**Example:**
```typescript
Objective: Launch Feature X
  KR1: Complete design (100 → 100%, weight 1)
  KR2: Ship to production (100 → 50%, weight 2)
  
  Progress = (1×1 + 0.5×2) / (1+2) = 2/3 = 66.7%
```

### 5. Weekly Reporting

**Report Structure:**
```typescript
Sections:
  - Highlights: Wins and accomplishments
  - Risks: Potential issues or blockers
  - Asks: Help needed from manager/team
  - OKRs: Progress on objectives (auto-computed)

HTML Generation:
  - Clean, formatted HTML
  - Sections with bullet lists
  - OKR progress percentages
  - Disclaimer footer

Email Sending (Step 35):
  - Via Gmail API
  - RFC 822 MIME format
  - To: Manager, team, stakeholders
  - Subject: Weekly update
  - Track in Outbox
```

**Context Mining (Consented):**
```typescript
Optional Features:
  - Pull recent calendar events
  - Suggest highlights from meetings
  - Summarize activities
  
Consent Required:
  - Explicit opt-in banner
  - Only user's own data
  - Event titles and dates only
  - No email content unless pasted
  - Can be disabled anytime
```

### 6. Evidence Binder

**Evidence Collection:**
```typescript
Evidence Types:
  - doc: Documents and reports
  - metric: Quantitative results
  - screenshot: Visual proof
  - link: URL references
  - note: Text notes

Properties:
  - id, title, kind
  - url: Link to evidence
  - text: Description or content
  - createdAt: Timestamp
  - tags: Categories
  - relatedTaskIds: Linked tasks

Use Cases:
  - Probation review preparation
  - Performance review artifacts
  - Promotion packets
  - Self-advocacy documentation
```

**Export Options:**
```typescript
Formats:
  - PDF: Printable summary
  - Google Docs: Editable document
  - Email attachment: Send to manager

Content:
  - Titled evidence items
  - Descriptions and links
  - Creation dates
  - Tagged by category
```

## Type System

### OnboardingPlan

```typescript
interface OnboardingPlan {
  id: string
  applicationId: string         // Step 33 link
  role: string
  company: string
  startDateISO?: string
  stage: 'draft' | 'active' | 'paused' | 'completed'
  lang: 'en' | 'tr'
  milestones: PlanMilestone[]
  tasks: PlanTask[]
  checklists: ChecklistItem[]
  stakeholders: Stakeholder[]
  evidence: EvidenceItem[]
  retentionDays: 30 | 60 | 90 | 180 | 365
  createdAt: string
  updatedAt: string
}
```

### OneOnOneSeries

```typescript
interface OneOnOneSeries {
  id: string
  planId: string
  counterpartEmail: string
  counterpartName: string
  cadence: 'weekly' | 'biweekly' | 'monthly'
  weekday: 1 | 2 | 3 | 4 | 5 | 6 | 0  // Mon-Sun
  timeHHMM: string                    // '10:30'
  durationMin: number
  calendarEventId?: string            // Step 35
  notes?: string
  createdAt: string
  updatedAt: string
}
```

### Objective (OKR)

```typescript
interface Objective {
  id: string
  planId: string
  title: string
  owner: string
  krs: KeyResult[]
  confidence: 0 | 1 | 2 | 3 | 4 | 5
  createdAt: string
  updatedAt: string
}

interface KeyResult {
  id: string
  label: string
  target: number
  unit?: string
  current: number
  weight?: number
  evidenceId?: string
}
```

## Services

### planBuilder.service.ts

```typescript
defaultMilestones(): PlanMilestone[]
  Returns 3 standard milestones (30/60/90)

seedTasks(role: string): PlanTask[]
  Generates role-specific starter tasks
  Engineer: Add dev environment setup
  PM: Add roadmap review
  Generic: Onboarding docs, 1:1 setup, shadowing

personalizeTasksWithAI(tasks, context): Promise<PlanTask[]>
  AI Enhancement:
    - Uses Step 31 AI orchestrator
    - Prompt includes role, company, goals, risks
    - Generates up to 8 additional tasks
    - Assigns to milestones (30/60/90)
    - Adds tags and details
  Fallback:
    - Returns original tasks if AI fails
    - Graceful error handling
```

### stakeholder.service.ts

```typescript
dedupeStakeholders(items): Stakeholder[]
  Process:
    1. Build Map<email, Stakeholder>
    2. Case-insensitive email keys
    3. Last-wins for duplicates
    4. Sort by score (influence + interest)
  
Score Calculation:
  high: 3 points
  med: 2 points
  low: 1 point
  Total: influence + interest (2-6 range)
```

### oneonone.service.ts

```typescript
scheduleOneOnOne(series, accountId): Promise<{eventId, whenISO}>
  Process:
    1. Compute next occurrence (weekday + time)
    2. Get OAuth bearer token (Step 35)
    3. Create Calendar event
    4. Return event ID and ISO time

computeNextOccurISO(weekday, timeHHMM): string
  Algorithm:
    1. Parse time (HH:MM)
    2. Calculate days until next weekday
    3. Set date + time
    4. Return ISO string

entryToActionPrompt(entry): string
  Generates AI prompt:
    "Extract actionable items from 1:1 notes.
     Return JSON [{text, owner?, dueISO?}].
     Notes: {entry.notes}"
```

### okr.service.ts

```typescript
objectiveProgress(objective): number
  Algorithm:
    1. For each KR: frac = min(1, current/target)
    2. weightedSum = Σ(frac × weight)
    3. totalWeight = Σ(weight)
    4. progress = weightedSum / totalWeight
    5. Return 0 if no KRs
  
  Example:
    KR1: 100/100, weight 1 → frac 1.0
    KR2: 50/100, weight 2 → frac 0.5
    Progress = (1×1 + 0.5×2) / 3 = 0.667
```

### weeklyReport.service.ts

```typescript
buildWeeklyHTML(plan, opts): string
  Sections:
    - H2: Company — Role Weekly Update
    - H3: Highlights (if any)
      - UL with LI items
    - H3: Risks (if any)
    - H3: Asks (if any)
    - H3: OKRs (if any)
      - Progress percentages
    - Footer: Disclaimer

sendWeeklyEmail(bearer, from, to, subject, html): Promise
  Process:
    1. Build RFC 822 MIME message
    2. Base64 encode (URL-safe)
    3. POST to Gmail API
    4. Return response

progressForPlan(plan, okrs): Array<{title, pct}>
  Filter OKRs by planId
  Map to {title, pct: objectiveProgress()}
```

### aiActionItems.service.ts

```typescript
extractActions(text): Promise<Action[]>
  Process:
    1. Build prompt with notes text
    2. Call Step 31 AI orchestrator
    3. Parse JSON response
    4. Return array of {text, owner?, dueISO?}
  Fallback:
    - Return [] if AI fails
    - Handle malformed JSON
```

### evidenceBinder.service.ts

```typescript
renderBinderHTML(items): string
  Template:
    <div>
      <h2>Evidence Binder</h2>
      <ul>
        <li><b>{title}</b> — {text/url} <i>{date}</i></li>
        ...
      </ul>
    </div>
```

### biasPhrasing.service.ts

```typescript
suggestBiasSafe(text): string[]
  Patterns:
    - "culture fit" → "culture add"
    - "aggressive|bossy" → "specific behaviors"
    - "rockstar|ninja" → "job-relevant competencies"
  
  Returns:
    Array of suggestions for matched patterns
```

## UI Components

### OnboardingHome

**Dashboard Overview:**
- Tasks progress (done/total)
- Stakeholders count
- OKRs count
- Evidence count
- Checklists progress
- 1:1s scheduled count

**Quick Actions:**
- Navigate to tabs
- View stage badge
- See start date
- Disclaimer banner

### PlanBuilder

**Features:**
- Display company and role
- Seed Plan button
  - Creates default milestones
  - Adds role-specific tasks
- Personalize with AI button
  - Calls AI service
  - Adds up to 8 tasks
  - Shows loading state
- Task list with checkboxes
  - Toggle done status
  - Display tags
  - Show milestone
  - Mark as blocked

**Task Display:**
```tsx
[✓] Read onboarding docs [learn]
[ ] Set up 1:1 with manager [people]
[ ] Run local dev & tests [dev]
[ ] Review system architecture [30d] [in_progress]
```

### ConsentMiningBanner

**Features:**
- Yellow alert banner
- Clear explanation of data usage
- Checkbox for consent
- Dismissible
- ARIA live announcement

**Content:**
```
⚠️ Calendar & Email Suggestions

Calendar/email suggestions require your consent and use only
your own data (event titles and dates; no content unless pasted).

[✓] I consent to calendar/email analysis for suggestions [Dismiss]
```

## Integration with Steps 17-37

### Step 27 (Profile)
```typescript
// Auto-fill from CV
plan.customFields.candidateName = cv.personalInfo.fullName
```

### Step 31 (AI Orchestrator)
```typescript
// Plan personalization
const tasks = await personalizeTasksWithAI(baseTasks, context)
  → Uses aiRoute() for task generation

// Action extraction
const actions = await extractActions(notes)
  → Uses aiRoute() for parsing
```

### Step 33 (Applications)
```typescript
// Create plan from accepted application
if (application.stage === 'offer_accepted') {
  const plan = createOnboardingPlan({
    applicationId: application.id,
    company: application.company,
    role: application.role
  })
}

// Link back
application.onboardingPlanId = plan.id
```

### Step 35 (Gmail/Calendar)
```typescript
// Schedule 1:1s
const event = await scheduleOneOnOne(series, accountId)
  → Uses calendarCreate() from Step 35

// Send weekly reports
await sendWeeklyEmail(bearer, from, to, subject, html)
  → Uses Gmail API from Step 35

// Schedule reminders
await scheduleReminder(accountId, label, whenISO)
  → Uses calendarCreate() from Step 35
```

### Step 36 (Interviews)
```typescript
// Reference interview artifacts
interview.scoreSubmissions → evidence
interview.transcripts → onboarding notes
```

### Step 37 (Offers)
```typescript
// Start onboarding after acceptance
if (offer.stage === 'accepted') {
  createOnboardingPlan({
    applicationId: offer.applicationId,
    company: offer.company,
    role: offer.role
  })
}
```

## Algorithms

### Next Occurrence Calculation

```typescript
Given: weekday (1-7), time (HH:MM)

Process:
  1. Parse time → hours, minutes
  2. Get current date
  3. Calculate delta days:
     delta = (targetWeekday - currentWeekday + 7) % 7
     if delta === 0: delta = 7 (next week)
  4. Add delta days to current date
  5. Set hours and minutes
  6. Return ISO string

Example:
  Today: Monday (1), want Friday (5)
  delta = (5 - 1 + 7) % 7 = 4
  Next Friday = Today + 4 days
  
  Time: 10:30
  Result: 2025-11-01T10:30:00Z
```

### OKR Progress Calculation

```typescript
Given: Array of KRs with target, current, weight

Process:
  1. For each KR:
     frac = min(1, max(0, current / target))
     weighted = frac × weight
  
  2. Sum all weighted values
  3. Sum all weights
  4. Progress = totalWeighted / totalWeight
  5. Return 0 if totalWeight === 0

Example:
  KR1: target=100, current=100, weight=1
    frac=1.0, weighted=1.0
  
  KR2: target=100, current=50, weight=2
    frac=0.5, weighted=1.0
  
  Progress = (1.0 + 1.0) / (1 + 2) = 2/3 = 0.667
```

### Stakeholder Deduplication & Ranking

```typescript
Process:
  1. Create Map<emailLower, Stakeholder>
  2. For each stakeholder:
     map.set(email.toLowerCase(), stakeholder)
  3. Convert map to array
  4. Sort by score descending

Score Function:
  influence: high=3, med=2, low=1
  interest: high=3, med=2, low=1
  score = influence + interest (2-6)

Ranking:
  6: High/High (Key Partners)
  5: High/Med or Med/High
  4: Med/Med or High/Low or Low/High
  3: Med/Low or Low/Med
  2: Low/Low (Monitor)
```

## Consent & Privacy

### Data Mining Consent

**What's Collected (when consented):**
- Calendar event titles
- Calendar event times
- Calendar attendees

**NOT Collected:**
- Email content
- Email bodies
- Meeting notes (unless pasted)
- Private calendar details

**User Controls:**
- Explicit opt-in checkbox
- Can disable anytime
- Clear explanation of usage
- Dismissible banner

### Retention Policy

**Configurable Retention:**
- 30 days: Short projects
- 60 days: Standard onboarding
- 90 days: Extended ramp
- 180 days: Complex roles
- 365 days: Long-term reference

**What's Retained:**
- Notes and transcripts
- Evidence artifacts
- Task history
- OKR progress

**Auto-Purge:**
- Based on retentionDays setting
- User can manually delete
- Export before purge

### Bias Safety

**Phrasing Suggestions:**
- Real-time tips
- Pattern matching
- Nudges, not blocks
- Educational approach

**Examples:**
```
Input: "Good culture fit"
Suggestion: Consider "culture add" and focus on values & behaviors

Input: "Can be aggressive in meetings"
Suggestion: Describe specific behaviors and impact instead of labels

Input: "Looking for a rockstar"
Suggestion: Use job-relevant competencies instead of stereotypes
```

## Accessibility

### Keyboard Navigation

- All controls tab-accessible
- Enter/Space to activate
- Arrow keys for lists
- Escape to dismiss dialogs

### Screen Reader Support

- ARIA labels on all inputs
- ARIA live regions for banners
- Semantic HTML (nav, main, section)
- Alt text for icons

### High Contrast

- Color contrast ratio ≥ 4.5:1
- Focus indicators
- Non-color-only information
- Resizable text

### Mobile Support

- Responsive grid layout
- Touch-friendly targets (44×44px)
- Swipe gestures
- Mobile-first design

## Testing

### Unit Tests (6 files)

**planBuilder.spec.ts:**
- Default milestones creation
- Role-specific task seeding
- Engineer task addition
- PM task addition
- Unique ID generation

**okr.progress.spec.ts:**
- Weighted progress calculation
- No KRs edge case
- Zero targets handling
- Progress capping at 100%

**aiActionItems.spec.ts:**
- Action item parsing (mock)
- Malformed JSON handling

**weeklyReport.spec.ts:**
- HTML building with sections
- Empty sections handling
- Unicode character support

**evidenceBinder.spec.ts:**
- HTML rendering
- Date inclusion
- Empty evidence handling

**biasPhrasing.spec.ts:**
- "culture fit" suggestions
- "aggressive" suggestions
- "rockstar" suggestions
- Neutral text (no suggestions)
- Case-insensitive matching

### Integration Tests (Planned)

**plan_schedule_1on1.spec.ts:**
1. Create onboarding plan
2. Add stakeholder
3. Create 1:1 series
4. Schedule first meeting (mock Calendar)
5. Add entry notes
6. Extract AI actions (mock)

**weekly_report_send.spec.ts:**
1. Compose weekly report
2. Include OKR progress
3. Send via Gmail (mock)
4. Log to Application timeline

**binder_export.spec.ts:**
1. Add evidence items
2. Export to PDF (mock)
3. Export to Docs (mock)
4. Verify content

### E2E Tests (Planned)

**step38-first90days-flow.spec.ts:**
1. Start from accepted application
2. Seed plan with tasks
3. Personalize with AI
4. Schedule 1:1 with manager
5. Define OKRs with KRs
6. Compose & send weekly report
7. Add evidence items
8. Export binder
9. Mark plan as completed

## Known Limitations

### 1. AI Personalization (Best-Effort)

**What Works:**
- Generic task suggestions
- Role-aware recommendations
- Milestone assignment

**What's Missing:**
- Company-specific systems
- Team dynamics
- Actual org structure
- Past performance data

**Workaround:**
- User can edit all tasks
- Manual task addition
- Template library (future)

### 2. Meeting Mining (Stub)

**What's Stubbed:**
- Calendar event listing
- Email summarization
- Context extraction

**Production Needs:**
- Gmail API list endpoint
- Calendar API list endpoint
- Permission scopes
- Rate limiting

**Current:**
- User manually enters highlights
- Copy-paste from calendar
- Manual context assembly

### 3. 1:1 Recurrence (Simplified)

**What Works:**
- Compute next occurrence
- Single event creation
- Attendee list

**What's Missing:**
- True recurring series
- Calendar sync for all instances
- Automated reminders
- Cancellation handling

**Workaround:**
- Create one-off events
- Manual rescheduling
- User manages recurrence

### 4. Evidence Export (Basic)

**What Works:**
- HTML rendering
- Blob URL generation
- Basic PDF (HTML blob)

**What's Missing:**
- Professional PDF layout
- Image embedding
- Rich formatting
- Google Docs API integration

**Workaround:**
- User can copy HTML
- Print to PDF from browser
- Manual Docs import

## Best Practices

### Planning

**Do:**
- Start planning before day 1
- Seed plan early
- Personalize for company
- Set realistic milestones
- Break down big tasks
- Tag by category

**Don't:**
- Overcommit in first 30 days
- Skip stakeholder mapping
- Forget to track evidence
- Ignore manager feedback

### Stakeholder Management

**Do:**
- Map all key stakeholders early
- Schedule 1:1s proactively
- Document conversations
- Build relationships intentionally
- Update influence/interest as you learn

**Don't:**
- Focus only on manager
- Neglect cross-functional partners
- Skip low-influence/high-interest folks
- Forget to follow up

### OKRs

**Do:**
- Align with team/company OKRs
- Make KRs measurable
- Set realistic targets
- Track progress weekly
- Link evidence to KRs

**Don't:**
- Set too many objectives (max 3-5)
- Use vague KRs ("improve quality")
- Ignore confidence levels
- Wait until review to track

### Weekly Reports

**Do:**
- Send consistently (same day/time)
- Be concise (3-5 bullets per section)
- Include OKR progress
- Highlight wins
- Be transparent about risks
- Ask for help clearly

**Don't:**
- Skip when busy
- Over-detail
- Only report problems
- Surprise with risks
- Forget to celebrate wins

### Evidence Collection

**Do:**
- Capture wins in real-time
- Tag by OKR/project
- Include quantitative data
- Save links and screenshots
- Prepare for reviews early

**Don't:**
- Wait until review time
- Rely on memory
- Skip "small" wins
- Ignore team contributions

## Future Enhancements

### Short-Term

1. **Full Calendar Integration:**
   - List recent events
   - Auto-suggest highlights
   - Meeting sentiment tracking

2. **Enhanced 1:1s:**
   - Recurring series support
   - Agenda templates
   - Action item dashboard
   - Trend analysis

3. **Richer Evidence:**
   - Screenshot uploads
   - Link previews
   - Metric charts
   - Team testimonials

### Medium-Term

4. **Stakeholder Analytics:**
   - Interaction frequency
   - Sentiment trends
   - Relationship health
   - Network visualization

5. **Learning Roadmap:**
   - Skill gap analysis
   - Course recommendations
   - Certification tracking
   - Mentor matching

6. **Risk Register:**
   - Risk categorization
   - Mitigation plans
   - Escalation workflows
   - Impact assessment

### Long-Term

7. **Team Onboarding:**
   - Manager view
   - Team dashboards
   - Onboarding playbooks
   - Peer buddy system

8. **AI Coaching:**
   - Proactive suggestions
   - Pattern recognition
   - Best practice tips
   - Career path guidance

## Troubleshooting

### Plan Not Personalizing

**Problem:** AI button doesn't add tasks

**Solution:**
1. Check internet connection
2. Verify Step 31 AI is configured
3. Seed plan first (need base tasks)
4. Check browser console for errors
5. Try again (temporary AI failure)

### 1:1 Not Scheduling

**Problem:** Calendar event not created

**Solution:**
1. Check Gmail account connected (Step 35)
2. Verify OAuth token valid
3. Check calendar permissions
4. Manually create as fallback
5. Review browser console

### Weekly Report Not Sending

**Problem:** Email fails to send

**Solution:**
1. Verify Gmail bearer token
2. Check recipient email addresses
3. Review email content (no script tags)
4. Check Gmail sending limits
5. Use fallback: copy HTML and send manually

### Evidence Not Exporting

**Problem:** PDF/Docs export fails

**Solution:**
1. Check browser blob support
2. Verify evidence items exist
3. Try PDF first (simpler)
4. Manual export: copy HTML and paste
5. Use print-to-PDF as fallback

## References

- Onboarding Best Practices: https://www.officevibe.com/blog/employee-onboarding
- OKR Guide: https://www.whatmatters.com/get-started
- 1:1 Templates: https://www.fellow.app/blog/meetings/one-on-one-meeting-template/
- First 90 Days: https://hbr.org/2016/10/your-first-90-days-in-a-new-role
- Stakeholder Management: https://www.pmi.org/learning/library/stakeholder-management-task-project-success-7736
