/**
 * @fileoverview Negotiation planning types for Step 37
 * @module types/negotiation
 */

/**
 * Target adjustment field
 */
export type AdjustmentField = 'base' | 'bonus' | 'equity' | 'signing' | 'pto' | 'other';

/**
 * Negotiation target adjustment
 */
export interface TargetAdjustment {
  field: AdjustmentField;
  askPct?: number;
  askAbs?: number;
  rationale: string;
}

/**
 * Negotiation email template
 */
export interface NegotiationEmail {
  id: string;
  subject: string;
  bodyHtml: string;
}

/**
 * AI-generated negotiation plan
 */
export interface NegotiationPlan {
  id: string;
  offerId: string;
  strategy: string;
  talkingPoints: string[];
  targetAdjustments: TargetAdjustment[];
  riskNotes?: string[];
  batna?: string;
  emails?: NegotiationEmail[];
}

/**
 * Negotiation context inputs
 */
export interface NegotiationContext {
  market?: string;
  priorities?: string[];
  batna?: string;
}
