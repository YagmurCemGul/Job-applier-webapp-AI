import { useATSStore } from '@/stores/ats.store'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

/**
 * Tab for pasting job posting text directly
 */
export default function JobPasteTab() {
  const { t } = useTranslation('cv')
  const { currentJobText, setJobText, parseJob, isParsing } = useATSStore()
  const debounced = useDebouncedValue(currentJobText, 250)

  const wordCount = debounced.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="space-y-3 pt-4">
      <Textarea
        value={currentJobText}
        onChange={(e) => setJobText(e.target.value)}
        placeholder={t('job.pastePlaceholder', 'Paste the job description here...')}
        className="h-56 resize-none"
        aria-label="Job description"
      />
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {t('job.words', '{{count}} words', { count: wordCount })}
        </div>
        <Button onClick={parseJob} disabled={isParsing || !currentJobText.trim()} size="sm">
          {isParsing ? t('job.parsing', 'Parsing...') : t('job.parse', 'Parse')}
        </Button>
      </div>
    </div>
  )
}
