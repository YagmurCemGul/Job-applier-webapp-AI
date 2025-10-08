# Step 37 — Offer & Negotiation Suite

## Overview

This step implements a comprehensive Offer & Negotiation system that transforms the basic "Offer Prep" concept into a full-featured suite for job seekers. It integrates tightly with previous steps (Docs, AI, Jobs, Applications, Gmail/Calendar, Interview) to provide end-to-end offer management.

## Features

### 1. Offer Management
- **Capture offers** from multiple employers with complete details
- Track: base salary, bonus, equity, benefits, location, remote policy, PTO, perks
- Support for **multiple currencies** (USD, EUR, GBP, TRY, AUD, CAD, JPY, CNY, INR, BRL)
- **Import from text/email** - paste offer letters to auto-fill details
- **Stage tracking** - draft, received, negotiating, accepted, declined, expired

### 2. Total Compensation Calculator
- **Multi-horizon analysis** (1/2/4 years)
- Components:
  - Base salary
  - Target bonus (percentage)
  - **Equity valuation** (RSU, Options, PSU, ESPP)
  - **Benefits valuation** (PTO, health, retirement, stipends)
- **Tax adjustments** - user-configurable effective tax rate
- **Cost-of-living adjustments** - percentage delta vs baseline
- **Currency normalization** - compare offers in different currencies

### 3. Multi-Offer Comparison
- **Comparison Matrix** - side-by-side comparison of multiple offers
- **Ranking** - automatic ranking based on normalized total comp
- **What-If Analysis** - real-time recalculation when assumptions change
- Export comparisons to PDF/Google Docs

### 4. Negotiation Coach (AI-Powered)
- **Strategy generation** - personalized negotiation approach
- **Talking points** - key arguments and data points
- **Target adjustments** - suggested asks with rationale
- **Risk analysis** - potential concerns and mitigations
- **BATNA analysis** - Best Alternative To Negotiated Agreement
- **Email drafts** - ready-to-send negotiation emails

### 5. Deadlines & Reminders
- Track offer deadlines (accept, expire, background check, etc.)
- **Calendar integration** - create Google Calendar events (Step 35)
- **Approaching deadline alerts** - visual warnings within 72 hours
- Status indicators (past, approaching, future)

### 6. Document Management
- **Export to PDF** - offer summaries and comparisons
- **Export to Google Docs** - editable documents
- **E-signature stub** - demonstration interface (integrate DocuSign/Dropbox Sign in production)

### 7. Transition Planning
- **Resignation Checklist** - complete handover tasks
- **Relocation & Visa Checklist** - immigration and moving tasks
- Progress tracking with completion percentages

## Architecture

### Types (`src/types/`)
- `offer.types.ts` - Offer, equity, benefits, valuation types
- `negotiation.types.ts` - Negotiation plan, context, adjustments

### Stores (`src/stores/`)
- `offers.store.ts` - Global offers state
- `comparisons.store.ts` - Saved comparisons
- `offerSettings.store.ts` - User preferences (currency, tax rate, etc.)

### Services (`src/services/offer/`)

#### Core Calculators
- `compMath.service.ts` - Total compensation calculations
- `equityValuation.service.ts` - Equity grant valuation (RSU, Options, PSU, ESPP)
- `taxRough.service.ts` - Simple effective tax calculations
- `fxRates.service.ts` - Currency conversion (stub with pluggable adapter)
- `benefitValuation.service.ts` - PTO, health, retirement, stipend valuation

#### Integration Services
- `deadline.service.ts` - Calendar event creation (Step 35)
- `importers.service.ts` - Parse offers from text/email
- `negotiationCoach.service.ts` - AI-powered negotiation planning (Step 31)
- `docsExport.service.ts` - PDF/Docs export (Step 35/30)
- `esign.service.ts` - E-signature stub (replace with DocuSign/etc in production)

### UI Components (`src/components/offer/`)

#### Main Views
- `OffersPage.tsx` - Offers list with filters and search
- `OfferCreateDialog.tsx` - Create/import offer form
- `OfferDetail.tsx` - Detailed offer view with tabs
- `ComparisonMatrix.tsx` - Multi-offer comparison table

