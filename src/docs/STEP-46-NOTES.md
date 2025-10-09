# Step 46: Performance Review & Promotion Readiness

## Overview

This module provides a comprehensive **Performance Review & Promotion Readiness** system that enables users to:

- Request and collect **360-degree feedback** from peers, managers, and cross-functional collaborators
- Build a **Goal ↔ Evidence graph** linking SMART goals to measurable artifacts
- Plan and track **review cycles** with tasks, deadlines, and calendar integration
- Perform **calibration** with rubric-based scoring and outlier detection
- **Simulate ratings** with configurable weights and evidence boosts
- Assess **promotion readiness** with gap analysis and action planning
- Generate **bias-aware narratives** using AI assistance
- Export polished **review/promotion packets** as PDF or Google Docs

## Key Features

### 1. 360 Feedback System

- **Templates**: Pre-built feedback templates with behavioral prompts
- **Request Wizard**: Multi-step flow for sending feedback requests via Gmail
- **Inbox**: Centralized view of all feedback responses with filtering by role
- **Privacy**: All feedback is private by default; explicit consent required for sharing

### 2. Evidence Graph

- **Linking**: Connect SMART goals from Step 45 to evidence artifacts from Steps 38, 40, 43
- **Metrics**: Track metric deltas (e.g., +30% latency reduction) per evidence item
- **Progress**: Auto-compute cumulative progress per goal
- **Navigation**: Direct links to source artifacts

### 3. Review Cycle Planner

- **Cycle Types**: Mid-year, year-end, probation, custom
- **Tasks**: Default task templates with owner assignment (self, manager, peer)
- **Reviewers**: Batch assignment of feedback reviewers with role tagging
- **Calendar Integration**: Auto-create reminders and deadline events in Google Calendar
- **Quiet Hours**: Respects timezone-aware quiet hours from Step 35

### 4. Calibration Board

- **Rubric Heatmap**: Visual display of average scores across clarity, structure, impact, ownership, collaboration, craft
- **Outlier Detection**: Flags reviewers with >1.0 delta from mean on any dimension
- **Notes**: Capture calibration session notes and context
- **Recompute**: Refresh aggregates after new feedback arrives

### 5. Rating Simulator

- **What-If Analysis**: Adjust rubric scores and see real-time overall rating
- **Evidence Boost**: Simulate impact of strong evidence on final rating (0-50%)
- **Sensitivity**: Add noise to model uncertainty (0-1 range)
- **Weight Overrides**: Experiment with different rubric weight distributions
- **Scenario Saving**: Store and compare multiple simulation runs

### 6. Promotion Readiness

- **Level Expectations**: Define behavioral bars for target promotion level
- **Gap Analysis**: Compare current performance to target bars
- **Action Planning**: Auto-generate development actions for each gap
- **Readiness Flag**: Binary indicator of promotion readiness
- **Integration**: Actions can feed back into Step 45 development plan

### 7. Narrative Writer

- **AI Generation**: Uses `aiComplete` to draft structured self-review sections
  - Scope, Results, Collaboration, Growth, Next Half
- **Evidence Integration**: Automatically incorporates goal progress and metric deltas
- **Quote Inclusion**: Laces in feedback quotes from 360 responses
- **Bias Guard**: 
  - Redacts emails/phone numbers
  - Rewrites biased phrases (e.g., "low energy" → "consistent engagement")
  - Neutralizes subjective descriptors
- **Version Control**: Save and compare multiple narrative drafts

### 8. Review Packet Export

- **Formats**: PDF or Google Doc
- **Content**: Includes narrative, calibration summary, promotion readiness, disclaimer
- **Disclaimer**: Prominent warning that ratings are simulated and not official
- **Email**: Optional send to self/manager via Gmail
- **History**: Track all exported packets with timestamps

## Privacy & Compliance

### Privacy-First Design

- **Local Storage**: All feedback, narratives, and simulations stored in browser localStorage
- **No Cloud Sync**: No automatic cloud upload; user controls all data
- **Explicit Sharing**: Banners and confirmation dialogs before any export/email
- **Token-Based Forms**: Feedback forms use local-only tokens (not actual auth)

### Bias Mitigation

- **Language Checker**: Sanitizes text to remove:
  - Group-based descriptors (native/non-native, low/high energy, nice/aggressive)
  - Emails and phone numbers (PII redaction)
- **Observable Focus**: Prompts encourage evidence-based, behavior-focused feedback
- **Rubric Framing**: Dimensions chosen to minimize subjective bias (clarity, impact, ownership)

### Legal Disclaimer

- **Not HR Advice**: All ratings and promotion assessments are simulated for planning only
- **Not Legal Advice**: No guarantees or commitments; users responsible for decisions
- **User Responsibility**: Clear disclaimers in UI and export packets

## Accessibility (WCAG AA)

- **Keyboard Shortcuts**: 
  - `R` → Request 360 Feedback
  - `G` → Link Evidence
  - `N` → Write Narrative
- **Focus Management**: Visible focus indicators on all interactive elements
- **ARIA Labels**: Proper roles and labels for tabs, buttons, forms
- **Color Contrast**: All text meets WCAG AA contrast ratios
- **Screen Reader Support**: aria-live regions for dynamic updates
- **Responsive**: Works on mobile, tablet, desktop

## Integration Points

### Existing Steps

