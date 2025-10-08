import { useTranslation } from 'react-i18next'
import { useATSStore } from '@/stores/ats.store'
import { useCVDataStore } from '@/stores/cvData.store'
import { useATSWeightsStore } from '@/stores/ats.weights.store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw } from 'lucide-react'
import ATSKeywordTable from './ATSKeywordTable'
import ATSWeightsPanel from './ATSWeightsPanel'

/**
 * ATS Details tabs: Overview, Keywords, Weights
 */
export default function ATSDetailsTabs() {
  const { t } = useTranslation('cv')
  const { result, parsedJob, isAnalyzing } = useATSStore()
  const { currentCV } = useCVDataStore()
  const { normalized } = useATSWeightsStore()

  if (!result) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        {t('ats.details.noResult', 'Run ATS analysis to see details')}
      </Card>
    )
  }

  const handleRecompute = async () => {
    if (!currentCV || !parsedJob) return

    try {
      const { analyzeCVAgainstJob } = await import('@/services/ats/analysis.service')
      const weights = normalized()
      const newResult = analyzeCVAgainstJob(currentCV, parsedJob, { weights })
      useATSStore.setState({ result: newResult })
    } catch (error) {
      console.error('Failed to recompute:', error)
    }
  }

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">
          {t('ats.details.overview', 'Overview')}
        </TabsTrigger>
        <TabsTrigger value="keywords">
          {t('ats.details.keywords', 'Keywords')}
        </TabsTrigger>
        <TabsTrigger value="weights">
          {t('ats.details.weights', 'Weights')}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4 mt-4">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">
              {t('ats.details.score', 'ATS Score')}
            </h3>
            <div className="text-4xl font-bold text-primary">
              {result.score}
              <span className="text-lg text-muted-foreground">/100</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">
                {t('ats.details.matched', 'Matched Keywords')}
              </div>
              <div className="text-2xl font-semibold text-green-600 dark:text-green-400">
                {result.matchedKeywords.length}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">
                {t('ats.details.missing', 'Missing Keywords')}
              </div>
              <div className="text-2xl font-semibold text-red-600 dark:text-red-400">
                {result.missingKeywords.length}
              </div>
            </div>
          </div>

          {result.weightsUsed && (
            <div className="pt-4 border-t">
              <div className="text-sm font-medium mb-2">Weights Used:</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(result.weightsUsed).map(([key, value]) => (
                  <Badge key={key} variant="outline">
                    {key}: {value.toFixed(2)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleRecompute}
            disabled={isAnalyzing || !currentCV || !parsedJob}
            className="w-full gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Recompute with Current Weights
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3">Suggestions Summary</h3>
          <div className="space-y-2">
            {['critical', 'high', 'medium', 'low'].map((severity) => {
              const count = result.suggestions.filter(
                (s) => s.severity === severity
              ).length
              if (count === 0) return null
              return (
                <div key={severity} className="flex items-center justify-between">
                  <Badge
                    variant={severity === 'critical' || severity === 'high' ? 'destructive' : 'secondary'}
                  >
                    {severity}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {count} {count === 1 ? 'suggestion' : 'suggestions'}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="keywords" className="mt-4">
        <ATSKeywordTable result={result} />
      </TabsContent>

      <TabsContent value="weights" className="mt-4">
        <ATSWeightsPanel />
      </TabsContent>
    </Tabs>
  )
}
