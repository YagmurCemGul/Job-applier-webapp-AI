# Step 36: Interview Management Suite

## Overview

This step implements a complete Interview Management Suite with scheduling, scorecards, transcription, AI notes, and offer preparation. The system is tightly integrated with Steps 27-35 to provide end-to-end interview workflow management.

## Core Features

### 1. Interview Planning & Scheduling

**Interview Creation:**
- Create interviews from Applications (Step 33)
- Auto-populate candidate and role details
- Set duration and meeting provider
- Build interview panel with roles

**Smart Scheduling:**
- Multi-panelist availability merging
- Proposes feasible time slots (business hours)
- Excludes busy windows across all panelists
- Creates Google Calendar events (Step 35)
- Sends email invites via Gmail (Step 35)

**Panel Management:**
- Add/remove panelists
- Mark panelists as required/optional
- Assign roles (e.g., "Hiring Manager")
- Email notifications for scheduling

### 2. Scorecard System

**Templates:**
- Define evaluation dimensions
- Assign weights to dimensions
- Create rubric scales (1-5)
- Role-specific templates

**Submissions:**
- Independent panelist scoring
- Per-dimension ratings with notes
- Overall score and recommendation
- Submission tracking

**Aggregation:**
- Weighted dimension averages
- Variance calculation
- Recommendation tally
- Confidence scoring

**Export:**
- PDF export with full summary
- Google Docs format (HTML)
- Email via Step 35

### 3. Transcription & AI Notes

**Recording Consent:**
- Prominent consent banner
- Explicit checkbox requirement
- Timestamp tracking
- Privacy compliance

**Transcription:**
- Web Speech API fallback (browser support)
- Provider-agnostic ASR interface
- Segment-by-segment capture
- Speaker identification

**AI Analysis:**
- Summary generation (Step 31)
- STAR story extraction
- Strengths identification
- Concerns flagging
- Risk detection

**Bias Guard:**
- Real-time phrase detection
- Inline tips and guidance
- Policy recommendations
- Objective language promotion

### 4. Offer Preparation

**Compensation Bands:**
- Level-based recommendations
- Base salary ranges
- Equity percentage ranges
- Currency support

**Offer Generation:**
- Recommended base/equity
- Editable offer details
- Export to PDF/Docs
- Email via Step 35

## Architecture

### Type System

```typescript
// Interview stages
type InterviewStage =
  | 'planned'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'canceled'

// Interview record
interface Interview {
  id: string
  applicationId: string // Step 33 link
  candidateName: string
  candidateEmail?: string
  role: string
  company: string
  stage: InterviewStage
  meeting?: MeetingDetails
  panel: Panelist[]
  consent: ConsentDetails
  scorecardTemplateId?: string
  scoreSubmissions: string[]
  transcriptId?: string
  notes?: string
}

// Scorecard template
interface ScorecardTemplate {
  id: string
  name: string
  role?: string
  dimensions: ScoreDimension[]
  rubric?: Record<Scale, string>
}

// Transcript
interface Transcript {
  id: string
  interviewId: string
  language: 'en' | 'tr'
  segments: Segment[]
  ai?: AIAnalysis
}
```

### Stores

**interviewsStore:**
- CRUD operations
- Stage management
- Application filtering
- Persistence (localStorage)

**scorecardsStore:**
- Template management
- Submission tracking
- Interview-based queries
- Persistence (localStorage)

**questionBankStore:**
- Question library
- Tag-based organization
- Multi-language support
- Persistence (localStorage)

### Services

**Scheduling Service:**
```typescript
// Merge availabilities across panelists
mergeAvailabilities(panels, base): CalendarProposal

// Create calendar event
createInterviewEvent(opts): Promise<CalendarEvent>
```

**Transcription Service:**
```typescript
// ASR provider interface
interface ASRProvider {
  start(lang, onSegment): Promise<void>
  stop(): Promise<void>
}

// Web Speech implementation
class WebSpeechASR implements ASRProvider
```

