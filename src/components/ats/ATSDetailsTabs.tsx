import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ATSAnalysisResult } from '@/types/ats.types'
import ATSKeywordTable from './ATSKeywordTable'
import ATSWeightsPanel from './ATSWeightsPanel'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Target } from 'lucide-react'

interface ATSDetailsTabsProps {
  result: ATSAnalysisResult
}

export default function ATSDetailsTabs({ result }: ATSDetailsTabsProps) {
  const { t } = useTranslation()

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">{t('ats.details.overview')}</TabsTrigger>
        <TabsTrigger value="keywords">{t('ats.details.keywords')}</TabsTrigger>
        <TabsTrigger value="weights">{t('ats.details.weights')}</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Score Card */}
          <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {t('ats.details.score')}
              </span>
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600">{result.score}</div>
            <div className="mt-1 text-xs text-muted-foreground">out of 100</div>
          </div>

          {/* Matched Keywords */}
          <div className="rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Matched</span>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">{result.matchedKeywords.length}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {t('ats.details.matched')} keywords
            </div>
          </div>

          {/* Missing Keywords */}
          <div className="rounded-lg border bg-gradient-to-br from-orange-50 to-red-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Missing</span>
              <Target className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-600">
              {result.missingKeywords.length}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {t('ats.details.missing')} keywords
            </div>
          </div>
        </div>

        {/* Weights Used */}
        {result.weightsUsed && (
          <div className="rounded-md border bg-muted/30 p-4">
            <h4 className="mb-3 text-sm font-semibold">Weights Used</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(result.weightsUsed).map(([key, value]) => (
                <Badge key={key} variant="secondary">
                  {key}: {value.toFixed(2)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions Summary */}
        <div className="rounded-md border p-4">
          <h4 className="mb-3 text-sm font-semibold">Suggestions Summary</h4>
          <div className="space-y-2">
            {['critical', 'high', 'medium', 'low'].map((severity) => {
              const count = result.suggestions.filter((s) => s.severity === severity).length
              if (count === 0) return null
              return (
                <div key={severity} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{severity}</span>
                  <Badge
                    variant={
                      severity === 'critical' || severity === 'high' ? 'destructive' : 'secondary'
                    }
                  >
                    {count}
                  </Badge>
                </div>
              )
            })}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="keywords">
        <ATSKeywordTable result={result} />
      </TabsContent>

      <TabsContent value="weights">
        <ATSWeightsPanel />
      </TabsContent>
    </Tabs>
  )
}
