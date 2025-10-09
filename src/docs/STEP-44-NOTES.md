# STEP 44 — Offer Negotiation & Comparison Suite

## Overview

Step 44 implements a comprehensive **Offer Negotiation & Comparison** module that enables users to:

- **Ingest offers** from PDF, text, or manual input with automated field extraction
- **Model equity** with vesting schedules, growth scenarios, and risk bands
- **Compare offers** across multiple time horizons with NPV calculations
- **Benchmark compensation** against market data
- **Generate negotiation materials** including talking points, counter emails, and call agendas
- **Track outcomes** and update Pipeline/Application statuses
- **Export negotiation packets** as PDF or Google Docs

## Architecture

### Types & Data Models

#### Offer Types (`offer.types.step44.ts`)
- `Offer`: Comprehensive offer with base, bonus, equity, benefits
- `OfferParseResult`: Parsed fields with confidence scores
- `ComparisonHorizon`: Time horizon, discount rate, growth, tax assumptions
- `ComparisonRow`: Multi-year totals and NPV for comparison

#### Equity Types (`equity.types.ts`)
- `VestingEvent`: Monthly/quarterly/annual vesting events
- `EquityModelInput`: Parameters for equity modeling
- `EquityValuation`: Valuation results with risk bands

#### Negotiation Types (`negotiation.types.step44.ts`)
- `CounterAsk`: Counter-offer details with rationale
- `BenchmarkRow`: Market compensation data

### Services

#### Offers Services (`services/offers/`)
- **intake.service.ts**: PDF/text intake and normalization
- **parseOffer.service.ts**: Heuristic extraction of compensation fields
- **currency.stub.service.ts**: Offline FX conversion (user-editable rates)
- **comparison.service.ts**: Multi-offer NPV comparison
- **benchmarks.service.ts**: CSV benchmark import
- **exportPacket.service.ts**: PDF/Google Doc export

#### Equity Services (`services/equity/`)
- **vesting.service.ts**: Monthly/quarterly/annual schedule generation
- **valuation.service.ts**: Growth-based equity valuation
- **tax.stub.service.ts**: Simplified blended marginal tax estimates
- **scenarios.service.ts**: Low/base/high scenario modeling

#### Negotiation Services (`services/negotiation/`)
- **talkingPoints.service.ts**: Evidence-backed bullets from portfolio/reviews/interviews
- **emailTemplates.service.ts**: Counter-offer email templates
- **strategy.service.ts**: Anchor/ask computation, HTML escaping
- **email.service.ts**: Gmail integration for sending counters
- **calendar.service.ts**: Google Calendar integration for scheduling calls

### UI Components

All components are in `components/offers/`:

- **OffersPage.tsx**: Main hub with tabs
- **OfferIntakeCard.tsx**: PDF/text intake with preview
- **OfferDetail.tsx**: Editable offer fields
- **OfferCompareTable.tsx**: Multi-offer comparison with NPV sorting
- **EquityModeler.tsx**: Vesting schedule and valuation
- **ScenarioSimulator.tsx**: Low/base/high projections
- **BenchmarksPanel.tsx**: CSV import, P50/P75 display, anchor suggestions
- **NegotiationPlaybook.tsx**: Talking points, strategy, objections
- **CounterEmailWizard.tsx**: Template-based email generation
- **CallPlanner.tsx**: Calendar scheduling UI
- **AcceptanceChecklist.tsx**: Post-acceptance tasks
- **DocsVault.tsx**: Document storage (placeholder)
- **AnalyticsPanel.tsx**: Conversion metrics

### State Management

#### Offers Store (`offers.store.step44.ts`)
- Stores offers, comparison rows, and benchmarks
- Methods: `upsert`, `remove`, `upsertComparison`, `bulkBenchmarks`, `byId`

#### Negotiation Store (`negotiation.store.step44.ts`)
- Stores counter-offer requests
- Methods: `upsert`, `update`, `byOffer`

