/**
 * Offer Prep Service
 * Compensation band recommendations and offer letter generation
 */

export interface CompBand {
  level: string;
  baseMin: number;
  baseMax: number;
  currency: string;
  equityPctMin?: number;
  equityPctMax?: number;
}

/**
 * Default compensation bands (can be customized per organization)
 */
export const defaultCompBands: CompBand[] = [
  {
    level: 'Junior',
    baseMin: 60000,
    baseMax: 80000,
    currency: 'USD',
    equityPctMin: 0.01,
    equityPctMax: 0.05,
  },
  {
    level: 'Mid-Level',
    baseMin: 80000,
    baseMax: 120000,
    currency: 'USD',
    equityPctMin: 0.05,
    equityPctMax: 0.15,
  },
  {
    level: 'Senior',
    baseMin: 120000,
    baseMax: 160000,
    currency: 'USD',
    equityPctMin: 0.1,
    equityPctMax: 0.3,
  },
  {
    level: 'Staff',
    baseMin: 160000,
    baseMax: 220000,
    currency: 'USD',
    equityPctMin: 0.2,
    equityPctMax: 0.5,
  },
  {
    level: 'Principal',
    baseMin: 220000,
    baseMax: 300000,
    currency: 'USD',
    equityPctMin: 0.3,
    equityPctMax: 0.8,
  },
];

export interface OfferRecommendation {
  base?: number;
  equityPct?: number;
  currency: string;
  note: string;
  band?: CompBand;
}

/**
 * Recommends offer based on level and compensation bands
 */
export function recommendOffer(
  level: string,
  bands: CompBand[] = defaultCompBands
): OfferRecommendation {
  const band = bands.find(b => b.level === level);

  if (!band) {
    return {
      note: `No compensation band found for level: ${level}`,
      base: undefined,
      equityPct: undefined,
      currency: 'USD',
    };
  }

  const base = Math.round((band.baseMin + band.baseMax) / 2);
  const equityPct =
    band.equityPctMin && band.equityPctMax
      ? (band.equityPctMin + band.equityPctMax) / 2
      : undefined;

  return {
    base,
    equityPct,
    currency: band.currency,
    note: `Recommended offer for ${level} level`,
    band,
  };
}

/**
 * Generates offer letter content
 */
export function generateOfferLetter(opts: {
  candidateName: string;
  role: string;
  company: string;
  base: number;
  currency: string;
  equityPct?: number;
  startDate?: string;
  benefits?: string[];
}): string {
  const { candidateName, role, company, base, currency, equityPct, startDate, benefits } = opts;

  const formattedBase = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(base);

  const equitySection = equityPct
    ? `\n\n**Equity**: ${(equityPct * 100).toFixed(2)}% equity grant, subject to vesting schedule and board approval.`
    : '';

  const startSection = startDate
    ? `\n\n**Start Date**: ${new Date(startDate).toLocaleDateString()}`
    : '';

  const benefitsSection =
    benefits && benefits.length > 0
      ? `\n\n**Benefits**:\n${benefits.map(b => `- ${b}`).join('\n')}`
      : '';

  return `# Offer Letter

Dear ${candidateName},

We are pleased to offer you the position of **${role}** at ${company}.

**Compensation**: ${formattedBase} per year${equitySection}${startSection}${benefitsSection}

This offer is contingent upon successful completion of background checks and reference verification.

We are excited about the prospect of you joining our team and look forward to your contributions.

Best regards,
${company} Hiring Team`;
}

/**
 * Calculates total compensation value
 */
export function calculateTotalComp(opts: {
  base: number;
  equityPct?: number;
  companyValuation?: number;
  bonus?: number;
}): number {
  const { base, equityPct, companyValuation, bonus } = opts;

  let total = base;

  if (bonus) {
    total += bonus;
  }

  if (equityPct && companyValuation) {
    // Simplified: equity value / 4 years vesting
    total += (equityPct * companyValuation) / 4;
  }

  return total;
}
