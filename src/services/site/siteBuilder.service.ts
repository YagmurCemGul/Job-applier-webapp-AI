/**
 * @fileoverview Site builder utilities (theme presets, validation).
 * @module services/site/siteBuilder
 */

import type { SiteTheme, ThemeId } from '@/types/site.types';

/**
 * Theme presets (10 variations).
 */
export const THEME_PRESETS: Record<ThemeId, SiteTheme> = {
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    primary: '#111827',
    accent: '#4f46e5',
    fontHead: 'Inter',
    fontBody: 'Inter',
    layout: 'single',
    darkAuto: true,
  },
  studio: {
    id: 'studio',
    name: 'Studio',
    primary: '#0f172a',
    accent: '#f59e0b',
    fontHead: 'Playfair Display',
    fontBody: 'Lato',
    layout: 'two-column',
    darkAuto: true,
  },
  folio: {
    id: 'folio',
    name: 'Folio',
    primary: '#1e293b',
    accent: '#10b981',
    fontHead: 'Montserrat',
    fontBody: 'Open Sans',
    layout: 'grid',
    darkAuto: true,
  },
  grid: {
    id: 'grid',
    name: 'Grid',
    primary: '#18181b',
    accent: '#3b82f6',
    fontHead: 'Space Grotesk',
    fontBody: 'Inter',
    layout: 'grid',
    darkAuto: true,
  },
  writer: {
    id: 'writer',
    name: 'Writer',
    primary: '#292524',
    accent: '#dc2626',
    fontHead: 'Merriweather',
    fontBody: 'Georgia',
    layout: 'single',
    darkAuto: false,
  },
  executive: {
    id: 'executive',
    name: 'Executive',
    primary: '#1c1917',
    accent: '#6366f1',
    fontHead: 'Source Serif Pro',
    fontBody: 'Source Sans Pro',
    layout: 'two-column',
    darkAuto: true,
  },
  product: {
    id: 'product',
    name: 'Product',
    primary: '#0c4a6e',
    accent: '#06b6d4',
    fontHead: 'Work Sans',
    fontBody: 'Work Sans',
    layout: 'single',
    darkAuto: true,
  },
  engineer: {
    id: 'engineer',
    name: 'Engineer',
    primary: '#09090b',
    accent: '#22c55e',
    fontHead: 'JetBrains Mono',
    fontBody: 'Roboto Mono',
    layout: 'single',
    darkAuto: true,
  },
  designer: {
    id: 'designer',
    name: 'Designer',
    primary: '#fef3c7',
    accent: '#f59e0b',
    fontHead: 'DM Sans',
    fontBody: 'DM Sans',
    layout: 'grid',
    darkAuto: false,
  },
  consultant: {
    id: 'consultant',
    name: 'Consultant',
    primary: '#1e3a8a',
    accent: '#f97316',
    fontHead: 'IBM Plex Serif',
    fontBody: 'IBM Plex Sans',
    layout: 'two-column',
    darkAuto: true,
  },
};

/**
 * Validate a custom theme.
 */
export function validateTheme(theme: Partial<SiteTheme>): string[] {
  const errors: string[] = [];
  if (theme.primary && !/^#[0-9a-f]{6}$/i.test(theme.primary)) {
    errors.push('Primary color must be a valid hex code');
  }
  if (theme.accent && !/^#[0-9a-f]{6}$/i.test(theme.accent)) {
    errors.push('Accent color must be a valid hex code');
  }
  return errors;
}

/**
 * Check color contrast for accessibility (WCAG AA).
 * Simplified luminance calculation.
 */
export function checkContrast(
  fg: string,
  bg: string
): { ratio: number; passAA: boolean } {
  const lum = (hex: string) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = ((rgb >> 16) & 0xff) / 255;
    const g = ((rgb >> 8) & 0xff) / 255;
    const b = (rgb & 0xff) / 255;
    const [rs, gs, bs] = [r, g, b].map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  const l1 = lum(fg);
  const l2 = lum(bg);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return { ratio, passAA: ratio >= 4.5 };
}