**AI Notes Service:**
```typescript
// Analyze transcript
analyzeTranscript(transcript): Promise<AIAnalysis>
  Returns:
    - summary: string
    - star: STAR[]
    - strengths: string[]
    - concerns: string[]
    - riskFlags: string[]
```

**Bias Guard Service:**
```typescript
// Check text for bias triggers
biasTips(text): string[]
  Detects:
    - "culture fit" → suggest "culture add"
    - "communication issue" → ask for examples
    - "likeable/nice" → focus on competencies
    - age-related terms
    - gender-coded language
```

**Offer Prep Service:**
```typescript
// Recommend compensation
recommendOffer(level, bands): Recommendation
  Calculates:
    - base: (min + max) / 2
    - equityPct: (min + max) / 2
    - currency
```

## UI Components

### Main Pages

**InterviewsPage:**
- List all interviews
- Filter by stage, search
- Quick actions (Schedule, Score, Notes)
- Create new interview

**InterviewDetail:**
- Header with candidate info
- Stage badge and quick actions
- 6-tab interface:
  1. Overview
  2. Schedule
  3. Scorecards
  4. Notes & Transcript
  5. Files
  6. Emails

### Tab Components

**OverviewTab:**
- Candidate information
- Interview details
- Panel list
- Match score (from Step 33)

**ScheduleTab:**
- Panel editor
- Availability picker
- Meeting details
- Create event / Send invites

**ScorecardsTab:**
- Template display
- Submission list
- Score summary with aggregates
- Export options

**NotesTranscriptTab:**
- Consent banner
- Note-taking area
- Bias guard tips
- Recording controls
- Transcript viewer
- AI summarize button

**FilesTab:**
- File attachments (future)

**EmailsTab:**
- Email integration (future)

### Supporting Components

**PanelEditor:**
- Add/remove panelists
- Set roles and requirements
- Email input validation

**AvailabilityPicker:**
- Displays proposed slots
- Shows next 3 days
- Business hours filtering
- Click to select

**ConsentBanner:**
- Prominent yellow warning
- Checkbox for consent
- Legal notice text
- Timestamp capture

**ScoreSummary:**
- Dimension scores with variance
- Overall average
- Recommendation tally
- Export buttons (PDF/Docs)

## Integration Points

### Step 27 (Profile)
```typescript
// Use candidate data for interview
candidateName: cv.personalInfo.fullName
candidateEmail: cv.personalInfo.email
```

### Step 29 (Variants)
```typescript
// Attach CV to interview
files: [cvVariantPDF]
```

### Step 30 (Cover Letters)
```typescript
// Attach cover letter
files: [coverLetterPDF]
```

### Step 31 (AI Orchestrator)
```typescript
// AI analysis of transcript
analyzeTranscript(transcript)
  → Uses aiRoute() for LLM call
  → Returns STAR, strengths, concerns
```

### Step 32 (Jobs)
```typescript
// Create interview from job
jobId → applicationId → interview
```

### Step 33 (Applications)
```typescript
// Link interview to application
interview.applicationId = application.id

// Update application stage
if (interview.stage === 'completed') {
  application.stage = 'interview'
}
```

### Step 35 (Gmail/Calendar)
```typescript
// Create calendar event
createInterviewEvent()
  → Uses getBearer() for OAuth
  → Calls calendarCreate()

// Send invites
sendInvites()
  → Uses Gmail API via Step 35
  → Template rendering
```

## Scheduling Algorithm

### Availability Merging

```typescript
mergeAvailabilities(panels, base):
  1. Generate base slots (hourly, business hours)
  2. For each slot:
     a. Check if overlaps any panelist's busy window
     b. If overlap: exclude slot
     c. If no overlap: include slot
  3. Return filtered slots

Example:
  Panel A busy: 9-10am, 2-3pm
  Panel B busy: 11-12pm
  
  Base slots: 8am, 9am, 10am, 11am, 12pm, 1pm, 2pm, 3pm, 4pm
  
  Filtered: 8am, 10am, 12pm, 1pm, 3pm, 4pm
```

