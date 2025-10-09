/**
 * @fileoverview Unit tests for report export
 * Step 48: Networking CRM & Outreach Sequencer
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { exportCampaignReport } from '@/services/outreach/exportReport.service';
import { useOutreach } from '@/stores/outreach.store';
import type { Campaign } from '@/types/outreach.types';

vi.mock('@/services/export/pdf.service', () => ({
  exportHTMLToPDF: vi.fn().mockResolvedValue('https://pdf.url'),
}));

vi.mock('@/services/export/googleDocs.service', () => ({
  exportHTMLToGoogleDoc: vi.fn().mockResolvedValue({ id: 'doc-1', url: 'https://doc.url', title: 'Report' }),
}));

describe('Export Report', () => {
  beforeEach(() => {
    useOutreach.setState({ campaigns: [], exports: [] });
    vi.clearAllMocks();
  });

  it('exports campaign report as PDF', async () => {
    const campaign: Campaign = {
      id: 'camp-1',
      name: 'Test Campaign',
      sequenceId: 'seq-1',
      listId: 'list-1',
      status: 'finished',
      metrics: { sent: 100, delivered: 95, opens: 50, clicks: 20, replies: 10, bounces: 5, unsubs: 2 },
    };

    useOutreach.getState().upsertCampaign(campaign);

    const exp = await exportCampaignReport('camp-1', 'pdf');

    expect(exp.kind).toBe('pdf');
    expect(exp.url).toBe('https://pdf.url');
    
    const { exports } = useOutreach.getState();
    expect(exports.length).toBe(1);
  });

  it('exports campaign report as Google Doc', async () => {
    const campaign: Campaign = {
      id: 'camp-1',
      name: 'Test Campaign',
      sequenceId: 'seq-1',
      listId: 'list-1',
      status: 'running',
      metrics: { sent: 50, delivered: 48, opens: 25, clicks: 10, replies: 5, bounces: 2, unsubs: 1 },
    };

    useOutreach.getState().upsertCampaign(campaign);

    const exp = await exportCampaignReport('camp-1', 'gdoc');

    expect(exp.kind).toBe('gdoc');
    expect(exp.url).toBe('https://doc.url');
  });

  it('includes campaign metrics in export', async () => {
    const { exportHTMLToPDF } = await import('@/services/export/pdf.service');
    
    const campaign: Campaign = {
      id: 'camp-1',
      name: 'Metrics Test',
      sequenceId: 'seq-1',
      listId: 'list-1',
      status: 'finished',
      metrics: { sent: 100, delivered: 95, opens: 50, clicks: 20, replies: 10, bounces: 5, unsubs: 2 },
    };

    useOutreach.getState().upsertCampaign(campaign);

    await exportCampaignReport('camp-1', 'pdf');

    expect(exportHTMLToPDF).toHaveBeenCalledWith(
      expect.stringContaining('Metrics Test'),
      expect.any(String),
      expect.any(String),
      expect.any(Object)
    );

    const htmlArg = (exportHTMLToPDF as any).mock.calls[0][0];
    expect(htmlArg).toContain('sent: 100');
    expect(htmlArg).toContain('replies: 10');
  });
});
