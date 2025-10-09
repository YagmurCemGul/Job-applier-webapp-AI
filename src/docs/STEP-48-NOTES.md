# Step 48: Networking CRM & Outreach Sequencer

## Overview

A comprehensive **Networking CRM & Outreach Sequencer** that levels up the Networking/Pipeline (Step 41) with a full prospect database, reusable email templates, multi-step sequences with auto-follow-ups, A/B testing, warm-intro/referral workflows, scheduling links via Calendar (Step 35), sending and thread-tracking via Gmail (Step 35), and polished exports via Docs/PDF (Step 30).

## Core Features

### 1. Prospect Management
- **Import**: CSV import with deduplication by email+company
- **Enrichment**: Mock enrichment for company domain and role seniority
- **Lists & Tags**: Organize prospects into lists with custom tags
- **Suppression**: Do-not-contact list with manual/unsub/bounce reasons

### 2. Template System
- **Variable Interpolation**: `{{firstName}}`, `{{company}}`, `{{schedulerLink}}`, etc.
- **Snippet System**: Reusable text blocks like `{{snippet:intro}}`
- **Compliance Footer**: Automatic inclusion of unsubscribe link and postal address
- **Preview Mode**: Live preview with sample data

### 3. Sequence Builder
- **Step Types**: email, wait, task_manual
- **Rules**: Throttle per hour, daily cap, quiet hours
- **Stop Conditions**: Stop on reply, stop on unsubscribe
- **A/B Testing**: Optional variant testing with statistical significance

### 4. Campaign Runner
- **Throttling**: Enforces rate limits (default 30/hour, 150/day)
- **Suppression Checks**: Skips suppressed recipients
- **Quiet Hours**: Respects timezone-aware quiet hours (22:00–07:00)
- **Live Metrics**: Real-time tracking with aria-live updates

### 5. Tracking & Analytics
- **Event Types**: open, click, reply, bounce, unsub
- **Rollup Metrics**: Campaign-level aggregations
- **Log Storage**: Per-send logs with Gmail message IDs
- **Thread Tracking**: Links emails to Gmail threads

### 6. A/B Testing
- **Variants**: A/B split with custom goals (open_rate, reply_rate, click_rate)
- **Statistical Testing**: Z-test with 95% confidence level (|z| ≥ 1.96)
- **Auto Winner**: Automatic winner selection when significant
- **Proportions**: Displays success rates for both variants

### 7. Warm Intros & Referrals
- **Request Flow**: Select prospect, introducer, generate forwardable blurb
- **State Tracking**: requested → sent → intro_made → scheduled
- **Gmail Integration**: Sends intro request via Gmail
- **Portfolio Context**: Can include portfolio items in blurb

### 8. Scheduler Integration
- **Link Generation**: Creates bookable meeting links
- **Calendar Holds**: Creates placeholder events
- **Email Snippets**: Copy-paste HTML for templates
- **Timezone Support**: IANA timezone identifiers

### 9. Compliance & Safety
- **Consent-First**: Banner reminds users of consent requirements
- **Unsubscribe**: One-click unsubscribe with preferences page
- **Suppression List**: Email-based blocking (case-insensitive)
- **Rate Limits**: Prevents spam-like behavior
- **Quiet Hours**: No sends during sleep hours
- **Anti-Platform Automation**: Manual tasks only for LinkedIn/Twitter

### 10. Export & Reporting
- **Campaign Reports**: PDF or Google Doc export
- **Metrics Rollup**: Sent, delivered, opens, clicks, replies, bounces, unsubs
- **Pipeline Updates**: Syncs status to Pipeline (Step 41)

## Architecture

### Types
- `Prospect`: Core contact record with email, role, company, tags, status
- `Template`: Email template with variables and snippets
- `Sequence`: Multi-step workflow with rules and A/B config
- `Campaign`: Running instance of a sequence against a list
- `SendLog`: Individual send record with tracking data
- `TrackingEvent`: Open/click/reply/bounce/unsub events
- `Referral`: Warm intro request and state
- `SchedulerLink`: Meeting booking link
- `Suppression`: Do-not-contact record