#### Tabs (`tabs/`)
- `OfferOverviewTab.tsx` - Summary and quick stats
- `CompensationTab.tsx` - Calculator with sliders
- `BenefitsTab.tsx` - Benefits editor
- `EquityTab.tsx` - Equity grants manager
- `DeadlinesTab.tsx` - Deadline tracker with calendar
- `NegotiationTab.tsx` - AI coach and emails
- `DocsTab.tsx` - Export and e-sign

#### Supporting Components
- `WhatIfPanel.tsx` - Assumption controls for comparison
- `NegotiationCoach.tsx` - Standalone coach component
- `ResignationPlanner.tsx` - Transition checklist
- `RelocationVisaChecklist.tsx` - Immigration and moving tasks

## Methodology & Disclaimers

### Equity Valuation
**Simplified Models** - The equity valuation is intentionally simplified for comparison purposes:

- **RSU/PSU**: `units × assumedSharePrice × vestingPct`
- **Options**: `max(assumedSharePrice - strikePrice, 0) × vestedUnits`
- **Vesting schedules**:
  - `4y_1y_cliff`: 25% at year 1, then 2.08%/month for 36 months
  - `4y_no_cliff`: Linear 25%/year
  - `custom`: User-defined schedule

**Limitations**:
- Does not account for:
  - Stock price volatility
  - Liquidity events (IPO, acquisition)
  - Tax treatment (ISO vs NSO, AMT)
  - Forfeiture risk
  - Secondary market opportunities
- Assumes linear vesting approximations
- Strike price is snapshot; does not model option value (Black-Scholes)

**User Overrides**:
- Users can specify `assumedSharePrice` to override stub lookup
- Target value can be used when units are unknown

### Tax Calculations
**Rough Estimates** - Tax calculations use a single effective rate:

```typescript
postTax = gross × (1 - taxRatePct/100)
```

**Limitations**:
- Does not account for:
  - Progressive tax brackets
  - State/local taxes
  - Deductions and credits
  - Payroll taxes (FICA, Medicare)
  - AMT implications
  - Capital gains vs ordinary income
- User must estimate their own effective rate

**Disclaimer**: Tax calculations are **estimates only** — consult a tax professional.

### Benefits Valuation
**Naive Approximations**:

- **PTO**: `days × (salary/260) × 0.3` (30% recoverable value)
- **Health**: `monthlyEmployer × 12`
- **Retirement**: `matchPct × salary × 0.6` (60% capture assumption)
- **Stipends**: Taken at face value
- **Signing bonus**: Spread over first year

**Limitations**:
- Actual value varies by individual circumstances
- Health insurance value depends on family size, health status
- Retirement match assumes partial capture (some leave before vesting)
- Does not account for:
  - Vision/dental coverage
  - Life insurance
  - Disability insurance
  - Commuter benefits
  - Wellness programs

### Currency Conversion
**Stub FX Rates** - Hard-coded exchange rates (to USD):

```typescript
const FX_TABLE: Record<CurrencyCode, number> = {
  USD: 1, EUR: 1.1, GBP: 1.28, TRY: 0.03, AUD: 0.67, 
  CAD: 0.74, JPY: 0.0065, CNY: 0.14, INR: 0.012, BRL: 0.19
};
```

**Production Replacement**:
- Integrate real-time FX API (e.g., exchangerate-api.com, Open Exchange Rates)
- Update rates periodically
- Cache for performance

### Stock Price Lookup
**Stub Implementation** - Returns fixed $50 for all tickers:

```typescript
async function stubPrice(_ticker: string) { return 50; }
```

**Production Replacement**:
- Integrate stock price API (Yahoo Finance, Alpha Vantage, IEX Cloud)
- Cache prices with TTL
- Handle delisted/private companies
- Provide user override

## Integration Points

### Step 30 — Documents
- Export offer summaries to PDF
- Export comparisons to Google Docs
- Uses existing doc generation infrastructure

### Step 31 — AI Orchestrator
- Negotiation coach uses `aiComplete` service
- Generates strategy, talking points, emails
- JSON mode for structured output
- Fallback gracefully if AI unavailable

