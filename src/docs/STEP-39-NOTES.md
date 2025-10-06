# Step 39: Performance Review & Promotion Toolkit

## Overview

This step implements a comprehensive Performance Review & Promotion Toolkit that builds on Step 38's Evidence Binder, OKRs, and 1:1s to help users prepare for performance reviews, collect 360 feedback, compose self-reviews, and build promotion packets.

## Core Features

### 1. Review Cycles

**Cycle Types:**
- mid_year: Mid-year performance review
- year_end: Annual performance review
- probation: Probation period review
- promotion: Promotion packet preparation

**Cycle Stages:**
- draft: Initial setup
- collecting: Gathering feedback and evidence
- synthesizing: Composing self-review
- calibration: Manager preparation
- finalized: Review complete
- archived: Historical record

**Deadlines:**
- self_review: Self-review due date
- feedback_due: Feedback collection deadline
- calibration: Calibration meeting
- submit: Final submission
- other: Custom deadlines

### 2. Impact Aggregation

**Sources:**
- evidence: From Step 38 Evidence Binder
- okr: From Step 38 OKR progress
- weekly: From weekly reports
- oneonone: From 1:1 notes
- manual: User-entered impacts

**Competencies:**
- execution: Delivering on commitments
- craft: Technical excellence
- leadership: Leading initiatives
- collaboration: Teamwork
- communication: Clear communication
- impact: Measurable business results

**Scoring:**
```typescript
Base score = (hasMetrics ? 1 : 0.7) + (confidence / 5)
Final score = baseScore × competencyWeight

Competency Weights:
  impact: 1.2
  leadership: 1.1
  execution: 1.0
  craft: 0.9
  collaboration: 0.8
  communication: 0.7
```

### 3. 360 Feedback

**Request Flow:**
1. Select reviewers (from Step 38 stakeholders)
2. Choose relationship type (manager, peer, etc.)
3. Enable anonymous mode (optional)
4. Send via Gmail (Step 35)
5. Track responses
6. Send reminders

**Response Processing:**
- AI sentiment analysis (positive/neutral/negative)
- PII redaction for anonymous view
- Quote extraction
- Export options (raw/redacted)

**Anonymization:**
```typescript
Client-side redaction (best-effort):
  - Names: [redacted-name]
  - Emails: [redacted-email]
  
Best practices:
  - Inform reviewers about anonymity limits
  - Review redacted output before sharing
  - Server-side anonymization for production
```

### 4. Self-Review AI

**Generation Process:**
1. Aggregate top 20 impact entries
2. Generate with AI using STAR format
3. Parse into structured sections
4. Compute metrics (word count, clarity)
5. Allow user editing

**STAR Format:**
- Situation: Context and challenge
- Task: What needed to be done
- Action: What you did
- Result: Measurable outcome

**Quality Metrics:**
```typescript
Word Count: Track against 600 target
Clarity Score: 1 - (wordCount / 900)
  < 400 words: Excellent (>0.55)
  400-600: Good (0.33-0.55)
  > 600: Needs editing (<0.33)

Strong Verbs: Shipped, Led, Improved, Reduced, Increased
Avoid: Helped, Worked on, Participated
```

### 5. Calibration Prep

**Rubric Mapping:**
```typescript
For each competency:
  1. Filter impacts by competency
  2. Calculate average score
  3. Compute delta:
     strength >= 1.0: +2 (exceeds)
     strength >= 0.9: +1 (meets+)
     strength >= 0.7:  0 (meets)
     strength >= 0.5: -1 (developing)
     strength <  0.5: -2 (below)
  4. List top 5 evidence items

Output: Delta matrix for calibration conversation
```

**Delta Meaning:**
- +2: Strong exceeds expectations
- +1: Solid performance
-  0: Meets expectations
- -1: Development area
- -2: Below expectations

### 6. Promotion Packet