### Integration Points

#### Applications Page
- Added **"Log Offer"** action: creates offer from application and navigates to offers page
- Added **"Start Negotiation"** action: deep-links to negotiate tab with prefilled company

#### Pipeline (Step 41)
- Offers can update pipeline stage to `offer` or `in_process`

#### Applications Timeline (Step 33)
- Offer acceptance/decline events can be logged (integration pending)

#### Export (Step 30)
- Negotiation packets export via PDF or Google Docs services

#### Gmail & Calendar (Step 35)
- Send counter emails via Gmail
- Schedule negotiation calls via Calendar

#### Evidence, Quotes, Portfolio, Interviews (Steps 38–40, 43)
- Talking points pull from self-reviews, portfolio links, interview feedback

## Assumptions & Disclaimers

### Financial Modeling
- **Growth/discount/tax rates are user-set**; defaults are conservative
- **Equity valuation is not predictive**; shows educational scenarios only
- **Tax estimates are simplified**; not accounting/legal advice
- **FX rates are offline stubs**; user can override or plug real API

### Privacy & Security
- **Local-only storage** by default via Zustand persist
- **Redaction tools** for exports (name/email/address removal)
- **No external scraping** or auto-fetching of stock prices
- **User consent** for anchoring language

### Fairness & Ethics
- **Balanced pros/cons** presented (not just "ask high")
- **No pressure tactics** in templates
- **Educational guidance only**; encourages informed decisions

## Accessibility (WCAG AA)

- **Keyboard-first**: All tables, forms, and wizards navigable via keyboard
- **Clear labels**: Aria-labels on currency inputs, comparison cells
- **Color contrast**: 4.5:1 minimum for all text
- **Table summaries**: Aria-live regions for risk/assumption notices
- **Focus-visible**: Clear focus indicators on interactive elements

## Internationalization

- **Currency conversions**: Via stub service; user can override rates per-offer
- **Multi-currency support**: Comparison table normalizes to target currency
- **i18n files**: `en/offer.step44.json`, `tr/offer.step44.json`
- **Number formatting**: Uses locale-aware `toLocaleString()`

## Testing

### Unit Tests
- `offer_parse.spec.ts`: Field extraction, confidence scoring
- `vesting_math.spec.ts`: Cliff, schedules, rounding
- `equity_valuation.spec.ts`: Growth compounding, volatility bands
- `scenarios_npv.spec.ts`: Discount rate, tax impact
- `currency_stub.spec.ts`: FX reversibility
- `benchmarks_match.spec.ts`: CSV parsing, filtering
- `comparison_table.spec.ts`: NPV sorting, risk notes
- `talking_points.spec.ts`: Evidence aggregation
- `counter_email.spec.ts`: Template rendering, HTML escaping
- `calendar_create.spec.ts`: Event creation (mock)
- `export_packet.spec.ts`: HTML generation

### Integration Tests
- `intake_to_compare_flow.spec.ts`: PDF intake → parse → compare → export
- `model_to_counter_flow.spec.ts`: Equity model → benchmarks → counter email
- `accept_decline_logging.spec.ts`: Status tracking, timestamps

### E2E Test
- `step44-offer-negotiation.spec.ts`: Full flow with multiple offers, comparison, scenarios, email, analytics

## Extensibility

### Future Enhancements
- **Real market data**: Plug stock price APIs (Yahoo Finance, Alpha Vantage)
- **Multi-currency per-offer**: Live FX rates from exchangerate-api.com
- **Severance modeling**: Add termination/layoff scenario
- **Benefits valuation**: PTO, health, 401k matching quantification
- **Negotiation AI coach**: GPT-4 powered strategy suggestions
- **Multi-party negotiations**: Track multiple recruiters/hiring managers
- **Offer comparison sharing**: Export comparison links for partners/advisors

