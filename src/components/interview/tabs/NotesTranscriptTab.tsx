import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { Interview } from '@/types/interview.types'
import { useInterviewsStore } from '@/store/interviewsStore'
import ConsentBanner from '../ConsentBanner'
import { biasTips } from '@/services/interview/biasGuard.service'
import { Mic, MicOff, Sparkles } from 'lucide-react'

export default function NotesTranscriptTab({ interview }: { interview: Interview }) {
  const { update } = useInterviewsStore()
  const [notes, setNotes] = useState(interview.notes || '')
  const [recording, setRecording] = useState(false)
  const tips = biasTips(notes)

  const handleSaveNotes = () => {
    update(interview.id, { notes })
  }

  const toggleRecording = () => {
    setRecording(!recording)
  }

  return (
    <div className="space-y-4">
      <ConsentBanner
        consent={interview.consent}
        onConsentChange={(consent) => update(interview.id, { consent })}
      />

      <Card>
        <CardHeader>
          <CardTitle>Interview Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Take notes during the interview..."
            className="min-h-[200px]"
          />

          {tips.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-amber-600">Bias Guard Tips:</div>
              {tips.map((tip, i) => (
                <div key={i} className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs">
                  {tip}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSaveNotes}>Save Notes</Button>
            <Button variant="outline">
              <Sparkles className="mr-2 h-4 w-4" />
              AI Summarize
            </Button>
          </div>
        </CardContent>
      </Card>

      {interview.consent.recordingAllowed && (
        <Card>
          <CardHeader>
            <CardTitle>Recording & Transcription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={toggleRecording} variant={recording ? 'destructive' : 'default'}>
                {recording ? (
                  <>
                    <MicOff className="mr-2 h-4 w-4" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" />
                    Start Recording
                  </>
                )}
              </Button>
            </div>

            {recording && (
              <div className="rounded-md border bg-red-50 p-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-red-600" />
                  <span className="text-sm text-red-600">Recording in progress...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
