/**
 * @fileoverview Documents tab for Step 37
 * @module components/offer/tabs/DocsTab
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, FileDown, FileCheck, ExternalLink } from 'lucide-react';
import type { Offer } from '@/types/offer.types';
import { exportOfferToPDF, exportOfferToDocs, generateOfferHTML } from '@/services/offer/docsExport.service';
import { startESign } from '@/services/offer/esign.service';
import { toast } from 'sonner';

interface DocsTabProps {
  offer: Offer;
}

export function DocsTab({ offer }: DocsTabProps) {
  const { t } = useTranslation();

  const [exporting, setExporting] = useState(false);
  const [esignRequest, setEsignRequest] = useState<any>(null);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const html = generateOfferHTML(offer);
      const result = await exportOfferToPDF(html, `${offer.company}_${offer.role}_Offer.pdf`);

      // Download the result
      if (typeof result === 'string') {
        window.open(result, '_blank');
      } else {
        const url = URL.createObjectURL(result);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${offer.company}_${offer.role}_Offer.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }

      toast.success('Exported to PDF');
    } catch (error) {
      toast.error('Failed to export PDF');
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportDocs = async () => {
    setExporting(true);
    try {
      const html = generateOfferHTML(offer);
      const result = await exportOfferToDocs(html, `${offer.company} - ${offer.role} Offer`);

      if (result.url) {
        window.open(result.url, '_blank');
      }

      toast.success('Exported to Google Docs');
    } catch (error) {
      toast.error('Failed to export to Google Docs. Ensure integration is configured.');
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const handleStartESign = async () => {
    try {
      const html = generateOfferHTML(offer);
      const result = await startESign({
        html,
        docTitle: `${offer.company} - ${offer.role} Offer Letter`
      });

      setEsignRequest(result);
      toast.success('E-signature request created');
    } catch (error) {
      toast.error('Failed to start e-signature');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('offer.docs.export')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={handleExportPDF}
            disabled={exporting}
            variant="outline"
            className="w-full justify-start"
          >
            <FileDown className="mr-2 h-4 w-4" />
            {t('offer.docs.exportPDF')}
          </Button>

          <Button
            onClick={handleExportDocs}
            disabled={exporting}
            variant="outline"
            className="w-full justify-start"
          >
            <FileText className="mr-2 h-4 w-4" />
            {t('offer.docs.exportDocs')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('offer.docs.esign')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-900">
            <strong>Note:</strong> This is a demonstration stub. In production, 
            integrate with DocuSign, Dropbox Sign, or similar e-signature providers.
          </div>

          {!esignRequest ? (
            <Button onClick={handleStartESign} className="w-full">
              <FileCheck className="mr-2 h-4 w-4" />
              {t('offer.docs.startEsign')}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">E-Signature Request</div>
                  <div className="text-sm text-muted-foreground">
                    Status: <Badge>{esignRequest.status}</Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(esignRequest.url, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {t('offer.docs.viewSigned')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
