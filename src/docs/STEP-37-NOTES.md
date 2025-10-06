# Step 37: Offer & Negotiation Suite

## Overview

This step implements a complete Offer & Negotiation Suite that enables users to capture, compare, and negotiate job offers with AI-powered insights, total compensation calculations, deadline tracking, and document management.

## Core Features

### 1. Offer Capture & Management

**Offer Creation:**
- Manual entry with comprehensive fields
- Quick import from pasted email/letter
- Auto-parsing of base, bonus, signing bonus, PTO
- Application linking (Step 33)

**Offer Fields:**
- Company, role, level
- Location and remote policy
- Base salary and currency
- Bonus percentage
- Equity grants (RSU, Options, PSU, ESPP)
- Benefits (PTO, health, retirement, stipend)
- Signing bonus and relocation
- Custom fields for flexibility

**Offer Stages:**
- draft: Initial capture
- received: Official offer received
- negotiating: In negotiation
- accepted: Offer accepted
- declined: Offer declined
- expired: Deadline passed

### 2. Total Compensation Calculator

**Components:**
```typescript
Total Comp = Base + Bonus + Equity + Benefits

Base: Annual salary
Bonus: Base × BonusTargetPct
Equity: Annualized vested value
Benefits: PTO + Health + Retirement + Stipend + Signing

Post-Tax: Total × (1 - TaxRate)
Adjusted: Post-Tax × (1 + COL%)
Normalized: Convert to base currency via FX
```

**Equity Valuation:**
```typescript
RSU/PSU:
  value = units × sharePrice × vestedPct
  annualized = value / horizonYears

Options:
  intrinsic = max(sharePrice - strikePrice, 0)
  value = intrinsic × units × vestedPct
  annualized = value / horizonYears

Target Value (when units unknown):
  annualized = targetValue × vestedPct / horizonYears
```

**Vesting Schedules:**
```typescript
4y_no_cliff:
  Year 1: 25%
  Year 2: 50%
  Year 3: 75%
  Year 4: 100%

4y_1y_cliff:
  Year 0-1: 0%
  Year 1.25: ~6.67%
  Year 2: ~33%
  Year 3: ~67%
  Year 4: 100%

Custom:
  User-defined vesting milestones
  Array of { atMonths, pct }
```

**Tax Calculation (Rough):**
```typescript
roughTax(amount, ratePct):
  postTax = amount × (1 - ratePct / 100)

Example:
  $120,000 at 30% tax
  → $84,000 post-tax

⚠️ DISCLAIMER: Simplified model for comparison
    Not actual tax advice
    User should consult tax professional
```

**Benefits Valuation:**
```typescript
PTO Value:
  dailyRate = baseAnnual / 260
  ptoValue = ptoDays × dailyRate × 0.3
  (30% recoverable value assumption)

Health Insurance:
  annualValue = monthlyEmployer × 12

Retirement Match:
  annualValue = baseAnnual × matchPct × 0.6
  (60% capture assumption)

Stipend:
  annualValue = stipendAnnual

Signing Bonus:
  One-time value (spread over horizon)
```

**Currency Conversion (FX):**
```typescript
Stub Table:
  USD: 1.00
  EUR: 1.10
  GBP: 1.28
  TRY: 0.03
  AUD: 0.67
  CAD: 0.74
  JPY: 0.0065
  CNY: 0.14
  INR: 0.012
  BRL: 0.19

Process:
  1. Convert source to USD: amount × TABLE[from]
  2. Convert USD to target: usd / TABLE[to]

Example:
  €100,000 to USD
  → €100k × 1.10 = $110,000

⚠️ Production: Use real-time API
    - exchangerate-api.com
    - xe.com API
    - Central bank rates
```

### 3. Multi-Offer Comparison

**Comparison Matrix:**
```typescript
Columns:
  - Offer A (Acme Corp)
  - Offer B (TechCo)
  - Offer C (StartupX)
  - Rank

Rows:
  - Base Salary
  - Bonus
  - Equity (annualized)
  - Benefits
  - Total Pre-Tax
  - Total Post-Tax
  - Normalized (USD)

Ranking:
  Based on normalized total comp
  Dynamically updates with What-If changes
```

**What-If Panel:**
```typescript
Adjustable Parameters:
  - Horizon: 1yr | 2yr | 4yr
  - Tax Rate: 0-50%
  - COL Adjustment: -50% to +100%
  - Base Currency: USD/EUR/GBP/etc.

Real-time Recalculation:
  User moves slider
    ↓
  Recompute all offers
    ↓
  Update matrix
    ↓
  Re-rank offers
```

