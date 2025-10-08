# Step 39: Performance Review & Promotion Toolkit — Implementation Notes

## Overview

Step 39 delivers a comprehensive **Performance Review & Promotion** system that integrates with Steps 17–38, providing end-to-end support for:

- Review cycle management with deadlines and calendar integration
- Impact tracking from evidence, OKRs, and weekly reports
- 360 feedback collection with anonymization and sentiment analysis
- AI-assisted self-review composition using STAR methodology
- Calibration preparation with rubric mapping and delta analysis
- Promotion packet assembly and export (PDF/Google Docs)
- Visibility gap analysis and stakeholder coverage

## Architecture

### Data Flow

```
Evidence/OKRs/1:1s (Step 38)
    ↓
Impact Aggregator
    ↓
Review Cycles ← Feedback Requests ← Gmail (Step 35)
    ↓              ↓
Self-Review AI  Sentiment Analysis
    ↓              ↓
Calibration    Anonymization
    ↓
Promotion Packet
    ↓
Export (PDF/Docs) → Share via Gmail
```

### Key Integrations

- **Step 35 (Gmail/Calendar)**: Feedback requests, reminders, packet sharing, deadline scheduling
- **Step 36 (Interviews)**: Interview performance can inform calibration
- **Step 38 (Onboarding)**: Evidence Binder, OKRs, Weekly Reports, 1:1 notes, Stakeholders
- **Step 31 (AI Orchestrator)**: Self-review generation, sentiment analysis, feedback summary
- **Step 30 (Docs/Export)**: PDF and Google Docs export
- **Step 33 (Applications)**: Link review cycles to accepted offers

## Confidentiality & Privacy

### Confidential Banner

- Red dashed border banner appears on all review pages
- Shows retention policy (30/60/90/180/365 days)
- Screen reader announcement on page load
- Exported packets include watermark

### Anonymization

- **Client-side redaction only** (best-effort)
- PII patterns redacted:
  - Full names (e.g., "John Smith" → "[redacted-name]")
  - Email addresses
  - Phone numbers
  - URLs
- Users should be informed: "Anonymity is best-effort; not cryptographically secure"
- For true anonymity, use external forms (Google Forms, Typeform) and manually paste

### Data Retention

- Configurable per cycle: 30/60/90/180/365 days
- Auto-purge not implemented (requires background job)
- Users responsible for manual cleanup or export before purge

### Access Control

- All data stored in browser localStorage (Zustand persist)
- No server-side storage in this implementation
- Users should export sensitive data before sharing devices

## AI Usage & Limits

### Self-Review Generation

- Uses `aiComplete` service (Step 31)
- Grounded in user's impact entries
- STAR methodology prompts
- Outputs guidance only — **not HR/legal advice**
- Users should review and edit all AI outputs

### Sentiment Analysis

- Three-class classification: positive/neutral/negative
- Fallback to "neutral" on error
- Not a substitute for human judgment
- May miss nuance, sarcasm, or cultural context

### Feedback Summary

- AI-generated themes from all responses
- 3-5 bullet points
- Users should verify accuracy

## Calibration System

### Rubric Structure

- Level-based (e.g., L4, L5, Senior, Staff)
- Six competencies: execution, craft, leadership, collaboration, communication, impact
- User-editable descriptions

### Delta Computation

- Maps impact scores to rubric expectations
- Five-point scale:
  - `+2`: Far exceeds
  - `+1`: Above expectations
  - `0`: Meets expectations
  - `-1`: Below expectations
  - `-2`: Far below expectations
- Formula: `strength = avg(impact.score) for competency`
- Thresholds: ≥1.0 → +2, ≥0.9 → +1, ≥0.7 → 0, ≥0.5 → -1, else -2

### Pre-Read Export

- Markdown-formatted calibration summary
- Includes rubric expectations, evidence, and deltas
- Exportable as PDF or Google Doc

## Promotion Packet

### Components

1. **Confidential banner** with retention notice
2. **Cycle title and target level**
3. **Self-review overview**
4. **Highlights** (top 4-7 bullets)
5. **Top impacts** (up to 8, sorted by score)
6. **Supporting quotes** (up to 6, user-selected)
7. **Footer** with JobPilot attribution

### Export Options

- **PDF**: via `pdf.service` (Step 30)
- **Google Docs**: via `googleDocs.service` (Step 30)
- **Email sharing**: via Gmail (Step 35) — requires bearer token

### Watermarking

- All exports include "CONFIDENTIAL — for calibration use only" banner
- HTML export includes inline styles for consistent rendering

## Visibility Map

### Gap Detection

