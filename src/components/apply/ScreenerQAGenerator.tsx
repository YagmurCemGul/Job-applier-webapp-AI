/**
 * @fileoverview Screener Q&A Generator component
 * @module components/apply/ScreenerQAGenerator
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { draftAnswers } from '@/services/apply/qaDraft.service';
import { policyScan } from '@/services/apply/qaPolicy.service';
import type { Screener } from '@/types/apply.types';
import { Sparkles, Shield, Languages } from 'lucide-react';

interface Props {
  questions: Screener[];
  onUpdate: (questions: Screener[]) => void;
}

export function ScreenerQAGenerator({ questions, onUpdate }: Props) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);
  
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const lang = i18n.language as 'en' | 'tr';
      const drafted = await draftAnswers(questions, lang);
      onUpdate(drafted);
    } finally {
      setLoading(false);
    }
  };
  
  const handleScan = () => {
    const scannedQs = policyScan(questions);
    onUpdate(scannedQs);
    setScanned(true);
  };
  
  const handleAnswerChange = (id: string, answer: string) => {
    onUpdate(questions.map(q => q.id === id ? { ...q, answer } : q));
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {t('apply.qa')}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading}>
                <Sparkles className="mr-2 h-4 w-4" />
                {t('apply.generateDraft')}
              </Button>
              <Button variant="outline" size="sm" onClick={handleScan} disabled={scanned}>
                <Shield className="mr-2 h-4 w-4" />
                {t('apply.policyScan')}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="space-y-2 border-b pb-4 last:border-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="font-medium">{idx + 1}. {q.prompt}</div>
                  {q.flags && q.flags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {q.flags.map(flag => (
                        <Badge key={flag} variant="outline" className="text-xs">
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Textarea
                value={q.answer || ''}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                placeholder={t('apply.typeAnswer')}
                rows={3}
                maxLength={q.maxChars || 900}
              />
              <div className="text-xs text-muted-foreground text-right">
                {q.answer?.length || 0} / {q.maxChars || 900} {t('common.characters')}
              </div>
              {q.redactedAnswer && q.redactedAnswer !== q.answer && (
                <div className="text-xs text-yellow-600">
                  <Shield className="inline h-3 w-3 mr-1" />
                  {t('apply.redacted')}: {q.redactedAnswer}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