### Services

#### Prospect Services
- `prospect.service.ts`: Upsert, dedupe, list creation
- `importCsv.service.ts`: CSV parsing with PapaParse
- `enrich.service.ts`: Mock enrichment (seniority, domain)

#### Template & Sequence Services
- `templates.service.ts`: Template rendering, snippet/variable replacement
- `sequence.service.ts`: Sequence creation with safety defaults

#### Campaign & Tracking Services
- `campaign.service.ts`: Campaign execution with throttle/suppression
- `tracking.service.ts`: Event tracking and metric rollup
- `abtest.service.ts`: Z-test winner selection

#### Integration Services
- `gmailOutreach.service.ts`: Gmail send with suppression check
- `referral.service.ts`: Warm intro request via Gmail
- `scheduler.service.ts`: Scheduler link creation
- `calendarLink.service.ts`: HTML snippet generator
- `suppression.service.ts`: Suppression management
- `exportReport.service.ts`: PDF/GDoc export

### UI Components

#### Core Components
- `OutreachDashboard.tsx`: KPIs and quick actions
- `ProspectTable.tsx`: Import, filter, enrich, suppress
- `TemplateEditor.tsx`: WYSIWYG with preview
- `SequenceBuilder.tsx`: Drag-drop steps, rules panel
- `CampaignRunner.tsx`: Start/pause, live logs, metrics
- `ABTestLab.tsx`: Variant metrics, winner selection
- `ReferralHub.tsx`: Intro request form, state tracking
- `SchedulerWidget.tsx`: Link creation, snippet copy
- `CompliancePanel.tsx`: Suppression list, footer editor
- `UnsubscribePreferences.tsx`: Standalone unsub page

#### Page
- `Outreach.tsx`: Tabbed interface with keyboard shortcuts (N/T/S/R)

### Store
- `outreach.store.ts`: Zustand store with LocalStorage persistence
- Arrays: prospects, lists, templates, sequences, campaigns, logs, events, referrals, schedulers, suppressions, exports
- Methods: upsertX, isSuppressed, byList

## Compliance & Safety

### Consent & Anti-Spam
- **Consent Banner**: "Consent-first outreach — one-click unsubscribe available."
- **Unsubscribe Link**: Required in all email footers
- **Suppression List**: Respects unsub/bounce/manual suppression
- **Rate Limits**: Throttle (30/hr) and daily cap (150/day) enforced
- **Quiet Hours**: No sends 22:00–07:00 local time

### Platform ToS Compliance
- **No Automation**: LinkedIn/Twitter steps are manual tasks only
- **Clear Identity**: Sender identity and postal address in footer
- **Opt-In**: Designed for warm leads and explicit consent

### Privacy
- **Minimal Storage**: Only necessary fields (email, name, role, company)
- **Redaction**: Option to redact personal info from exports
- **Suppression**: Easy suppression with multiple reasons

### Accessibility (WCAG AA)
- **Keyboard Navigation**: Tab order, focus states, shortcuts (N/T/S/R)
- **ARIA**: aria-live for metrics, role="status" for updates
- **Labels**: All form inputs have explicit labels
- **Contrast**: Compliant color schemes
- **Screen Reader**: Table captions, semantic HTML

## Testing

### Unit Tests (10)
1. `prospect_import.spec.ts`: CSV parsing, missing fields, tags
2. `dedupe_and_suppress.spec.ts`: Email+company dedupe, case-insensitive suppression
3. `template_render.spec.ts`: Variables, snippets, footer injection
4. `sequence_rules.spec.ts`: Default rules, stopOnReply/unsub
5. `campaign_throttle.spec.ts`: Rate limits, suppression
6. `tracking_metrics.spec.ts`: Event rollup, bounce status
7. `abtest_stats.spec.ts`: Z-score, winner selection, proportions
8. `referral_flow.spec.ts`: Intro request, state storage
9. `scheduler_link.spec.ts`: Link creation, calendar hold, snippets
10. `export_report.spec.ts`: PDF/GDoc export, metrics

