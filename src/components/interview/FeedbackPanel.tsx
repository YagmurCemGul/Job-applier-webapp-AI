/**
 * @fileoverview AI feedback panel for Step 43
 * @module components/interview/FeedbackPanel
 */

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Mail, Info } from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackPanelProps {
  feedbackHtml: string;
  onSendEmail?: () => void;
}

export function FeedbackPanel({ feedbackHtml, onSendEmail }: FeedbackPanelProps) {
  const { t } = useTranslation();

  const handleCopy = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = feedbackHtml;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    navigator.clipboard.writeText(text);
    toast.success(t('interview.copiedToClipboard'));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('interview.feedback')}</CardTitle>
          <div className="flex gap-2">
            <Button onClick={handleCopy} variant="outline" size="sm">
              <Copy className="mr-2 h-4 w-4" />
              {t('interview.copySummary')}
            </Button>
            {onSendEmail && (
              <Button onClick={onSendEmail} variant="outline" size="sm">
                <Mail className="mr-2 h-4 w-4" />
                {t('interview.emailSelf')}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {t('interview.feedback.redactionNotice')}
          </AlertDescription>
        </Alert>

        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: feedbackHtml }}
        />
      </CardContent>
    </Card>
  );
}
