/**
 * @fileoverview Case study builder from Evidence Binder.
 * @module services/site/caseStudy
 */

import type { CaseStudy } from '@/types/site.types';
import type { OnboardingPlan } from '@/types/onboarding.types';
import { slugify } from './seo.service';
import { mdToExcerpt } from './markdown.service';

/**
 * Build a case study draft from an onboarding plan's evidence.
 */
export function buildCaseFromEvidence(
  plan: OnboardingPlan,
  title: string
): CaseStudy {
  const bullets = (plan.evidence ?? [])
    .slice(0, 6)
    .map((e) => `- ${e.title}: ${e.text ?? e.url ?? e.tag ?? ''}`);

  const contentMd = [
    `# ${title}`,
    '',
    '## Overview',
    plan.evidence.length
      ? `This case study summarizes ${plan.evidence.length} artifacts from my onboarding and subsequent work.`
      : 'Summary of impact with selected artifacts.',
    '',
    '## Highlights',
    bullets.join('\n'),
    '',
    '## Outcome',
    '- Quantified impact and lessons learned.',
    '- Key competencies demonstrated.',
  ].join('\n');

  return {
    id: crypto.randomUUID(),
    title,
    slug: slugify(title),
    excerpt: mdToExcerpt(contentMd, 160),
    contentMd,
    dateISO: new Date().toISOString(),
    visibility: 'draft',
    highlights: bullets
      .slice(0, 3)
      .map((x) => x.replace(/^-+\s*/, '').slice(0, 100)),
    quotes: [],
    links: [],
    competenceTags: ['execution', 'impact', 'collaboration'],
  };
}

/**
 * Add quotes from reviews to a case study.
 */
export function addQuotesToCase(
  caseStudy: CaseStudy,
  quotes: string[]
): CaseStudy {
  return {
    ...caseStudy,
    quotes: [...(caseStudy.quotes ?? []), ...quotes],
    contentMd:
      caseStudy.contentMd +
      '\n\n## Feedback\n' +
      quotes.map((q) => `> ${q}`).join('\n\n'),
  };
}