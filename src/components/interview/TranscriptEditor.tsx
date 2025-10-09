/**
 * @fileoverview Transcript editor component for Step 43
 * @module components/interview/TranscriptEditor
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sparkles, Save } from 'lucide-react';
import type { Transcript } from '@/types/interview.types';
import { chunkTranscript } from '@/services/interview/chunking.service';
import { buildFeedbackHTML } from '@/services/interview/feedback.service';
import { toast } from 'sonner';

interface TranscriptEditorProps {
  transcript: Transcript;
  onChange: (transcript: Transcript) => void;
  onFeedbackReady?: (feedbackHtml: string) => void;
}

export function TranscriptEditor({ transcript, onChange, onFeedbackReady }: TranscriptEditorProps) {
  const { t } = useTranslation();
  const [generating, setGenerating] = useState(false);

  const handleTextChange = (text: string) => {
    onChange({ ...transcript, text });
  };

  const handleGenerateFeedback = async () => {
    setGenerating(true);
    try {
      const chunks = chunkTranscript(transcript.text);
      const feedbackHtml = await buildFeedbackHTML(transcript);
      onFeedbackReady?.(feedbackHtml);
      toast.success(t('interview.feedbackGenerated'));
    } catch (error) {
      toast.error(t('interview.errors.feedbackFailed'));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('interview.transcript')}</CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleGenerateFeedback} disabled={generating} variant="default">
                <Sparkles className="mr-2 h-4 w-4" />
                {generating ? t('interview.generating') : t('interview.generateFeedback')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={transcript.text}
            onChange={e => handleTextChange(e.target.value)}
            rows={10}
            className="font-mono text-sm"
            placeholder={t('interview.transcriptPlaceholder')}
          />

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-muted rounded">
              <div className="text-muted-foreground">{t('interview.wordsPerMin')}</div>
              <div className="text-2xl font-bold">{transcript.wordsPerMin || '—'}</div>
            </div>
            <div className="p-3 bg-muted rounded">
              <div className="text-muted-foreground">{t('interview.fillerWords')}</div>
              <div className="text-2xl font-bold">{transcript.fillerCount || 0}</div>
            </div>
            <div className="p-3 bg-muted rounded">
              <div className="text-muted-foreground">{t('interview.talkRatio')}</div>
              <div className="text-2xl font-bold">
                {transcript.talkListenRatio ? `${(transcript.talkListenRatio * 100).toFixed(0)}%` : '—'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {transcript.segments && transcript.segments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('interview.segments')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">{t('interview.time')}</TableHead>
                  <TableHead>{t('interview.content')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transcript.segments.map((seg, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-sm">
                      {Math.floor(seg.t0 / 60)}:{String(seg.t0 % 60).padStart(2, '0')} -
                      {Math.floor(seg.t1 / 60)}:{String(seg.t1 % 60).padStart(2, '0')}
                    </TableCell>
                    <TableCell>{seg.text}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
