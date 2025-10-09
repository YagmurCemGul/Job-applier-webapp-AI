/**
 * Export Packet Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportPerfPacket } from '@/services/perf/exportPacket.service';
import * as pdfService from '@/services/export/pdf.service';
import * as gdocService from '@/services/export/googleDocs.service';
import type { NarrativeDoc, CalibSummary, GapAnalysis } from '@/types/perf.types';

vi.mock('@/services/export/pdf.service', () => ({
  exportHTMLToPDF: vi.fn().mockResolvedValue('https://example.com/packet.pdf'),
}));

vi.mock('@/services/export/googleDocs.service', () => ({
  exportHTMLToGoogleDoc: vi.fn().mockResolvedValue('https://docs.google.com/doc-id'),
}));

describe('Export Packet', () => {
  const narrative: NarrativeDoc = {
    id: 'narr-1',
    title: 'H2 Review',
    html: '<h2>Scope</h2><p>Delivered features.</p>',
    lastEditedISO: new Date().toISOString(),
  };

  const calib: CalibSummary = {
    id: 'calib-1',
    cycleId: 'cycle-1',
    aggScores: { clarity: 3, structure: 3, impact: 3, ownership: 3, collaboration: 3, craft: 3 },
    overall: 3,
    outliers: [],
  };

  const gap: GapAnalysis = {
    id: 'gap-1',
    level: 'L5',
    gaps: [{ key: 'impact', current: 3, target: 3.5, actions: [] }],
    ready: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports to PDF', async () => {
    const result = await exportPerfPacket({
      title: 'Performance Packet',
      narrative,
      calib,
      gap,
      disclaimer: 'For planning only',
      kind: 'pdf',
    });

    expect(pdfService.exportHTMLToPDF).toHaveBeenCalled();
    expect(result).toBe('https://example.com/packet.pdf');
  });

  it('exports to Google Doc', async () => {
    const result = await exportPerfPacket({
      title: 'Performance Packet',
      narrative,
      calib,
      gap,
      disclaimer: 'For planning only',
      kind: 'gdoc',
    });

    expect(gdocService.exportHTMLToGoogleDoc).toHaveBeenCalled();
    expect(result).toBe('https://docs.google.com/doc-id');
  });

  it('includes narrative in HTML', async () => {
    await exportPerfPacket({
      title: 'Test',
      narrative,
      calib,
      gap,
      disclaimer: 'Disclaimer',
      kind: 'pdf',
    });

    const callArg = vi.mocked(pdfService.exportHTMLToPDF).mock.calls[0][0];
    expect(callArg).toContain('Narrative');
    expect(callArg).toContain(narrative.html);
  });

  it('includes calibration summary', async () => {
    await exportPerfPacket({
      title: 'Test',
      narrative,
      calib,
      gap,
      disclaimer: 'Disclaimer',
      kind: 'pdf',
    });

    const callArg = vi.mocked(pdfService.exportHTMLToPDF).mock.calls[0][0];
    expect(callArg).toContain('Calibration Summary');
    expect(callArg).toContain('Overall');
  });

  it('includes promotion readiness', async () => {
    await exportPerfPacket({
      title: 'Test',
      narrative,
      calib,
      gap,
      disclaimer: 'Disclaimer',
      kind: 'pdf',
    });

    const callArg = vi.mocked(pdfService.exportHTMLToPDF).mock.calls[0][0];
    expect(callArg).toContain('Promotion Readiness');
    expect(callArg).toContain(gap.ready ? 'Yes' : 'Not yet');
  });
});
