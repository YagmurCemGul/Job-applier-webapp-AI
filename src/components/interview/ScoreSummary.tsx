import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Interview } from '@/types/interview.types'
import type { ScoreSubmission } from '@/types/scorecard.types'
import { useScorecardsStore } from '@/store/scorecardsStore'
import { Download, FileText } from 'lucide-react'
import { exportScoreSummaryPDF } from '@/services/export/scoreSummary.pdf.service'

export default function ScoreSummary({
  interview,
  submissions,
}: {
  interview: Interview
  submissions: ScoreSubmission[]
}) {
  const { getTemplate } = useScorecardsStore()
  const template = getTemplate(interview.scorecardTemplateId)

  if (!template) return null

  // Calculate aggregates
  const dimensionScores = template.dimensions.map((dim) => {
    const scores = submissions
      .flatMap((s) => s.ratings)
      .filter((r) => r.dimensionId === dim.id)
      .map((r) => r.score)

    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    const variance =
      scores.length > 1
        ? scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / (scores.length - 1)
        : 0

    return {
      dimensionId: dim.id,
      name: dim.name,
      avg,
      variance,
    }
  })

  const overallScores = submissions.filter((s) => s.overall).map((s) => s.overall as number)
  const overallAvg = overallScores.length
    ? overallScores.reduce((a, b) => a + b, 0) / overallScores.length
    : 0

  const recommendations = submissions.reduce(
    (acc, s) => {
      acc[s.recommendation] = (acc[s.recommendation] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const handleExportPDF = async () => {
    const blob = await exportScoreSummaryPDF(interview, submissions, {
      dimensionScores,
      overallAvg,
      recommendations,
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `interview-score-${interview.id}.pdf`
    a.click()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Score Summary</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Export Docs
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-2 text-sm font-medium">Dimension Scores</div>
          <div className="space-y-2">
            {dimensionScores.map((dim) => (
              <div key={dim.dimensionId} className="flex items-center justify-between text-sm">
                <span>{dim.name}</span>
                <span className="font-medium">
                  {dim.avg.toFixed(2)} / 5.0
                  <span className="ml-2 text-xs text-muted-foreground">
                    (σ²: {dim.variance.toFixed(2)})
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-sm font-medium">Overall Score</div>
          <div className="text-2xl font-bold">{overallAvg.toFixed(2)} / 5.0</div>
        </div>

        <div>
          <div className="mb-2 text-sm font-medium">Recommendations</div>
          <div className="space-y-1">
            {Object.entries(recommendations).map(([rec, count]) => (
              <div key={rec} className="flex items-center justify-between text-sm">
                <span className="capitalize">{rec.replace('_', ' ')}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