### Step 32 — Jobs
- Offers can link to job applications via `applicationId`
- Future: import offer details from job postings

### Step 33 — Applications
- "Add Offer" button in Applications page
- Offers linked to applications via `applicationId`
- Track offer stage in application funnel

### Step 35 — Gmail & Calendar
- **Deadlines**: Create Google Calendar events
- **Negotiation**: Send emails via Gmail
- Uses existing OAuth and API services

### Step 36 — Interview Prep
- Offers typically follow interviews
- Future: auto-create offers from interview outcomes

## Accessibility

### WCAG AA Compliance
- **Keyboard navigation**: All interactive elements accessible via Tab/Arrow keys
- **Screen reader support**: ARIA labels on all controls
- **Color contrast**: Meets WCAG AA standards
- **Focus indicators**: Visible focus states
- **Live regions**: Announcements for calculator updates
- **Alternative text**: Charts include table equivalents

### Specific Implementations
- Comparison matrix has accessible table headers
- Calculators announce value changes
- Disclaimers in ARIA live regions
- All buttons have descriptive labels
- Form inputs have associated labels

## Privacy & Security

### Data Storage
- All data stored locally in browser (Zustand + localStorage)
- No external offer data transmission (except AI coach, which uses existing secure service)
- Users control all inputs

### Sensitive Data
- Tax rates, salaries, equity details never logged
- OAuth tokens handled by existing Step 35 services
- E-signature stub does not transmit documents (local blob only)

### Production Considerations
- Implement offer data encryption at rest
- Add option to exclude offers from browser sync
- Consider server-side storage with E2EE
- Audit AI coach prompts to avoid leaking company names

## Testing

### Unit Tests (`src/tests/unit/`)
- `compMath.spec.ts` - Compensation calculations
- `equityValuation.spec.ts` - RSU, Options, PSU, ESPP logic
- `taxRough.spec.ts` - Tax rate application
- `benefitValuation.spec.ts` - PTO, health, retirement
- `importers.spec.ts` - Text parsing accuracy

### Integration Tests (`src/tests/integration/`)
- `multi_offer_compare.spec.ts` - Comparison matrix, What-If panel
- `deadlines_integration.spec.ts` - Calendar event creation
- `docs_export.spec.ts` - PDF/Docs export pipeline

### E2E Tests (`src/tests/e2e/`)
- `step37-offer-negotiation-flow.spec.ts` - Complete user flow:
  - Create offer → Calculate totals → Negotiate → Export → Accept
  - Multi-offer comparison
  - Import from text
  - Keyboard navigation

## Localization (i18n)

### Supported Languages
- **English** (`en/offer.json`)
- **Turkish** (`tr/offer.json`)

### Translation Coverage
- All UI strings
- Stage labels
- Remote policy options
- Currency names (abbreviated)
- Tab labels
- Action buttons
- Disclaimers

### Future Enhancements
- Number/currency formatting per locale
- Date formats
- More languages (ES, FR, DE, etc.)

## Adapters for Production

### FX Rates (`fxRates.service.ts`)
Replace stub with real API:

```typescript
export async function convertFx(from: CurrencyCode, to: CurrencyCode, amount: number) {
  const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
  const data = await response.json();
  const rate = data.rates[to];
  return amount * rate;
}
```

### Stock Prices (`equityValuation.service.ts`)
Replace `stubPrice` with real lookup:

