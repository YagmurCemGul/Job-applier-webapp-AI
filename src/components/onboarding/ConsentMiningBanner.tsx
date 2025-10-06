import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, X } from 'lucide-react'

export default function ConsentMiningBanner({
  onConsent,
}: {
  onConsent?: (consented: boolean) => void
}) {
  const [dismissed, setDismissed] = useState(false)
  const [consented, setConsented] = useState(false)

  const handleToggle = () => {
    const newConsent = !consented
    setConsented(newConsent)
    onConsent?.(newConsent)
  }

  if (dismissed) return null

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
          <div className="flex-1 space-y-2">
            <div className="text-sm font-medium text-yellow-900">Calendar & Email Suggestions</div>
            <div className="text-xs text-yellow-800">
              Calendar/email suggestions require your consent and use only your own data (event
              titles and dates; no content unless pasted).
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={consented} onChange={handleToggle} />
                <span className="text-yellow-900">
                  I consent to calendar/email analysis for suggestions
                </span>
              </label>
              <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
