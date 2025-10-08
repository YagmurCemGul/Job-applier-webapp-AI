/**
 * Unit Tests: Score Aggregation
 * Tests weighted dimension averages, overall mean, and variance calculations
 */

import { describe, it, expect } from 'vitest';
import type { ScoreSubmission, ScorecardTemplate } from '@/types/scorecard.types';

// Simulate the aggregation logic from ScoreSummary component
function calculateAggregates(template: ScorecardTemplate, submissions: ScoreSubmission[]) {
  if (submissions.length === 0) {
    return { overall: 0, dimensions: [], recommendations: {} };
  }

  const dimensions = template.dimensions.map(dim => {
    const scores = submissions
      .map(s => s.ratings.find(r => r.dimensionId === dim.id)?.score)
      .filter((s): s is number => s !== undefined);

    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance =
      scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length;

    return {
      dimensionId: dim.id,
      name: dim.name,
      average,
      variance,
      weight: dim.weight || 1,
    };
  });

  const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0);
  const overall = dimensions.reduce((sum, d) => sum + d.average * d.weight, 0) / totalWeight;

  const recommendations = submissions.reduce((acc, s) => {
    acc[s.recommendation] = (acc[s.recommendation] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return { overall, dimensions, recommendations };
}

describe('Score Aggregation', () => {
  const template: ScorecardTemplate = {
    id: 'tpl-1',
    name: 'Engineering Interview',
    dimensions: [
      { id: 'dim-1', name: 'Technical Skills', weight: 2 },
      { id: 'dim-2', name: 'Communication', weight: 1 },
      { id: 'dim-3', name: 'Problem Solving', weight: 1.5 },
    ],
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  };

  it('should calculate simple average when all weights are 1', () => {
    const uniformTemplate: ScorecardTemplate = {
      ...template,
      dimensions: template.dimensions.map(d => ({ ...d, weight: 1 })),
    };

    const submissions: ScoreSubmission[] = [
      {
        id: 'sub-1',
        interviewId: 'int-1',
        panelistId: 'panel-1',
        ratings: [
          { dimensionId: 'dim-1', score: 4 },
          { dimensionId: 'dim-2', score: 3 },
          { dimensionId: 'dim-3', score: 5 },
        ],
        recommendation: 'yes',
        submittedAt: '2025-01-01',
      },
    ];

    const { overall, dimensions } = calculateAggregates(uniformTemplate, submissions);

    expect(dimensions[0].average).toBe(4);
    expect(dimensions[1].average).toBe(3);
    expect(dimensions[2].average).toBe(5);
    expect(overall).toBe((4 + 3 + 5) / 3);
  });

  it('should calculate weighted average correctly', () => {
    const submissions: ScoreSubmission[] = [
      {
        id: 'sub-1',
        interviewId: 'int-1',
        panelistId: 'panel-1',
        ratings: [
          { dimensionId: 'dim-1', score: 4 },
          { dimensionId: 'dim-2', score: 3 },
          { dimensionId: 'dim-3', score: 5 },
        ],
        recommendation: 'yes',
        submittedAt: '2025-01-01',
      },
    ];

    const { overall } = calculateAggregates(template, submissions);

    // (4*2 + 3*1 + 5*1.5) / (2+1+1.5) = 18.5 / 4.5 = 4.11
    expect(overall).toBeCloseTo(4.11, 1);
  });

  it('should calculate variance for multiple submissions', () => {
    const submissions: ScoreSubmission[] = [
      {
        id: 'sub-1',
        interviewId: 'int-1',
        panelistId: 'panel-1',
        ratings: [
          { dimensionId: 'dim-1', score: 5 },
          { dimensionId: 'dim-2', score: 5 },
          { dimensionId: 'dim-3', score: 5 },
        ],
        recommendation: 'strong_yes',
        submittedAt: '2025-01-01',
      },
      {
        id: 'sub-2',
        interviewId: 'int-1',
        panelistId: 'panel-2',
        ratings: [
          { dimensionId: 'dim-1', score: 1 },
          { dimensionId: 'dim-2', score: 1 },
          { dimensionId: 'dim-3', score: 1 },
        ],
        recommendation: 'no',
        submittedAt: '2025-01-01',
      },
    ];

    const { dimensions } = calculateAggregates(template, submissions);

    // High variance when scores are 5 and 1
    dimensions.forEach(dim => {
      expect(dim.variance).toBeGreaterThan(0);
      expect(dim.variance).toBe(4); // ((5-3)^2 + (1-3)^2) / 2 = 4
    });
  });

  it('should count recommendations correctly', () => {
    const submissions: ScoreSubmission[] = [
      {
        id: 'sub-1',
        interviewId: 'int-1',
        panelistId: 'panel-1',
        ratings: [],
        recommendation: 'strong_yes',
        submittedAt: '2025-01-01',
      },
      {
        id: 'sub-2',
        interviewId: 'int-1',
        panelistId: 'panel-2',
        ratings: [],
        recommendation: 'yes',
        submittedAt: '2025-01-01',
      },
      {
        id: 'sub-3',
        interviewId: 'int-1',
        panelistId: 'panel-3',
        ratings: [],
        recommendation: 'yes',
        submittedAt: '2025-01-01',
      },
    ];

    const { recommendations } = calculateAggregates(template, submissions);

    expect(recommendations.strong_yes).toBe(1);
    expect(recommendations.yes).toBe(2);
  });

  it('should handle missing ratings gracefully', () => {
    const submissions: ScoreSubmission[] = [
      {
        id: 'sub-1',
        interviewId: 'int-1',
        panelistId: 'panel-1',
        ratings: [
          { dimensionId: 'dim-1', score: 4 },
          // Missing dim-2
          { dimensionId: 'dim-3', score: 5 },
        ],
        recommendation: 'yes',
        submittedAt: '2025-01-01',
      },
    ];

    const { dimensions } = calculateAggregates(template, submissions);

    expect(dimensions[0].average).toBe(4);
    expect(dimensions[1].average).toBeNaN(); // No scores for dim-2
    expect(dimensions[2].average).toBe(5);
  });
});
