import { Card } from '@/components/ui/card'
import { Lock } from 'lucide-react'

export default function ConfidentialBanner() {
  return (
    <Card className="border-dashed border-red-300 bg-red-50">
      <div className="p-3" role="alert" aria-live="polite">
        <div className="flex items-center gap-2 text-sm font-medium text-red-900">
          <Lock className="h-4 w-4" />
          CONFIDENTIAL — for review/calibration use only
        </div>
        <div className="mt-1 text-xs text-red-800">
          This information is private and should only be shared with your manager and HR during
          official performance reviews. Retention window applies.
        </div>
      </div>
    </Card>
  )
}