### Risk Modeling
- **Concentration risk**: Highlight single-company equity exposure
- **Volatility bands**: Show ±20% scenarios by default
- **Cliff impact**: Visualize pre-cliff vs post-cliff value
- **Refresher modeling**: Multi-year refresher grants

## Performance

- **Local computation**: All NPV/valuation runs client-side
- **Memoization**: `useMemo` for scenario/comparison calculations
- **Lazy loading**: Components loaded per-tab
- **Batch updates**: Zustand persist debounced

## Known Limitations

1. **PDF parsing is heuristic**: May miss non-standard formats
2. **Tax estimates are US-centric**: No multi-country tax support yet
3. **No real-time stock prices**: User must input manually
4. **No e-signature flow**: External DocuSign/HelloSign needed
5. **No automated reminders**: User must set Calendar events manually

## Files Created

### Types
- `src/types/equity.types.ts`
- `src/types/offer.types.step44.ts`
- `src/types/negotiation.types.step44.ts`

### Stores
- `src/stores/offers.store.step44.ts`
- `src/stores/negotiation.store.step44.ts`

### Services
- `src/services/offers/intake.service.ts`
- `src/services/offers/parseOffer.service.ts`
- `src/services/offers/currency.stub.service.ts`
- `src/services/offers/comparison.service.ts`
- `src/services/offers/benchmarks.service.ts`
- `src/services/offers/exportPacket.service.ts`
- `src/services/equity/vesting.service.ts`
- `src/services/equity/valuation.service.ts`
- `src/services/equity/tax.stub.service.ts`
- `src/services/equity/scenarios.service.ts`
- `src/services/negotiation/talkingPoints.service.ts`
- `src/services/negotiation/emailTemplates.service.ts`
- `src/services/negotiation/strategy.service.ts`
- `src/services/negotiation/email.service.ts`
- `src/services/negotiation/calendar.service.ts`

### Components
- `src/components/offers/OffersPage.tsx`
- `src/components/offers/OfferIntakeCard.tsx`
- `src/components/offers/OfferDetail.tsx`
- `src/components/offers/OfferCompareTable.tsx`
- `src/components/offers/EquityModeler.tsx`
- `src/components/offers/ScenarioSimulator.tsx`
- `src/components/offers/BenchmarksPanel.tsx`
- `src/components/offers/NegotiationPlaybook.tsx`
- `src/components/offers/CounterEmailWizard.tsx`
- `src/components/offers/CallPlanner.tsx`
- `src/components/offers/AcceptanceChecklist.tsx`
- `src/components/offers/DocsVault.tsx`
- `src/components/offers/AnalyticsPanel.tsx`

### Pages
- `src/pages/Offers.tsx` (created/updated)
- `src/pages/Applications.tsx` (updated with Log Offer / Negotiate actions)

### i18n
- `src/i18n/en/offer.step44.json`
- `src/i18n/tr/offer.step44.json`

### Tests
- 11 unit tests
- 3 integration tests
- 1 comprehensive e2e test

## Acceptance Criteria ✅

- [x] Users can ingest offers from PDF/text/manual with confidence scores
- [x] Equity schedules and scenarios produce totals with risk bands
- [x] After-tax toggle works (stub implementation)
- [x] Benchmarks load from CSV with anchor/ask suggestions
- [x] Offers compare across Y1/Y2/Y4 with NPV sorting
- [x] Sensitivity toggle and currency conversion supported
- [x] Counter emails render from templates with evidence bullets
- [x] Counter emails sendable via Gmail (integration ready)
- [x] Negotiation calls schedulable via Calendar (integration ready)
- [x] Pipeline/Application statuses updatable from offer actions
- [x] Negotiation packet exports as PDF/Google Doc with disclaimer
- [x] Tests pass (unit, integration, e2e)
- [x] WCAG AA compliant (keyboard, labels, contrast, aria-live)
- [x] No console errors