```typescript
async function getStockPrice(ticker: string): Promise<number> {
  const response = await fetch(`https://api.iexcloud.io/v1/stock/${ticker}/quote?token=YOUR_TOKEN`);
  const data = await response.json();
  return data.latestPrice;
}
```

### E-Signature (`esign.service.ts`)
Integrate DocuSign:

```typescript
export async function startESign(opts: { html: string; docTitle: string }) {
  const response = await fetch('https://api.docusign.com/v2.1/accounts/{accountId}/envelopes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      emailSubject: opts.docTitle,
      documents: [/* ... */],
      recipients: [/* ... */]
    })
  });
  return await response.json();
}
```

## Future Enhancements

### Advanced Equity Modeling
- **Option pricing**: Black-Scholes model
- **Monte Carlo simulation**: Price volatility scenarios
- **Secondary market**: Estimated liquidity value
- **409A valuations**: Private company strike prices

### Tax Planning
- **Progressive brackets**: Federal + state
- **AMT calculator**: Alternative Minimum Tax
- **ISO vs NSO**: Option exercise strategies
- **Tax loss harvesting**: Equity sale optimization
- **Withholding estimator**: W-4 recommendations

### Benefits Deep-Dive
- **Health plan comparison**: PPO vs HMO vs HDHP
- **HSA/FSA modeling**: Tax advantages
- **Retirement projections**: 401k growth over time
- **Mega backdoor Roth**: Advanced strategies

### Negotiation Insights
- **Market data integration**: Levels.fyi, Glassdoor, H1B data
- **Peer comparison**: Anonymous benchmarks
- **Success probability**: ML model for counter-offer acceptance
- **Timeline optimization**: When to counter, when to accept

### Decision Science
- **Multi-criteria decision analysis**: Weighted factors beyond comp
- **Risk tolerance**: Personal preference modeling
- **Life stage alignment**: Career goals, family, location
- **Scenario planning**: What if I get promoted? What if stock tanks?

## Known Limitations

1. **Equity valuation** is extremely simplified; does not replace financial advisor
2. **Tax calculations** use single effective rate; consult tax professional
3. **FX rates** are static stubs; production needs real-time API
4. **Stock prices** are mocked; production needs market data
5. **E-signature** is a demo stub; integrate DocuSign/etc for production
6. **Benefits valuation** uses naive approximations; actual value varies
7. **AI coach** depends on Step 31 service; fallback to static guidance if unavailable

## Compliance

### Disclaimers
All calculator views display prominent disclaimer:

> **Estimates only — not financial or tax advice.**

Additional disclaimers in:
- Compensation tab
- Comparison matrix
- Negotiation coach
- Exported PDFs

### Regulatory Considerations
- **NOT** financial advice (no FINRA/SEC issues)
- **NOT** tax advice (no CPA liability)
- Users responsible for verifying all information
- Encourage consultation with professionals

## Performance

### Optimization Strategies
- **Lazy loading**: Tabs load on demand
- **Memoization**: Expensive calculations cached
- **Debounced sliders**: Avoid excessive recalculation
- **Virtual scrolling**: Large comparison matrices (future)
- **Service workers**: Cache FX rates, stock prices

### Bundle Size
- Core offer logic: ~15KB gzipped
- UI components: ~40KB gzipped
- Total Step 37 contribution: ~55KB gzipped

## Changelog

### v1.0.0 (Step 37 Initial Release)
- Complete offer management (create, edit, stage)
- Multi-horizon compensation calculator
- Multi-offer comparison matrix
- What-If analysis panel
- AI-powered negotiation coach
- Deadline tracking with calendar integration
- PDF/Docs export
- E-signature stub
- Resignation & relocation checklists
- i18n (EN/TR)
- Comprehensive test suite
- Integration with Steps 30, 31, 33, 35, 36

---

## Quick Start

### Create an Offer
1. Navigate to `/offers`
2. Click "Add Offer"
3. Fill in details or paste offer letter in "Import" tab
4. Save

### Compare Offers
1. Click "Compare"
2. Select 2+ offers
3. Click "Compare Selected"
4. Adjust What-If panel (tax rate, COL, horizon, currency)
5. Export comparison to PDF

### Negotiate
1. Open offer detail
2. Navigate to "Negotiation" tab
3. Provide market context, priorities, BATNA
4. Click "Generate Plan"
5. Review strategy, talking points, target adjustments
6. Send draft email via Gmail (Step 35)

### Track Deadlines
1. Open offer detail
2. Navigate to "Deadlines" tab
3. Add deadline (label, date, type)
4. Click "Create Calendar Event" (Step 35 integration)
5. Monitor approaching deadlines on overview tab

---

**Built with production quality, modular architecture, strict types, comprehensive tests, and accessibility in mind.**