- **Step 45 (Onboarding)**: SMART goals feed into Evidence Graph
- **Step 38 (Evidence/OKRs/1:1s)**: Evidence items linkable to goals
- **Step 39 (Self-Review)**: Feedback inbox quotes can be added to self-review
- **Step 40 (Portfolio)**: Portfolio projects linkable as evidence
- **Step 41 (Networking/Pipeline)**: Referral success can be evidence
- **Step 43 (Interview)**: Interview performance can be evidence
- **Step 44 (Offer/Comp)**: Negotiation outcomes inform comp benchmarks
- **Step 35 (Calendar)**: Review cycle reminders and deadlines
- **Step 30 (Gmail)**: Feedback requests sent via Gmail, packets emailed

### External Services

- **Google Calendar API**: Create review milestones and reminders
- **Gmail API**: Send feedback requests, email packets
- **Google Docs API**: Export packets as Google Docs
- **AI Completion**: Generate narrative drafts (Step 39 aiComplete)

## Data Model

### Key Entities

- **FeedbackTemplate**: Reusable templates with sections and rubric keys
- **FeedbackRequest**: Outbound request with status tracking
- **FeedbackResponse**: Inbound response with answers, rubric, quotes
- **EvidenceLink**: Goal-to-artifact link with metric delta
- **ReviewCycle**: Cycle definition with tasks and reviewers
- **RubricDef**: Rubric with weighted dimensions
- **CalibSummary**: Aggregated scores and outliers per cycle
- **RatingScenario**: Simulation parameters and results
- **PromotionExpectation**: Behavioral bars per level
- **GapAnalysis**: Current vs. target with action items
- **NarrativeDoc**: HTML self-review narrative
- **PerfPacketExport**: Export record with URL and timestamp

### State Management

- **Zustand Store**: `usePerf` store with localStorage persistence
- **Upsert Pattern**: All mutations via `upsert*` methods (idempotent)
- **Version**: Schema version 1 for future migrations

## Extensibility

### Plug Adapters

- **Slack Feedback**: Adapter to send feedback requests via Slack
- **Notion Forms**: Embed feedback forms in Notion pages
- **HR System Import**: Import rubric schemas from Workday, Lattice, etc.

### Multi-Reviewee Support

- **Manager Mode**: Managers can calibrate multiple direct reports
- **Anonymization**: Option to anonymize reviewers in calibration view
- **Batch Export**: Export packets for entire team

### Custom Rubrics

- **Industry-Specific**: Engineering, Design, PM, Sales rubrics
- **Company Values**: Map to company-specific values/competencies
- **Role Levels**: Different rubrics per IC vs. manager track

## Testing Strategy

### Unit Tests (11 files)

- `feedback_templates.spec.ts`: Template seeding and idempotency
- `feedback_inbox.spec.ts`: Response submission and status updates
- `evidence_graph.spec.ts`: Linking and progress computation
- `review_cycle.spec.ts`: Cycle creation and task management
- `rubric_weights.spec.ts`: Rubric seeding and weight validation
- `calibration_outliers.spec.ts`: Outlier detection and aggregation
- `rating_simulator.spec.ts`: Boost, sensitivity, and weight overrides
- `bias_guard.spec.ts`: Redaction and phrase rewriting
- `narrative_writer.spec.ts`: AI generation and sanitization
- `promotion_gaps.spec.ts`: Gap analysis and action generation
- `export_packet.spec.ts`: PDF/Doc export HTML composition

### Integration Tests (4 files)

- `feedback_request_to_inbox.spec.ts`: Full feedback loop
- `evidence_to_rating_loop.spec.ts`: Evidence → progress → boost → rating
- `cycle_calendar_email.spec.ts`: Cycle creation → calendar → email
- `promotion_packet_flow.spec.ts`: End-to-end packet generation

### E2E Test (1 file)

- `step46-performance-review.spec.ts`: Full user journey with Playwright
  - Dashboard navigation
  - Cycle creation
  - Evidence linking
  - Rating simulation
  - Keyboard shortcuts
  - Accessibility checks

## Known Limitations

- **No Backend**: All data is client-side; no sync across devices
- **Email Sending**: Requires Google OAuth; may hit rate limits
- **AI Generation**: Depends on aiComplete service availability
- **PDF Export**: Limited styling; uses basic HTML-to-PDF
- **Rubric Complexity**: Fixed 6-dimension rubric; not fully customizable in UI

## Future Enhancements

- **Team Calibration**: Multi-user calibration sessions with real-time sync
- **Goal Tracking**: Integrate with OKR tracking (Step 38) for auto-progress
- **Sentiment Analysis**: AI-powered sentiment and theme extraction from feedback
- **Blind Feedback**: Truly anonymous feedback with aggregation-only access
- **Mobile App**: Native mobile app for on-the-go feedback and review
- **Performance Trends**: Multi-cycle trend analysis and visualizations
- **Skills Matrix**: Map evidence to skill development paths
- **Career Ladder**: Visual career ladder with level transitions

## References

- [Performance Review Best Practices](https://www.manager-tools.com/map-universe/performance-reviews)
- [Bias in Performance Reviews](https://textio.com/blog/gender-bias-in-performance-reviews)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Google APIs](https://developers.google.com/apis-explorer)

## Changelog

- **2025-10-09**: Initial implementation (Step 46)
  - 360 feedback request/inbox
  - Evidence graph and goal progress
  - Review cycle planner with calendar
  - Calibration board with outliers
  - Rating simulator with what-if
  - Promotion readiness and gap analysis
  - Bias-aware narrative writer
  - PDF/Doc packet export
