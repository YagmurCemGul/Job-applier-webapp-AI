/**
 * Review Packet Actions Component
 * 
 * Export and share performance review packets with disclaimers.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePerf } from '@/stores/perf.store';
import { exportPerfPacket } from '@/services/perf/exportPacket.service';
import { Download, FileText, Mail, AlertCircle } from 'lucide-react';

/**
 * Actions for exporting and sharing review packets.
 */
export function ReviewPacketActions() {
  const { t } = useTranslation();
  const { narratives, calibrations, gaps, exports } = usePerf();
  const [exporting, setExporting] = useState(false);

  const latestNarrative = narratives[0];
  const latestCalib = calibrations[0];
  const latestGap = gaps[0];

  const handleExport = async (kind: 'pdf' | 'gdoc') => {
    if (!latestNarrative || !latestCalib || !latestGap) return;
    setExporting(true);
    try {
      const url = await exportPerfPacket({
        title: latestNarrative.title,
        narrative: latestNarrative,
        calib: latestCalib,
        gap: latestGap,
        disclaimer: 'This packet is for planning purposes only. Ratings are simulated and not official.',
        kind,
      });
      usePerf.getState().upsertExport({
        id: crypto.randomUUID(),
        cycleId: latestNarrative.cycleId,
        url: typeof url === 'string' ? url : undefined,
        createdAt: new Date().toISOString(),
        kind,
      });
    } catch (err) {
      console.error('Failed to export packet:', err);
    } finally {
      setExporting(false);
    }
  };

  const canExport = latestNarrative && latestCalib && latestGap;

  return (
    <div className="space-y-4">
      {/* Disclaimer Banner */}
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 h-5 w-5 text-red-600 dark:text-red-400" />
          <div className="flex-1">
            <p className="font-semibold text-red-900 dark:text-red-100">Disclaimer</p>
            <p className="mt-1 text-sm text-red-800 dark:text-red-200">
              This packet is for planning purposes only. Ratings are simulated and not official HR/legal
              advice. Share responsibly with explicit consent.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('perf.packet')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Export your performance review packet with narrative, calibration, and promotion readiness.
            </p>
            {!canExport && (
              <Badge variant="secondary">
                Complete narrative, calibration, and gap analysis first
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleExport('pdf')} disabled={!canExport || exporting}>
              <Download className="mr-2 h-4 w-4" />
              Export as PDF
            </Button>
            <Button
              onClick={() => handleExport('gdoc')}
              variant="outline"
              disabled={!canExport || exporting}
            >
              <FileText className="mr-2 h-4 w-4" />
              Export as Google Doc
            </Button>
          </div>
        </CardContent>
      </Card>

      {exports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Export History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {exports.map((ex) => (
                <div key={ex.id} className="flex items-center justify-between rounded border p-2">
                  <div className="flex items-center gap-2">
                    {ex.kind === 'pdf' ? (
                      <Download className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    <span className="text-sm">
                      {new Date(ex.createdAt).toLocaleDateString()} - {ex.kind.toUpperCase()}
                    </span>
                  </div>
                  {ex.url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(ex.url, '_blank')}
                    >
                      Open
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