**Components:**
- Overview: Self-review summary
- Highlights: Key accomplishments
- Top Impacts: 8 highest-scored items
- Quotes: Selected feedback snippets
- OKR Results: Progress on objectives

**Export:**
```html
CONFIDENTIAL — for calibration use only

Promotion Packet — {CycleTitle} (Target: {TargetLevel})

## Overview
{self.overview}

## Highlights
{self.highlights as bullets}

## Top Impacts
{impacts.slice(0,8) with details}

## Quotes
{quotes as blockquotes}
```

### 7. Visibility Map

**Analysis:**
```typescript
From Step 38 stakeholders:
  1. Filter high influence OR high interest
  2. Check for regular cadence (weekly/biweekly)
  3. Identify gaps (no cadence or ad-hoc)
  4. Suggest actions (set up 1:1s)

Gap Detection:
  needs = stakeholders.filter(s =>
    (s.influence === 'high' || s.interest === 'high') &&
    (!s.cadence || s.cadence === 'ad_hoc')
  )
```

## Type System

### ReviewCycle

```typescript
interface ReviewCycle {
  id: string
  applicationId?: string      // Step 33
  planId?: string              // Step 38
  title: string
  kind: 'mid_year' | 'year_end' | 'probation' | 'promotion'
  stage: 'draft' | 'collecting' | 'synthesizing' | 'calibration' | 'finalized' | 'archived'
  startISO: string
  endISO: string
  deadlines: Array<{
    id: string
    label: string
    atISO: string
    kind: 'self_review' | 'feedback_due' | 'calibration' | 'submit' | 'other'
  }>
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
  metrics?: Array<{
    label: string
    value: number
    unit?: string
  }>
  competency?: Competency
  confidence?: 0 | 1 | 2 | 3 | 4 | 5
  links?: string[]
  score?: number                // normalized 0..1 for ranking
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
  labels?: string[]             // 'strength', 'area_for_growth'
  sentiment?: 'positive' | 'neutral' | 'negative'
  redactedBody?: string
}
```

### SelfReview

```typescript
interface SelfReview {
  id: string
  cycleId: string
  lang: 'en' | 'tr'
  overview: string
  highlights: string[]
  growthAreas: string[]
  nextObjectives: string[]
  wordCount: number
  clarityScore: number          // 0..1
  generatedAt?: string
  updatedAt: string
}
```

## Services

### impactAggregator.service.ts

```typescript
aggregateImpact(cycleId): ImpactEntry[]
  Process:
    1. Get review cycle
    2. Get linked onboarding plan
    3. Pull evidence items → convert to ImpactEntry
    4. Pull OKRs → convert with progress metrics
    5. Infer competency from title keywords
    6. Calculate score for each
    7. Deduplicate by title+date+source
    8. Sort by score descending

inferCompetency(title):
  Keyword matching:
    'refactor', 'design' → craft
    'migration', 'launch' → execution
    'kpi', 'revenue', '%' → impact
    'mentoring', 'led' → leadership
    'collab', 'review' → collaboration
    default → communication

score(impact):
  base = (hasMetrics ? 1 : 0.7) + (confidence/5)
  weighted = base × competencyWeight[impact.competency]
```

### privacy.service.ts

```typescript
redactPII(text): string
  Patterns:
    Names: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g
      → '[redacted-name]'
    
    Emails: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
      → '[redacted-email]'

Note: Best-effort client-side only
Production should use server-side NER
```

### sentiment.service.ts

```typescript
analyzeSentiment(text): Promise<'positive'|'neutral'|'negative'>
  Process:
    1. Call Step 31 AI with prompt:
       "Label as POSITIVE, NEUTRAL, or NEGATIVE.
        Return only the label."
    2. Parse response (contains POS/NEG?)
    3. Fallback to 'neutral' on error

Usage:
  - Categorize feedback
  - Filter by sentiment
  - Summary statistics
```

### feedback.service.ts