## Scorecard Aggregation

### Weighted Averages

```typescript
For each dimension:
  scores = submissions
    .flatMap(s => s.ratings)
    .filter(r => r.dimensionId === dimension.id)
    .map(r => r.score)
  
  avg = sum(scores) / count(scores)
  
  variance = sum((score - avg)^2) / (count - 1)

Overall:
  overallScores = submissions
    .filter(s => s.overall exists)
    .map(s => s.overall)
  
  overallAvg = sum(overallScores) / count(overallScores)
```

### Recommendation Tally

```typescript
recommendations = {}
for submission in submissions:
  rec = submission.recommendation
  recommendations[rec] = (recommendations[rec] || 0) + 1

Example:
  {
    'strong_yes': 2,
    'yes': 3,
    'lean_yes': 1,
    'no': 0,
    'strong_no': 0
  }
```

## Transcription

### Web Speech API

```typescript
WebSpeechASR:
  start(lang, onSegment):
    1. Check browser support
    2. Create SpeechRecognition instance
    3. Set language (en-US or tr-TR)
    4. Set continuous mode
    5. Listen for results
    6. Call onSegment for each transcript
  
  stop():
    1. Stop recognition
    2. Clean up resources

Limitations:
  - Chrome/Edge only
  - Requires microphone permission
  - Internet connection needed
  - English/Turkish only in this implementation
```

### Segment Structure

```typescript
Segment:
  id: unique identifier
  atMs: timestamp in milliseconds
  durMs: duration
  speaker: 'Interviewer' | 'Candidate' | 'System'
  text: transcript text

Example:
  {
    id: '1',
    atMs: 0,
    durMs: 2000,
    speaker: 'Interviewer',
    text: 'Tell me about yourself'
  }
```

## AI Analysis

### STAR Extraction

```typescript
AI Prompt:
  "Extract STAR stories from the transcript.
   For each story, identify:
   - Situation: context
   - Task: goal
   - Action: what candidate did
   - Result: measurable outcome"

Example Output:
  {
    situation: "Team struggling with deployment pipeline",
    task: "Improve deployment frequency",
    action: "Implemented CI/CD automation",
    result: "Reduced deployment time by 80%"
  }
```

### Strengths & Concerns

```typescript
Strengths:
  - Technical depth in [area]
  - Clear communication
  - Problem-solving approach
  - Ownership and initiative
  - Impact measurement

Concerns:
  - Limited experience in [area]
  - Vague impact metrics
  - Communication gaps
  - Team collaboration examples
  - Scalability thinking
```

### Risk Flags

```typescript
Risk Flags:
  - "Vague impact" (no numbers)
  - "Unclear ownership" (used "we" excessively)
  - "Communication concerns" (interrupted, unclear)
  - "Technical gaps" (couldn't explain fundamentals)
  - "Culture fit concerns" (negative team comments)
```

## Bias Guard

### Detection Rules

```typescript
Rule 1: "culture fit" / "fit in"
  Tip: Consider "culture add" instead to reduce similarity bias

Rule 2: "communication issue"
  Tip: Link to concrete examples and impact

Rule 3: "likeable" / "nice"
  Tip: Focus on job-relevant competencies

Rule 4: "young" / "old" / "age"
  Tip: Avoid age-related comments

Rule 5: "aggressive" / "emotional"
  Tip: Use neutral, objective language
```

### Usage

```typescript
// Real-time as user types
onNotesChange(text):
  tips = biasTips(text)
  if (tips.length > 0):
    display warning banner
    show tips inline
```

## Offer Preparation

### Compensation Bands

```typescript
DEFAULT_COMP_BANDS:
  Junior:
    base: $60k-80k
    equity: 0.05%-0.15%
  
  Mid:
    base: $80k-120k
    equity: 0.1%-0.3%
  
  Senior:
    base: $120k-160k
    equity: 0.2%-0.5%
  
  Staff:
    base: $160k-220k
    equity: 0.3%-0.8%
  
  Principal:
    base: $220k-300k
    equity: 0.5%-1.2%
```

