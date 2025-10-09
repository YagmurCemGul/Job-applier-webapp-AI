/**
 * @fileoverview Offer intake card component for Step 44
 * @module components/offers/OfferIntakeCard
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { intakeOffer } from '@/services/offers/intake.service';
import { useOffers } from '@/stores/offers.store.step44';
import type { Offer } from '@/types/offer.types.step44';

/**
 * Offer intake with PDF/text/manual input
 */
export function OfferIntakeCard() {
  const { t } = useTranslation();
  const { upsert } = useOffers();
  
  const [loading, setLoading] = useState(false);
  const [parsedOffer, setParsedOffer] = useState<Offer | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [company, setCompany] = useState('');
  const [url, setUrl] = useState('');

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPdfFile(file);
  }, []);

  const handleParse = useCallback(async () => {
    setLoading(true);
    try {
      const offer = await intakeOffer({
        pdf: pdfFile || undefined,
        text: textInput || undefined,
        company: company || undefined,
        url: url || undefined
      });
      setParsedOffer(offer);
    } catch (err) {
      console.error('Parse error:', err);
    } finally {
      setLoading(false);
    }
  }, [pdfFile, textInput, company, url]);

  const handleSave = useCallback(() => {
    if (parsedOffer) {
      upsert(parsedOffer);
      setParsedOffer(null);
      setPdfFile(null);
      setTextInput('');
      setCompany('');
      setUrl('');
    }
  }, [parsedOffer, upsert]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('offer.addOffer', 'Add Offer')}</CardTitle>
          <CardDescription>
            Upload PDF, paste text, or enter manually
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('offer.disclaimer', 'Educational estimate — not financial or legal advice.')}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Source URL (optional)</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdf">Upload PDF</Label>
            <div className="flex items-center gap-2">
              <Input
                id="pdf"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="flex-1"
              />
              {pdfFile && (
                <FileText className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="text">Or paste offer text</Label>
            <textarea
              id="text"
              className="w-full min-h-[120px] p-2 border rounded-md"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste offer letter text here..."
            />
          </div>

          <Button onClick={handleParse} disabled={loading} className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            {loading ? 'Parsing...' : 'Parse Offer'}
          </Button>
        </CardContent>
      </Card>

      {parsedOffer && (
        <Card>
          <CardHeader>
            <CardTitle>Parsed Offer Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <strong>Company:</strong> {parsedOffer.company}
              </div>
              <div>
                <strong>Role:</strong> {parsedOffer.role}
              </div>
              <div>
                <strong>Base:</strong> {parsedOffer.currency} {parsedOffer.baseAnnual.toLocaleString()}
              </div>
              <div>
                <strong>Bonus:</strong> {parsedOffer.bonusTargetPct || 0}%
              </div>
              {parsedOffer.equity && (
                <div className="col-span-2">
                  <strong>Equity:</strong> {parsedOffer.equity.kind.toUpperCase()} {parsedOffer.equity.grantShares || parsedOffer.equity.grantValue || 0} shares
                </div>
              )}
            </div>
            <Button onClick={handleSave} className="w-full mt-4">
              Save Offer
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
