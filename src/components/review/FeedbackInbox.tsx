/**
 * @fileoverview Feedback inbox component
 * Displays responses with anonymization, sentiment, and AI summary
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFeedback } from '@/stores/feedback.store';
import { summarizeFeedback } from '@/services/review/sentiment.service';
import type { FeedbackResponse } from '@/types/review.types';

interface FeedbackInboxProps {
  cycleId: string;
}

/**
 * List responses with anonymous view toggle (uses redactPII);
 * filters (relationship, sentiment); AI summary of all responses;
 * export redacted/raw; copy quotes
 */
export function FeedbackInbox({ cycleId }: FeedbackInboxProps) {
  const { t } = useTranslation();
  const { byCycle } = useFeedback();
  const { responses } = byCycle(cycleId);
  
  const [anonymousView, setAnonymousView] = useState(false);
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  
  const filtered = useMemo(() => {
    if (sentimentFilter === 'all') return responses;
    return responses.filter(r => r.sentiment === sentimentFilter);
  }, [responses, sentimentFilter]);
  
  const handleGenerateSummary = async () => {
    setLoadingSummary(true);
    try {
      const bodies = responses.map(r => r.body);
      const result = await summarizeFeedback(bodies);
      setSummary(result);
    } finally {
      setLoadingSummary(false);
    }
  };
  
  const handleExportCSV = () => {
    const headers = ['Received At', 'Sentiment', 'Body'];
    const rows = filtered.map(r => [
      r.receivedAt,
      r.sentiment || '',
      anonymousView ? (r.redactedBody || r.body) : r.body,
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback_${cycleId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const sentimentColors = {
    positive: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    negative: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select
            value={sentimentFilter}
            onValueChange={(v: any) => setSentimentFilter(v)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
              <SelectItem value="positive">{t('review.sentiment.positive', 'Positive')}</SelectItem>
              <SelectItem value="neutral">{t('review.sentiment.neutral', 'Neutral')}</SelectItem>
              <SelectItem value="negative">{t('review.sentiment.negative', 'Negative')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAnonymousView(!anonymousView)}
          >
            {anonymousView ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" aria-hidden="true" />
                {t('review.showRaw', 'Show Raw')}
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" aria-hidden="true" />
                {t('review.anonymize', 'Anonymize')}
              </>
            )}
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleGenerateSummary} disabled={loadingSummary}>
            <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
            {loadingSummary ? t('common.loading', 'Loading...') : t('review.aiSummary', 'AI Summary')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('common.export', 'Export')}
          </Button>
        </div>
      </div>
      
      {summary && (
        <div className="border rounded-md p-4 bg-blue-50 dark:bg-blue-950">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            {t('review.aiSummary', 'AI Summary')}
          </h4>
          <p className="text-sm whitespace-pre-wrap">{summary}</p>
        </div>
      )}
      
      <div className="text-sm text-muted-foreground">
        {t('review.responsesCount', { count: filtered.length, defaultValue: `${filtered.length} responses` })}
      </div>
      
      <div className="space-y-3">
        {filtered.map(response => (
          <div
            key={response.id}
            className="border rounded-md p-4 bg-card"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {response.sentiment && (
                  <span className={`px-2 py-1 rounded text-xs font-medium ${sentimentColors[response.sentiment]}`}>
                    {response.sentiment}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {new Date(response.receivedAt).toLocaleDateString()}
                </span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const text = anonymousView ? (response.redactedBody || response.body) : response.body;
                  navigator.clipboard.writeText(text);
                }}
              >
                {t('common.copy', 'Copy')}
              </Button>
            </div>
            
            <p className="text-sm whitespace-pre-wrap">
              {anonymousView ? (response.redactedBody || response.body) : response.body}
            </p>
          </div>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>{t('review.noResponses', 'No feedback responses yet.')}</p>
        </div>
      )}
    </div>
  );
}