### Recommendation Logic

```typescript
recommendOffer(level, bands):
  band = bands.find(b => b.level === level)
  
  if not band:
    return { note: 'No band found' }
  
  base = (band.baseMin + band.baseMax) / 2
  equityPct = (band.equityPctMin + band.equityPctMax) / 2
  
  return {
    base: Math.round(base),
    equityPct,
    currency: band.currency
  }

Example:
  Level: "Senior"
  → base: $140k
  → equity: 0.35%
```

## Privacy & Compliance

### Consent Requirements

**Before Recording:**
1. Display ConsentBanner
2. Require checkbox acknowledgment
3. Capture timestamp
4. Store consent record

**Consent Record:**
```typescript
consent: {
  recordingAllowed: boolean
  capturedAt: string // ISO timestamp
}
```

**Legal Notice:**
"Before recording or transcribing this interview, ensure you have obtained explicit consent from the candidate. Recording without consent may violate privacy laws and regulations."

### Data Retention

**Default Policy:**
- Transcripts: 30 days
- Notes: 90 days
- Scores: Permanent (anonymized)
- Recordings: Not stored (live transcription only)

**Configurable:**
- retention.transcripts: 30 | 60 | 90 days
- retention.notes: 90 | 180 | 365 days
- retention.recordings: never (default)

### PII Protection

**Never Logged:**
- Audio recordings
- Candidate personal data
- Panelist personal data
- Meeting links

**Minimization:**
- Store only necessary data
- Anonymize after decision
- Delete after retention period

## Accessibility

### Keyboard Navigation

**InterviewsPage:**
- Tab to navigate cards
- Enter to open detail
- Arrow keys to select

**InterviewDetail:**
- Tab to navigate tabs
- Enter to activate
- Escape to close dialogs

**Scoring:**
- Arrow keys to select rating
- Tab to next dimension
- Enter to submit

### Screen Reader Support

**ARIA Labels:**
- All buttons labeled
- Form fields described
- Status updates announced
- Error messages clear

**Live Regions:**
- Recording status: aria-live="polite"
- Score updates: aria-live="polite"
- Errors: aria-live="assertive"

### Color Contrast

- Text: 4.5:1 minimum
- Buttons: 3:1 minimum
- Focus indicators: 3:1 minimum
- Consent banner: High contrast yellow/black

## Testing

### Unit Tests

**scheduling.merge.spec.ts:**
- Busy window exclusion
- Overlapping windows
- No busy windows
- Edge cases

**score.aggregate.spec.ts:**
- Weighted averages
- Variance calculation
- Missing scores
- Recommendation tally

**transcript.chunk.spec.ts:**
- Segment creation
- Speaker identification
- Language support
- ID uniqueness

**ai.notes.spec.ts:**
- Response parsing
- Missing fields
- STAR extraction
- Risk flagging

### Integration Tests

**schedule_invite.spec.ts:**
- Create interview
- Propose slots
- Create calendar event
- Send invites

**score_end_to_end.spec.ts:**
- Assign template
- Submit scores (2 panelists)
- Aggregate results
- Export PDF

### E2E Tests

**step36-interview-flow.spec.ts:**
1. Create interview from application
2. Add panel members
3. Schedule meeting
4. Record transcript (mock)
5. AI summarize
6. Submit scores
7. Aggregate results
8. Mark completed
9. Update application stage

## Known Limitations

### 1. Web Speech API

**Browser Support:**
- Chrome/Edge: Full support
- Firefox: Partial support
- Safari: Limited support

**Network Dependency:**
- Requires internet connection
- Uses Google's ASR service
- Privacy implications

**Language Support:**
- English (en-US)
- Turkish (tr-TR)
- Limited to browser capabilities

**Solution:**
- Provide server-side ASR option
- Support more providers (AWS Transcribe, Azure Speech)
- Offline mode with local models

### 2. Meeting Link Generation

**Current:**
- Google Meet: Via Calendar API
- Zoom: Manual link entry
- Other: Manual link entry

