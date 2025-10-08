/**
 * @fileoverview Promotion case builder
 * Assembles packet with narrative, quotes, and export options
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileText, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useReviews } from '@/stores/review.store';
import { usePromotion } from '@/stores/promotion.store';
import { useFeedback } from '@/stores/feedback.store';
import { buildPromotionPacketHTML } from '@/services/review/promotionPacket.service';
import { exportReviewPDF } from '@/services/export/reviewExport.pdf.service';
import { exportReviewDoc } from '@/services/export/reviewExport.docs.service';

interface PromotionCaseBuilderProps {
  cycleId: string;
}

/**
 * Set target level; import self-review highlights & quotes;
 * render packet HTML via buildPromotionPacketHTML; export PDF/Doc;
 * Share via Gmail (Step 35)
 */
export function PromotionCaseBuilder({ cycleId }: PromotionCaseBuilderProps) {
  const { t } = useTranslation();
  const { byId, impactsByCycle, selfByCycle } = useReviews();
  const { byCycle, upsertCase } = usePromotion();
  const { byCycle: feedbackByCycle } = useFeedback();
  
  const cycle = byId(cycleId);
  const impacts = impactsByCycle(cycleId);
  const self = selfByCycle(cycleId);
  const { case: existingCase } = byCycle(cycleId);
  const { responses } = feedbackByCycle(cycleId);
  
  const [targetLevel, setTargetLevel] = useState(existingCase?.targetLevel ?? '');
  const [narrative, setNarrative] = useState(existingCase?.narrative ?? '');
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>(existingCase?.supportingQuotes ?? []);
  const [exporting, setExporting] = useState(false);
  
  useEffect(() => {
    if (existingCase) {
      setTargetLevel(existingCase.targetLevel);
      setNarrative(existingCase.narrative);
      setSelectedQuotes(existingCase.supportingQuotes);
    }
  }, [existingCase]);
  
  const handleSave = () => {
    upsertCase({
      id: existingCase?.id ?? crypto.randomUUID(),
      cycleId,
      targetLevel,
      narrative,
      supportingQuotes: selectedQuotes,
      version: (existingCase?.version ?? 0) + 1,
      updatedAt: new Date().toISOString(),
    });
  };
  
  const handleToggleQuote = (body: string) => {
    if (selectedQuotes.includes(body)) {
      setSelectedQuotes(selectedQuotes.filter(q => q !== body));
    } else {
      setSelectedQuotes([...selectedQuotes, body]);
    }
  };
  
  const handleExportPDF = async () => {
    if (!self) return;
    setExporting(true);
    try {
      const html = buildPromotionPacketHTML({
        cycleTitle: cycle?.title ?? 'Promotion',
        targetLevel,
        self,
        impacts,
        quotes: selectedQuotes,
      });
      await exportReviewPDF(html, `Promotion_Packet_${cycleId}.pdf`);
    } finally {
      setExporting(false);
    }
  };
  
  const handleExportDoc = async () => {
    if (!self) return;
    setExporting(true);
    try {
      const html = buildPromotionPacketHTML({
        cycleTitle: cycle?.title ?? 'Promotion',
        targetLevel,
        self,
        impacts,
        quotes: selectedQuotes,
      });
      await exportReviewDoc(html, `Promotion Packet: ${cycle?.title}`);
    } finally {
      setExporting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2 flex-1 max-w-xs">
          <Label htmlFor="promo-level">{t('review.targetLevel', 'Target Level')}</Label>
          <Input
            id="promo-level"
            value={targetLevel}
            onChange={e => setTargetLevel(e.target.value)}
            placeholder="e.g., L5, Staff"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} variant="outline">
            {t('common.save', 'Save')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            disabled={!self || exporting}
          >
            <Download className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('review.exportPDF', 'Export PDF')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportDoc}
            disabled={!self || exporting}
          >
            <FileText className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('review.exportDocs', 'Export Doc')}
          </Button>
        </div>
      </div>
      
      {!self && (
        <div className="text-center py-8 text-muted-foreground">
          <p>{t('review.createSelfReviewFirst', 'Create a self-review first to build promotion packet.')}</p>
        </div>
      )}
      
      {self && (
        <>
          <div className="space-y-2">
            <Label htmlFor="narrative">{t('review.scopeNarrative', 'Scope Increase Narrative')}</Label>
            <Textarea
              id="narrative"
              value={narrative}
              onChange={e => setNarrative(e.target.value)}
              rows={6}
              placeholder={t('review.narrativePlaceholder', 'Describe how your scope has grown...')}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('review.supportingQuotes', 'Supporting Quotes')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('review.selectQuotes', 'Select feedback snippets to include in your packet.')}
            </p>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {responses.map(r => (
                <label
                  key={r.id}
                  className="flex items-start gap-2 p-2 border rounded hover:bg-accent cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedQuotes.includes(r.body)}
                    onChange={() => handleToggleQuote(r.body)}
                    className="mt-1 rounded border-gray-300"
                  />
                  <p className="text-sm flex-1">{r.body.slice(0, 200)}{r.body.length > 200 ? '...' : ''}</p>
                </label>
              ))}
            </div>
            
            {responses.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('review.noQuotes', 'No feedback responses to select from.')}
              </p>
            )}
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">{t('review.previewPacket', 'Preview Packet')}</h4>
            <div className="border rounded-md p-4 bg-muted max-h-96 overflow-y-auto text-sm">
              <div
                dangerouslySetInnerHTML={{
                  __html: buildPromotionPacketHTML({
                    cycleTitle: cycle?.title ?? 'Promotion',
                    targetLevel,
                    self,
                    impacts,
                    quotes: selectedQuotes,
                  }),
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
