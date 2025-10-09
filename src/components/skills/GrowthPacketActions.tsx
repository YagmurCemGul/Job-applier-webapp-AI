/**
 * Growth Packet Actions Component (Step 47)
 * Export growth packet to PDF/Google Doc.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSkills } from '@/stores/skills.store';
import { exportGrowthPacket } from '@/services/skills/exportPacket.service';
import { Download, FileText, Mail, AlertTriangle } from 'lucide-react';

/**
 * Growth Packet export with disclaimer.
 */
export function GrowthPacketActions() {
  const { t } = useTranslation();
  const { frameworks, inventory, paths, badges, upsertExport } = useSkills();
  const [exporting, setExporting] = useState(false);
  
  const fw = frameworks[0];
  const latestPath = paths[0];

  const handleExport = async (kind: 'pdf' | 'gdoc') => {
    if (!fw || !latestPath) return;
    
    setExporting(true);
    try {
      const result = await exportGrowthPacket({
        role: fw.role,
        targetLevel: latestPath.targetLevel,
        path: latestPath,
        inventory,
        badges,
        disclaimer: t('skills.educational'),
        kind
      });
      
      upsertExport({
        id: crypto.randomUUID(),
        url: typeof result === 'string' ? result : result?.url,
        kind,
        createdAt: new Date().toISOString()
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-900 dark:text-red-100 mb-1">
              Educational Guidance Only
            </h4>
            <p className="text-sm text-red-800 dark:text-red-200">
              {t('skills.educational')} This growth packet is for personal development planning and 
              does not constitute official certification or performance evaluation.
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Growth Packet Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Role</p>
              <p className="font-medium">{fw?.role ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Target Level</p>
              <p className="font-medium">{latestPath?.targetLevel ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Skills Tracked</p>
              <p className="font-medium">{inventory.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Badges Earned</p>
              <p className="font-medium">{badges.length}</p>
            </div>
          </div>

          {latestPath && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Learning Path</p>
              <Badge variant="outline">
                {latestPath.steps.length} steps • {Math.round(latestPath.totalMinutes / 60)}h {latestPath.totalMinutes % 60}m
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={() => handleExport('pdf')} 
            disabled={!latestPath || exporting}
            className="w-full gap-2"
          >
            <Download className="h-4 w-4" />
            Export as PDF
          </Button>
          
          <Button 
            onClick={() => handleExport('gdoc')} 
            disabled={!latestPath || exporting}
            variant="outline"
            className="w-full gap-2"
          >
            <FileText className="h-4 w-4" />
            Export to Google Doc
          </Button>
          
          <Button 
            disabled={!latestPath}
            variant="outline"
            className="w-full gap-2"
          >
            <Mail className="h-4 w-4" />
            Email to Self
          </Button>

          {!latestPath && (
            <p className="text-sm text-muted-foreground text-center pt-2">
              Generate a learning path first to export.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