```typescript
buildFeedbackEmail(req, vars): {subject, html, text}
  Template:
    Subject: Feedback request for {YourName} ({CycleTitle})
    Body:
      Hi {ReviewerName},
      I'm collecting feedback for {CycleTitle}.
      Would you share observations on:
      - What went well?
      - What could be improved?
      - Examples/impact numbers
      
      You can reply directly{Anon}.

recordFeedbackResponse(req, body): FeedbackResponse
  Process:
    1. Redact PII → redactedBody
    2. Analyze sentiment → positive/neutral/negative
    3. Create FeedbackResponse object
    4. Store in feedbackStore
    5. Return response
```

### selfReviewAI.service.ts

```typescript
generateSelfReview(cycleId, lang, impacts): SelfReview
  Process:
    1. Build AI prompt:
       - Language: EN or TR
       - Format: STAR with sections
       - Constraints: <600 words, strong verbs
       - Grounding: Top 20 impacts JSON
    
    2. Call Step 31 AI
    
    3. Parse response:
       materializeSelfReview(cycleId, lang, text)
    
    4. Return structured SelfReview

materializeSelfReview(cycleId, lang, text): SelfReview
  Parse sections:
    overview: First paragraph or Overview section
    highlights: Bullets from Highlights section
    growthAreas: Bullets from Growth section
    nextObjectives: Bullets from Objectives/Next Steps
  
  Compute metrics:
    wordCount = text.split(/\s+/).length
    clarityScore = max(0.1, min(1, 1 - wordCount/900))
```

### calibrationPrep.service.ts

```typescript
mapToRubric(level, rubric, impacts): Array<{rubric, evidence, delta}>
  Process:
    1. Filter rubric by level (e.g., "L4", "Senior")
    2. For each rubric expectation:
       a. Find impacts matching competency
       b. Calculate average score
       c. Compute delta (-2 to +2):
          ≥1.0: +2, ≥0.9: +1, ≥0.7: 0, ≥0.5: -1, else: -2
       d. List top 5 evidence titles
    3. Return mapping array

Usage:
  - Visualize strength/delta matrix
  - Prepare calibration conversation
  - Identify support needs
```

### promotionPacket.service.ts

```typescript
buildPromotionPacketHTML(opts): string
  Components:
    - Confidential banner (red dashed border)
    - Title with target level
    - Overview (self.overview)
    - Highlights (self.highlights as UL)
    - Top Impacts (impacts.slice(0,8) as UL with details)
    - Quotes (selected feedback as blockquotes)
    - Footer disclaimer

Export:
  - PDF via reviewExport.pdf.service
  - Google Docs via reviewExport.docs.service
  - Share via Gmail (Step 35)
```

## Integration with Steps 17-38

### Step 31 (AI Orchestrator)
```typescript
// Self-review generation
const review = await generateSelfReview(cycleId, lang, impacts)
  → Uses aiRoute()

// Sentiment analysis
const sentiment = await analyzeSentiment(feedbackText)
  → Uses aiRoute()
```

### Step 33 (Applications)
```typescript
// Link review to application
cycle.applicationId = application.id

// Create cycle from application
if (application.stage === 'offer_accepted') {
  createReviewCycle({
    applicationId: application.id,
    kind: 'probation'
  })
}
```

### Step 35 (Gmail/Calendar)
```typescript
// Send feedback requests
await sendFeedbackRequests() → Gmail API

// Schedule deadlines
await scheduleCycleDeadline() → Calendar API

// Share promotion packet
await shareViaEmail() → Gmail API
```

### Step 38 (Onboarding)
```typescript
// Pull evidence
const plan = getOnboardingPlan(cycle.planId)
const evidence = plan.evidence → ImpactEntry[]

// Pull OKRs
const okrs = getOKRs(plan.id) → ImpactEntry[]

// Get stakeholders
const stakeholders = plan.stakeholders → FeedbackRequest[]

// Visibility gaps
const gaps = computeVisibilityGaps(plan.id)
```

