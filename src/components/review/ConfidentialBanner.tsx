import { Card } from '@/components/ui/card'
import { Lock } from 'lucide-react'

export default function ConfidentialBanner() {
  return (
    <Card className="border-dashed border-red-200 bg-red-50">
      <div className="p-3">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 flex-shrink-0 text-red-600" />
          <div className="text-sm font-medium text-red-900" role="alert" aria-live="polite">
            CONFIDENTIAL — for review/calibration use only
          </div>
        </div>
      </div>
    </Card>
  )
}