**Ideal:**
- Automatic Zoom link generation
- Teams integration
- Custom meeting platforms

### 3. Score Normalization

**Current:**
- Simple averages
- No outlier detection
- No rater bias correction

**Future:**
- Z-score normalization
- Detect and adjust for harsh/lenient raters
- Confidence intervals

### 4. Offer Preparation

**Current:**
- Static compensation bands
- Manual entry
- PDF/HTML export only

**Future:**
- Market data integration
- Location-based adjustments
- Digital signature support
- DocuSign integration

## Best Practices

### Interview Scheduling

**Do:**
- Confirm all panelists before scheduling
- Include buffer time between interviews
- Send calendar invites 48h+ in advance
- Include meeting link in invite

**Don't:**
- Schedule back-to-back interviews
- Skip consent for recording
- Assume availability without checking

### Scorecards

**Do:**
- Define clear rubric levels
- Weight dimensions appropriately
- Require notes for extreme scores (1 or 5)
- Review submissions before finalizing

**Don't:**
- Use vague dimension names
- Skip dimension descriptions
- Allow incomplete submissions

### Note-Taking

**Do:**
- Take notes during interview
- Use STAR format for examples
- Include specific quotes
- Review bias tips

**Don't:**
- Record opinions as facts
- Use subjective language
- Make assumptions
- Skip AI summary review

### Bias Mitigation

**Do:**
- Review bias tips before finalizing
- Use structured scorecards
- Focus on job-relevant competencies
- Compare to rubric, not other candidates

**Don't:**
- Use personality adjectives
- Make snap judgments
- Compare to "culture fit"
- Include protected characteristics

## Future Enhancements

### Short-Term

1. **Video Integration:**
   - Record video interviews
   - Automatic transcription
   - Speaker diarization
   - Video playback in UI

2. **Advanced Scheduling:**
   - Time zone intelligence
   - Optimal slot recommendation
   - Recurring interview series
   - Room booking integration

3. **Enhanced Scorecards:**
   - Custom scale (1-7, 1-10)
   - Conditional questions
   - Multi-stage scorecards
   - Comparative scoring

### Medium-Term

4. **Collaboration:**
   - Real-time note sharing
   - Panelist chat
   - Shared highlights
   - Collaborative decision

5. **Analytics:**
   - Interview funnel metrics
   - Panelist calibration
   - Time-to-hire tracking
   - Offer acceptance rate

6. **Integrations:**
   - ATS systems (Greenhouse, Lever)
   - HRIS (BambooHR, Workday)
   - Background check services
   - Reference check automation

### Long-Term

7. **AI Enhancements:**
   - Real-time coaching
   - Question suggestions
   - Sentiment analysis
   - Predictive hiring

8. **Mobile App:**
   - iOS/Android apps
   - Offline mode
   - Push notifications
   - Mobile-first interview experience

9. **Compliance:**
   - GDPR automation
   - EEO reporting
   - Audit logs
   - Data export/deletion

## Troubleshooting

### Recording Not Working

**Problem:** "ASR not supported on this browser"

**Solution:**
1. Use Chrome or Edge
2. Enable microphone permission
3. Check internet connection
4. Fallback to manual notes

### Availability Not Showing

**Problem:** No slots proposed

**Solution:**
1. Check date range (next 3 days)
2. Verify business hours (8 AM - 6 PM)
3. Check panelist busy windows
4. Expand time window

### Scores Not Aggregating

**Problem:** Summary shows 0 or NaN

**Solution:**
1. Ensure submissions exist
2. Check template matches
3. Verify dimension IDs
4. Review score values (1-5)

### Export Failing

**Problem:** PDF/Docs export errors

**Solution:**
1. Check browser console
2. Verify data completeness
3. Try smaller export
4. Check file permissions

## References

- Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- Google Calendar API: https://developers.google.com/calendar
- STAR Method: https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique
- Bias in Hiring: https://www.shrm.org/topics-tools/tools/toolkits/managing-employee-selection
- GDPR Compliance: https://gdpr.eu/
