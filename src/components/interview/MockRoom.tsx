/**
 * @fileoverview Mock interview room component for Step 43
 * @module components/interview/MockRoom
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PlayCircle, StopCircle, Timer } from 'lucide-react';
import type { QuestionItem, StorySTAR, SessionRun, Consent } from '@/types/interview.types';
import { Recorder } from './Recorder';
import { useInterview } from '@/stores/interview.store';
import { transcribeLocal } from '@/services/interview/transcribe.stub.service';
import { toast } from 'sonner';

interface MockRoomProps {
  questions: QuestionItem[];
  stories: StorySTAR[];
  onComplete?: (run: SessionRun) => void;
}

export function MockRoom({ questions, stories, onComplete }: MockRoomProps) {
  const { t } = useTranslation();
  const { upsertRun } = useInterview();
  const [consentOpen, setConsentOpen] = useState(true);
  const [consent, setConsent] = useState<Consent>({ audio: false, video: false, transcription: false });
  const [sessionId] = useState(crypto.randomUUID());
  const [started, setStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);

  const currentQuestion = questions[questionIndex];

  const handleStart = () => {
    if (!consent.audio && !consent.video) {
      toast.error(t('interview.errors.consentRequired'));
      return;
    }

    setConsentOpen(false);
    setStarted(true);

    const interval = setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);
    setTimerInterval(interval);

    const run: SessionRun = {
      id: sessionId,
      questionIds: questions.map(q => q.id),
      storyIds: stories.map(s => s.id),
      consent,
      startedAt: new Date().toISOString()
    };
    upsertRun(run);
  };

  const handleStop = async () => {
    if (timerInterval) clearInterval(timerInterval);
    setStarted(false);

    if (mediaBlob) {
      try {
        const transcript = await transcribeLocal(mediaBlob);
        const run: SessionRun = {
          id: sessionId,
          questionIds: questions.map(q => q.id),
          storyIds: stories.map(s => s.id),
          consent,
          startedAt: new Date(Date.now() - timer * 1000).toISOString(),
          endedAt: new Date().toISOString(),
          transcript
        };
        upsertRun(run);
        onComplete?.(run);
      } catch (error) {
        toast.error(t('interview.errors.transcriptionFailed'));
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Dialog open={consentOpen} onOpenChange={setConsentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('interview.recordingConsent')}</DialogTitle>
            <DialogDescription>{t('interview.consentDescription')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="audio"
                checked={consent.audio}
                onCheckedChange={c => setConsent({ ...consent, audio: c as boolean })}
              />
              <Label htmlFor="audio">{t('interview.consentAudio')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="video"
                checked={consent.video}
                onCheckedChange={c => setConsent({ ...consent, video: c as boolean })}
              />
              <Label htmlFor="video">{t('interview.consentVideo')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="transcription"
                checked={consent.transcription}
                onCheckedChange={c => setConsent({ ...consent, transcription: c as boolean })}
              />
              <Label htmlFor="transcription">{t('interview.consent')}</Label>
            </div>
            <Button onClick={handleStart} className="w-full">
              <PlayCircle className="mr-2 h-4 w-4" />
              {t('interview.startMock')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('interview.currentQuestion')}</span>
              <div className="flex items-center gap-2 text-sm font-normal">
                <Timer className="h-4 w-4" />
                <span role="timer" aria-live="polite">{formatTime(timer)}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion && (
              <>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium text-lg">{currentQuestion.prompt}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-primary/10 px-2 py-1 rounded">{currentQuestion.kind}</span>
                    <span className="text-xs bg-secondary px-2 py-1 rounded">Difficulty: {currentQuestion.difficulty}/5</span>
                  </div>
                </div>

                {stories.filter(s => s.tags.some(t => currentQuestion.tags.includes(t))).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">{t('interview.relevantStories')}:</h4>
                    {stories.filter(s => s.tags.some(t => currentQuestion.tags.includes(t))).slice(0, 2).map(story => (
                      <div key={story.id} className="p-2 border rounded text-sm">
                        <div className="font-medium">{story.title}</div>
                        <div className="text-muted-foreground">{story.R.slice(0, 100)}...</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setQuestionIndex(Math.max(0, questionIndex - 1))}
                disabled={questionIndex === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setQuestionIndex(Math.min(questions.length - 1, questionIndex + 1))}
                disabled={questionIndex === questions.length - 1}
              >
                Next ({questionIndex + 1}/{questions.length})
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('interview.recording')}</CardTitle>
          </CardHeader>
          <CardContent>
            {started ? (
              <>
                <Recorder
                  consent={consent}
                  onBlobReady={setMediaBlob}
                />
                <Button onClick={handleStop} variant="destructive" className="w-full mt-4">
                  <StopCircle className="mr-2 h-4 w-4" />
                  {t('interview.stop')}
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-8">{t('interview.startToRecord')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