### Integration Tests (5)
1. `gmail_send_and_thread.spec.ts`: Gmail API, message ID, suppression
2. `sequence_stop_on_reply.spec.ts`: Reply halts sequence
3. `unsubscribe_preferences.spec.ts`: Suppression, case-insensitive
4. `abtest_auto_winner.spec.ts`: Winner application, sample size
5. `pipeline_stage_updates.spec.ts`: Status transitions (contacted → replied → intro → scheduled)

### E2E Test
- `step48-outreach-e2e.spec.ts`: Full workflow (import → sequence → campaign → track → export)

## Keyboard Shortcuts
- **N**: New prospect (Prospects tab)
- **T**: New template (Templates tab)
- **S**: New sequence (Sequences tab)
- **R**: Run tick (Campaigns tab)

## i18n Support
- **English**: Full translations in `en/outreach.json`
- **Turkish**: Full translations in `tr/outreach.json`
- Keys: dashboard, prospects, templates, sequences, campaigns, abtests, referrals, scheduler, compliance, consent

## Integration Points

### Gmail (Step 35)
- Send emails via `gmail.real.service.ts`
- OAuth via `google.oauth.service.ts`
- Thread tracking with message IDs

### Calendar (Step 35)
- Create holds via `calendar.real.service.ts`
- Scheduler links with timezone support

### Docs/PDF (Step 30)
- Export campaign reports via `pdf.service.ts` and `googleDocs.service.ts`

### Portfolio (Step 40)
- Context for warm intro blurbs (can reference projects)

### Offers/Onboarding (Steps 44–45)
- Pipeline stage updates on reply/intro/scheduled

### Performance/Skills (Steps 46–47)
- Context-aware templates (role, skills for personalization)

### Pipeline (Step 41)
- Status sync: Contacted → Replied → Intro → Interview
- Quiet hours rules reused

## Extensibility

### Future Enhancements
1. **Enrichment Providers**: Clearbit, Hunter.io, Apollo.io
2. **Webhooks**: Real-time tracking via pixel/link proxy
3. **Custom Domain**: Link tracking on user domain
4. **Calendar Booking**: Full Calendly-like booking flow
5. **LinkedIn Automation**: Manual tasks → Chrome extension helper
6. **Reply Detection**: Gmail API polling for auto-reply tracking
7. **Drip Campaigns**: Time-based triggers beyond wait steps
8. **CRM Sync**: Salesforce, HubSpot bidirectional sync

### Best Practices
- Always include unsubscribe link in footer
- Respect quiet hours and rate limits
- Use warm intros over cold outreach
- Test A/B at sufficient sample size (n≥50 per variant)
- Monitor bounce rate (>5% = list quality issue)
- Keep templates personalized (avoid "spray and pray")

## Acceptance Criteria ✅

- [x] Prospects can be imported, deduped, tagged, enriched
- [x] Lists created and managed
- [x] Templates render with variables/snippets and compliance footer
- [x] Preview works with sample data
- [x] Sequences define email/wait/manual steps
- [x] Rules validated (throttle, daily cap, quiet hours)
- [x] A/B variants optional and configurable
- [x] Campaign runner respects throttle, daily cap, quiet hours
- [x] Logs sends and metrics update with tracking events
- [x] A/B Lab surfaces winner with z-score
- [x] Can apply winner to sequence
- [x] Warm intro requests generated and sent via Gmail
- [x] Tracked through states (requested/sent/intro_made/scheduled)
- [x] Scheduler links created and inserted into templates
- [x] Unsubscribe/preferences update suppression list
- [x] Further sends blocked for suppressed emails
- [x] Campaign Report exports to PDF/Google Doc
- [x] Pipeline (Step 41) stages update on reply/intro/scheduled
- [x] All tests pass
- [x] No console errors
- [x] WCAG AA compliant

## Commit Message

```
feat(outreach): Networking CRM & Outreach Sequencer — prospects, templates, sequences, Gmail sending with tracking, A/B testing, warm intros, scheduler links, compliance (unsubscribe/suppression), analytics, and campaign report exports
```
