import { useATSStore } from '@/stores/ats.store'
import { useTranslation } from 'react-i18next'
import { TrendingUp } from 'lucide-react'

/**
 * Summary bar showing ATS score and keyword stats
 */
export default function ATSSummaryBar() {
  const { t } = useTranslation('cv')
  const { result } = useATSStore()
  if (!result) return null

  const scoreColor =
    result.score >= 80
      ? 'text-green-600 dark:text-green-400'
      : result.score >= 60
      ? 'text-yellow-600 dark:text-yellow-400'
      : 'text-red-600 dark:text-red-400'

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
      <div className="flex items-center gap-3">
        <TrendingUp className={cn('h-5 w-5', scoreColor)} />
        <div>
          <div className="font-semibold text-lg">
            {t('job.score', 'ATS Score')}: <span className={scoreColor}>{result.score}/100</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {result.matchedKeywords.length} {t('job.matched', 'matched')} •{' '}
            {result.missingKeywords.length} {t('job.missing', 'missing')}
          </div>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}
