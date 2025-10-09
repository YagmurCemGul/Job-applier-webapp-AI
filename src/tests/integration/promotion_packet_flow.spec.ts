/**
 * Promotion Packet Flow Integration Test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePerf } from '@/stores/perf.store';
import { createCycle } from '@/services/perf/reviewCycle.service';
import { submitFeedbackResponse } from '@/services/perf/feedbackInbox.service';
import { calibrate } from '@/services/perf/calibration.service';
import { analyzeGaps } from '@/services/perf/promotion.service';
import { writeNarrative } from '@/services/perf/narrative.service';
import { exportPerfPacket } from '@/services/perf/exportPacket.service';
import type { FeedbackRequest, PromotionExpectation } from '@/types/perf.types';
import * as aiService from '@/services/features/aiComplete.service';
import * as pdfService from '@/services/export/pdf.service';

vi.mock('@/services/features/aiComplete.service', () => ({
  aiComplete: vi.fn().mockResolvedValue('<h2>Scope</h2><p>Delivered key initiatives.</p>'),
}));

vi.mock('@/services/export/pdf.service', () => ({
  exportHTMLToPDF: vi.fn().mockResolvedValue('https://example.com/packet.pdf'),
}));

describe('Promotion Packet Flow', () => {
  beforeEach(() => {
    usePerf.setState({
      cycles: [],
      requests: [],
      responses: [],
      calibrations: [],
      expectations: [],
      gaps: [],
      narratives: [],
      exports: [],
    });
    vi.clearAllMocks();
  });

  it('completes end-to-end promotion packet generation', async () => {
    // 1. Create review cycle
    const cycle = createCycle({
      kind: 'year_end',
      title: '2025 EOY Review',
      startISO: '2025-11-01T00:00:00Z',
      dueISO: '2025-12-15T00:00:00Z',
      tz: 'UTC',
      reviewers: [
        { toEmail: 'manager@company.com', role: 'manager' },
        { toEmail: 'peer@company.com', role: 'peer' },
      ],
    });

    // 2. Collect feedback responses
    const managerRequest: FeedbackRequest = {
      ...cycle.reviewers[0],
      cycleId: cycle.id,
    };
    const peerRequest: FeedbackRequest = {
      ...cycle.reviewers[1],
      cycleId: cycle.id,
    };
    usePerf.getState().upsertRequest(managerRequest);
    usePerf.getState().upsertRequest(peerRequest);

    submitFeedbackResponse({
      requestId: managerRequest.id,
      answers: { feedback: 'Strong technical leadership' },
      rubric: {
        clarity: 3.5,
        structure: 3.5,
        impact: 4.0,
        ownership: 3.5,
        collaboration: 3.5,
        craft: 3.0,
      },
      quotes: ['Led the migration project successfully'],
    });

    submitFeedbackResponse({
      requestId: peerRequest.id,
      answers: { feedback: 'Great to work with' },
      rubric: {
        clarity: 3.5,
        structure: 3.0,
        impact: 3.5,
        ownership: 3.5,
        collaboration: 4.0,
        craft: 3.0,
      },
      quotes: ['Very collaborative and helpful'],
    });

    // 3. Calibrate
    const calib = calibrate(cycle.id);
    expect(calib.overall).toBeGreaterThan(3.0);
    expect(calib.aggScores.impact).toBeGreaterThan(3.0);

    // 4. Analyze promotion gaps
    const expectations: PromotionExpectation[] = [
      {
        id: 'exp-1',
        level: 'L5',
        behaviors: [
          { key: 'impact', descriptor: 'Leads multi-quarter initiatives', bar: 3.5 },
          { key: 'ownership', descriptor: 'Proactive problem solving', bar: 3.5 },
          { key: 'collaboration', descriptor: 'Mentors peers', bar: 3.5 },
        ],
      },
    ];
    usePerf.setState({ expectations });

    const gap = analyzeGaps('L5', calib.aggScores, expectations);
    usePerf.getState().upsertGap(gap);

    // 5. Write narrative
    const narrative = await writeNarrative({
      cycleId: cycle.id,
      title: '2025 Self-Review',
      bullets: [
        'Led database migration affecting 100M users',
        'Reduced API latency by 40%',
        'Mentored 3 junior engineers',
      ],
      quotes: ['Led the migration project successfully', 'Very collaborative and helpful'],
    });
    usePerf.getState().upsertNarrative(narrative);

    // 6. Export packet
    const packetUrl = await exportPerfPacket({
      title: '2025 Promotion Packet - L5',
      narrative,
      calib,
      gap,
      disclaimer: 'This packet is for planning purposes only.',
      kind: 'pdf',
    });

    // 7. Verify packet created
    expect(pdfService.exportHTMLToPDF).toHaveBeenCalled();
    expect(packetUrl).toBe('https://example.com/packet.pdf');

    // 8. Store export record
    usePerf.getState().upsertExport({
      id: crypto.randomUUID(),
      cycleId: cycle.id,
      url: typeof packetUrl === 'string' ? packetUrl : undefined,
      createdAt: new Date().toISOString(),
      kind: 'pdf',
    });

    const exports = usePerf.getState().exports;
    expect(exports.length).toBe(1);
    expect(exports[0].kind).toBe('pdf');
  });

  it('identifies when promotion bar is not met', async () => {
    // Calibration with lower scores
    const calib = {
      id: crypto.randomUUID(),
      cycleId: 'test-cycle',
      aggScores: {
        clarity: 2.5,
        structure: 2.5,
        impact: 2.5,
        ownership: 2.5,
        collaboration: 2.5,
        craft: 2.0,
      },
      overall: 2.5,
      outliers: [],
    };
    usePerf.getState().upsertCalib(calib);

    const expectations: PromotionExpectation[] = [
      {
        id: 'exp-1',
        level: 'L5',
        behaviors: [
          { key: 'impact', descriptor: 'Leads initiatives', bar: 3.5 },
          { key: 'ownership', descriptor: 'Proactive', bar: 3.5 },
        ],
      },
    ];
    usePerf.setState({ expectations });

    const gap = analyzeGaps('L5', calib.aggScores, expectations);
    expect(gap.ready).toBe(false);
    expect(gap.gaps.length).toBeGreaterThan(0);
    expect(gap.gaps.every((g) => g.actions.length > 0)).toBe(true);
  });
});
