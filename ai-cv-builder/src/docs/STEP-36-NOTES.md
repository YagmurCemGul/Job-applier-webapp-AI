# Step 36: Interview Management Suite — Implementation Notes

## Overview

The Interview Management Suite provides end-to-end interview orchestration, from scheduling to decision-making, with AI-powered insights, bias mitigation, and comprehensive scorecard evaluation.

## Features Implemented

### 1. Interview Planning & Scheduling

**Multi-Attendee Availability**
- Smart slot proposal considering all panelists' calendars
- Business hours filtering (9 AM - 5 PM, weekdays)
- Conflict detection across multiple attendees
- Timezone-aware scheduling

**Calendar Integration**
- Google Calendar event creation via Step 35 OAuth
- Automatic Google Meet link generation
- Email invitations to all participants
- ICS attachment support

**Panel Management**
- Add/remove panelists with roles
- Mark panelists as required/optional
- Validate availability for required panelists only

### 2. Scorecard System

**Template Creation**
- Custom evaluation dimensions with weights
- 1-5 rating scale with customizable rubric
- Role-specific templates
- Dimension descriptions and guidance

**Independent Scoring**
- Each panelist submits ratings independently
- Dimension-level scores with optional notes
- Overall rating and final recommendation
- Timestamp tracking for submission order

**Score Aggregation**
- Weighted dimension averages
- Variance calculation to detect disagreement
- Recommendation distribution analysis
- Export to PDF or Google Docs

### 3. Interview Recording & Transcription

**Consent Management**
- Prominent consent banner with retention policy
- Explicit consent checkbox before recording
- Timestamp of consent capture
- Link to privacy documentation

**Transcription (Web Speech API Fallback)**
- Browser-based speech recognition
- Real-time segment capture
- Speaker identification (Interviewer/Candidate/System)
- Multi-language support (EN/TR)
- Pluggable ASR provider architecture

**Provider Abstraction**
```typescript
interface ASRProvider {
  start(lang: 'en'|'tr', onSegment: (seg) => void): Promise<void>;
  stop(): Promise<void>;
}
```

Production implementations can swap Web Speech API with:
- Azure Speech Services
- Google Cloud Speech-to-Text
- AWS Transcribe
- AssemblyAI

### 4. AI-Powered Insights

**Transcript Analysis** (via Step 31 AI Orchestrator)
- Concise interview summary
- STAR story extraction (Situation, Task, Action, Result)
- Candidate strengths identification
- Concerns and risk flags detection

**STAR Pattern Matching**
- Keyword-based heuristics for STAR indicators
- Fallback when AI service unavailable
- Quantifiable impact emphasis

**Risk Flag Detection**
- Vague impact statements ("helped the team")
- Lack of ownership indicators
- Missing quantifiable results
- Communication clarity issues

### 5. Bias Mitigation

**Real-Time Bias Tips**
Triggered on specific phrases in notes:

| Pattern | Category | Tip |
|---------|----------|-----|
| "culture fit" | Similarity | Use "culture add" instead to value diverse perspectives |
| "communication issue" | Vagueness | Link to concrete examples with measurable impact |
| "likeable", "nice" | Similarity | Focus on job-relevant competencies, not personality |
| "aggressive", "bossy" | Stereotyping | Describe specific behaviors objectively |
| "too young/old" | Stereotyping | Focus on skills and growth potential |
| "gut feeling" | Halo Effect | Ground feedback in observable behaviors |

**Bias Awareness Guidelines**
- Culture Add vs. Culture Fit
- Specific & Observable Feedback
- Structured Evaluation with Consistent Rubrics
- Diverse Panel Composition
- Independent Note-Taking
- Potential-Based Assessment

### 6. Offer Preparation

**Compensation Bands**
Default bands included (customizable):

| Level | Base (USD) | Equity % |
|-------|-----------|----------|
| Junior | $60K - $80K | 0.01% - 0.05% |
| Mid-Level | $80K - $120K | 0.05% - 0.15% |
| Senior | $120K - $160K | 0.1% - 0.3% |
| Staff | $160K - $220K | 0.2% - 0.5% |
| Principal | $220K - $300K | 0.3% - 0.8% |

**Offer Letter Generation**
- Template-based letter with candidate details
- Base salary, equity, start date
- Benefits enumeration
- Export to PDF or Google Docs
- Email via Step 35 Gmail integration

### 7. Question Bank

**Pre-Loaded Categories**
- Behavioral
- Technical
- System Design
- Leadership
- Culture

