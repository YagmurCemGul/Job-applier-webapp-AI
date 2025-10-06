import { Card } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import type { Interview } from '@/types/interview.types'

export default function ConsentBanner({
  consent,
  onConsentChange,
}: {
  consent: Interview['consent']
  onConsentChange: (consent: Interview['consent']) => void
}) {
  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <div className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
          <div className="flex-1 space-y-2">
            <div className="text-sm font-medium text-yellow-900">
              Recording & Transcription Consent
            </div>
            <div className="text-xs text-yellow-800">
              Before recording or transcribing this interview, ensure you have obtained explicit
              consent from the candidate. Recording without consent may violate privacy laws and
              regulations.
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={consent.recordingAllowed}
                onChange={(e) => {
                  onConsentChange({
                    recordingAllowed: e.target.checked,
                    capturedAt: e.target.checked ? new Date().toISOString() : undefined,
                  })
                }}
              />
              <span className="text-yellow-900">
                I have obtained consent to record and transcribe this interview
              </span>
            </label>
          </div>
        </div>
      </div>
    </Card>
  )
}
