import { useTranslation } from 'react-i18next'
import { useATSWeightsStore } from '@/store/atsWeightsStore'
import { useATSStore } from '@/store/atsStore'
import { useCVDataStore } from '@/store/cvDataStore'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { RefreshCw, RotateCcw } from 'lucide-react'

export default function ATSWeightsPanel() {
  const { t } = useTranslation()
  const { weights, setWeight, reset, normalized } = useATSWeightsStore()
  const { parsedJob, analyze, isAnalyzing } = useATSStore()
  const { currentCV } = useCVDataStore()

  const handleRecalculate = async () => {
    if (!currentCV || !parsedJob) return
    const norm = normalized()
    await analyze(currentCV, { weights: norm })
  }

  const sum = Object.values(weights).reduce((a, b) => a + b, 0)
  const norm = normalized()

  const weightKeys = [
    { key: 'keywords' as const, label: t('ats.details.weightsPanel.keywords') },
    { key: 'sections' as const, label: t('ats.details.weightsPanel.sections') },
    { key: 'length' as const, label: t('ats.details.weightsPanel.length') },
    { key: 'experience' as const, label: t('ats.details.weightsPanel.experience') },
    { key: 'formatting' as const, label: t('ats.details.weightsPanel.formatting') },
  ]

  return (
    <div className="space-y-6 rounded-md border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Scoring Weights</h3>
        <Button variant="ghost" size="sm" onClick={reset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          {t('ats.details.weightsPanel.reset')}
        </Button>
      </div>

      <div className="space-y-4">
        {weightKeys.map(({ key, label }) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={`weight-${key}`}>{label}</Label>
              <div className="text-sm text-muted-foreground">
                {weights[key].toFixed(2)} → {norm[key].toFixed(2)}
              </div>
            </div>
            <Slider
              id={`weight-${key}`}
              min={0}
              max={1}
              step={0.05}
              value={[weights[key]]}
              onValueChange={([v]) => setWeight(key, v)}
            />
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium">Sum (normalized to 1.0):</span>
          <span className="font-mono text-sm">{sum.toFixed(2)} → 1.00</span>
        </div>

        <Button
          onClick={handleRecalculate}
          disabled={isAnalyzing || !parsedJob || !currentCV}
          className="w-full"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {t('ats.details.weightsPanel.recalc')}
        </Button>
      </div>
    </div>
  )
}