### 4. AI Negotiation Coach

**Plan Generation:**
```typescript
Input:
  - Offer details
  - Market research notes
  - Priorities (base vs equity vs benefits)
  - BATNA (Best Alternative)

AI Prompt (Step 31):
  "You are a negotiation coach for job offers.
   Generate strategy, talking points, target adjustments,
   risk notes, and email templates.
   Focus on respectful tone, data-backed rationale."

Output:
  {
    strategy: "Focus on equity upside; use competing offer as anchor",
    talkingPoints: [
      "Thank them for the offer",
      "Express enthusiasm for the role",
      "Share market research data",
      "Propose alternatives (equity vs base)"
    ],
    targetAdjustments: [
      {
        field: 'base',
        askPct: 10,
        rationale: "Market data shows $X for this level"
      },
      {
        field: 'equity',
        askAbs: 50000,
        rationale: "Equity upside compensates for base delta"
      }
    ],
    riskNotes: [
      "Verify internal equity bands",
      "Don't anchor too high initially"
    ],
    emails: [
      {
        subject: "Following up on offer",
        bodyHtml: "<p>Thank you for the offer...</p>"
      }
    ]
  }
```

**Email Composition:**
```typescript
Generated emails:
  ✓ Professional tone
  ✓ Data-backed rationale
  ✓ Specific asks
  ✓ Gratitude and enthusiasm
  ✓ Flexible alternatives

Integration:
  ✓ Preview in dialog
  ✓ Edit before sending
  ✓ Send via Gmail (Step 35)
  ✓ Track in Outbox
```

### 5. Deadline Management

**Deadline Types:**
- accept: Final decision deadline
- expire: Offer expiration
- background: Background check deadline
- other: Custom deadlines

**Features:**
```typescript
Create Deadline:
  1. Label (e.g., "Accept by")
  2. Date/time (ISO)
  3. Kind (accept/expire/etc.)
  4. Save to offer

Calendar Integration (Step 35):
  1. Create Google Calendar event
  2. Set reminder (15 min before)
  3. Add to offer.deadlines
  4. Link calendar event ID

Urgent Alert:
  if (deadline < 72 hours):
    Show red "Urgent" badge
    Sort to top of list
```

### 6. Document Export & E-Signature

**Export Formats:**
- PDF summary
- Google Docs (HTML)
- Email body (inline)

**E-Signature (Stub):**
```typescript
startESign({ html, docTitle }):
  1. Generate unique ID
  2. Create blob URL from HTML
  3. Return { id, url, status: 'pending' }

Production Integration:
  - DocuSign API
  - Dropbox Sign
  - Adobe Sign
  - HelloSign
```

## Type System

### Offer

```typescript
interface Offer {
  id: string
  applicationId?: string
  company: string
  role: string
  level?: string
  location?: string
  remote?: 'on_site' | 'hybrid' | 'remote'
  currency: CurrencyCode
  baseAnnual: number
  bonusTargetPct?: number
  equity?: EquityGrant[]
  benefits?: Benefits
  stage: OfferStage
  deadlines?: Deadline[]
  customFields?: Record<string, any>
}
```

### EquityGrant

```typescript
interface EquityGrant {
  id: string
  type: 'RSU' | 'Options' | 'PSU' | 'ESPP'
  units?: number
  strikePrice?: number
  vestSchedule?: '4y_1y_cliff' | '4y_no_cliff' | 'custom'
  vestCustom?: Array<{ atMonths: number; pct: number }>
  targetValue?: number
  ticker?: string
  assumedSharePrice?: number
}
```

### Benefits

```typescript
interface Benefits {
  ptoDays?: number
  healthMonthlyEmployer?: number
  retirementMatchPct?: number
  stipendAnnual?: number
  signingBonus?: number
  relocation?: number
  visaSupport?: boolean
  notes?: string
}
```

### NegotiationPlan

```typescript
interface NegotiationPlan {
  id: string
  offerId: string
  strategy: string
  talkingPoints: string[]
  targetAdjustments: Array<{
    field: 'base' | 'bonus' | 'equity' | 'signing' | 'pto' | 'other'
    askPct?: number
    askAbs?: number
    rationale: string
  }>
  riskNotes?: string[]
  batna?: string
  emails?: Email[]
}
```

## Services

### compMath.service.ts

