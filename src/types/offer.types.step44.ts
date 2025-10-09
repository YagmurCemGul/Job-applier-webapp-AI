/**
 * @fileoverview Extended offer types for Step 44 — Offer Negotiation & Comparison
 * @module types/offer.step44
 */

export type OfferSource = 'pdf' | 'text' | 'manual';
export type EquityKind = 'rsu' | 'options';
export type VestingSchedule = 'monthly' | 'quarterly' | 'semiannual' | 'annual';

/**
 * Job offer with comprehensive compensation details
 */
export interface Offer {
  id: string;
  company: string;
  role: string;
  level?: string;
  location?: string;
  /** ISO currency code (USD, EUR, TRY, etc.) */
  currency: string;
  /** Annual base salary */
  baseAnnual: number;
  /** Target bonus as % of base */
  bonusTargetPct?: number;
  /** Minimum bonus as % of base */
  bonusMinPct?: number;
  /** Maximum bonus as % of base */
  bonusMaxPct?: number;
  /** Sign-on bonus year 1 */
  signOnYr1?: number;
  /** Sign-on bonus year 2 */
  signOnYr2?: number;
  /** Equity grant details */
  equity?: {
    kind: EquityKind;
    /** Stock ticker symbol */
    symbol?: string;
    /** Number of shares/units granted */
    grantShares?: number;
    /** Dollar value of grant (if specified as value) */
    grantValue?: number;
    /** Strike price for options */
    strikePrice?: number;
    /** Vesting period in years */
    vestYears: number;
    /** Cliff period in months */
    cliffMonths: number;
    /** Vesting frequency */
    schedule: VestingSchedule;
    /** Annual refresher as % of initial grant */
    refresherPctPerYear?: number;
  };
  /** Benefits package */
  benefits?: {
    /** Annual PTO days */
    ptoDays?: number;
    /** Monthly health stipend */
    healthStipend?: number;
    /** Relocation package */
    relocation?: number;
    /** Work from home stipend */
    wfhStipend?: number;
    /** Severance in weeks */
    severanceWeeks?: number;
  };
  /** Offer start date */
  startDateISO?: string;
  /** Additional notes */
  notes?: string;
  /** How offer was provided */
  source: OfferSource;
  /** Source URL/link */
  sourceUrl?: string;
  /** Raw text extracted from PDF/paste */
  rawText?: string;
  /** When offer was extracted/created */
  extractedAt: string;
}

/**
 * Parsed field with confidence score
 */
export interface OfferParsedField<T = any> {
  key: string;
  value?: T;
  /** Confidence score 0-1 */
  confidence: number;
}

/**
 * Result of offer parsing
 */
export interface OfferParseResult {
  base?: OfferParsedField<number>;
  bonusTargetPct?: OfferParsedField<number>;
  signOnYr1?: OfferParsedField<number>;
  equityGrantShares?: OfferParsedField<number>;
  vestYears?: OfferParsedField<number>;
  cliffMonths?: OfferParsedField<number>;
  schedule?: OfferParsedField<VestingSchedule>;
  currency?: OfferParsedField<string>;
  role?: OfferParsedField<string>;
  level?: OfferParsedField<string>;
  location?: OfferParsedField<string>;
}

/**
 * Comparison horizon assumptions
 */
export interface ComparisonHorizon {
  /** Time horizon for comparison */
  years: 1 | 2 | 4;
  /** Discount rate for NPV (%) */
  discountRatePct: number;
  /** Expected equity growth rate (%) */
  growthRatePct: number;
  /** Blended tax rate estimate (%) */
  taxRatePct: number;
}

/**
 * Comparison row for multi-offer analysis
 */
export interface ComparisonRow {
  offerId: string;
  company: string;
  currency: string;
  /** Year 1 total comp */
  y1Total: number;
  /** Year 2 total comp */
  y2Total: number;
  /** Year 4 total comp */
  y4Total: number;
  /** Net present value */
  npv: number;
  /** Risk or assumption note */
  riskNote?: string;
}
