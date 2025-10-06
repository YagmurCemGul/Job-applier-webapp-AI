# Step 39: Performance Review & Promotion Toolkit

## Overview

This step implements a comprehensive Performance Review & Promotion system that builds on Steps 17-38, particularly Step 38's evidence binder and OKRs. It provides tools for conducting performance reviews, collecting 360 feedback, generating self-reviews with AI, preparing for calibration, and building promotion packets.

## Core Features

### 1. Review Cycle Management

**Cycle Types:**
- mid_year: Mid-year performance review
- year_end: Annual performance review
- probation: Probation period review
- promotion: Promotion review

**Cycle Stages:**
- draft: Initial setup
- collecting: Gathering feedback and evidence
- synthesizing: Compiling self-review
- calibration: Manager calibration
- finalized: Review complete
- archived: Historical record

**Deadline Management:**
- self_review: Self-review due date
- feedback_due: Feedback collection deadline
- calibration: Calibration meeting
- submit: Final submission
- Calendar integration (Step 35) for reminders

### 2. Impact Aggregation

**Sources:**
- evidence: From Step 38 Evidence Binder
- okr: From Step 38 OKR progress
- weekly: From Step 38 Weekly Reports
- oneonone: From Step 38 1:1 notes
- manual: User-entered impacts

**Scoring Algorithm:**
```typescript
score(impact):
  competencyWeight = {
    execution: 1.0,
    craft: 0.9,
    leadership: 1.1,
    collaboration: 0.8,
    communication: 0.7,
    impact: 1.2
  }
  
  baseScore = (hasMetrics ? 1 : 0.7) + (confidence / 5)
  finalScore = baseScore × competencyWeight[competency]
  
  return finalScore
```

**Competency Inference:**
- "refactor", "design" → craft
- "migration", "launch" → execution
- "kpi", "revenue", "%" → impact
- "mentoring", "led", "initiative" → leadership
- "collab", "review" → collaboration
- Default → communication

### 3. 360 Feedback System

**Request Management:**
- Select reviewers from Step 38 stakeholders
- Send via Gmail (Step 35)
- Track status (pending, sent, responded, reminded)
- Optional anonymous mode
- Reminder scheduling

**Response Collection:**
- Manual paste or form submission
- AI sentiment analysis (positive/neutral/negative)
- PII redaction for anonymous view
- Labels (strength, area_for_growth)
- Export options (redacted/raw)

**Privacy (Redaction):**
```typescript
redactPII(text):
  // Redact names: "John Smith" → "[redacted-name]"
  text.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[redacted-name]')
  
  // Redact emails: "user@example.com" → "[redacted-email]"
  text.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
```

### 4. AI Self-Review Generation

**STAR Framework:**
- Situation: Context and background
- Task: Objective or goal
- Action: Steps taken
- Result: Outcomes and impact

**Generation Process:**
```typescript
generateSelfReview(cycleId, lang, impacts):
  1. Build prompt with STAR instructions
  2. Include top 20 impact items
  3. Call Step 31 AI orchestrator
  4. Parse response into sections:
     - Overview (3-5 sentences)
     - Highlights (4-7 bullets with metrics)
     - Growth Areas (2-4 bullets)
     - Next Objectives (3-5 bullets)
  5. Calculate word count
  6. Calculate clarity score (shorter = clearer)
  7. Return SelfReview object
```

**Clarity Score:**
```typescript
clarityScore = max(0.1, min(1, 1 - wordCount / 900))

Example:
  300 words: 1 - 300/900 = 0.67 (good)
  600 words: 1 - 600/900 = 0.33 (verbose)
  900+ words: capped at 0.1 (too long)
```

### 5. Calibration Preparation

**Rubric Mapping:**
```typescript
mapToRubric(level, rubric, impacts):
  For each rubric expectation at level:
    1. Find matching impacts by competency
    2. Calculate average strength:
       strength = sum(impact.score) / count
    3. Compute delta (-2 to +2):
       strength >= 1.0: +2 (exceeds)
       strength >= 0.9: +1 (meets+)
       strength >= 0.7:  0 (meets)
       strength >= 0.5: -1 (below)
       strength <  0.5: -2 (concerns)
    4. Return top 5 evidence items
```

**Delta Interpretation:**
- +2: Exceeds expectations
- +1: Meets expectations+
-  0: Meets expectations
- -1: Below expectations
- -2: Significant concerns

### 6. Promotion Packet

