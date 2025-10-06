import { useATSStore } from '@/store/atsStore'
import { TrendingUp } from 'lucide-react'

/**
 * ATS analysis summary bar - score and keyword stats
 */
export default function ATSSummaryBar() {
  const { result } = useATSStore()
  if (!result) return null

  const scoreColor =
    result.score >= 80 ? 'text-green-700' : result.score >= 60 ? 'text-yellow-700' : 'text-red-700'

  return (
    <div className="flex items-center justify-between rounded-md border bg-muted/30 p-3">
      <div className="flex items-center gap-2">
        <TrendingUp className={cn('h-5 w-5', scoreColor)} />
        <span className="font-semibold">ATS Score: {result.score}/100</span>
      </div>
      <div className="text-sm text-muted-foreground">
        {result.matchedKeywords.length} matched • {result.missingKeywords.length} missing
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
