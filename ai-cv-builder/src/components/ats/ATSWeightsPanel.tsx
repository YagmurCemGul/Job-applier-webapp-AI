import { useTranslation } from 'react-i18next'
import { useATSWeightsStore } from '@/stores/ats.weights.store'
import { useATSStore } from '@/stores/ats.store'
import { useCVDataStore } from '@/stores/cvData.store'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { RotateCcw, Calculator } from 'lucide-react'
import type { ATSScoringWeights } from '@/types/ats.types'

/**
 * Configurable scoring weights panel with recalculate functionality
 */
export default function ATSWeightsPanel() {
  const { t } = useTranslation('cv')
  const { weights, setWeight, reset, normalized } = useATSWeightsStore()
  const { parsedJob, result, isAnalyzing } = useATSStore()
  const { currentCV } = useCVDataStore()

  const sum = Object.values(weights).reduce((acc, val) => acc + val, 0)
  const isNormalized = Math.abs(sum - 1) < 0.001

  const handleRecalculate = async () => {
    if (!currentCV || !parsedJob || !result) return

    try {
      const { analyzeCVAgainstJob } = await import('@/services/ats/analysis.service')
      const normalizedWeights = normalized()
      const newResult = analyzeCVAgainstJob(currentCV, parsedJob, {
        weights: normalizedWeights,
      })

      // Update the result in the store
      useATSStore.setState({ result: newResult })
    } catch (error) {
      console.error('Failed to recalculate:', error)
    }
  }

  const weightLabels: Record<keyof ATSScoringWeights, string> = {
    keywords: t('ats.details.weightsPanel.keywords', 'Keywords'),
    sections: t('ats.details.weightsPanel.sections', 'Sections'),
    length: t('ats.details.weightsPanel.length', 'Length'),
    experience: t('ats.details.weightsPanel.experience', 'Experience'),
    formatting: t('ats.details.weightsPanel.formatting', 'Formatting'),
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {t('ats.details.weights', 'Weights')}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Sum: {sum.toFixed(2)}
              {!isNormalized && (
                <span className="text-yellow-600 dark:text-yellow-500 ml-1">
                  (will be normalized)
                </span>
              )}
            </span>
          </div>
        </div>

        {Object.entries(weights).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                {weightLabels[key as keyof ATSScoringWeights]}
              </Label>
              <span className="text-sm text-muted-foreground">
                {value.toFixed(2)}
              </span>
            </div>
            <Slider
              value={[value]}
              onValueChange={([v]) => setWeight(key as keyof ATSScoringWeights, v)}
              min={0}
              max={1}
              step={0.05}
              className="w-full"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={reset}
          className="gap-2"
          aria-label={t('ats.details.weightsPanel.reset', 'Reset defaults')}
        >
          <RotateCcw className="h-4 w-4" />
          {t('ats.details.weightsPanel.reset', 'Reset defaults')}
        </Button>

        <Button
          onClick={handleRecalculate}
          disabled={isAnalyzing || !result || !currentCV || !parsedJob}
          className="gap-2"
          aria-label={t('ats.details.weightsPanel.recalc', 'Recalculate')}
        >
          <Calculator className="h-4 w-4" />
          {t('ats.details.weightsPanel.recalc', 'Recalculate')}
        </Button>
      </div>
    </Card>
  )
}