## Algorithms

### Impact Scoring

```typescript
Algorithm:
  1. Base score:
     hasMetrics = impact.metrics && impact.metrics.length > 0
     base = (hasMetrics ? 1 : 0.7) + (confidence ?? 3) / 5
  
  2. Competency weight:
     weights = {
       impact: 1.2,
       leadership: 1.1,
       execution: 1.0,
       craft: 0.9,
       collaboration: 0.8,
       communication: 0.7
     }
  
  3. Final score:
     score = base × weights[competency ?? 'impact']

Example:
  Impact with metrics, confidence 4, competency 'impact':
    base = 1 + 4/5 = 1.8
    score = 1.8 × 1.2 = 2.16
  
  Impact without metrics, confidence 3, competency 'communication':
    base = 0.7 + 3/5 = 1.3
    score = 1.3 × 0.7 = 0.91
```

### Deduplication

```typescript
Algorithm:
  signature(impact) = `${title}|${dateISO}|${source}`
  
  unique = []
  seen = Set<string>()
  
  for impact in impacts:
    sig = signature(impact)
    if !seen.has(sig):
      unique.push(impact)
      seen.add(sig)
  
  return unique.sort((a,b) => b.score - a.score)
```

## Confidentiality & Privacy

### Confidential Banner

**Display:**
- Red border (dashed)
- Lock icon
- ARIA live announcement
- On all review pages

**Message:**
> CONFIDENTIAL — for review/calibration use only
> 
> This information is private and should only be shared with your manager and HR during official performance reviews. Retention window applies.

### Data Retention

**Configurable Windows:**
- 30 days: Short cycles
- 60 days: Standard reviews
- 90 days: Annual reviews (default)
- 180 days: Promotion packets
- 365 days: Long-term reference

**What's Retained:**
- Review cycles
- Impact entries
- Feedback (requests and responses)
- Self-reviews
- Calibration notes

**Auto-Purge:**
- After retentionDays elapsed
- User can export before purge
- Explicit user delete anytime

### Anonymization

**Client-Side (Best-Effort):**
```typescript
redactPII(text):
  - Names → [redacted-name]
  - Emails → [redacted-email]
  - Preserve structure and sentiment

Limitations:
  - Regex-based (not NER)
  - May miss context clues
  - Not cryptographically secure

Production Recommendations:
  - Server-side NER (spaCy, AWS Comprehend)
  - Differential privacy
  - Secure multi-party computation
```

### Consent

**Required:**
- Explicit opt-in for calendar/email mining
- Clear explanation of data usage
- Dismissible banners
- Can disable anytime

**What's Collected:**
- Event titles (not content)
- Event dates and attendees
- Email metadata (not bodies unless pasted)

## Accessibility

### Keyboard Navigation

- Tab through all controls
- Enter/Space to activate buttons
- Arrow keys for lists and matrices
- Escape to dismiss dialogs

### Screen Reader Support

- ARIA labels on all inputs
- ARIA live regions for banners
- Semantic HTML (nav, main, article)
- Alt text for icons
- Table headers for matrices

### High Contrast

- Color contrast ratio ≥ 4.5:1
- Focus indicators (2px outline)
- Non-color-only information
- Delta matrix uses symbols + color

### Mobile Support

- Responsive grid layout
- Touch-friendly targets (44×44px)
- Swipe gestures for tabs
- Mobile-first design

## Testing

### Unit Tests (6 files)

**impactAggregator.spec.ts:**
- Aggregate evidence and OKRs
- Empty array for non-existent cycle

**privacyRedaction.spec.ts:**
- Redact names
- Redact emails
- Preserve non-PII
- Handle multiple instances

**feedbackAnonymize.spec.ts:**
- Build feedback email with subject
- Include anonymous link when provided

**selfReviewAI.spec.ts:**
- Parse overview and highlights
- Compute word count
- Compute clarity score

**calibrationMath.spec.ts:**
- Map impacts to rubric with deltas
- Handle empty impacts

