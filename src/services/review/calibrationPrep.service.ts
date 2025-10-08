/**
 * @fileoverview Calibration preparation service
 * Maps impact to rubric and computes strength/delta matrix
 */

import type { ImpactEntry } from '@/types/review.types';
import type { RubricExpectation } from '@/types/promotion.types';

export interface CalibrationMapping {
  rubric: RubricExpectation;
  evidence: string[];
  delta: -2 | -1 | 0 | 1 | 2;
}

/**
 * Map impact entries to rubric lines and compute deltas (−2..+2)
 */
export function mapToRubric(
  level: string,
  rubric: RubricExpectation[],
  impacts: ImpactEntry[]
): CalibrationMapping[] {
  const relevant = rubric.filter(r => r.level === level);
  
  return relevant.map(r => {
    const hits = impacts.filter(i => (i.competency ?? 'impact') === r.competency);
    const strength = hits.reduce((a, b) => a + (b.score ?? 0), 0) / Math.max(1, hits.length);
    
    // Map strength to delta
    let delta: -2 | -1 | 0 | 1 | 2;
    if (strength >= 1) delta = 2;
    else if (strength >= 0.9) delta = 1;
    else if (strength >= 0.7) delta = 0;
    else if (strength >= 0.5) delta = -1;
    else delta = -2;
    
    return {
      rubric: r,
      evidence: hits.slice(0, 5).map(h => h.title),
      delta
    };
  });
}

/**
 * Generate calibration pre-read text
 */
export function generatePreRead(
  cycleTitle: string,
  targetLevel: string,
  mappings: CalibrationMapping[]
): string {
  const lines = [
    `# Calibration Pre-Read: ${cycleTitle}`,
    `**Target Level:** ${targetLevel}`,
    ``,
    `## Competency Assessment`,
    ``
  ];
  
  for (const m of mappings) {
    const deltaLabel = m.delta >= 1 ? '✓ Exceeds' : m.delta === 0 ? '= Meets' : '✗ Below';
    lines.push(`### ${m.rubric.competency} (${deltaLabel})`);
    lines.push(`**Expectation:** ${m.rubric.description}`);
    lines.push(`**Evidence:**`);
    
    if (m.evidence.length > 0) {
      for (const e of m.evidence) {
        lines.push(`- ${e}`);
      }
    } else {
      lines.push(`- *(No evidence collected)*`);
    }
    
    lines.push(``);
  }
  
  return lines.join('\n');
}