**Components:**
- Confidential banner
- Target level
- Self-review overview
- Highlights (STAR format)
- Top 8 impacts
- Selected quotes from feedback
- Supporting attachments

**Export Options:**
- PDF (for printing/archival)
- Google Docs (for editing)
- Gmail sharing (Step 35)

**HTML Structure:**
```html
<div>
  <div style="confidential banner">
    CONFIDENTIAL — for calibration use only
  </div>
  <h2>Promotion Packet — [Title] (Target: [Level])</h2>
  <h3>Overview</h3>
  <p>[Self-review overview]</p>
  <h3>Highlights</h3>
  <ul>[STAR bullets]</ul>
  <h3>Top Impacts</h3>
  <ul>[Evidence with metrics]</ul>
  <h3>Quotes</h3>
  <blockquote>[Feedback snippets]</blockquote>
</div>
```

## Type System

### ReviewCycle
```typescript
interface ReviewCycle {
  id: string
  applicationId?: string  // Step 33
  planId?: string        // Step 38
  title: string
  kind: ReviewKind
  stage: ReviewStage
  startISO: string
  endISO: string
  deadlines: Deadline[]
  retentionDays: 30 | 60 | 90 | 180 | 365
  createdAt: string
  updatedAt: string
}
```

### ImpactEntry
```typescript
interface ImpactEntry {
  id: string
  cycleId: string
  source: 'evidence' | 'okr' | 'weekly' | 'oneonone' | 'manual'
  title: string
  detail?: string
  dateISO?: string
  metrics?: Metric[]
  competency?: Competency
  confidence?: 0 | 1 | 2 | 3 | 4 | 5
  links?: string[]
  score?: number  // 0..1+ for ranking
}
```

### FeedbackRequest & Response
```typescript
interface FeedbackRequest {
  id: string
  cycleId: string
  reviewerEmail: string
  reviewerName?: string
  relationship?: 'manager' | 'peer' | 'stakeholder' | 'direct_report' | 'other'
  sentAt?: string
  respondedAt?: string
  anonymous?: boolean
  status: 'pending' | 'sent' | 'responded' | 'reminded'
}

interface FeedbackResponse {
  id: string
  requestId: string
  cycleId: string
  receivedAt: string
  anonymousView?: boolean
  body: string
  labels?: string[]
  sentiment?: 'positive' | 'neutral' | 'negative'
  redactedBody?: string
}
```

## Services

### impactAggregator.service.ts

**aggregateImpact(cycleId):**
1. Get review cycle
2. If has planId:
   - Pull evidence from Step 38 onboarding plan
   - Pull OKRs from Step 38 OKRs store
   - Calculate OKR progress
3. For each item:
   - Infer competency from title
   - Calculate score
4. Deduplicate by signature (title + date + source)
5. Sort by score descending
6. Return ImpactEntry[]

### feedback.service.ts

**buildFeedbackEmail(request, vars):**
- Template with subject and body
- Variable substitution
- Optional anonymous link
- Returns {subject, html, text}

**sendFeedbackRequests(opts):**
1. Get Gmail bearer token (Step 35)
2. For each request:
   - Build email with template
   - Create RFC 822 MIME message
   - Base64 encode
   - POST to Gmail API
   - Mark as sent

**recordFeedbackResponse(request, body):**
1. Redact PII
2. Analyze sentiment (AI via Step 31)
3. Create FeedbackResponse
4. Save to store
5. Return response

### selfReviewAI.service.ts

**generateSelfReview(cycleId, lang, impacts):**
1. Build STAR-focused prompt
2. Include top 20 impacts
3. Call Step 31 AI (temp=0.4, max=1200)
4. Parse response into sections
5. Calculate word count & clarity
6. Return SelfReview

**materializeSelfReview(cycleId, lang, text):**
1. Extract sections (overview, highlights, growth, objectives)
2. Parse bullets from each section
3. Count words
4. Calculate clarity score
5. Return structured SelfReview

### calibrationPrep.service.ts

**mapToRubric(level, rubric, impacts):**
1. Filter rubric for target level
2. For each expectation:
   - Find impacts matching competency
   - Calculate average strength
   - Compute delta (-2 to +2)
   - Select top 5 evidence items
3. Return mapped array

### promotionPacket.service.ts

**buildPromotionPacketHTML(opts):**
1. Confidential banner
2. Title with target level
3. Self-review overview
4. Highlights (bullets)
5. Top 8 impacts
6. Selected quotes (blockquotes)
7. Footer with disclaimer
8. Return HTML string

## UI Components