**Sample Questions**
- "Tell me about a time you faced a significant technical challenge..."
- "Describe your experience with system design..."
- "How do you handle disagreements with teammates?"
- Multi-language support (EN/TR)

## Data Model

### Interview
```typescript
interface Interview {
  id: string;
  applicationId: string;
  candidateName: string;
  candidateEmail?: string;
  role: string;
  company: string;
  stage: 'planned' | 'scheduled' | 'in_progress' | 'completed' | 'canceled';
  meeting?: {
    provider: 'google_meet' | 'zoom' | 'other';
    link?: string;
    calendarEventId?: string;
    whenISO?: string;
    durationMin: number;
  };
  panel: Panelist[];
  consent: { recordingAllowed: boolean; capturedAt?: string };
  scorecardTemplateId?: string;
  scoreSubmissions: string[];
  transcriptId?: string;
  notes?: string;
}
```

### Scorecard Template
```typescript
interface ScorecardTemplate {
  id: string;
  name: string;
  role?: string;
  dimensions: ScoreDimension[];
  rubric?: Record<Scale, string>;
}

interface ScoreDimension {
  id: string;
  name: string;
  description?: string;
  weight?: number; // default 1.0
}
```

### Transcript
```typescript
interface Transcript {
  id: string;
  interviewId: string;
  language: 'en' | 'tr';
  segments: Array<{
    id: string;
    atMs: number;
    durMs: number;
    speaker: 'Interviewer' | 'Candidate' | 'System';
    text: string;
  }>;
  ai?: {
    summary?: string;
    star?: Array<{ situation, task, action, result }>;
    strengths?: string[];
    concerns?: string[];
    riskFlags?: string[];
  };
}
```

## Privacy & Compliance

### Recording Consent
- **Explicit Consent Required**: Users must check consent checkbox before any recording
- **Consent Timestamp**: Captured and stored with interview record
- **Visible Banner**: Yellow alert banner with retention policy link
- **No Auto-Recording**: Recording only starts on explicit user action

### Data Retention
- **Local Storage**: All interview data stored in browser localStorage by default
- **Configurable Retention**: 30/60/90 day retention windows (to be implemented in settings)
- **PII Minimization**: Store only necessary candidate information
- **Secure Deletion**: Clear transcripts and recordings after retention period

### Bias & Compliance
- **Structured Evaluation**: Scorecards ensure consistent, comparable assessments
- **Audit Trail**: All score submissions timestamped and attributed
- **Diverse Perspectives**: Multi-panelist requirement encourages diverse input
- **Documentation**: Clear guidelines on bias awareness

## Accessibility (WCAG AA)

### Keyboard Navigation
- All scorecard inputs navigable via keyboard
- Slider controls support arrow keys
- Focus visible on all interactive elements
- Tab order follows logical flow

### Screen Reader Support
- ARIA labels on all form inputs
- Live regions for recording state updates
- Descriptive button labels
- Semantic HTML structure

### Visual Accessibility
- High contrast focus indicators
- Color not sole information carrier
- Text meets 4.5:1 contrast ratio
- Resizable text up to 200%

## Security Considerations

### Authentication & Authorization
- Interview data scoped to authenticated user
- OAuth tokens never logged or exposed in UI
- Secure bearer token handling via Step 35 services

### Data Protection
- No raw audio uploaded without explicit user action
- Transcripts stored encrypted in localStorage
- Meeting links contain minimal PII
- Calendar API calls use secure HTTPS

## Performance

### Optimizations
- Lazy loading of interview detail tabs
- Debounced bias tip checking
- Chunked transcript rendering (600px max-height scroll)
- Memoized score aggregation calculations

### Scalability
- Store architecture supports 1000+ interviews
- Efficient filtering and search on client
- Paginated submission lists (future enhancement)

## Testing Coverage

### Unit Tests (Vitest)
- `scheduling.merge.spec.ts`: Slot proposal, conflict detection, business hours
- `score.aggregate.spec.ts`: Weighted averages, variance, edge cases
- `transcript.chunk.spec.ts`: Segment ordering, search, multi-language
- `ai.notes.spec.ts`: STAR extraction, fallback handling

### Integration Tests
- `schedule_invite.spec.ts`: Calendar event creation, invite sending
- `score_end_to_end.spec.ts`: Template → submission → aggregation → export

### E2E Tests (Playwright)
- `step36-interview-flow.spec.ts`: Complete workflow from creation to decision

## Known Limitations

### Recording
- **Browser Dependency**: Web Speech API not supported in all browsers
- **No Audio Storage**: Current implementation doesn't store raw audio files
- **Limited Accuracy**: Browser ASR less accurate than cloud services