- Compares stakeholders (Step 38) by influence/interest
- Identifies high-influence/interest stakeholders with ad-hoc or no cadence
- Suggests: "Set up biweekly 1:1 to increase visibility"

### Actions

- Schedule 1:1 series (integration with Step 38)
- Send intro email (integration with Step 35)

## Testing Strategy

### Unit Tests

- **impactAggregator.spec.ts**: Aggregation logic, deduplication, scoring
- **privacyRedaction.spec.ts**: PII redaction patterns
- **feedbackAnonymize.spec.ts**: Request→response flow, sentiment
- **selfReviewAI.spec.ts**: Section parsing, word count, clarity score
- **calibrationMath.spec.ts**: Rubric mapping, delta computation
- **sentimentSummary.spec.ts**: Sentiment classification, fallback

### Integration Tests

- **cycle_feedback_flow.spec.ts**: Full feedback cycle (request → response → summary → export)
- **selfreview_to_export.spec.ts**: AI generation → packet HTML → export
- **promotion_packet_share.spec.ts**: Packet assembly → PDF/Docs export

### E2E Tests

- **step39-review-promotion-flow.spec.ts**: Complete user journey across all tabs

## Accessibility (WCAG AA)

### Keyboard Navigation

- All tabs navigable via `Tab`, `ArrowLeft`, `ArrowRight`
- Form inputs have visible focus indicators
- Dialogs trap focus and restore on close

### Screen Reader Support

- Confidential banner announces on page load
- Tables include `role="table"`, `aria-label`
- Filter chips have `aria-label`
- KPI cards include descriptive labels

### Color Contrast

- All text meets 4.5:1 ratio (normal) or 3:1 (large)
- Delta colors include text labels (not color-only)
- Sentiment badges include icons (not color-only)

### Alternative Text

- Icons include `aria-hidden="true"`
- Buttons include descriptive labels
- Export actions announce success/failure

## Performance Considerations

### Impact Aggregation

- Runs once on first load per cycle
- Dedups by `title|date|source` signature
- Limits evidence/OKRs to top 20 per source
- Sorted by score (O(n log n))

### Feedback Inbox

- Filters run in-memory (no backend pagination)
- AI summary triggered manually (not auto)
- Redaction applied per-response on save

### Export

- PDF/Docs generation offloaded to service workers (Step 30)
- Large packets (>100 pages) may timeout — recommend limiting to top 20 impacts

## Known Limitations

1. **No server-side storage**: All data in localStorage (5-10MB limit)
2. **No auto-purge**: Retention policy is informational only
3. **No true anonymity**: Client-side redaction is reversible
4. **No email tracking**: No read receipts or reminder automation
5. **No version control**: Promotion packets don't track edits (version number only)
6. **No collaborative editing**: Single-user only
7. **AI limits**: Token limits may truncate long prompts (use top 20 impacts)

## Future Enhancements

- **Calendar sync**: Sync deadlines bidirectionally with Google Calendar
- **Email automation**: Auto-reminders 3 days before feedback due
- **Template library**: Pre-built self-review templates by role/level
- **Peer comparison**: Anonymized benchmarking vs. similar roles
- **Manager view**: Dashboard for managers to track direct reports
- **Mobile app**: Native iOS/Android with offline support
- **LLM fine-tuning**: Train on company-specific review language

## Migration from Step 38

If users have existing Step 38 onboarding plans:

1. Create a review cycle linked to plan (`planId`)
2. Run impact aggregator to pull evidence/OKRs
3. Feedback requests auto-populate from stakeholders
4. 1:1 notes can be manually copied into growth areas

## Troubleshooting

### "No impacts found"

- Verify cycle `planId` matches onboarding plan
- Check evidence/OKR stores for data
- Try manual impact add

### "AI summary failed"

- Check API key/token in Step 31
- Verify network connectivity
- Reduce feedback body length (<5000 chars total)

### "Export stuck"

- Check browser console for errors
- Try smaller packet (fewer impacts/quotes)
- Disable browser extensions (PDF blockers)

### "Redaction incomplete"

- Review redaction patterns in `privacy.service.ts`
- Add custom patterns for company-specific PII
- Consider external anonymous forms for sensitive feedback

## Compliance Notes

- **GDPR**: Users are data controllers; inform reviewers of data usage
- **CCPA**: Provide export/delete mechanisms
- **SOC 2**: Encryption at rest (browser localStorage encrypted if device encrypted)
- **ISO 27001**: Access control via device/browser lock

## Support & Feedback

For issues or feature requests, see [CONTRIBUTING.md](../CONTRIBUTING.md).

---

**Last Updated**: 2025-01-08  
**Version**: 1.0.0  
**Author**: JobPilot Team
