# Step 43 — Interview Coach & Scheduler: Implementation Notes

## Overview

Step 43 implements a complete Interview Coach & Scheduler system that helps users prepare for, conduct, and follow up on job interviews. The system integrates with previous steps (Evidence/OKRs, Self-Review, Portfolio, Networking, Applications) to provide a comprehensive interview preparation platform.

## Architecture

### Core Components

#### 1. **Interview Planning** (`Planner.tsx`, `scheduler.service.ts`)
- Create interview plans with company, role, type, and scheduling details
- Timezone-aware scheduling with quiet hours respect (22:00–07:00 local)
- Conflict detection to prevent overlapping interviews
- Google Calendar integration via Step 35 OAuth

#### 2. **Question Bank** (`QuestionBank.tsx`, `questionBank.service.ts`)
- Pre-seeded default questions (behavioral, system design, coding, product, analytics)
- AI-powered question generation from job descriptions
- Filtering by type, tags, difficulty, and search
- Support for custom questions

#### 3. **STAR Story Builder** (`StoryBuilder.tsx`, `storyBuilder.service.ts`)
- Guided creation of STAR (Situation, Task, Action, Result) stories
- Auto-pulls context from Evidence (Step 38), quotes from Self-Review (Step 39), and links from Portfolio (Step 40)
- Metrics tracking and portfolio linking
- Export as formatted bullet points

#### 4. **Mock Interview Room** (`MockRoom.tsx`, `Recorder.tsx`)
- Consent-first recording (audio/video)
- Live question prompts with relevant STAR story suggestions
- Timer with visual countdown
- MediaRecorder API with time-sliced recording (250ms chunks for memory efficiency)

#### 5. **Transcription** (`transcribe.stub.service.ts`)
- **Privacy-first**: Local stub only, no upload by default
- Heuristic-based duration estimation (~128KB/min)
- Manual segment creation via UI notes
- Filler word counting and WPM calculation

#### 6. **Feedback & Rubric** (`RubricPanel.tsx`, `FeedbackPanel.tsx`, `feedback.service.ts`)
- Multiple rubric templates (Behavioral, System Design, Coding)
- Weighted scoring (0-4 scale per competency)
- AI-generated feedback with redaction of emails/phones
- Explainable scoring with competency breakdown

#### 7. **Follow-up & Scheduling** (`Followups.tsx`, `emailFollowup.service.ts`)
- Thank-you email templates (same-day)
- Follow-up email templates (5-7 days post-interview)
- Gmail integration via Step 35
- Calendar reminder scheduling

#### 8. **Tracker** (`TrackerBoard.tsx`)
- Upcoming and past interviews
- Integration with Pipeline (Step 41) and Applications (Step 33)
- Quick status updates

## Data Flow

```
1. Plan Interview → Create InterviewPlan
2. Select Questions → Filter from QuestionBank
3. Prepare Stories → Build STAR stories
4. Run Mock → Record with consent
5. Stop Recording → Generate transcript (stub)
6. Score Performance → Apply rubric
7. Get Feedback → AI-generated insights
8. Send Follow-up → Gmail + Calendar
9. Update Tracker → Sync with Pipeline
```

## Privacy & Compliance

### Consent Management
- **Explicit consent required** before any recording
- Separate consent for audio, video, and transcription
- Visual recording indicator (red dot, "Recording…" text)
- Easy stop/delete controls

### Data Storage
- **Local-first**: Transcripts and recordings stored in browser only
- Object URLs for media playback (revocable)
- No automatic upload to external services
- User-initiated export only (PDF/Google Docs)

### Redaction
- Email addresses → `[redacted-email]`
- Phone numbers → `[redacted-phone]`
- Applied before AI feedback generation
- Regex-based with comprehensive pattern matching

### Fairness
- Rubrics focus on **competencies** (communication, problem-solving, impact)
- Avoid protected attributes (age, gender, race, etc.)
- Explainable scoring with clear competency breakdown
- No personality judgments in AI feedback

## Accessibility (WCAG AA)

### Keyboard Navigation
- Full tab order through all controls
- Shortcuts: **Space** (start/stop), **M** (mute - future enhancement)
- Enter key submission for forms

### Screen Readers
- ARIA live regions for timer updates (`role="timer"`, `aria-live="polite"`)
- ARIA labels for all form inputs
- Semantic HTML (headings, landmarks, lists)
- Error messages with `aria-describedby`

### Visual
- High contrast timer display
- Recording indicator with color + text + icon
- Status announcements for state changes
- Caption support from transcript segments

### Captions
- Transcript segments rendered as timed captions
- Editable for corrections
- Exportable with timestamps

## Performance Optimizations

### Recording
- **Time-sliced recording** (250ms chunks) to limit memory growth
- Object URL management (create → use → revoke)
- Blob streaming for large recordings

