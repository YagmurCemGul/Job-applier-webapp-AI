/**
 * @fileoverview Calibration preparation board
 * Maps impacts to rubric with delta matrix and pre-read export
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useReviews } from '@/stores/review.store';
import { usePromotion } from '@/stores/promotion.store';
import { mapToRubric, generatePreRead } from '@/services/review/calibrationPrep.service';
import { exportReviewPDF } from '@/services/export/reviewExport.pdf.service';
import { exportReviewDoc } from '@/services/export/reviewExport.docs.service';

interface CalibrationPrepBoardProps {
  cycleId: string;
}

const deltaColors: Record<-2 | -1 | 0 | 1 | 2, string> = {
  2: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  1: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  0: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  '-1': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  '-2': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const deltaLabels: Record<-2 | -1 | 0 | 1 | 2, string> = {
  2: '++ Exceeds',
  1: '+ Above',
  0: '= Meets',
  '-1': '- Below',
  '-2': '-- Far Below',
};

/**
 * Select target level; map impacts to rubric via mapToRubric;
 * show delta matrix (−2..+2) with color scale; notes; export pre-read PDF/Doc
 */
export function CalibrationPrepBoard({ cycleId }: CalibrationPrepBoardProps) {
  const { t } = useTranslation();
  const { byId, impactsByCycle } = useReviews();
  const { byCycle, addNote } = usePromotion();
  const cycle = byId(cycleId);
  const impacts = impactsByCycle(cycleId);
  const { rubric } = byCycle(cycleId);
  
  const [targetLevel, setTargetLevel] = useState('');
  const [note, setNote] = useState('');
  const [exporting, setExporting] = useState(false);
  
  const mappings = useMemo(() => {
    if (!targetLevel) return [];
    return mapToRubric(targetLevel, rubric, impacts);
  }, [targetLevel, rubric, impacts]);
  
  const handleAddNote = () => {
    if (!note.trim()) return;
    addNote({
      id: crypto.randomUUID(),
      cycleId,
      note,
      createdAt: new Date().toISOString(),
    });
    setNote('');
  };
  
  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const preRead = generatePreRead(cycle?.title ?? 'Review', targetLevel, mappings);
      await exportReviewPDF(preRead, `Calibration_PreRead_${cycleId}.pdf`);
    } finally {
      setExporting(false);
    }
  };
  
  const handleExportDoc = async () => {
    setExporting(true);
    try {
      const preRead = generatePreRead(cycle?.title ?? 'Review', targetLevel, mappings);
      await exportReviewDoc(preRead, `Calibration Pre-Read: ${cycle?.title}`);
    } finally {
      setExporting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="space-y-2 flex-1 max-w-xs">
            <Label htmlFor="target-level">{t('review.targetLevel', 'Target Level')}</Label>
            <Input
              id="target-level"
              value={targetLevel}
              onChange={e => setTargetLevel(e.target.value)}
              placeholder="e.g., L4, Senior"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            disabled={!targetLevel || exporting}
          >
            <Download className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('review.exportPDF', 'Export PDF')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportDoc}
            disabled={!targetLevel || exporting}
          >
            <FileText className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('review.exportDocs', 'Export Doc')}
          </Button>
        </div>
      </div>
      
      {!targetLevel && (
        <div className="text-center py-8 text-muted-foreground">
          <p>{t('review.enterTargetLevel', 'Enter a target level to see calibration matrix.')}</p>
        </div>
      )}
      
      {targetLevel && mappings.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>{t('review.noRubric', 'No rubric defined for this level. Add rubric expectations in settings.')}</p>
        </div>
      )}
      
      {targetLevel && mappings.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">{t('review.competencyMatrix', 'Competency Assessment Matrix')}</h3>
          
          <div className="space-y-3">
            {mappings.map((m, idx) => (
              <div key={idx} className="border rounded-md p-4 bg-card">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold capitalize">{m.rubric.competency}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{m.rubric.description}</p>
                  </div>
                  
                  <span className={`px-3 py-1 rounded text-sm font-medium ${deltaColors[m.delta]}`}>
                    {deltaLabels[m.delta]}
                  </span>
                </div>
                
                {m.evidence.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      {t('review.evidence', 'Evidence')}:
                    </p>
                    <ul className="text-sm space-y-1">
                      {m.evidence.map((e, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-muted-foreground">•</span>
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="calib-note">{t('review.calibrationNotes', 'Calibration Notes')}</Label>
        <div className="flex gap-2">
          <Input
            id="calib-note"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={t('review.addNotePlaceholder', 'Add a note...')}
          />
          <Button onClick={handleAddNote} disabled={!note.trim()}>
            {t('common.add', 'Add')}
          </Button>
        </div>
      </div>
    </div>
  );
}