**sentimentSummary.spec.ts:**
- Classify positive feedback (mock)
- Fallback to neutral on error

## Known Limitations

### 1. Impact Aggregation (Heuristic)

**What Works:**
- Evidence and OKR pull
- Competency inference from keywords
- Basic scoring and ranking

**What's Missing:**
- Weekly report persistence (Step 38)
- 1:1 note mining
- External achievements
- Peer recognition

### 2. Anonymization (Client-Side)

**What Works:**
- Simple name/email redaction
- Preserves structure and sentiment

**What's Missing:**
- NER (Named Entity Recognition)
- Context clue detection
- Cryptographic anonymity
- Differential privacy

**Production:**
- Server-side processing
- ML-based NER
- Secure computation

### 3. Sentiment Analysis (AI)

**What Works:**
- Basic positive/neutral/negative
- Step 31 AI integration
- Graceful fallback

**What's Missing:**
- Fine-grained emotions
- Sarcasm detection
- Context awareness
- Multi-language support

### 4. Calibration (Simplified)

**What Works:**
- Rubric mapping
- Delta calculation
- Evidence linking

**What's Missing:**
- Peer comparison
- Historical trends
- Industry benchmarks
- Compensation modeling

## Best Practices

### Review Preparation

**Do:**
- Start 2-4 weeks before deadline
- Aggregate impact weekly
- Request feedback early (2 weeks)
- Review and edit AI drafts
- Get manager input

**Don't:**
- Wait until last minute
- Rely solely on AI
- Skip evidence collection
- Ignore growth areas

### Feedback Requests

**Do:**
- Select diverse reviewers (manager, peers, stakeholders)
- Provide context (project, interaction)
- Send 2 weeks before deadline
- Send reminder after 1 week
- Thank respondents

**Don't:**
- Only ask friendly reviewers
- Send day before deadline
- Skip manager/key stakeholders
- Forget to follow up

### Self-Review Writing

**Do:**
- Use STAR format
- Include metrics and impact
- Be specific and concrete
- Acknowledge growth areas
- Align with company values
- Keep under 600 words

**Don't:**
- Use vague language
- List tasks without impact
- Exaggerate or inflate
- Skip growth areas
- Exceed word limit

### Promotion Packets

**Do:**
- Build incrementally (not last minute)
- Include diverse evidence
- Show scope increase over time
- Get manager feedback early
- Prepare for questions
- Export and share selectively

**Don't:**
- Rely on single project
- Inflate impact
- Skip peer feedback
- Wait for manager to build
- Share publicly

## Troubleshooting

### Impact Not Aggregating

**Problem:** aggregateImpact returns empty

**Solution:**
1. Check cycle has planId
2. Verify onboarding plan exists
3. Check evidence and OKRs exist
4. Review browser console

### Feedback Email Not Sending

**Problem:** Requests not marked as sent

**Solution:**
1. Check Gmail account connected (Step 35)
2. Verify OAuth token valid
3. Check recipient addresses
4. Review sending limits
5. Use fallback: manual copy-paste

### Self-Review Generation Fails

**Problem:** AI returns empty or error

**Solution:**
1. Check Step 31 AI configured
2. Verify impact entries exist (min 5)
3. Check internet connection
4. Try manual composition
5. Review AI settings

### PII Not Redacting

**Problem:** Names/emails still visible

**Solution:**
1. Check exact format (First Last)
2. Review regex patterns
3. Use manual review
4. Remember: best-effort only
5. Don't rely for legal compliance

## References

- Performance Reviews: https://hbr.org/2016/10/how-to-write-a-performance-review
- STAR Method: https://www.themuse.com/advice/star-interview-method
- 360 Feedback: https://www.cultureamp.com/blog/360-feedback-questions
- Calibration: https://lattice.com/library/what-is-performance-calibration
- Promotion Packets: https://staffeng.com/guides/promo-packets
