/**
 * Consent Banner Component
 * Displays recording/transcription consent information
 */

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, FileText } from 'lucide-react';

export default function ConsentBanner() {
  return (
    <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800">
      <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-200">
        <strong>Recording & Transcription Consent:</strong> Before recording or
        transcribing interviews, ensure you have explicit consent from all
        participants. Recordings are stored locally and retained according to your
        data retention policy.{' '}
        <a
          href="/docs/STEP-36-NOTES.md"
          target="_blank"
          className="underline inline-flex items-center gap-1"
        >
          <FileText className="w-3 h-3" />
          Learn more
        </a>
      </AlertDescription>
    </Alert>
  );
}