### Transcription
- **Chunking service** splits text at sentence boundaries (~2k chars)
- Time-based chunking for long sessions
- Small segment merging (< 5s) for cleaner output

### AI Calls
- Transcript truncation (8000 chars) before feedback
- Chunk-based processing for long transcripts
- Error handling with graceful degradation

## Integration Points

### Step 33 (Applications)
- `applicationId` link in InterviewPlan
- "Schedule Interview" action creates plan
- "Start Mock" prefills questions from JD

### Step 35 (Calendar/Gmail)
- OAuth bearer token retrieval
- Calendar event creation with `calendarCreate`
- Email sending via `sendFollowUp`

### Step 38 (Evidence/OKRs)
- Pull evidence titles/descriptions for STAR Situation
- Link metrics from OKRs to Story metrics

### Step 39 (Self-Review)
- Extract quotes for STAR Result section
- Pull highlights as story prompts

### Step 40 (Portfolio)
- Link portfolio URLs to stories
- Include in interview packet export

### Step 41 (Pipeline)
- `pipelineItemId` link in InterviewPlan
- Update pipeline stage after interview
- Contact autocomplete for interviewer field

## Testing Strategy

### Unit Tests (8 files)
1. **question_bank.spec.ts**: Seeding, JD generation, filtering
2. **story_builder.spec.ts**: Draft creation, persistence, formatting
3. **scheduler_slots.spec.ts**: Conflict detection, quiet hours
4. **recorder_chunking.spec.ts**: Media recorder, text chunking
5. **transcribe_stub.spec.ts**: Local transcription, WPM, fillers
6. **rubric_scoring.spec.ts**: Weighted scoring, validation
7. **feedback_redaction.spec.ts**: PII redaction
8. **export_packet.spec.ts**: HTML generation, PDF/GDoc export

### Integration Tests (3 files)
1. **plan_mock_feedback.spec.ts**: Full flow from plan to feedback
2. **email_followup_calendar.spec.ts**: Follow-up + calendar integration
3. **pipeline_update_flow.spec.ts**: Pipeline/application status sync

### E2E Test
- **step43-interview-coach.spec.ts**: End-to-end user flows

## Security Considerations

### OAuth Token Handling
- Tokens never logged
- Passphrase-encrypted storage (Step 35)
- Automatic token refresh

### Media Access
- Browser permission dialogs
- No cross-origin mic/cam leaks
- Secure context (HTTPS) required for getUserMedia

### Content Security Policy
- Allow `blob:` URLs for media playback
- Restrict `unsafe-inline` scripts
- Whitelist Google APIs

## Extensibility

### Future Enhancements
1. **Real STT Provider**: Replace stub with Web Speech API or cloud provider
2. **Coding Environment**: Integrated IDE for coding interviews
3. **Role-Specific Rubrics**: Custom rubrics per job family
4. **Peer Review**: Share sessions for feedback
5. **Video Analysis**: Posture, eye contact, gestures (with consent)
6. **Multi-Language**: Expand beyond en/tr
7. **Mobile App**: React Native version

### Plugin Architecture
- Service abstraction for transcription (`TranscriptionProvider`)
- Rubric registry for custom rubrics
- Export format plugins (PDF, DOCX, Markdown)

## Known Limitations

1. **Transcription**: Stub only; no real STT integration
2. **Browser Support**: MediaRecorder not supported in older browsers
3. **Recording Format**: WebM may not play on all devices
4. **Timezone**: Relies on Intl API (may need polyfill)
5. **Offline**: No offline sync; local storage only

## Migration Notes

### From Previous Steps
- No breaking changes to existing stores
- Additive-only to Applications page
- New route: `/interview`

### Data Migration
- No existing data to migrate (new feature)
- Stores auto-initialize on first use
- Graceful handling of missing links

## Monitoring & Analytics

### Metrics to Track
- Mock interview completion rate
- Average rubric scores over time
- Question usage frequency
- Story reuse rate
- Follow-up email send rate

### Error Tracking
- Media access denials
- Transcription failures
- AI generation errors
- Export failures

## Deployment Checklist

- [ ] Environment variables set (VITE_GOOGLE_CLIENT_ID)
- [ ] OAuth consent screen configured
- [ ] HTTPS enabled for getUserMedia
- [ ] CSP headers configured
- [ ] Sentry/error tracking initialized
- [ ] i18n strings reviewed
- [ ] A11y audit passed
- [ ] Performance budget met
- [ ] Tests passing (unit + integration + e2e)

## References

- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/)
- [STAR Method](https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique)
- [Behavioral Interview Guide](https://www.indeed.com/career-advice/interviewing/common-behavioral-interview-questions)

---

**Last Updated**: 2025-10-09  
**Author**: Step 43 Implementation  
**Status**: ✅ Complete
