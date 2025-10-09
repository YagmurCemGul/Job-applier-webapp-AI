/**
 * @fileoverview Media recorder widget for Step 43
 * @module components/interview/Recorder
 */

import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Mic, Video, Circle } from 'lucide-react';
import type { Consent } from '@/types/interview.types';
import { getMedia, recordStream } from '@/services/interview/recorder.service';
import { toast } from 'sonner';

interface RecorderProps {
  consent: Consent;
  onBlobReady: (blob: Blob) => void;
}

export function Recorder({ consent, onBlobReady }: RecorderProps) {
  const { t } = useTranslation();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<{ stop: () => void; done: Promise<Blob> } | null>(null);

  useEffect(() => {
    const startStream = async () => {
      try {
        const constraints: MediaStreamConstraints = {
          audio: consent.audio,
          video: consent.video ? { width: 640, height: 480 } : false
        };
        const mediaStream = await getMedia(constraints);
        setStream(mediaStream);
        
        if (videoRef.current && consent.video) {
          videoRef.current.srcObject = mediaStream;
        }

        // Auto-start recording
        const kind = consent.video ? 'video' : 'audio';
        const rec = recordStream(mediaStream, kind);
        recorderRef.current = rec;
        setRecording(true);

        rec.done.then(blob => {
          onBlobReady(blob);
          setRecording(false);
        });
      } catch (error) {
        toast.error(t('interview.errors.mediaAccessDenied'));
      }
    };

    startStream();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleStop = () => {
    recorderRef.current?.stop();
  };

  return (
    <div className="space-y-4">
      {consent.video && (
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full rounded-lg bg-black"
        />
      )}

      {recording && (
        <div className="flex items-center justify-center gap-2 text-red-500" role="status" aria-live="polite">
          <Circle className="h-3 w-3 fill-current animate-pulse" />
          <span className="text-sm font-medium">{t('interview.recording')}</span>
        </div>
      )}

      <div className="flex gap-2 items-center text-sm text-muted-foreground">
        {consent.audio && <Mic className="h-4 w-4" />}
        {consent.video && <Video className="h-4 w-4" />}
        <span>{consent.video ? t('interview.videoRecording') : t('interview.audioRecording')}</span>
      </div>
    </div>
  );
}