```typescript
totalComp(offer, valuationInputs): Promise<CompResult>

Process:
  1. Calculate base
  2. Calculate bonus (base × bonusTargetPct)
  3. Annualize equity (await annualizeEquity)
  4. Value benefits (valueBenefits)
  5. Sum gross = base + bonus + equity + benefits
  6. Apply tax: postTax = roughTax(gross, taxRate)
  7. Adjust for COL: adjusted = postTax × (1 + cocAdj%)
  8. Normalize currency: normalized = convertFx(...)

Returns:
  {
    currency,
    base,
    bonus,
    equity,
    benefits: { signingSpread, annualValue },
    gross,
    postTax,
    adjusted,
    normalized
  }
```

### equityValuation.service.ts

```typescript
annualizeEquity(offer, inputs): Promise<number>

For each grant:
  1. Get share price (assumedSharePrice or stub)
  2. Calculate vested % based on schedule
  3. Calculate value:
     - RSU/PSU: sharePrice × units × vestedPct
     - Options: max(sharePrice - strike, 0) × units × vestedPct
     - Target: targetValue × vestedPct
  4. Sum all grants
  5. Annualize: total / horizonYears

Vesting Calculation:
  4y_no_cliff:
    vestPct = min(1, years / 4)
  
  4y_1y_cliff:
    vestPct = min(1, max(0, (years - 0.25) / 3.75))
  
  custom:
    vestPct = sum(steps where atMonths <= years×12) / 100
```

### importers.service.ts

```typescript
parseOfferFromText(raw): Partial<Offer>

Regex Patterns:
  Company: /(?:from|at)\s+([A-Z][A-Za-z0-9&.\- ]{2,})/i
  Base: /(?:base|salary)[:\s]*\$?\s*([\d,]+)/i
  Bonus: /bonus[^%]*?(\d{1,2})%/i
  Currency: /\b(USD|EUR|GBP|...)\b/i
  Signing: /signing\s+bonus[^$]*\$?\s*([\d,]+)/i
  PTO: /(\d{1,2})\s+(?:days?|PTO)/i
  Role: /(?:for|as|position:?)\s+([A-Z][A-Za-z\s]{5,30})/i

Returns:
  Partial offer object with extracted fields
```

### negotiationCoach.service.ts

```typescript
buildNegotiationPlan(offer, context): Promise<NegotiationPlan>

AI Prompt Structure:
  System: "You are a negotiation coach for job offers."
  
  Task: "Generate JSON with:
    - strategy: Overall approach
    - talkingPoints: Key messages
    - targetAdjustments: Specific asks with rationale
    - riskNotes: Things to watch for
    - emails: Ready-to-send templates"
  
  Input: Offer details + market context + BATNA

AI Call (Step 31):
  await aiRoute({
    task: 'generate',
    prompt,
    temperature: 0.4,
    maxTokens: 1500
  })

Fallback:
  If AI fails:
    - Generic strategy
    - Standard talking points
    - Empty adjustments
    - Basic risk notes
```

## UI Components

### OffersPage

**Features:**
- List all offers
- Search by company/role
- Filter by stage
- Quick 1yr total display
- Urgent deadline badges
- Create new offer

**Layout:**
```tsx
Header:
  [Search] [Stage Filter] [Compare] [Add Offer]

Disclaimer:
  ⚠️ Estimates only — not financial or tax advice

Offer Cards:
  Company + Role
  Stage Badge
  Urgent Badge (if deadline < 72h)
  1yr Total Comp
  Location + Remote mode
```

### OfferCreateDialog

**Features:**
- Quick import textarea
- Parse & Fill button
- Manual entry fields
- Currency selector
- Create and navigate to detail

**Import Flow:**
```typescript
1. User pastes offer email
2. Click "Parse & Fill"
3. Regex extraction
4. Auto-populate fields
5. User reviews/edits
6. Create offer
```

### OfferDetail

**Header:**
- Company + Role
- Stage badge
- Accept/Decline buttons
- 1yr/2yr/4yr total estimates

**Tabs (7):**
1. Overview: Snapshot, quick facts
2. Compensation: Calculator with breakdown
3. Benefits: PTO, health, retirement details
4. Equity: Grants, vesting, charts
5. Deadlines: Manage deadlines, calendar sync
6. Negotiation: AI coach, email composer
7. Docs: Export, e-sign

### ComparisonMatrix (Planned)

**Features:**
- Select multiple offers
- Side-by-side comparison
- Ranking column
- What-If panel integration
- Export comparison to PDF

