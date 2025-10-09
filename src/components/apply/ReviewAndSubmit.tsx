/**
 * @fileoverview Review and Submit component
 * @module components/apply/ReviewAndSubmit
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { buildReviewHtml } from '@/services/apply/review.service';
import { exportPacket } from '@/services/apply/exportPacket.service';
import { sendConfirmationEmail } from '@/services/apply/confirmEmail.service';
import { scheduleFollowUp } from '@/services/apply/reminders.service';
import { ComplianceBanner } from './ComplianceBanner';
import { Send, Download, Mail, Calendar } from 'lucide-react';
import type { ApplyRun, JobPosting, VariantDoc, Screener } from '@/types/apply.types';

interface Props {
  run: ApplyRun;
  posting: JobPosting;
  variants: VariantDoc[];
  screeners: Screener[];
  onSubmit: () => void;
}

export function ReviewAndSubmit({ run, posting, variants, screeners, onSubmit }: Props) {
  const { t } = useTranslation();
  const [consent, setConsent] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sending, setSending] = useState(false);
  
  const reviewHtml = buildReviewHtml(run, posting.company, posting.role, screeners);
  
  const handleExport = async (kind: 'pdf' | 'gdoc') => {
    setExporting(true);
    try {
      await exportPacket({ run, posting, variants, screeners, kind });
    } finally {
      setExporting(false);
    }
  };
  
  const handleEmail = async () => {
    setSending(true);
    try {
      // Stub: would use real OAuth credentials
      await sendConfirmationEmail({
        accountId: 'user@example.com',
        clientId: 'stub-client-id',
        passphrase: 'stub-passphrase',
        to: 'user@example.com',
        subject: `Application Submitted: ${posting.company} - ${posting.role}`,
        html: reviewHtml
      });
    } finally {
      setSending(false);
    }
  };
  
  const handleReminder = async () => {
    try {
      await scheduleFollowUp(7, `Follow up: ${posting.company}`, 'user@example.com', 'stub-client-id', 'stub-passphrase');
    } catch (error) {
      console.error('Reminder error:', error);
    }
  };
  
  return (
    <div className="space-y-4">
      <ComplianceBanner />
      
      <Card>
        <CardHeader>
          <CardTitle>{t('apply.review')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div dangerouslySetInnerHTML={{ __html: reviewHtml }} className="prose prose-sm max-w-none" />
          
          <div className="flex items-center space-x-2 border-t pt-4">
            <Checkbox 
              id="consent" 
              checked={consent}
              onChange={(e: any) => setConsent(e.target.checked)}
            />
            <Label htmlFor="consent" className="text-sm cursor-pointer">
              {t('apply.consentLabel')}
            </Label>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => handleExport('pdf')} disabled={exporting}>
              <Download className="mr-2 h-4 w-4" />
              {t('apply.exportPacket')} (PDF)
            </Button>
            <Button variant="outline" onClick={() => handleExport('gdoc')} disabled={exporting}>
              <Download className="mr-2 h-4 w-4" />
              {t('apply.exportPacket')} (Doc)
            </Button>
            <Button variant="outline" onClick={handleEmail} disabled={sending}>
              <Mail className="mr-2 h-4 w-4" />
              {t('apply.sendEmail')}
            </Button>
            <Button variant="outline" onClick={handleReminder}>
              <Calendar className="mr-2 h-4 w-4" />
              {t('apply.createReminder')}
            </Button>
          </div>
          
          <Button 
            onClick={onSubmit}
            disabled={!consent}
            className="w-full"
            size="lg"
          >
            <Send className="mr-2 h-5 w-5" />
            {t('apply.markSubmitted')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