### ConfidentialBanner
- Red dashed border
- Lock icon
- "CONFIDENTIAL" warning
- ARIA live region for screen readers

### ReviewHome
- KPI cards:
  - Impacts count
  - Feedback response rate
  - Self-review word count
  - Readiness status
- Cycle details (title, kind, dates)
- Stage badge

## Integration with Steps 17-38

### Step 31 (AI Orchestrator)
```typescript
// Self-review generation
const review = await generateSelfReview(cycleId, lang, impacts)
  → Uses aiRoute() for STAR content

// Sentiment analysis
const sentiment = await analyzeSentiment(feedback)
  → Uses aiRoute() for classification
```

### Step 33 (Applications)
```typescript
// Link review to application
reviewCycle.applicationId = application.id
```

### Step 35 (Gmail/Calendar)
```typescript
// Send feedback requests
await sendFeedbackRequests({...})
  → Uses Gmail API send

// Schedule deadlines
await scheduleCycleDeadline({...})
  → Uses calendarCreate()

// Share promotion packet
await shareViaGmail(html, recipients)
  → Uses Gmail API send
```

### Step 38 (Onboarding)
```typescript
// Pull evidence
const plan = useOnboardingStore.getState().getById(planId)
plan.evidence → ImpactEntry[]

// Pull OKRs
const okrs = useOKRsStore.getState().byPlan(planId)
okrs → ImpactEntry[] with progress

// Reference stakeholders
plan.stakeholders → feedback reviewers
```

## Algorithms

### Impact Scoring
```typescript
Example:
  Impact: "Migrated 500k users to new platform"
  Metrics: [{label: "Users", value: 500000}]
  Competency: execution (weight 1.0)
  Confidence: 5
  
  baseScore = 1 (has metrics) + 5/5 (confidence)
           = 2.0
  
  finalScore = 2.0 × 1.0 (execution weight)
             = 2.0
```

### Clarity Scoring
```typescript
Example:
  Self-review with 450 words
  
  clarityScore = 1 - 450/900
               = 1 - 0.5
               = 0.5 (moderate)
```

### Calibration Delta
```typescript
Example:
  Rubric: "Senior → Execution"
  Impacts: [1.2, 1.1, 0.9]
  
  strength = (1.2 + 1.1 + 0.9) / 3
           = 1.07
  
  delta = +2 (exceeds, since >= 1.0)
```

## Consent & Privacy

### Confidentiality
- CONFIDENTIAL banner on all review pages
- Watermark on exported packets
- "for calibration use only" disclaimer

### Anonymity
- Client-side PII redaction (best-effort)
- Redacts names (capitalized words)
- Redacts email addresses
- Anonymous view toggle
- Not cryptographically secure

### Retention
- Configurable windows: 30/60/90/180/365 days
- Auto-purge after retention period
- User can manually delete
- Export before purge recommended

## Accessibility

- Keyboard navigation
- ARIA labels on all inputs
- ARIA live regions for banners
- High contrast mode
- Focus indicators
- Table alternatives for matrices

## Testing

**Unit Tests (6 files):**
- impactAggregator.spec.ts
- privacyRedaction.spec.ts
- feedbackAnonymize.spec.ts
- selfReviewAI.spec.ts
- calibrationMath.spec.ts
- sentimentSummary.spec.ts

## Known Limitations

1. **PII Redaction**: Client-side only, not cryptographically secure
2. **AI Generation**: Requires verification, not HR advice
3. **Sentiment Analysis**: Basic classification, may miss nuance
4. **Export Formats**: HTML blobs, not full PDF/Docs integration

## Best Practices

### Review Cycle
- Start early (2-4 weeks before deadline)
- Set clear deadlines
- Send reminders proactively
- Keep confidential

### Feedback
- Request from diverse sources (manager, peers, stakeholders)
- Ask specific questions
- Respect anonymous responses
- Follow up on themes

### Self-Review
- Ground in evidence and metrics
- Use STAR framework
- Be concise (< 600 words)
- Focus on impact, not just activity
- Verify AI-generated content

### Calibration
- Map to official rubric
- Provide specific evidence
- Quantify when possible
- Note confidence levels
- Prepare for discussion

### Promotion
- Build case over time
- Collect quotes early
- Quantify scope increase
- Show trajectory
- Get feedback before submitting

## References

- STAR Method: https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique
- Performance Reviews: https://www.radicalcandor.com/
- Calibration: https://www.cultureamp.com/blog/performance-calibration
- Promotion: https://www.progression.fyi/