### Scheduling
- **Mock Availability**: Currently uses mock busy windows; production needs real calendar API integration
- **Timezone Handling**: Basic timezone support; complex scenarios may need enhancement
- **Multi-Day Events**: Slot proposal limited to single-day windows

### Export
- **PDF Quality**: Fallback HTML export when jsPDF unavailable
- **Google Docs Formatting**: Plain text only; rich formatting in future enhancement

## Future Enhancements

1. **Advanced Scheduling**
   - Integration with Calendly/Cal.com
   - Multi-timezone visual availability grid
   - Recurring interview slots

2. **Enhanced Transcription**
   - Speaker diarization
   - Punctuation and formatting
   - Video recording support
   - Cloud ASR integration

3. **AI Features**
   - Automated question suggestions based on role
   - Sentiment analysis
   - Interviewer coaching tips
   - Candidate response quality scoring

4. **Collaboration**
   - Real-time collaborative note-taking
   - Chat during remote interviews
   - Screen sharing integration

5. **Analytics**
   - Interview performance metrics
   - Panelist calibration analysis
   - Time-to-hire tracking
   - Offer acceptance rates

## Integration Points

### Step 27 (Profile)
- Pull candidate details from profile store
- Link interview results to candidate profile

### Step 30 (Cover Letters)
- Access cover letter for interview prep
- Reference candidate's self-presentation

### Step 31 (AI Orchestrator)
- Transcript summarization
- STAR story extraction
- Risk flag detection

### Step 32 (Jobs)
- Pull job description for interview context
- Match interview questions to job requirements

### Step 33 (Applications)
- Create interviews from application pipeline
- Update application stage on interview completion
- Link interview results to application timeline

### Step 35 (Gmail/Calendar)
- Calendar event creation
- Email invitations and follow-ups
- OAuth bearer token management

## Usage Examples

### Creating an Interview from Application
```typescript
// From ApplicationDetailDrawer
const handleCreateInterview = () => {
  window.location.href = `/interviews?createFrom=${applicationId}`;
};
```

### Scheduling with Multi-Panelist Availability
```typescript
const { slots } = mergeAvailabilities(
  [
    { busy: [['2025-10-10T10:00:00Z', '2025-10-10T11:00:00Z']] },
    { busy: [['2025-10-10T14:00:00Z', '2025-10-10T15:00:00Z']] }
  ],
  {
    startISO: '2025-10-10T09:00:00Z',
    endISO: '2025-10-10T17:00:00Z',
    durationMin: 60,
    businessHoursOnly: true
  }
);
```

### Submitting Scorecard
```typescript
const submission: ScoreSubmission = {
  id: crypto.randomUUID(),
  interviewId: interview.id,
  panelistId: 'alice@company.com',
  ratings: [
    { dimensionId: 'coding', score: 5, note: 'Excellent problem solving' },
    { dimensionId: 'design', score: 4 }
  ],
  overall: 4,
  recommendation: 'strong_yes',
  submittedAt: new Date().toISOString()
};

useScorecards.getState().upsertSubmission(submission);
```

### Recording & Transcription
```typescript
const asr = getASRProvider();
await asr.start('en', segment => {
  segments.push(segment);
  setTranscript(makeTranscript(interviewId, 'en', segments));
});
```

### Bias Tips
```typescript
const tips = biasTips("Candidate has good culture fit");
// Returns: ["Consider 'culture add' instead of 'fit'..."]
```

## Troubleshooting

### Recording Not Starting
- Check browser compatibility (Chrome/Edge recommended)
- Verify microphone permissions granted
- Ensure HTTPS connection (Web Speech API requirement)

### Calendar Event Creation Fails
- Verify OAuth token validity
- Check Google Calendar API quota
- Ensure correct bearer token in Step 35

### Scores Not Aggregating
- Verify all dimension IDs match template
- Check for missing ratings
- Ensure submissions linked to interview

### Export Not Working
- Check jsPDF dependency installed
- Verify Google Docs API access
- Check browser popup blocker settings

## Support & Resources

- **Bias Training**: [Link to bias awareness resources]
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **Web Speech API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- **Google Calendar API**: https://developers.google.com/calendar
- **Step 31 AI Docs**: See `STEP-31-COMPLETION.md`
- **Step 35 Integration Docs**: See `STEP-35-COMPLETION-REPORT.md`

---

**Version**: 1.0  
**Last Updated**: 2025-10-08  
**Maintainer**: AI CV Builder Team
