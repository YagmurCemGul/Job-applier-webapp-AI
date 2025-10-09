/**
 * @fileoverview Job Intake Card component
 * @module components/apply/JobIntakeCard
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { intakePosting } from '@/services/apply/intake.service';
import { useApply } from '@/stores/apply.store';
import { Upload, Link as LinkIcon, FileText } from 'lucide-react';
import type { JobPosting } from '@/types/apply.types';

export function JobIntakeCard() {
  const { t } = useTranslation();
  const { upsertPosting } = useApply();
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JobPosting | null>(null);
  
  const handleIntake = async (input: { url?: string; text?: string; pdf?: File }) => {
    setLoading(true);
    try {
      const posting = await intakePosting(input);
      upsertPosting(posting);
      setResult(posting);
    } catch (error) {
      console.error('Intake error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      await handleIntake({ pdf: file });
    }
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('apply.intake')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job-url">{t('apply.pasteUrl')}</Label>
            <div className="flex gap-2">
              <Input
                id="job-url"
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <Button onClick={() => handleIntake({ url })} disabled={!url || loading}>
                <LinkIcon className="mr-2 h-4 w-4" />
                {t('common.load')}
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">{t('common.or')}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="job-text">{t('apply.pasteText')}</Label>
            <Textarea
              id="job-text"
              placeholder={t('apply.pasteJobDescription')}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
            />
            <Button onClick={() => handleIntake({ text })} disabled={!text || loading}>
              <FileText className="mr-2 h-4 w-4" />
              {t('apply.parse')}
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">{t('common.or')}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pdf-upload">{t('apply.dropPdf')}</Label>
            <Input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
            />
          </div>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>{t('apply.parsedResult')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>{t('common.company')}:</strong> {result.company || '—'}</div>
            <div><strong>{t('common.role')}:</strong> {result.role || '—'}</div>
            <div><strong>{t('common.location')}:</strong> {result.location || '—'}</div>
            <div><strong>{t('apply.questions')}:</strong> {result.questions.length}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
