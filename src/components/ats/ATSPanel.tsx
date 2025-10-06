import { useMemo } from 'react'
import { useATSStore } from '@/store/atsStore'
import { useCVDataStore } from '@/store/cvDataStore'
import ATSPill from './ATSPill'
import ATSFilters from './ATSFilters'
import ATSSummaryBar from './ATSSummaryBar'
import { Button } from '@/components/ui/button'
import { RefreshCw, Undo2, Redo2 } from 'lucide-react'

/**
 * Main ATS panel with suggestions, filters, and controls
 */
export default function ATSPanel() {
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
      if (filter.severity && s.severity !== filter.severity) return false
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
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          Parse a job posting and click "Analyze" to see ATS suggestions.
        </p>
      </div>
    )
  }

  const handleReanalyze = () => {
    if (currentCV) {
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
          disabled={isAnalyzing || !parsedJob}
        >
          <RefreshCw className={cn('mr-2 h-4 w-4', isAnalyzing && 'animate-spin')} />
          {isAnalyzing ? 'Re-analyzing...' : 'Re-run analysis'}
        </Button>
        <Button variant="ghost" size="sm" onClick={undo} disabled={!past.length}>
          <Undo2 className="mr-2 h-4 w-4" />
          Undo
        </Button>
        <Button variant="ghost" size="sm" onClick={redo} disabled={!future.length}>
          <Redo2 className="mr-2 h-4 w-4" />
          Redo
        </Button>
      </div>

      <ATSFilters />

      <div className="flex flex-wrap gap-2">
        {filtered.map((s) => (
          <ATSPill key={s.id} s={s} onApply={applySuggestion} onDismiss={dismissSuggestion} />
        ))}
        {!filtered.length && (
          <div className="text-sm text-muted-foreground">No suggestions match the filters.</div>
        )}
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
