import { useMemo } from 'react'
import { useATSStore } from '@/stores/ats.store'
import { useCVDataStore } from '@/stores/cvData.store'
import ATSPill from './ATSPill'
import ATSFilters from './ATSFilters'
import ATSSummaryBar from './ATSSummaryBar'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { RotateCcw, Redo2, RefreshCw } from 'lucide-react'

/**
 * Main ATS analysis panel with suggestions, filters, and controls
 */
export default function ATSPanel() {
  const { t } = useTranslation('cv')
  const {
    result,
    filter,
    applySuggestion,
    dismissSuggestion,
    undo,
    redo,
    analyze,
    parsedJob,
    isAnalyzing,
    past,
    future,
  } = useATSStore()
  const { currentCV } = useCVDataStore()

  const filtered = useMemo(() => {
    if (!result) return []
    return result.suggestions.filter((s) => {
      if (filter.category && s.category !== filter.category) return false
      if (filter.severity && s.severity !== (filter.severity as any)) return false
      if (
        filter.search &&
        !`${s.title} ${s.detail}`.toLowerCase().includes(filter.search.toLowerCase())
      )
        return false
      return true
    })
  }, [result, filter])

  if (!result) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t('optimize.noAnalysis', 'Parse a job posting and run analysis to see suggestions.')}
      </div>
    )
  }

  const handleReanalyze = () => {
    if (currentCV && parsedJob) {
      analyze(currentCV)
    }
  }

  return (
    <div className="space-y-4">
      <ATSSummaryBar />

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReanalyze}
          disabled={isAnalyzing || !parsedJob || !currentCV}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {isAnalyzing ? t('job.reanalyzing', 'Re-analyzing...') : t('job.reanalyze', 'Re-run Analysis')}
        </Button>
        <Button variant="ghost" size="sm" onClick={undo} disabled={!past.length} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          {t('common.undo', 'Undo')}
        </Button>
        <Button variant="ghost" size="sm" onClick={redo} disabled={!future.length} className="gap-2">
          <Redo2 className="h-4 w-4" />
          {t('common.redo', 'Redo')}
        </Button>
      </div>

      <ATSFilters />

      <div className="flex flex-wrap gap-2">
        {filtered.map((s) => (
          <ATSPill key={s.id} suggestion={s} onApply={applySuggestion} onDismiss={dismissSuggestion} />
        ))}
        {!filtered.length && (
          <div className="text-sm text-muted-foreground py-4">
            {t('optimize.noSuggestions', 'No suggestions match the filters.')}
          </div>
        )}
      </div>
    </div>
  )
}
