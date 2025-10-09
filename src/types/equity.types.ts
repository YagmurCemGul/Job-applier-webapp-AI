/**
 * @fileoverview Equity vesting and valuation types for Step 44
 * @module types/equity
 */

/**
 * Vesting event representing shares vesting at a specific time
 */
export interface VestingEvent {
  /** Month index (0-based) from grant date */
  monthIndex: number;
  /** Number of shares vesting */
  shares: number;
  /** Currency value at modeled price */
  amount: number;
  /** Whether this is a cliff vesting event */
  cliff?: boolean;
}

/**
 * Input parameters for equity modeling
 */
export interface EquityModelInput {
  /** Type of equity grant */
  kind: 'rsu' | 'options';
  /** Total shares granted */
  totalShares: number;
  /** Strike price (options only) */
  strikePrice?: number;
  /** Current/assumed share price */
  currentPrice: number;
  /** Annual growth rate assumption (%) */
  growthRatePct: number;
  /** Vesting horizon in years */
  years: number;
  /** Cliff period in months */
  cliffMonths: number;
  /** Vesting schedule frequency */
  schedule: 'monthly' | 'quarterly' | 'semiannual' | 'annual';
  /** Annual refresher as % of base grant */
  refresherPctPerYear?: number;
  /** Volatility for risk bands (%) */
  volatilityPct?: number;
}

/**
 * Equity valuation result with risk bands
 */
export interface EquityValuation {
  /** Detailed vesting events with valuations */
  events: VestingEvent[];
  /** Total gross value */
  totalGross: number;
  /** Lower bound estimate (-volatility) */
  lowBand?: number;
  /** Upper bound estimate (+volatility) */
  highBand?: number;
}
