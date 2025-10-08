/**
 * Notes & Transcript Tab
 * Live recording, transcription, AI summarization, and bias tips
 */

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import type { Interview } from '@/types/interview.types';
import type { Transcript } from '@/types/transcript.types';
import ConsentBanner from '../ConsentBanner';
import TranscriptViewer from '../TranscriptViewer';
import QuestionBankDialog from '../QuestionBankDialog';
import { getASRProvider, makeTranscript } from '@/services/interview/transcription.service';
import { analyzeTranscript } from '@/services/interview/aiNotes.service';
import { biasTips } from '@/services/interview/biasGuard.service';
import { Mic, Square, Sparkles, FileQuestion, AlertTriangle } from 'lucide-react';

interface Props {
  interview: Interview;
  onUpdate: (interview: Interview) => void;
}

export default function NotesTranscriptTab({ interview, onUpdate }: Props) {
  const { toast } = useToast();
  const [notes, setNotes] = useState(interview.notes || '');
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const asrRef = useRef<any>(null);
  const segmentsRef = useRef<Transcript['segments']>([]);

  const biasWarnings = biasTips(notes);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    onUpdate({ ...interview, notes: value });
  };

  const handleStartRecording = async () => {
    if (!interview.consent.recordingAllowed) {
      toast({
        title: 'Consent Required',
        description: 'Recording consent must be granted before starting',
        variant: 'destructive',
      });
      return;
    }

    try {
      const asr = getASRProvider();
      asrRef.current = asr;
      segmentsRef.current = [];

      await asr.start('en', segment => {
        const newSegment = {
          ...segment,
          id: crypto?.randomUUID?.() ?? String(Date.now()),
        };
        segmentsRef.current.push(newSegment);
        setTranscript(makeTranscript(interview.id, 'en', [...segmentsRef.current]));
      });

      setRecording(true);
      toast({ title: 'Recording started', description: 'Transcription is live' });
    } catch (error: any) {
      console.error('Failed to start recording:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to start recording',
        variant: 'destructive',
      });
    }
  };

  const handleStopRecording = async () => {
    if (asrRef.current) {
      await asrRef.current.stop();
      setRecording(false);
      toast({ title: 'Recording stopped' });
    }
  };

  const handleAISummarize = async () => {
    if (!transcript) {
      toast({
        title: 'No transcript',
        description: 'Create a transcript first',
        variant: 'destructive',
      });
      return;
    }

    setAnalyzing(true);
    try {
      const ai = await analyzeTranscript(transcript);
      setTranscript({ ...transcript, ai });
      toast({ title: 'Analysis complete' });
    } catch (error) {
      console.error('Failed to analyze:', error);
      toast({
        title: 'Error',
        description: 'Failed to analyze transcript',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Consent Banner */}
      <ConsentBanner />

      {/* Recording Controls */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recording & Transcription</h2>
        <div className="flex gap-2">
          {!recording ? (
            <Button
              onClick={handleStartRecording}
              disabled={!interview.consent.recordingAllowed}
              className="gap-2"
            >
              <Mic className="w-4 h-4" />
              Start Recording
            </Button>
          ) : (
            <Button onClick={handleStopRecording} variant="destructive" className="gap-2">
              <Square className="w-4 h-4" />
              Stop Recording
            </Button>
          )}

          {transcript && (
            <Button
              onClick={handleAISummarize}
              disabled={analyzing}
              variant="outline"
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {analyzing ? 'Analyzing...' : 'AI Summarize'}
            </Button>
          )}
        </div>

        {recording && (
          <Alert className="mt-4">
            <Mic className="h-4 w-4 animate-pulse" />
            <AlertDescription>Recording in progress...</AlertDescription>
          </Alert>
        )}
      </Card>

      {/* Transcript Viewer */}
      {transcript && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Transcript</h2>
          <TranscriptViewer transcript={transcript} />
        </Card>
      )}

      {/* Notes */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Interview Notes</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQuestions(true)}
            className="gap-2"
          >
            <FileQuestion className="w-4 h-4" />
            Question Bank
          </Button>
        </div>

        <Textarea
          value={notes}
          onChange={e => handleNotesChange(e.target.value)}
          placeholder="Take notes during the interview..."
          className="min-h-[200px]"
        />

        {/* Bias Tips */}
        {biasWarnings.length > 0 && (
          <Alert className="mt-4 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Bias Awareness Tips:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                {biasWarnings.map((w, i) => (
                  <li key={i}>{w.tip}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </Card>

      <QuestionBankDialog open={showQuestions} onOpenChange={setShowQuestions} />
    </div>
  );
}
