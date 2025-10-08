import { useTranslation } from 'react-i18next'
import { useATSStore } from '@/stores/ats.store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileJson, FileSpreadsheet } from 'lucide-react'
import ATSDetailsTabs from './ATSDetailsTabs'
import ATSHighlightsToggles from './ATSHighlightsToggles'
import ATSJobTextViewer from './ATSJobTextViewer'
import { exportATSJson, exportKeywordsCsv, downloadBlob } from '@/services/ats/export.service'

/**
 * Main ATS Details component with tabs, toggles, and export functionality
 */
export default function ATSDetails() {
  const { t } = useTranslation('cv')
  const { result } = useATSStore()

  const handleExportJson = () => {
    if (!result) return
    const blob = exportATSJson(result)
    const filename = `ats-analysis-${result.id}.json`
    downloadBlob(blob, filename)
  }

  const handleExportCsv = () => {
    if (!result?.keywordMeta) return
    const blob = exportKeywordsCsv(
      result.keywordMeta,
      result.matchedKeywords,
      result.missingKeywords
    )
    const filename = `ats-keywords-${result.id}.csv`
    downloadBlob(blob, filename)
  }

  if (!result) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <h3 className="text-lg font-semibold mb-2">
          {t('ats.details.title', 'ATS Details')}
        </h3>
        <p>{t('ats.details.noResult', 'Run ATS analysis to see details')}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with export buttons */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {t('ats.details.title', 'ATS Details')}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJson}
            className="gap-2"
            aria-label={t('ats.details.exportJson', 'Export JSON')}
          >
            <FileJson className="h-4 w-4" />
            {t('ats.details.exportJson', 'Export JSON')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={!result.keywordMeta}
            className="gap-2"
            aria-label={t('ats.details.exportCsv', 'Export Keywords CSV')}
          >
            <FileSpreadsheet className="h-4 w-4" />
            {t('ats.details.exportCsv', 'Export Keywords CSV')}
          </Button>
        </div>
      </div>

      {/* Highlights toggles */}
      <ATSHighlightsToggles />

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ATSDetailsTabs />
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Job Text Preview</h3>
            <ATSJobTextViewer />
          </div>
        </div>
      </div>
    </div>
  )
}
