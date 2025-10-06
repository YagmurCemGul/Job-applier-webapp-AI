import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Interview } from '@/types/interview.types'
import { useScorecardsStore } from '@/store/scorecardsStore'
import ScoreSummary from '../ScoreSummary'

export default function ScorecardsTab({ interview }: { interview: Interview }) {
  const { byInterview, getTemplate } = useScorecardsStore()
  const submissions = byInterview(interview.id)
  const template = getTemplate(interview.scorecardTemplateId)

  return (
    <div className="space-y-4">
      {template ? (
        <Card>
          <CardHeader>
            <CardTitle>Scorecard Template: {template.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {template.dimensions.map((dim) => (
                <div key={dim.id} className="text-sm">
                  <span className="font-medium">{dim.name}</span>
                  {dim.description && (
                    <span className="ml-2 text-muted-foreground">- {dim.description}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No scorecard template assigned
          </CardContent>
        </Card>
      )}

      {submissions.length > 0 && <ScoreSummary interview={interview} submissions={submissions} />}

      {submissions.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No score submissions yet
          </CardContent>
        </Card>
      )}
    </div>
  )
}