**What-If Panel:**
```typescript
Sliders:
  - Horizon: 1yr | 2yr | 4yr
  - Tax Rate: 0-50%
  - COL Adjustment: -50% to +100%
  - Base Currency: USD/EUR/GBP/etc.

Live Updates:
  User adjusts slider
    ↓
  Recalculate all offers
    ↓
  Update matrix values
    ↓
  Re-rank offers
    ↓
  Highlight changes
```

### NegotiationCoach (Planned)

**Features:**
- Market research input
- Priorities selection
- BATNA entry
- Generate AI plan
- Email templates
- Send via Gmail (Step 35)

**Generated Content:**
```typescript
Strategy:
  "Focus on equity upside to compensate for
   base delta. Use competing offer as anchor.
   Maintain collaborative tone."

Talking Points:
  • Thank them for the comprehensive offer
  • Express strong interest in the role
  • Share market data: $X for this level/location
  • Propose equity increase as alternative to base

Target Adjustments:
  Base: Ask +10% ($12k) - Market alignment
  Equity: Ask +$50k target value - Long-term upside
  Signing: Ask +$10k - Relocation costs

Email Template:
  Subject: "Following up on offer discussion"
  
  Body:
    "Dear [Hiring Manager],
     
     Thank you for the offer for [Role].
     I'm very excited about the opportunity.
     
     Based on my research and experience, I'd like
     to discuss [specific adjustment].
     
     I'm flexible and open to alternatives such as
     [equity vs signing vs PTO].
     
     Looking forward to our conversation.
     
     Best regards,
     [Your Name]"
```

## Integration with Steps 17-36

### Step 27 (Profile)
```typescript
// Auto-populate from CV
offer.customFields = {
  candidateName: cv.personalInfo.fullName,
  candidateEmail: cv.personalInfo.email
}
```

### Step 31 (AI Orchestrator)
```typescript
// Negotiation plan generation
const plan = await buildNegotiationPlan(offer, context)
  → Uses aiRoute() for LLM call
  → Returns strategy, talking points, emails
```

### Step 32 (Jobs)
```typescript
// Create offer from job posting
job → application → offer
  offer.company = job.company
  offer.role = job.title
  offer.location = job.location
```

### Step 33 (Applications)
```typescript
// Link offer to application
offer.applicationId = application.id

// Update application stage
if (offer.stage === 'accepted') {
  application.stage = 'offer'
}

// Display in application detail
<ApplicationDetailDrawer>
  <OffersList applicationId={app.id} />
</ApplicationDetailDrawer>
```

### Step 35 (Gmail/Calendar)
```typescript
// Create deadline calendar events
await createDeadlineEvent({
  accountId: userGmailAccount,
  label: 'Accept offer by',
  atISO: deadline.atISO,
  attendees: []
})

// Send negotiation emails
await sendEmail({
  to: recruiter.email,
  subject: plan.emails[0].subject,
  html: plan.emails[0].bodyHtml
})
```

### Step 36 (Interviews)
```typescript
// Create offer from interview
interview → application → offer
  offer.company = interview.company
  offer.role = interview.role

// Link back
offer.interviewId = interview.id
```

## Algorithms

### Equity Annualization

```typescript
Example: $100k RSU grant, 4yr no cliff, 1yr horizon

Calculate vested %:
  vestPct = min(1, 1 / 4) = 0.25

Calculate value:
  value = units × sharePrice × vestPct
        = 1000 × $100 × 0.25
        = $25,000

Annualize:
  annualized = $25,000 / 1
             = $25,000

For 2yr horizon:
  vestPct = min(1, 2 / 4) = 0.5
  value = 1000 × $100 × 0.5 = $50,000
  annualized = $50,000 / 2 = $25,000

Result: Same annualized value regardless of horizon
```

### Benefit Valuation

```typescript
Example: $120k base, 20 PTO days, $500/mo health

PTO Value:
  dailyRate = $120k / 260 = $461.54
  value = 20 days × $461.54 × 0.3
        = $2,769.23

Health:
  value = $500 × 12 = $6,000

Retirement (4% match):
  value = $120k × 0.04 × 0.6
        = $2,880

Stipend ($2k):
  value = $2,000

Total Annual:
  $2,769 + $6,000 + $2,880 + $2,000
  = $13,649
```

### Total Comp Calculation

```typescript
Offer:
  Base: $120,000
  Bonus: 15%
  Equity: $25,000 annualized
  Benefits: $13,649
  Signing: $10,000

Gross:
  $120k + $18k + $25k + $13.6k + $10k
  = $186,600

Post-Tax (30%):
  $186,600 × 0.70
  = $130,620

COL Adjustment (+10% for HCOL):
  $130,620 × 1.10
  = $143,682

Normalized (already USD):
  $143,682
```

