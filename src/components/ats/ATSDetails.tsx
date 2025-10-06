import { useTranslation } from 'react-i18next'
import { useATSStore } from '@/store/atsStore'
import { Button } from '@/components/ui/button'
import { Download, FileJson, FileSpreadsheet } from 'lucide-react'
import ATSDetailsTabs from './ATSDetailsTabs'
import ATSHighlightsToggles from './ATSHighlightsToggles'
import { exportATSJson, exportKeywordsCsv, downloadBlob } from '@/services/ats/export.service'

export default function ATSDetails() {
  const { t } = useTranslation()
  const { result } = useATSStore()

  if (!result) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No ATS analysis available. Please analyze a job posting first.</p>
      </div>
    )
  }

  const handleExportJson = () => {
    const blob = exportATSJson(result)
    downloadBlob(blob, `ats-analysis-${result.id}.json`)
  }

  const handleExportCsv = () => {
    if (!result.keywordMeta) return
    const blob = exportKeywordsCsv(
      result.keywordMeta,
      result.matchedKeywords,
      result.missingKeywords
    )
    downloadBlob(blob, `ats-keywords-${result.id}.csv`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('ats.details.title')}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportJson}>
            <FileJson className="mr-2 h-4 w-4" />
            {t('ats.details.exportJson')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={!result.keywordMeta}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            {t('ats.details.exportCsv')}
          </Button>
        </div>
      </div>

      {/* Highlights Toggles */}
      <ATSHighlightsToggles />

      {/* Main Content */}
      <ATSDetailsTabs result={result} />
    </div>
  )
}
