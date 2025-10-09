/**
 * @fileoverview Negotiation types for Step 44
 * @module types/negotiation.step44
 */

/**
 * Counter-offer request details
 */
export interface CounterAsk {
  id: string;
  offerId: string;
  /** Anchor amount for base (if using anchoring) */
  anchorBase?: number;
  /** Requested base salary */
  askBase?: number;
  /** Requested sign-on bonus */
  askSignOn?: number;
  /** Requested equity shares */
  askEquityShares?: number;
  /** Requested bonus percentage */
  askBonusPct?: number;
  /** Evidence-backed rationale bullets */
  rationale: string[];
  /** Status of the counter-offer */
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  /** When counter was sent */
  sentAt?: string;
  /** When response was received */
  responseAt?: string;
  /** Additional notes */
  notes?: string;
}

/**
 * Compensation benchmark data point
 */
export interface BenchmarkRow {
  id: string;
  role: string;
  level?: string;
  region?: string;
  currency: string;
  /** 50th percentile base salary */
  baseP50: number;
  /** 75th percentile base salary */
  baseP75?: number;
  /** 50th percentile total compensation */
  tcP50?: number;
  /** 75th percentile total compensation */
  tcP75?: number;
  /** Data source */
  source?: string;
  /** Year of data */
  year?: number;
}