## Disclaimers & Methodology

### Financial Disclaimer

**Displayed on all calculator views:**
> ⚠️ Estimates only — not financial or tax advice
> 
> These calculations are simplified models for comparison purposes only. They do not account for:
> - Actual tax brackets and deductions
> - AMT (Alternative Minimum Tax)
> - State/local taxes
> - Capital gains treatment
> - Vesting acceleration clauses
> - Clawback provisions
> - Market volatility
> 
> Consult a tax professional and financial advisor for personalized guidance.

### Equity Methodology

**Assumptions:**
- Linear vesting within schedule
- Share price remains constant (or user-provided assumption)
- Options: Intrinsic value only (no time value)
- No early exercise scenarios
- No secondary market liquidity discounts

**User Overrides:**
- assumedSharePrice: Manual price entry
- vestCustom: Custom vesting milestones
- targetValue: Total value if units unknown

### Tax Methodology

**Assumptions:**
- Single effective tax rate (user-estimated)
- No bracket progression
- No deductions or credits
- Federal + state combined

**Typical Rates:**
- Low: 20-25% (junior, low tax state)
- Medium: 25-35% (mid-level, average)
- High: 35-45% (senior, high tax state)

### Cost-of-Living

**Adjustment:**
- Relative to baseline (user's current location)
- Expressed as percentage delta
- Applied to post-tax amount

**Example:**
- Current: Kansas City (baseline 0%)
- Offer: San Francisco (+30% COL)
- Offer: Austin (+5% COL)

### Currency Conversion

**Stub Table:**
- Based on approximate rates
- Updated periodically (manual)
- Production: Use live API

**Production APIs:**
- exchangerate-api.com
- xe.com API
- ECB (European Central Bank)
- Fed Reserve data

## Testing

### Unit Tests (5 files, 20+ tests)

**compMath.spec.ts:**
- Total comp with all components
- Offers without equity
- Tax rate application
- Currency normalization

**equityValuation.spec.ts:**
- RSU value with no cliff
- Options intrinsic value
- Target value handling
- 1yr cliff vesting
- Custom vesting schedules

**taxRough.spec.ts:**
- Standard rates (25%, 30%)
- Edge cases (0%, 100%)
- Decimal amounts

**benefitValuation.spec.ts:**
- All benefit components
- Missing benefits
- Signing bonus spread

**importers.spec.ts:**
- Parse complete offer
- Different formats
- Extract PTO days
- Handle missing fields

### Integration Tests (Planned)

**multi_offer_compare.spec.ts:**
1. Create 3 offers
2. Calculate totals for each
3. Rank by normalized total
4. Adjust What-If parameters
5. Verify re-ranking

**deadlines_integration.spec.ts:**
1. Add deadline to offer
2. Create calendar event
3. Verify event link
4. Check urgent alert

**docs_export.spec.ts:**
1. Generate offer summary HTML
2. Export to PDF
3. Export to Docs
4. Verify content

### E2E Tests (Planned)

**step37-offer-negotiation-flow.spec.ts:**
1. Create offer from application
2. Enter all details (base, equity, benefits)
3. Calculate total comp (1yr/2yr/4yr)
4. Generate negotiation plan (AI)
5. Send negotiation email (Gmail mock)
6. Add deadline (Calendar)
7. Export to PDF
8. Mark accepted
9. Verify application stage updated

## Known Limitations

### 1. Equity Valuation (Simplified)

**What's Missing:**
- Time value of options
- Dividend assumptions
- Secondary market discounts
- IPO probability modeling
- Dilution effects
- Liquidity events

**Workaround:**
- Allow user to override share price
- Provide conservative/optimistic scenarios
- Link to external equity calculators

### 2. Tax Calculation (Rough)

**What's Missing:**
- Progressive tax brackets
- State/local taxes
- Deductions (standard/itemized)
- Credits (EITC, child tax, etc.)
- AMT calculations
- Capital gains treatment

**Workaround:**
- User estimates effective rate
- Link to tax calculators
- Annual tax review reminder

### 3. Currency Conversion (Stub)

**What's Missing:**
- Real-time rates
- Historical trends
- Forward rates
- Cross-border tax implications

**Workaround:**
- Static table (updated periodically)
- Production: API integration
- User can verify externally

### 4. Benefits Valuation (Estimates)

**What's Missing:**
- Actual health plan costs
- Retirement vesting schedules
- PTO carryover policies
- Perks monetary value

**Workaround:**
- Conservative assumptions
- User can adjust manually
- Notes field for specifics

## Best Practices

### Offer Capture

**Do:**
- Capture offers immediately
- Include all components (base, equity, benefits)
- Set deadlines as soon as known
- Link to application
- Save email/letter as attachment

**Don't:**
- Delay entry (risk forgetting details)
- Skip equity details
- Ignore benefits
- Forget to track deadlines

### Comparison

**Do:**
- Compare apples-to-apples (same horizon)
- Adjust for tax differences (location)
- Account for COL differences
- Consider non-monetary factors
- Review with trusted advisor

**Don't:**
- Focus only on base salary
- Ignore vesting cliffs
- Overlook benefits value
- Decide based on numbers alone

### Negotiation

**Do:**
- Research market data
- Know your BATNA
- Be specific in asks
- Provide data-backed rationale
- Offer alternatives (base vs equity)
- Maintain professional tone
- Express enthusiasm

**Don't:**
- Anchor too high initially
- Make ultimatums
- Compare to other candidates
- Negotiate via email only
- Skip the call/meeting

### Documentation

**Do:**
- Export all offers to PDF
- Keep email trail
- Document verbal agreements
- Request written confirmation
- Save signed offer letter

**Don't:**
- Rely on memory
- Accept verbal-only offers
- Skip reading fine print
- Sign without review

## Privacy & Security

### Data Storage

**Local:**
- Offers stored in localStorage
- Encrypted if browser supports
- No external transmission
- User controls deletion

**Server (Production):**
- Encrypted at rest
- TLS in transit
- User-owned data
- GDPR-compliant deletion

### Sensitive Fields

**Never Logged:**
- Equity details
- Salary amounts
- Personal financial data
- Tax information

**Masked in UI:**
- Email addresses
- Phone numbers
- Recruiter contacts

## Future Enhancements

### Short-Term

1. **Advanced Calculator:**
   - Progressive tax brackets
   - State/local taxes
   - AMT calculation
   - Capital gains scenarios

2. **Market Data:**
   - levels.fyi integration
   - Glassdoor data
   - Blind salary data
   - H1B wage data

3. **Equity Tools:**
   - Option exercise calculator
   - 409A valuations
   - 83(b) election guidance
   - Secondary market liquidity

### Medium-Term

4. **Negotiation Analytics:**
   - Success rate tracking
   - Typical counters by company
   - Industry benchmarks
   - Seasonal trends

5. **Collaboration:**
   - Share with partner/spouse
   - Advisor comments
   - Family decision tools

6. **Automation:**
   - Auto-parse offer emails (ML)
   - Extract equity from offer letters
   - OCR for PDFs
   - Calendar auto-sync

### Long-Term

7. **Financial Planning:**
   - Net worth projection
   - Retirement impact
   - College savings impact
   - Mortgage qualification

8. **Legal Integration:**
   - Contract review AI
   - Non-compete analysis
   - IP assignment review
   - Severance terms

## Troubleshooting

### Equity Value Shows 0

**Problem:** Equity not included in total

**Solution:**
1. Check units and share price entered
2. Verify vesting schedule selected
3. Ensure horizon >= cliff period
4. Review assumedSharePrice field

### Tax Seems Wrong

**Problem:** Post-tax value unexpected

**Solution:**
1. Verify tax rate (effective, not marginal)
2. Check that rate is percentage (not decimal)
3. Typical rates: 20-45%
4. Consult tax calculator for actual rate

### Import Not Working

**Problem:** Parse doesn't fill fields

**Solution:**
1. Ensure email contains key phrases
2. Check format: "Base: $120,000"
3. Try manual entry
4. Report format for improvement

### Currency Conversion Off

**Problem:** Normalized value seems incorrect

**Solution:**
1. Check stub TABLE in fxRates.service.ts
2. Verify currencies (3-letter codes)
3. Use external converter to verify
4. Production: Use live API

## References

- Equity Compensation: https://www.schwab.com/learn/story/stock-options-rsus-taxes
- Total Comp: https://www.levels.fyi/blog/total-compensation.html
- Negotiation: https://www.kalzumeus.com/2012/01/23/salary-negotiation/
- BATNA: https://www.pon.harvard.edu/tag/batna/
- Tax Brackets: https://www.irs.gov/filing/federal-income-tax-rates-and-brackets
