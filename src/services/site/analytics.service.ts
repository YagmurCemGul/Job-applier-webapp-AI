/**
 * @fileoverview Privacy-friendly analytics (stub adapter).
 * @module services/site/analytics
 */

import type { AnalyticsEvent } from '@/types/site.types';

/**
 * Track an event (stub).
 * In production: send to privacy-friendly analytics service (e.g., Plausible, Fathom).
 */
export function track(_ev: AnalyticsEvent): void {
  // No-op stub for client-side tracking
  // In production: send to analytics endpoint if opt-in is enabled
}

/**
 * Build a UTM-tagged URL for campaign tracking.
 */
export function buildUtm(
  url: string,
  params: Record<string, string>
): string {
  const u = new URL(url);
  for (const [k, v] of Object.entries(params)) {
    u.searchParams.set(k, v);
  }
  return u.toString();
}

/**
 * Parse UTM parameters from a URL.
 */
export function parseUtm(url: string): Record<string, string> {
  const u = new URL(url);
  const utm: Record<string, string> = {};
  for (const [k, v] of u.searchParams.entries()) {
    if (k.startsWith('utm_')) {
      utm[k] = v;
    }
  }
  return utm;
}

/**
 * Generate common UTM presets.
 */
export const UTM_PRESETS = {
  linkedinPost: (url: string, campaignName: string) =>
    buildUtm(url, {
      utm_source: 'linkedin',
      utm_medium: 'social',
      utm_campaign: campaignName,
    }),
  twitterPost: (url: string, campaignName: string) =>
    buildUtm(url, {
      utm_source: 'twitter',
      utm_medium: 'social',
      utm_campaign: campaignName,
    }),
  email: (url: string, campaignName: string) =>
    buildUtm(url, {
      utm_source: 'email',
      utm_medium: 'email',
      utm_campaign: campaignName,
    }),
};