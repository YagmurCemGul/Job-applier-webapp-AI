/**
 * @fileoverview Offer and compensation types for Step 37 — Offer & Negotiation Suite
 * @module types/offer
 */

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'TRY' | 'AUD' | 'CAD' | 'JPY' | 'CNY' | 'INR' | 'BRL';
export type EquityType = 'RSU' | 'Options' | 'PSU' | 'ESPP';
export type OfferStage = 'draft' | 'received' | 'negotiating' | 'accepted' | 'declined' | 'expired';
export type RemotePolicy = 'on_site' | 'hybrid' | 'remote';
export type DeadlineKind = 'accept' | 'expire' | 'background' | 'other';

/**
 * Equity grant details (RSU, Options, PSU, ESPP)
 */
export interface EquityGrant {
  id: string;
  type: EquityType;
  units?: number;
  strikePrice?: number;
  vestSchedule?: '4y_1y_cliff' | '4y_no_cliff' | 'custom';
  vestCustom?: Array<{ atMonths: number; pct: number }>;
  targetValue?: number;
  ticker?: string;
  assumedSharePrice?: number;
}

/**
 * Benefits package details
 */
export interface Benefits {
  ptoDays?: number;
  healthMonthlyEmployer?: number;
  retirementMatchPct?: number;
  stipendAnnual?: number;
  signingBonus?: number;
  relocation?: number;
  visaSupport?: boolean;
  notes?: string;
}

/**
 * Offer deadline
 */
export interface OfferDeadline {
  id: string;
  label: string;
  atISO: string;
  kind: DeadlineKind;
  calendarEventId?: string;
}

/**
 * Job offer with compensation, equity, benefits, and deadlines
 */
export interface Offer {
  id: string;
  applicationId?: string;
  company: string;
  role: string;
  level?: string;
  location?: string;
  remote?: RemotePolicy;
  currency: CurrencyCode;
  baseAnnual: number;
  bonusTargetPct?: number;
  equity?: EquityGrant[];
  benefits?: Benefits;
  stage: OfferStage;
  createdAt: string;
  updatedAt: string;
  deadlines?: OfferDeadline[];
  customFields?: Record<string, string | number | boolean>;
}

/**
 * Valuation calculation inputs
 */
export interface ValuationInputs {
  horizonYears: 1 | 2 | 4;
  taxRatePct?: number;
  cocAdjustPct?: number;
  fxBase?: CurrencyCode;
}

/**
 * Total compensation calculation result
 */
export interface TotalCompResult {
  currency: CurrencyCode;
  base: number;
  bonus: number;
  equity: number;
  benefits: BenefitValuation;
  gross: number;
  postTax: number;
  adjusted: number;
  normalized: number;
}

/**
 * Benefit valuation breakdown
 */
export interface BenefitValuation {
  signingSpread: number;
  annualValue: number;
}
